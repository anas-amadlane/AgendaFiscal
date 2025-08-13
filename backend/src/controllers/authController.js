const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, getOne, transaction } = require('../config/database');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'regular' } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    // Check if user already exists
    const existingUser = await getOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email, passwordHash, firstName, lastName, role]
    );

    const user = result.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Create session
    const sessionToken = uuidv4();
    await query(
      `INSERT INTO user_sessions (user_id, session_token, refresh_token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days')`,
      [user.id, sessionToken, refreshToken, req.ip, req.get('User-Agent')]
    );

    // Update last login
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at
      },
      tokens: {
        accessToken,
        refreshToken,
        sessionToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Erreur lors de la création du compte'
    });
  }
};

// Check if email exists
const checkEmail = async (req, res) => {
  console.log('checkEmail function called');
  console.log('Request body:', req.body);
  
  try {
    const { email } = req.body;

    if (!email) {
      console.log('No email provided');
      return res.status(400).json({
        error: 'Email required',
        message: 'Email requis'
      });
    }

    console.log('Checking email:', email);

    // Check if user already exists
    const existingUser = await getOne('SELECT id FROM users WHERE email = $1', [email]);
    
    console.log('Existing user result:', existingUser);
    
    if (existingUser) {
      console.log('Email exists, returning 409');
      return res.status(409).json({
        error: 'Email already exists',
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    console.log('Email available, returning 200');
    res.status(200).json({
      message: 'Email available',
      available: true
    });

  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({
      error: 'Email check failed',
      message: 'Erreur lors de la vérification de l\'email'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email et mot de passe requis'
      });
    }

    // Find user
    const user = await getOne(
      'SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email ou mot de passe incorrect'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account inactive',
        message: 'Compte inactif, veuillez contacter l\'administrateur'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Create session
    const sessionToken = uuidv4();
    await query(
      `INSERT INTO user_sessions (user_id, session_token, refresh_token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days')`,
      [user.id, sessionToken, refreshToken, req.ip, req.get('User-Agent')]
    );

    // Update last login
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken,
        sessionToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Erreur lors de la connexion'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (sessionToken) {
      await query(
        'DELETE FROM user_sessions WHERE session_token = $1',
        [sessionToken]
      );
    }

    res.json({
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Erreur lors de la déconnexion'
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        message: 'Token de rafraîchissement requis'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(403).json({
        error: 'Invalid refresh token',
        message: 'Token de rafraîchissement invalide'
      });
    }

    // Check if user exists and is active
    const user = await getOne(
      'SELECT id, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'Invalid user',
        message: 'Utilisateur invalide'
      });
    }

    // Generate new tokens
    const newTokens = generateTokens(user.id);

    // Update session
    await query(
      `UPDATE user_sessions 
       SET refresh_token = $1, expires_at = NOW() + INTERVAL '7 days'
       WHERE user_id = $2 AND refresh_token = $3`,
      [newTokens.refreshToken, user.id, refreshToken]
    );

    res.json({
      message: 'Token rafraîchi avec succès',
      tokens: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Token refresh failed',
      message: 'Erreur lors du rafraîchissement du token'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
        const user = await getOne(
      `SELECT id, email, first_name, last_name, role, avatar_url, 
               is_active, email_verified, last_login_at, created_at
        FROM users WHERE id = $1`,
      [req.user.id]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'Erreur lors de la récupération du profil'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, avatarUrl } = req.body;

    const result = await query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, first_name, last_name, role, avatar_url`,
      [firstName, lastName, avatarUrl, req.user.id]
    );

    const user = result.rows[0];

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatarUrl: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing passwords',
        message: 'Ancien et nouveau mot de passe requis'
      });
    }

    // Get current password hash
    const user = await getOne(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid current password',
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: 'Erreur lors du changement de mot de passe'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  checkEmail
}; 
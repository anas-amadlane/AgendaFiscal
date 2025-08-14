# Agenda Fiscal - Development Rules & Standards

## 🎯 Core Development Principles

### 1. Code Quality Standards

#### TypeScript/JavaScript Standards:
- **Always use TypeScript** for frontend code
- **Use strict TypeScript configuration**
- **Define interfaces for all data structures**
- **Use proper type annotations**
- **Avoid `any` type unless absolutely necessary**

#### Code Style:
- **Use Prettier** for consistent formatting
- **Follow ESLint rules** strictly
- **Use meaningful variable and function names**
- **Keep functions small and focused** (max 50 lines)
- **Use descriptive comments** for complex logic

### 2. Component Development Rules

#### React Component Structure:
```typescript
// ✅ CORRECT STRUCTURE
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

interface ComponentProps {
  title: string;
  onPress?: () => void;
}

export default function MyComponent({ title, onPress }: ComponentProps) {
  // 1. Hooks first
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 3. Event handlers
  const handlePress = () => {
    if (onPress) onPress();
  };
  
  // 4. Render
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

// 5. Styles at the bottom
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

#### Component Rules:
- **One component per file**
- **Use functional components** with hooks
- **Export components as default**
- **Use proper prop types** with TypeScript interfaces
- **Keep components focused** on a single responsibility
- **Use composition over inheritance**

### 3. State Management Rules

#### Context Usage:
```typescript
// ✅ CORRECT CONTEXT USAGE
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const login = useCallback(async (credentials: LoginData) => {
    // Login logic
  }, []);
  
  const value = useMemo(() => ({
    user,
    login,
    logout,
  }), [user, login]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### State Rules:
- **Use Context for global state**
- **Use local state for component-specific data**
- **Use useCallback for functions passed to children**
- **Use useMemo for expensive calculations**
- **Avoid prop drilling** - use Context instead

### 4. API Integration Rules

#### API Service Structure:
```typescript
// ✅ CORRECT API SERVICE
export class ApiService {
  private static instance: ApiService;
  private baseURL: string;
  
  private constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  }
  
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}
```

#### API Rules:
- **Use singleton pattern** for API services
- **Handle errors consistently**
- **Use proper HTTP status codes**
- **Implement retry logic** for network failures
- **Use TypeScript for API responses**

### 5. Database Rules

#### Query Structure:
```javascript
// ✅ CORRECT DATABASE QUERIES
const getUserById = async (userId) => {
  try {
    const user = await getOne(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
      [userId]
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

// ✅ CORRECT TRANSACTION USAGE
const createUserWithCompany = async (userData, companyData) => {
  return await transaction(async (client) => {
    // Create user
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id',
      [userData.email, userData.passwordHash, userData.firstName, userData.lastName]
    );
    
    // Create company
    const companyResult = await client.query(
      'INSERT INTO companies (name, user_id) VALUES ($1, $2) RETURNING id',
      [companyData.name, userResult.rows[0].id]
    );
    
    return {
      userId: userResult.rows[0].id,
      companyId: companyResult.rows[0].id,
    };
  });
};
```

#### Database Rules:
- **Always use parameterized queries**
- **Use transactions for multiple operations**
- **Handle database errors properly**
- **Use proper indexing**
- **Validate data before database operations**

### 6. Error Handling Rules

#### Frontend Error Handling:
```typescript
// ✅ CORRECT ERROR HANDLING
const handleApiCall = async () => {
  try {
    setIsLoading(true);
    const result = await apiService.getData();
    setData(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    
    if (error instanceof NetworkError) {
      Alert.alert('Network Error', 'Please check your internet connection');
    } else if (error.status === 401) {
      // Handle unauthorized
      logout();
    } else {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};
```

#### Backend Error Handling:
```javascript
// ✅ CORRECT BACKEND ERROR HANDLING
const handleRequest = async (req, res) => {
  try {
    // Validate input
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Business logic
    const user = await getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Success response
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Controller error:', error);
    
    // Handle specific errors
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Resource already exists',
        code: 'DUPLICATE_ENTRY'
      });
    }
    
    // Generic error
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};
```

### 7. Security Rules

#### Authentication:
```typescript
// ✅ CORRECT AUTHENTICATION
const AuthGuard = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (requireAuth && !isAuthenticated) {
    return <Redirect href="/login" />;
  }
  
  return <>{children}</>;
};
```

#### Security Rules:
- **Always validate user input**
- **Use HTTPS in production**
- **Implement proper CORS**
- **Use rate limiting**
- **Sanitize database inputs**
- **Use environment variables** for secrets

### 8. Performance Rules

#### Frontend Performance:
```typescript
// ✅ CORRECT PERFORMANCE OPTIMIZATION
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: heavyCalculation(item)
    }));
  }, [data]);
  
  const handleUpdate = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);
  
  return (
    <View>
      {processedData.map(item => (
        <Item key={item.id} item={item} onUpdate={handleUpdate} />
      ))}
    </View>
  );
});
```

#### Performance Rules:
- **Use React.memo** for expensive components
- **Use useMemo** for expensive calculations
- **Use useCallback** for function props
- **Implement proper loading states**
- **Use lazy loading** for routes
- **Optimize images and assets**

### 9. Testing Rules

#### Frontend Testing:
```typescript
// ✅ CORRECT COMPONENT TESTING
import { render, screen, fireEvent } from '@testing-library/react-native';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeTruthy();
  });
  
  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    render(<MyComponent title="Test" onPress={mockOnPress} />);
    
    fireEvent.press(screen.getByText('Test'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

#### Backend Testing:
```javascript
// ✅ CORRECT BACKEND TESTING
const request = require('supertest');
const app = require('../server');

describe('Auth API', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
  });
});
```

### 10. Documentation Rules

#### Code Documentation:
```typescript
/**
 * Calculates fiscal obligations for a given company
 * @param companyId - The ID of the company
 * @param startDate - Start date for calculations
 * @param endDate - End date for calculations
 * @returns Promise<FiscalObligation[]> - Array of fiscal obligations
 * @throws {Error} When company is not found
 */
export const calculateFiscalObligations = async (
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<FiscalObligation[]> => {
  // Implementation
};
```

#### Documentation Rules:
- **Document all public functions**
- **Use JSDoc comments**
- **Include parameter types and return types**
- **Document error conditions**
- **Keep documentation up to date**

### 11. Git Workflow Rules

#### Commit Messages:
```
feat: add user registration functionality
fix: resolve authentication token refresh issue
docs: update API documentation
style: format code according to prettier
refactor: extract common validation logic
test: add unit tests for user service
chore: update dependencies
```

#### Branch Naming:
```
feature/user-registration
bugfix/auth-token-refresh
hotfix/security-vulnerability
release/v1.2.0
```

### 12. Code Review Rules

#### Review Checklist:
- [ ] Code follows established patterns
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] Performance is considered
- [ ] Security is addressed
- [ ] Code is properly formatted

### 13. Deployment Rules

#### Environment Configuration:
```bash
# ✅ CORRECT ENVIRONMENT SETUP
NODE_ENV=production
PORT=3001
DB_HOST=production-db-host
DB_PASSWORD=secure-password
JWT_SECRET=very-secure-jwt-secret
ALLOWED_ORIGINS=https://yourdomain.com
```

#### Deployment Rules:
- **Use environment variables** for configuration
- **Never commit secrets** to version control
- **Use proper logging** in production
- **Monitor application performance**
- **Set up error tracking**
- **Use HTTPS in production**

## 🚨 Anti-Patterns to Avoid

### ❌ DON'T DO THIS:

```typescript
// ❌ WRONG: Using any type
const data: any = await api.getData();

// ❌ WRONG: Large components
export default function HugeComponent() {
  // 500+ lines of code
}

// ❌ WRONG: Inline styles
<View style={{ padding: 16, margin: 8, backgroundColor: '#fff' }}>

// ❌ WRONG: No error handling
const result = await api.getData();
setData(result);

// ❌ WRONG: Hardcoded values
const API_URL = 'http://localhost:3001/api/v1';
```

### ✅ DO THIS INSTEAD:

```typescript
// ✅ CORRECT: Proper typing
const data: ApiResponse = await api.getData();

// ✅ CORRECT: Small, focused components
export default function UserCard({ user }: UserCardProps) {
  // 50 lines max
}

// ✅ CORRECT: StyleSheet
const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 8,
    backgroundColor: '#fff',
  },
});

// ✅ CORRECT: Error handling
try {
  const result = await api.getData();
  setData(result);
} catch (error) {
  handleError(error);
}

// ✅ CORRECT: Environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

## 📋 Development Checklist

Before submitting code:

- [ ] Code follows TypeScript standards
- [ ] Components are properly structured
- [ ] Error handling is implemented
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Code is formatted with Prettier
- [ ] ESLint passes without errors
- [ ] Performance is considered
- [ ] Security is addressed
- [ ] Git commit message follows conventions

---

**Remember**: These rules are designed to maintain code quality, consistency, and maintainability. Follow them strictly to ensure the project remains clean and professional.

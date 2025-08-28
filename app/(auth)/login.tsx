import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, Redirect } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth();

  // Redirect already authenticated users to their appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      console.log('🔍 Login page: User already authenticated, redirecting...');
      if (user.role === UserRole.ADMIN) {
        console.log('🔍 Login page: Redirecting admin to admin-dashboard');
        router.replace('/(tabs)/admin-dashboard');
      } else {
        console.log('🔍 Login page: Redirecting regular user to dashboard');
        router.replace('/(tabs)/dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading]);

  // Handle error display
  useEffect(() => {
    if (error) {
      console.log('Login error in UI:', error);
      Alert.alert('Erreur de connexion', error);
      clearError();
    }
  }, [error, clearError]);

  const handleLogin = async () => {
    console.log('Login form submitted');
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      console.log('Calling login function with:', { email, password: '***' });
      await login({ email, password });
      console.log('Login successful, navigating to tabs');
      
      // Try different navigation methods
      setTimeout(() => {
        console.log('Attempting navigation after timeout');
        router.replace('/(tabs)');
      }, 100);
    } catch (err) {
      console.error('Login form error:', err);
      // Error is handled by context
    }
  };

  // Show redirect for authenticated users
  if (isAuthenticated && user && !isLoading) {
    if (user.role === UserRole.ADMIN) {
      return <Redirect href="/(tabs)/admin-dashboard" />;
    } else {
      return <Redirect href="/(tabs)/dashboard" />;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <View style={[styles.logoBar, { backgroundColor: '#3B82F6' }]} />
              <View style={[styles.logoBar, { backgroundColor: '#10B981' }]} />
              <View style={[styles.logoBar, { backgroundColor: '#F59E0B' }]} />
            </View>
            <Text style={styles.title}>Agenda Fiscal</Text>
            <Text style={styles.subtitle}>Marocain</Text>
            <Text style={styles.description}>
              Connectez-vous pour gérer vos obligations fiscales
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="votre@email.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#94A3B8" />
                  ) : (
                    <Eye size={20} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.loginButtonText}>Connexion...</Text>
              ) : (
                <>
                  <LogIn size={20} color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.registerSection}>
              <Text style={styles.registerText}>Pas encore de compte ?</Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity style={styles.registerButton}>
                  <Text style={styles.registerButtonText}>Créer un compte</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  logoBar: {
    width: 6,
    height: 24,
    borderRadius: 3,
    marginRight: 3
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 16
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24
  },
  form: {
    flex: 1
  },
  inputGroup: {
    marginBottom: 24
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 16
  },
  eyeButton: {
    padding: 4
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6'
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 32
  },
  loginButtonDisabled: {
    backgroundColor: '#94A3B8'
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0'
  },
  dividerText: {
    fontSize: 14,
    color: '#64748B',
    paddingHorizontal: 16
  },
  registerSection: {
    alignItems: 'center'
  },
  registerText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16
  },
  registerButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6'
  }
});
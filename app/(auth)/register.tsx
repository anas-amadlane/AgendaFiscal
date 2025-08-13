import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import emailValidationService from '@/utils/emailValidationService';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const { register, isLoading, error, clearError } = useAuth();

  // Validation functions
  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) return 'Le prénom est obligatoire';
        if (value.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères';
        return '';
      
      case 'lastName':
        if (!value.trim()) return 'Le nom est obligatoire';
        if (value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
        return '';
      
      case 'email':
        if (!value.trim()) return 'L\'email est obligatoire';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Veuillez saisir une adresse email valide';
        if (emailExists) return 'Un utilisateur avec cet email existe déjà';
        return '';
      
      case 'password':
        if (!value) return 'Le mot de passe est obligatoire';
        if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (!passwordRegex.test(value)) return 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'La confirmation du mot de passe est obligatoire';
        if (value !== formData.password) return 'Les mots de passe ne correspondent pas';
        return '';
      
      default:
        return '';
    }
  };

  const validateAllFields = () => {
    const errors: {[key: string]: string} = {};
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        errors[field] = error;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    // Clear any previous errors
    clearError();
    setValidationErrors({});

    // Check if email exists
    if (emailExists) {
      Alert.alert('Erreur', 'Un utilisateur avec cet email existe déjà');
      return;
    }

    // Validate all fields
    if (!validateAllFields()) {
      // Show first error in alert
      const firstError = Object.values(validationErrors)[0];
      Alert.alert('Erreur de validation', firstError);
      return;
    }

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });
      // Only navigate if registration was successful (no error thrown)
      router.replace('/(tabs)');
    } catch (err) {
      // Error is handled by context
      console.error('Registration error:', err);
      // Don't navigate - let the error be displayed
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // If password changes, also clear confirmPassword error and revalidate
    if (field === 'password' && validationErrors.confirmPassword) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
    
    // If email changes, clear email existence check
    if (field === 'email') {
      setEmailExists(false);
    }
    
    // Clear any registration error when user starts typing
    if (error) {
      clearError();
    }
  };

  const validateFieldOnBlur = (field: string) => {
    const error = validateField(field, formData[field as keyof typeof formData]);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Email validation effect
  useEffect(() => {
    const checkEmailExists = async () => {
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setEmailExists(false);
        return;
      }

      console.log('Starting email validation for:', formData.email);
      setIsCheckingEmail(true);
      try {
        const exists = await emailValidationService.checkEmailExists(formData.email);
        console.log('Email validation result:', exists);
        setEmailExists(exists);
        
        // Update validation errors if email exists
        if (exists) {
          setValidationErrors(prev => ({
            ...prev,
            email: 'Un utilisateur avec cet email existe déjà'
          }));
        } else {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        }
      } catch (error) {
        console.error('Email validation error:', error);
        setEmailExists(false);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(checkEmailExists, 1000); // Debounce for 1 second
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  React.useEffect(() => {
    if (error) {
      // Don't show alert - let the error be displayed in the UI
      // The error will be shown in the error container below the form
      console.log('Registration error in UI:', error);
    }
  }, [error]);

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
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.description}>
              Rejoignez Agenda Fiscal Marocain pour gérer vos obligations
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prénom *</Text>
              <View style={[
                styles.inputContainer,
                validationErrors.firstName && styles.inputContainerError
              ]}>
                <User size={20} color={validationErrors.firstName ? "#EF4444" : "#94A3B8"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData('firstName', value)}
                  onBlur={() => validateFieldOnBlur('firstName')}
                  placeholder="Ahmed"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                />
              </View>
              {validationErrors.firstName && (
                <Text style={styles.errorText}>{validationErrors.firstName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom *</Text>
              <View style={[
                styles.inputContainer,
                validationErrors.lastName && styles.inputContainerError
              ]}>
                <User size={20} color={validationErrors.lastName ? "#EF4444" : "#94A3B8"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData('lastName', value)}
                  onBlur={() => validateFieldOnBlur('lastName')}
                  placeholder="Benali"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                />
              </View>
              {validationErrors.lastName && (
                <Text style={styles.errorText}>{validationErrors.lastName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <View style={[
                styles.inputContainer,
                (validationErrors.email || emailExists) && styles.inputContainerError
              ]}>
                <Mail size={20} color={(validationErrors.email || emailExists) ? "#EF4444" : "#94A3B8"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  onBlur={() => validateFieldOnBlur('email')}
                  placeholder="votre@email.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                {isCheckingEmail && (
                  <Text style={styles.checkingText}>Vérification...</Text>
                )}
              </View>
              {validationErrors.email && (
                <Text style={styles.errorText}>{validationErrors.email}</Text>
              )}
              {emailExists && !validationErrors.email && (
                <Text style={styles.errorText}>Un utilisateur avec cet email existe déjà</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe *</Text>
              <View style={[
                styles.inputContainer,
                validationErrors.password && styles.inputContainerError
              ]}>
                <Lock size={20} color={validationErrors.password ? "#EF4444" : "#94A3B8"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  onBlur={() => validateFieldOnBlur('password')}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={validationErrors.password ? "#EF4444" : "#94A3B8"} />
                  ) : (
                    <Eye size={20} color={validationErrors.password ? "#EF4444" : "#94A3B8"} />
                  )}
                </TouchableOpacity>
              </View>
              {validationErrors.password ? (
                <Text style={styles.errorText}>{validationErrors.password}</Text>
              ) : (
                <Text style={styles.helpText}>
                  Au moins 8 caractères avec majuscule, minuscule et chiffre
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe *</Text>
              <View style={[
                styles.inputContainer,
                validationErrors.confirmPassword && styles.inputContainerError
              ]}>
                <Lock size={20} color={validationErrors.confirmPassword ? "#EF4444" : "#94A3B8"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  onBlur={() => validateFieldOnBlur('confirmPassword')}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={validationErrors.confirmPassword ? "#EF4444" : "#94A3B8"} />
                  ) : (
                    <Eye size={20} color={validationErrors.confirmPassword ? "#EF4444" : "#94A3B8"} />
                  )}
                </TouchableOpacity>
              </View>
              {validationErrors.confirmPassword && (
                <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
              )}
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <View style={styles.errorHeader}>
                  <Text style={styles.errorMessage}>{error}</Text>
                  <TouchableOpacity onPress={clearError} style={styles.errorCloseButton}>
                    <Text style={styles.errorCloseText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.registerButtonText}>Création...</Text>
              ) : (
                <>
                  <UserPlus size={20} color="#FFFFFF" />
                  <Text style={styles.registerButtonText}>Créer mon compte</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Déjà un compte ?</Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity style={styles.loginButton}>
                  <Text style={styles.loginButtonText}>Se connecter</Text>
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
    marginBottom: 32
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
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8
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
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
    paddingVertical: 14
  },
  eyeButton: {
    padding: 4
  },
  helpText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic'
  },
  inputContainerError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500'
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  errorMessage: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8
  },
  errorCloseButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20
  },
  checkingText: {
    fontSize: 12,
    color: '#3B82F6',
    fontStyle: 'italic',
    marginLeft: 8
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 12,
    marginBottom: 32
  },
  registerButtonDisabled: {
    backgroundColor: '#94A3B8'
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8
  },
  loginSection: {
    alignItems: 'center',
    paddingBottom: 20
  },
  loginText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16
  },
  loginButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6'
  }
});
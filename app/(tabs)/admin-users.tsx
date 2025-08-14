import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Switch } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { User, UserRole } from '@/types/auth';
import { Users, Search, Edit, Trash2, Eye, EyeOff, Plus, Filter } from 'lucide-react-native';

interface UserWithStats extends User {
  lastLoginAt?: Date;
  companiesCount: number;
  isActive: boolean;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'edit' | 'password' | 'delete' | 'create'>('edit');
  const [loading, setLoading] = useState(true);

  // Form states
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.REGULAR,
    isActive: true
  });
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.REGULAR
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Validation states
  const [createErrors, setCreateErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [editErrors, setEditErrors] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== UserRole.ADMIN) {
      router.replace('/(tabs)');
      return;
    }
    loadUsers();
  }, [user]);

  // Filter users based on search query
  useEffect(() => {
    const filtered = users.filter(user => 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:3001/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'edit' | 'password' | 'delete' | 'create', user?: UserWithStats) => {
    setModalType(type);
    setModalVisible(true);

    // Clear errors when opening modal
    setCreateErrors({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setEditErrors({
      firstName: '',
      lastName: '',
      email: ''
    });

    if (type === 'edit' && user) {
      setSelectedUser(user);
      setEditForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
    } else if (type === 'password' && user) {
      setSelectedUser(user);
      setPasswordForm({
        newPassword: '',
        confirmPassword: ''
      });
    } else if (type === 'delete' && user) {
      setSelectedUser(user);
    } else if (type === 'create') {
      setSelectedUser(null);
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: UserRole.REGULAR
      });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
    
    // Clear errors when closing modal
    setCreateErrors({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setEditErrors({
      firstName: '',
      lastName: '',
      email: ''
    });
  };

  const handleCreateUser = async () => {
    if (!validateCreateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:3001/api/v1/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: createForm.firstName,
          lastName: createForm.lastName,
          email: createForm.email,
          password: createForm.password,
          role: createForm.role
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409 && errorData.error === 'Email already exists') {
          // Set email error in the form
          setCreateErrors(prev => ({
            ...prev,
            email: 'This email is already registered'
          }));
          return;
        }
        throw new Error(errorData.message || 'Failed to create user');
      }

      const data = await response.json();
      Alert.alert('Success', data.message);
      closeModal();
      // Clear form and errors
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: UserRole.REGULAR
      });
      setCreateErrors({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      loadUsers(); // Reload users list
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleEditUser = async () => {
    if (!validateEditForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:3001/api/v1/users/${selectedUser?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409 && errorData.error === 'Email already exists') {
          // Set email error in the form
          setEditErrors(prev => ({
            ...prev,
            email: 'This email is already registered by another user'
          }));
          return;
        }
        throw new Error(errorData.message || 'Failed to update user');
      }

      const data = await response.json();
      Alert.alert('Success', data.message);
      closeModal();
      loadUsers(); // Reload users list
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.newPassword) {
      Alert.alert('Error', 'New password is required');
      return;
    }

    if (!validatePassword(passwordForm.newPassword)) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:3001/api/v1/users/${selectedUser?.id}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: passwordForm.newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      const data = await response.json();
      Alert.alert('Success', data.message);
      closeModal();
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleDeleteUser = async () => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${selectedUser?.firstName} ${selectedUser?.lastName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = localStorage.getItem('authToken');
              
              const response = await fetch(`http://localhost:3001/api/v1/users/${selectedUser?.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
              }

              const data = await response.json();
              Alert.alert('Success', data.message);
              closeModal();
              loadUsers(); // Reload users list
            } catch (error) {
              console.error('Error deleting user:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
              Alert.alert('Error', errorMessage);
            }
          }
        }
      ]
    );
  };

  const getRoleColor = (role: UserRole) => {
    return role === UserRole.ADMIN ? '#EF4444' : '#3B82F6';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#10B981' : '#EF4444';
  };

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateCreateForm = () => {
    const errors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    if (!createForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!createForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!createForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(createForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!createForm.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(createForm.password)) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!createForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (createForm.password !== createForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setCreateErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const validateEditForm = () => {
    const errors = {
      firstName: '',
      lastName: '',
      email: ''
    };

    if (!editForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!editForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!editForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(editForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setEditErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  // Clear email errors when user starts typing
  const clearEmailError = (formType: 'create' | 'edit') => {
    if (formType === 'create') {
      setCreateErrors(prev => ({ ...prev, email: '' }));
    } else {
      setEditErrors(prev => ({ ...prev, email: '' }));
    }
  };

  if (user?.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => openModal('create')}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <ScrollView style={styles.usersList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>
                    {user.firstName} {user.lastName}
                  </Text>
                  <View style={styles.badges}>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                      <Text style={styles.roleText}>{user.role}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.isActive ? 'active' : 'inactive') }]}>
                      <Text style={styles.statusText}>{user.isActive ? 'active' : 'inactive'}</Text>
                    </View>
                  </View>
                </View>
                
                <Text style={styles.userEmail}>{user.email}</Text>
                
                <View style={styles.userStats}>
                  <Text style={styles.statText}>
                    Companies: {user.companiesCount || 0}
                  </Text>
                  <Text style={styles.statText}>
                    Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </Text>
                </View>
              </View>

              <View style={styles.userActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => openModal('edit', user)}
                >
                  <Edit size={16} color="#3B82F6" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => openModal('password', user)}
                >
                  <Eye size={16} color="#10B981" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => openModal('delete', user)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create User Modal */}
      <Modal
        visible={modalVisible && modalType === 'create'}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New User</Text>
            
            <TextInput
              style={[styles.input, createErrors.firstName && styles.inputError]}
              placeholder="First Name"
              value={createForm.firstName}
              onChangeText={(text) => setCreateForm({...createForm, firstName: text})}
            />
            {createErrors.firstName ? (
              <Text style={styles.errorText}>{createErrors.firstName}</Text>
            ) : null}
            
            <TextInput
              style={[styles.input, createErrors.lastName && styles.inputError]}
              placeholder="Last Name"
              value={createForm.lastName}
              onChangeText={(text) => setCreateForm({...createForm, lastName: text})}
            />
            {createErrors.lastName ? (
              <Text style={styles.errorText}>{createErrors.lastName}</Text>
            ) : null}
            
            <TextInput
              style={[styles.input, createErrors.email && styles.inputError]}
              placeholder="Email"
              value={createForm.email}
              onChangeText={(text) => {
                setCreateForm({...createForm, email: text});
                clearEmailError('create');
              }}
              keyboardType="email-address"
            />
            {createErrors.email ? (
              <Text style={styles.errorText}>{createErrors.email}</Text>
            ) : null}

            <TextInput
              style={[styles.input, createErrors.password && styles.inputError]}
              placeholder="Password"
              value={createForm.password}
              onChangeText={(text) => setCreateForm({...createForm, password: text})}
              secureTextEntry
            />
            {createErrors.password ? (
              <Text style={styles.errorText}>{createErrors.password}</Text>
            ) : null}

            <TextInput
              style={[styles.input, createErrors.confirmPassword && styles.inputError]}
              placeholder="Confirm Password"
              value={createForm.confirmPassword}
              onChangeText={(text) => setCreateForm({...createForm, confirmPassword: text})}
              secureTextEntry
            />
            {createErrors.confirmPassword ? (
              <Text style={styles.errorText}>{createErrors.confirmPassword}</Text>
            ) : null}

            <View style={styles.roleSelector}>
              <Text style={styles.label}>Role:</Text>
              <View style={styles.roleOptions}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    createForm.role === UserRole.REGULAR && styles.roleOptionSelected
                  ]}
                  onPress={() => setCreateForm({...createForm, role: UserRole.REGULAR})}
                >
                  <Text style={[
                    styles.roleOptionText,
                    createForm.role === UserRole.REGULAR && styles.roleOptionTextSelected
                  ]}>Regular</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    createForm.role === UserRole.ADMIN && styles.roleOptionSelected
                  ]}
                  onPress={() => setCreateForm({...createForm, role: UserRole.ADMIN})}
                >
                  <Text style={[
                    styles.roleOptionText,
                    createForm.role === UserRole.ADMIN && styles.roleOptionTextSelected
                  ]}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleCreateUser}>
                <Text style={styles.saveButtonText}>Create User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        visible={modalVisible && modalType === 'edit'}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            
            <TextInput
              style={[styles.input, editErrors.firstName && styles.inputError]}
              placeholder="First Name"
              value={editForm.firstName}
              onChangeText={(text) => setEditForm({...editForm, firstName: text})}
            />
            {editErrors.firstName ? (
              <Text style={styles.errorText}>{editErrors.firstName}</Text>
            ) : null}
            
            <TextInput
              style={[styles.input, editErrors.lastName && styles.inputError]}
              placeholder="Last Name"
              value={editForm.lastName}
              onChangeText={(text) => setEditForm({...editForm, lastName: text})}
            />
            {editErrors.lastName ? (
              <Text style={styles.errorText}>{editErrors.lastName}</Text>
            ) : null}
            
            <TextInput
              style={[styles.input, editErrors.email && styles.inputError]}
              placeholder="Email"
              value={editForm.email}
              onChangeText={(text) => {
                setEditForm({...editForm, email: text});
                clearEmailError('edit');
              }}
              keyboardType="email-address"
            />
            {editErrors.email ? (
              <Text style={styles.errorText}>{editErrors.email}</Text>
            ) : null}

            <View style={styles.roleSelector}>
              <Text style={styles.label}>Role:</Text>
              <View style={styles.roleOptions}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    editForm.role === UserRole.REGULAR && styles.roleOptionSelected
                  ]}
                  onPress={() => setEditForm({...editForm, role: UserRole.REGULAR})}
                >
                  <Text style={[
                    styles.roleOptionText,
                    editForm.role === UserRole.REGULAR && styles.roleOptionTextSelected
                  ]}>Regular</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    editForm.role === UserRole.ADMIN && styles.roleOptionSelected
                  ]}
                  onPress={() => setEditForm({...editForm, role: UserRole.ADMIN})}
                >
                  <Text style={[
                    styles.roleOptionText,
                    editForm.role === UserRole.ADMIN && styles.roleOptionTextSelected
                  ]}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.statusToggle}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={styles.statusToggleContainer}>
                <Text style={styles.statusToggleText}>
                  {editForm.isActive ? 'Active' : 'Inactive'}
                </Text>
                <Switch
                  value={editForm.isActive}
                  onValueChange={(value) => {
                    console.log('Switch value changed:', value);
                    setEditForm({...editForm, isActive: value});
                  }}
                  trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                  thumbColor={editForm.isActive ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleEditUser}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={modalVisible && modalType === 'password'}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <Text style={styles.modalSubtitle}>
              Change password for {selectedUser?.firstName} {selectedUser?.lastName}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm({...passwordForm, newPassword: text})}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm({...passwordForm, confirmPassword: text})}
              secureTextEntry
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                <Text style={styles.saveButtonText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={modalVisible && modalType === 'delete'}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete User</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}?
            </Text>
            <Text style={styles.warningText}>
              This action cannot be undone. All user data will be permanently deleted.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirmButton} onPress={handleDeleteUser}>
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    textAlign: 'left',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  filterButton: {
    padding: 4,
  },
  usersList: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 12,
    color: '#64748B',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1E293B',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  roleSelector: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  roleOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  roleOptionTextSelected: {
    color: '#FFFFFF',
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    padding: 8,
    borderRadius: 8,
  },
  statusToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteConfirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  deleteConfirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

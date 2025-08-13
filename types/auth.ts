export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  token?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  role?: UserRole;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT = 'agent',
  USER = 'user'
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// New interfaces for role management
export interface CompanyAssignment {
  id: string;
  companyId: string;
  userId: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  assignedBy: string;
  assignedAt: Date;
  permissions?: Record<string, any>;
}

export interface UserInvitation {
  id: string;
  email: string;
  invitedBy: string;
  companyId: string;
  role: UserRole;
  invitationToken: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  acceptedAt?: Date;
  message?: string;
  createdAt: Date;
}

export interface ManagerAgentAssignment {
  id: string;
  managerId: string;
  agentId: string;
  assignmentType: 'all' | 'specific';
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
}

export interface CompanyWithRole {
  id: string;
  name: string;
  registrationNumber?: string;
  taxId?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry?: string;
  size?: string;
  status: 'active' | 'inactive' | 'suspended';
  userRole: UserRole;
  userStatus: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  assignedAt: Date;
  assignedByName: string;
  lastLoginAt?: Date;
}

export interface CompanyDetails {
  company: CompanyWithRole;
  users: CompanyUser[];
}
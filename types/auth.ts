export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

// User roles in the users table (simplified)
export enum UserRole {
  REGULAR = 'regular',
  ADMIN = 'admin'
}

// Company roles in the company_user_roles table
export enum CompanyRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  AGENT = 'agent'
}

export interface CompanyWithRole {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  userRole: CompanyRole;
  userStatus: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

// Company user role assignment
export interface CompanyUserRole {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyRole;
  permissions: Record<string, any>;
  status: 'active' | 'inactive' | 'pending';
  assignedBy: string;
  assignedAt: Date;
}

// New interfaces for role management
export interface CompanyAssignment {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyRole;
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
  role: CompanyRole;
  invitationToken: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  acceptedAt?: Date;
  message?: string;
  createdAt: Date;
}

export interface ManagerAgentAssignment {
  id: string;
  companyId: string;
  managerId: string;
  agentId: string;
  assignmentType: 'all' | 'specific';
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
}

export interface CompanyUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: CompanyRole;
  status: 'active' | 'inactive' | 'pending';
  assignedAt: Date;
  assignedByName: string;
  lastLoginAt?: Date;
}

export interface CompanyDetails {
  company: CompanyWithRole;
  users: CompanyUser[];
}
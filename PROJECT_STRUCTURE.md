# Agenda Fiscal - Project Structure & Development Guide

## 📁 Project Overview

Agenda Fiscal is a React Native/Expo application with a Node.js/Express backend for fiscal calendar management. The project follows a clean architecture with clear separation between frontend and backend.

## 🏗️ Project Structure

```
project/
├── 📱 Frontend (React Native/Expo)
│   ├── app/                          # Expo Router - Main Application
│   │   ├── (auth)/                   # Authentication Routes
│   │   │   ├── login.tsx            # Login Screen
│   │   │   ├── register.tsx         # Registration Screen
│   │   │   └── _layout.tsx          # Auth Layout
│   │   ├── (tabs)/                   # Main App Tabs
│   │   │   ├── _layout.tsx          # Tab Navigation Layout
│   │   │   ├── index.tsx            # Root Redirect Handler
│   │   │   ├── dashboard.tsx        # Regular User Dashboard
│   │   │   ├── admin-dashboard.tsx  # Admin Dashboard
│   │   │   ├── admin-calendar.tsx   # Admin Calendar Management
│   │   │   ├── admin-companies.tsx  # Admin Companies Management
│   │   │   ├── admin-users.tsx      # Admin Users Management
│   │   │   ├── enterprises.tsx      # User Companies View
│   │   │   ├── calendar.tsx         # User Calendar View
│   │   │   ├── invitations.tsx      # User Invitations
│   │   │   ├── notifications.tsx    # User Notifications
│   │   │   └── settings.tsx         # User Settings
│   │   ├── _layout.tsx              # Root Layout
│   │   └── +not-found.tsx           # 404 Page
│   ├── components/                   # Reusable UI Components
│   │   ├── AuthGuard.tsx            # Authentication Guard
│   │   ├── AppHeader.tsx            # Application Header
│   │   ├── StatCard.tsx             # Statistics Card
│   │   ├── ObligationCard.tsx       # Fiscal Obligation Card
│   │   ├── EnterpriseCard.tsx       # Company Card
│   │   ├── InvitationCard.tsx       # Invitation Card
│   │   ├── RoleBadge.tsx            # Role Display Badge
│   │   ├── PingNavigationBar.tsx    # Navigation Bar
│   │   ├── PingEcheanceModal.tsx    # Due Date Modal
│   │   ├── ReminderModal.tsx        # Reminder Modal
│   │   ├── ExcelImportModal.tsx     # Excel Import Modal
│   │   ├── CompanyCreationModal.tsx # Company Creation Modal
│   │   ├── CompanyAssignmentModal.tsx # Company Assignment Modal
│   │   ├── EnterpriseDetailsModal.tsx # Company Details Modal
│   │   ├── EnterpriseCalendarModal.tsx # Company Calendar Modal
│   │   ├── AgentManagementModal.tsx # Agent Management Modal
│   │   ├── UserManagementModal.tsx  # User Management Modal
│   │   ├── UserProfileModal.tsx     # User Profile Modal
│   │   ├── RoleSelectionModal.tsx   # Role Selection Modal
│   │   └── ObligationActionsModal.tsx # Obligation Actions Modal
│   ├── contexts/                     # React Contexts
│   │   ├── AuthContext.tsx          # Authentication State
│   │   └── AppContext.tsx           # Application State
│   ├── types/                       # TypeScript Definitions
│   │   ├── auth.ts                  # Authentication Types
│   │   ├── fiscal.ts                # Fiscal Data Types
│   │   ├── theme.ts                 # Theme Types
│   │   └── localization.ts          # Localization Types
│   ├── utils/                       # Frontend Utilities
│   │   ├── apiProxy.js              # API Communication
│   │   ├── roleManagementService.ts # Role Management
│   │   ├── fiscalCalendarService.ts # Fiscal Calendar Service
│   │   ├── fiscalCalculations.ts    # Fiscal Calculations
│   │   ├── notificationService.ts   # Notification Service
│   │   ├── emailValidationService.ts # Email Validation
│   │   ├── companyRoleService.ts    # Company Role Service
│   │   ├── pdfExport.ts             # PDF Export
│   │   └── mockData.ts              # Mock Data
│   ├── hooks/                       # Custom React Hooks
│   │   └── useFrameworkReady.ts     # Framework Ready Hook
│   ├── assets/                      # Static Assets
│   │   └── images/                  # Images
│   │       ├── icon.png             # App Icon
│   │       └── favicon.png          # Favicon
│   ├── package.json                 # Frontend Dependencies
│   ├── app.json                     # Expo Configuration
│   └── tsconfig.json                # TypeScript Configuration
│
├── 🔧 Backend (Node.js/Express)
│   ├── src/                         # Backend Source Code
│   │   ├── server.js                # Main Server File
│   │   ├── config/                  # Configuration
│   │   │   └── database.js          # Database Configuration
│   │   ├── controllers/             # Business Logic
│   │   │   ├── authController.js    # Authentication Logic
│   │   │   ├── userController.js    # User Management
│   │   │   ├── companyController.js # Company Management
│   │   │   └── invitationController.js # Invitation Logic
│   │   ├── routes/                  # API Routes
│   │   │   ├── auth.js              # Authentication Routes
│   │   │   ├── users.js             # User Routes
│   │   │   ├── companies.js         # Company Routes
│   │   │   ├── invitations.js       # Invitation Routes
│   │   │   ├── notifications.js     # Notification Routes
│   │   │   ├── dashboard.js         # Dashboard Routes
│   │   │   ├── obligations.js       # Obligation Routes
│   │   │   └── fiscal.js            # Fiscal Calendar Routes
│   │   ├── middleware/              # Middleware
│   │   │   ├── auth.js              # Authentication Middleware
│   │   │   └── audit.js             # Audit Logging
│   │   └── database/                # Database
│   │       ├── schema.sql           # Database Schema
│   │       ├── migration.sql        # Migration Scripts
│   │       └── migrate.js           # Migration Runner
│   ├── package.json                 # Backend Dependencies
│   ├── env.example                  # Environment Template
│   └── README.md                    # Backend Documentation
│
├── 📚 Documentation
│   ├── README.md                    # Main Project Documentation
│   ├── BACKEND_SETUP.md             # Backend Setup Guide
│   └── PROJECT_STRUCTURE.md         # This File
│
└── 🔧 Configuration Files
    ├── .gitignore                   # Git Ignore Rules
    ├── .prettierrc                  # Prettier Configuration
    └── .npmrc                       # NPM Configuration
```

## 🎯 Development Rules & Guidelines

### 1. File Organization Rules

#### Frontend Rules:
- **Components**: Place reusable UI components in `/components/`
- **Pages**: Place route-specific components in `/app/(tabs)/` or `/app/(auth)/`
- **Utilities**: Place business logic in `/utils/` with `.ts` extension
- **Types**: Define TypeScript interfaces in `/types/`
- **Contexts**: Place React contexts in `/contexts/`
- **Hooks**: Place custom hooks in `/hooks/`

#### Backend Rules:
- **Controllers**: Place business logic in `/backend/src/controllers/`
- **Routes**: Place API endpoints in `/backend/src/routes/`
- **Middleware**: Place middleware in `/backend/src/middleware/`
- **Config**: Place configuration in `/backend/src/config/`
- **Database**: Place database files in `/backend/src/database/`

### 2. Naming Conventions

#### Files:
- **Components**: PascalCase (e.g., `UserProfileModal.tsx`)
- **Pages**: kebab-case (e.g., `admin-dashboard.tsx`)
- **Utilities**: camelCase (e.g., `fiscalCalculations.ts`)
- **Types**: camelCase (e.g., `auth.ts`)
- **Backend**: camelCase (e.g., `authController.js`)

#### Functions & Variables:
- **React Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

### 3. Code Organization Rules

#### Frontend Components:
```typescript
// 1. Imports (external libraries first, then internal)
import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component Definition
export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 4. Hooks
  const { user } = useAuth();
  
  // 5. State
  const [state, setState] = useState();
  
  // 6. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 7. Event Handlers
  const handleEvent = () => {
    // ...
  };
  
  // 8. Render
  return (
    <View>
      <Text>Content</Text>
    </View>
  );
}

// 9. Styles (at the bottom)
const styles = StyleSheet.create({
  // ...
});
```

#### Backend Controllers:
```javascript
// 1. Imports
const { query, getOne } = require('../config/database');

// 2. Controller Functions
const functionName = async (req, res) => {
  try {
    // 3. Input validation
    const { param1, param2 } = req.body;
    
    // 4. Business logic
    const result = await query('SELECT * FROM table');
    
    // 5. Response
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    // 6. Error handling
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error message'
    });
  }
};

// 7. Export
module.exports = {
  functionName
};
```

### 4. API Design Rules

#### Endpoint Structure:
```
GET    /api/v1/resource          # List resources
GET    /api/v1/resource/:id      # Get single resource
POST   /api/v1/resource          # Create resource
PUT    /api/v1/resource/:id      # Update resource
DELETE /api/v1/resource/:id      # Delete resource
```

#### Response Format:
```javascript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### 5. Database Rules

#### Table Naming:
- Use snake_case for table names
- Use descriptive names (e.g., `fiscal_calendar`, `user_sessions`)

#### Column Naming:
- Use snake_case for column names
- Include timestamps: `created_at`, `updated_at`
- Use UUID for primary keys

#### Query Organization:
```javascript
// 1. Use parameterized queries
const result = await query('SELECT * FROM users WHERE id = $1', [userId]);

// 2. Use helper functions
const user = await getOne('SELECT * FROM users WHERE id = $1', [userId]);
const users = await getMany('SELECT * FROM users');

// 3. Use transactions for complex operations
const result = await transaction(async (client) => {
  // Multiple operations
});
```

### 6. Authentication & Security Rules

#### Frontend:
- Use `AuthGuard` component for protected routes
- Store tokens in `localStorage` (for web)
- Use `AuthContext` for global auth state

#### Backend:
- Use JWT tokens for authentication
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production
- Sanitize database inputs

### 7. Error Handling Rules

#### Frontend:
```typescript
try {
  const result = await apiCall();
  // Handle success
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly error message
  Alert.alert('Error', 'Something went wrong');
}
```

#### Backend:
```javascript
try {
  // Business logic
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: 'User-friendly error message'
  });
}
```

### 8. State Management Rules

#### Frontend:
- Use React Context for global state
- Use local state for component-specific data
- Keep state as close to where it's used as possible

#### Backend:
- Use database for persistent state
- Use sessions for temporary state
- Implement proper cleanup

### 9. Testing Rules

#### Frontend:
- Test components with React Testing Library
- Test utilities with Jest
- Test API calls with mock data

#### Backend:
- Test controllers with unit tests
- Test API endpoints with integration tests
- Test database operations with test database

### 10. Performance Rules

#### Frontend:
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images and assets
- Use lazy loading for routes

#### Backend:
- Implement database indexing
- Use connection pooling
- Implement caching where appropriate
- Monitor query performance

### 11. Deployment Rules

#### Frontend:
- Build for production with `expo build`
- Configure environment variables
- Test on multiple devices

#### Backend:
- Use environment variables for configuration
- Implement proper logging
- Set up monitoring and alerts
- Use PM2 or similar for process management

## 🚀 Quick Start Commands

### Frontend Development:
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:web
```

### Backend Development:
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Run migrations
npm run migrate

# Run tests
npm test
```

### Database Setup:
```bash
# Create database
createdb agenda_fiscal

# Run schema
psql agenda_fiscal < src/database/schema.sql

# Run migrations
npm run migrate
```

## 📝 Notes for Future Development

1. **Always check this file** before adding new features
2. **Follow the established patterns** for consistency
3. **Update this documentation** when adding new patterns
4. **Use TypeScript** for all new frontend code
5. **Write tests** for critical functionality
6. **Document API changes** in the backend README
7. **Keep dependencies updated** regularly
8. **Monitor performance** and optimize as needed

## 🔧 Troubleshooting

### Common Issues:
1. **Port conflicts**: Check if ports 3001 (backend) and 8081 (frontend) are available
2. **Database connection**: Verify PostgreSQL is running and credentials are correct
3. **Authentication issues**: Check JWT tokens and session configuration
4. **CORS errors**: Verify ALLOWED_ORIGINS in backend configuration

### Debug Commands:
```bash
# Check running processes
netstat -ano | findstr :3001
netstat -ano | findstr :8081

# Kill process by PID
taskkill /PID <PID> /F

# Check database connection
psql -h localhost -U postgres -d agenda_fiscal
```

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: Agenda Fiscal Team

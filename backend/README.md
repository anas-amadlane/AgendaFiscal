# Agenda Fiscal Backend API

A comprehensive backend system for the Agenda Fiscal dashboard application, built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **User Management & Authentication**
  - JWT-based authentication with refresh tokens
  - Role-based access control (Admin, Manager, Agent, User)
  - Session management with database persistence
  - Password hashing with bcrypt

- **Manager-Agent Hierarchy**
  - Managers can assign agents to their team
  - Support for "all companies" or "specific companies" assignments
  - Granular permission control
  - Audit logging for all assignments

- **Data Persistence**
  - PostgreSQL database with comprehensive schema
  - Historical data tracking
  - Dashboard configurations per user
  - Session persistence across devices

- **Security Features**
  - Rate limiting for API endpoints
  - Input validation and sanitization
  - CORS configuration
  - Helmet security headers
  - Audit logging for all operations

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=agenda_fiscal
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   
   # Server
   PORT=3001
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb agenda_fiscal
   
   # Run migrations
   npm run migrate
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🗄️ Database Schema

### Core Tables

- **users**: User accounts with roles and authentication
- **companies**: Business entities managed by users
- **manager_agent_assignments**: Manager-Agent relationships
- **agent_company_assignments**: Specific company assignments for agents
- **fiscal_obligations**: Tax and fiscal obligations tracking
- **dashboard_configurations**: User-specific dashboard settings
- **user_sessions**: Active user sessions
- **audit_logs**: System audit trail
- **notifications**: User notifications

### Key Relationships

```
Manager (User) → Manager_Agent_Assignment → Agent (User)
Agent (User) → Agent_Company_Assignment → Company
Company → Fiscal_Obligation
User → Dashboard_Configuration
User → User_Session
```

## 🔐 Authentication

### JWT Token Structure
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionToken": "uuid-session-token"
}
```

### Role Hierarchy
- **Admin**: Full system access
- **Manager**: Can manage assigned agents and their companies
- **Agent**: Can access assigned companies and obligations
- **User**: Basic access to own data

## 📡 API Endpoints

### Authentication
```
POST /api/v1/auth/register     - Register new user
POST /api/v1/auth/login        - User login
POST /api/v1/auth/logout       - User logout
POST /api/v1/auth/refresh      - Refresh access token
GET  /api/v1/auth/profile      - Get user profile
PUT  /api/v1/auth/profile      - Update user profile
PUT  /api/v1/auth/password     - Change password
```

### User Management (Admin)
```
GET  /api/v1/users             - Get all users
GET  /api/v1/users/stats       - Get user statistics
PUT  /api/v1/users/:id/status  - Update user status
```

### Manager-Agent Management
```
GET  /api/v1/users/agents                    - Get manager's agents
POST /api/v1/users/agents/assign             - Assign agent to manager
DELETE /api/v1/users/agents/:agentId         - Remove agent assignment
POST /api/v1/users/agents/:agentId/companies - Assign companies to agent
GET  /api/v1/users/agents/:agentId/companies - Get agent's companies
```

### Companies
```
GET    /api/v1/companies      - Get companies
GET    /api/v1/companies/:id  - Get specific company
POST   /api/v1/companies      - Create company
PUT    /api/v1/companies/:id  - Update company
DELETE /api/v1/companies/:id  - Delete company
```

### Fiscal Obligations
```
GET    /api/v1/obligations      - Get obligations
GET    /api/v1/obligations/:id  - Get specific obligation
POST   /api/v1/obligations      - Create obligation
PUT    /api/v1/obligations/:id  - Update obligation
DELETE /api/v1/obligations/:id  - Delete obligation
```

### Dashboard
```
GET  /api/v1/dashboard/config  - Get dashboard configuration
POST /api/v1/dashboard/config  - Save dashboard configuration
GET  /api/v1/dashboard/stats   - Get dashboard statistics
```

### Notifications
```
GET  /api/v1/notifications           - Get notifications
PUT  /api/v1/notifications/:id/read  - Mark notification as read
PUT  /api/v1/notifications/read-all  - Mark all notifications as read
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `agenda_fiscal` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Access token expiry | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `30d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit requests | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |

### Security Settings

- **Rate Limiting**: 100 requests per 15 minutes for API, 5 attempts per 15 minutes for auth
- **Password Requirements**: Minimum 8 characters, uppercase, lowercase, number
- **Session Duration**: 7 days with refresh capability
- **CORS**: Configurable allowed origins

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   PORT=3001
   DB_HOST=your-db-host
   DB_PASSWORD=your-secure-password
   JWT_SECRET=your-very-secure-jwt-secret
   ```

2. **Database Setup**
   ```bash
   # Create production database
   createdb agenda_fiscal_prod
   
   # Run migrations
   NODE_ENV=production npm run migrate
   ```

3. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start src/server.js --name "agenda-fiscal-api"
   pm2 save
   pm2 startup
   ```

4. **Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t agenda-fiscal-backend .
docker run -p 3001:3001 --env-file .env agenda-fiscal-backend
```

## 📊 Monitoring & Logging

### Health Check
```
GET /health
```
Returns server status and version information.

### Audit Logging
All user actions are logged to the `audit_logs` table with:
- User ID
- Action performed
- Table affected
- Old and new values
- IP address and user agent
- Timestamp

### Error Handling
- Structured error responses
- Proper HTTP status codes
- Detailed error messages in French
- Logging of all errors

## 🔒 Security Considerations

1. **Input Validation**: All inputs are validated using express-validator
2. **SQL Injection Prevention**: Parameterized queries with pg
3. **XSS Protection**: Helmet middleware with CSP
4. **CSRF Protection**: JWT tokens with session validation
5. **Rate Limiting**: Prevents brute force attacks
6. **Password Security**: bcrypt hashing with configurable rounds
7. **Session Security**: Secure session tokens with expiration

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Documentation

### Request/Response Examples

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Login Response:**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "company": "Example Corp",
    "role": "manager"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionToken": "uuid-session-token"
  }
}
```

**Error Response:**
```json
{
  "error": "Validation failed",
  "message": "Données de validation invalides",
  "details": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for Agenda Fiscal** 
# Agenda Fiscal Backend API

A comprehensive backend system for the Agenda Fiscal Dashboard application, providing user management, role-based access control, and fiscal data management.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user lifecycle management with roles (admin, manager, agent, user)
- **Manager-Agent Hierarchy**: Delegated access control for managers to manage their assigned agents
- **Company Management**: CRUD operations for companies with agent assignments
- **Fiscal Obligations**: Management of fiscal obligations and deadlines
- **Dashboard Configurations**: User-specific dashboard settings and preferences
- **Audit Logging**: Comprehensive audit trail for all operations
- **Rate Limiting**: API rate limiting for security
- **Session Management**: Secure session handling with PostgreSQL storage

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository and navigate to the backend directory:**
   ```bash
   cd project/src
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `src` directory with the following variables:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3001
   API_VERSION=v1

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=agenda_fiscal
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_SSL=false

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d

   # Session Configuration
   SESSION_SECRET=your_session_secret_here

   # Security
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
   ```

4. **Set up the database:**
   ```bash
   # Create the database
   createdb agenda_fiscal

   # Run migrations
   npm run migrate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts with roles and status
- **companies**: Company information
- **manager_agent_assignments**: Manager-agent relationships
- **agent_company_assignments**: Agent-company assignments
- **fiscal_obligations**: Fiscal obligations and deadlines
- **dashboard_configurations**: User dashboard settings
- **user_sessions**: Active user sessions
- **audit_logs**: Audit trail
- **notifications**: User notifications

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

- **Access Token**: Short-lived (7 days by default) for API access
- **Refresh Token**: Long-lived (30 days by default) for token renewal
- **Session Management**: Server-side session storage in PostgreSQL

### Default Admin User

After running migrations, a default admin user is created:
- **Email**: admin@agendafiscal.com
- **Password**: Admin123!

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/change-password` - Change password

### User Management

- `GET /api/v1/users/all` - Get all users (admin only)
- `GET /api/v1/users/stats` - Get user statistics (admin only)
- `PUT /api/v1/users/:userId/status` - Update user status (admin only)
- `GET /api/v1/users/manager/:managerId/agents` - Get manager's agents
- `POST /api/v1/users/assign-agent` - Assign agent to manager
- `DELETE /api/v1/users/manager/:managerId/agent/:agentId` - Remove agent from manager
- `POST /api/v1/users/assign-companies` - Assign companies to agent
- `GET /api/v1/users/agent/:agentId/companies` - Get agent's companies

### Health Check

- `GET /health` - Server health check

## Role-Based Access Control

The system implements a hierarchical role structure:

1. **Admin**: Full system access
2. **Manager**: Can manage assigned agents and their companies
3. **Agent**: Can access assigned companies and their obligations
4. **User**: Basic access to own data

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Request validation using express-validator
- **SQL Injection Prevention**: Parameterized queries
- **Password Hashing**: bcrypt for password security
- **Audit Logging**: Comprehensive audit trail

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

### Project Structure

```
src/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── userController.js    # User management logic
├── database/
│   ├── schema.sql          # Database schema
│   └── migrate.js          # Migration script
├── middleware/
│   └── auth.js             # Authentication middleware
├── routes/
│   ├── auth.js             # Authentication routes
│   └── users.js            # User management routes
├── server.js               # Main server file
├── package.json            # Backend dependencies
└── README.md              # This file
```

## Production Deployment

### Environment Variables

For production, ensure all environment variables are properly set:

```env
NODE_ENV=production
PORT=3001
DB_HOST=your_db_host
DB_PASSWORD=your_secure_password
JWT_SECRET=your_very_secure_jwt_secret
SESSION_SECRET=your_very_secure_session_secret
ALLOWED_ORIGINS=https://yourdomain.com
```

### Process Management

Use PM2 for process management:

```bash
npm install -g pm2
pm2 start server.js --name "agenda-fiscal-api"
pm2 save
pm2 startup
```

### Reverse Proxy

Use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

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

## Monitoring

### Health Check

The API provides a health check endpoint:

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Logging

The application uses Winston for logging. Logs are written to:
- Console (development)
- File system (production)

### Error Handling

The API provides consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details"
}
```

## Testing

Run tests with:

```bash
npm test
```

## API Documentation

### Request/Response Format

All API endpoints return JSON responses with the following structure:

**Success Response:**
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

### Authentication

Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Pagination

List endpoints support pagination:

```
GET /api/v1/users/all?page=1&limit=10
```

Response:
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 
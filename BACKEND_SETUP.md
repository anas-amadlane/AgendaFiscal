# Backend Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **PostgreSQL** (v12 or higher)
3. **npm** or **yarn**

## Quick Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

1. **Create PostgreSQL Database:**
   ```sql
   CREATE DATABASE agenda_fiscal;
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `backend` directory with the following content:
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
   DB_PASSWORD=your_password_here
   DB_SSL=false

   # JWT Configuration
   JWT_SECRET=agenda_fiscal_super_secret_jwt_key_2024
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d

   # Session Configuration
   SESSION_SECRET=agenda_fiscal_session_secret_2024

   # Security
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # File Upload
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads

   # Logging
   LOG_LEVEL=info
   LOG_FILE=./logs/app.log

   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://localhost:19006,http://localhost:19000

   # Email (for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

3. **Run Database Migration:**
   ```bash
   cd backend
   node src/database/migrate.js
   ```

### 3. Start the Server

```bash
cd backend
npm start
```

The server will start on `http://localhost:3001`

## Demo Mode

If you don't want to set up the backend immediately, the application includes a **Demo Mode** that will automatically activate when the backend is not available. This allows you to:

- ✅ Test all UI features
- ✅ Create companies with role selection
- ✅ Manage users and agents
- ✅ Test role-based permissions
- ✅ Use all the role management features

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Companies
- `GET /api/v1/companies` - Get user's companies
- `POST /api/v1/companies` - Create company with role
- `GET /api/v1/companies/:id` - Get company details
- `PUT /api/v1/companies/:id` - Update company
- `POST /api/v1/companies/assign-user` - Assign user to company

### User Management
- `GET /api/v1/users/manager/:id/agents` - Get manager's agents
- `POST /api/v1/users/agents/assign` - Assign agent to manager
- `POST /api/v1/users/agents/:id/companies` - Assign companies to agent

### Invitations
- `POST /api/v1/invitations` - Send invitation
- `GET /api/v1/invitations/sent` - Get sent invitations
- `GET /api/v1/invitations/received` - Get received invitations
- `POST /api/v1/invitations/accept/:token` - Accept invitation
- `POST /api/v1/invitations/decline/:token` - Decline invitation

## Troubleshooting

### Common Issues

1. **Database Connection Error:**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Port Already in Use:**
   - Change `PORT` in `.env` file
   - Kill process using port 3001

3. **JWT Errors:**
   - Ensure `JWT_SECRET` is set in `.env`
   - Restart server after changing JWT settings

4. **CORS Errors:**
   - Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

### Logs

Check the logs in `./logs/app.log` for detailed error information.

## Development

### Running in Development Mode

```bash
cd backend
npm run dev
```

### Running Tests

```bash
cd backend
npm test
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a production database
3. Set secure JWT secrets
4. Configure proper CORS origins
5. Set up SSL/TLS
6. Use a process manager like PM2

## Support

For issues or questions, please check the logs and ensure all prerequisites are met.


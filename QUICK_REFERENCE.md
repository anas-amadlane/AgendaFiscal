# Agenda Fiscal - Quick Reference Guide

## 🚀 Quick Start Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:web

# Run linting
npm run lint
```

### Backend Development
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

### Database Operations
```bash
# Create database
createdb agenda_fiscal

# Run schema
psql agenda_fiscal < backend/src/database/schema.sql

# Run migrations
cd backend && npm run migrate

# Connect to database
psql -h localhost -U postgres -d agenda_fiscal
```

## 📁 File Locations Quick Reference

### Frontend Files
| Purpose | Location |
|---------|----------|
| Main App | `app/(tabs)/` |
| Authentication | `app/(auth)/` |
| Components | `components/` |
| Utilities | `utils/` |
| Types | `types/` |
| Contexts | `contexts/` |
| Assets | `assets/` |

### Backend Files
| Purpose | Location |
|---------|----------|
| Server | `backend/src/server.js` |
| Controllers | `backend/src/controllers/` |
| Routes | `backend/src/routes/` |
| Middleware | `backend/src/middleware/` |
| Database Config | `backend/src/config/database.js` |
| Schema | `backend/src/database/schema.sql` |

## 🔧 Common Development Tasks

### Adding a New Component
1. Create file in `components/` with PascalCase name
2. Follow component structure from `DEVELOPMENT_RULES.md`
3. Export as default
4. Add to imports where needed

### Adding a New API Endpoint
1. Add route in `backend/src/routes/`
2. Add controller logic in `backend/src/controllers/`
3. Update API service in frontend if needed
4. Test with Postman or similar

### Adding a New Database Table
1. Add to `backend/src/database/schema.sql`
2. Create migration if needed
3. Update types in `types/` if needed
4. Test database operations

### Adding a New Page
1. Create file in `app/(tabs)/` or `app/(auth)/`
2. Follow page structure from `DEVELOPMENT_RULES.md`
3. Add to navigation if needed
4. Update types if needed

## 🐛 Common Issues & Solutions

### Port Conflicts
```bash
# Check what's using port 3001
netstat -ano | findstr :3001

# Kill process by PID
taskkill /PID <PID> /F

# Check what's using port 8081
netstat -ano | findstr :8081
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_ctl status

# Start PostgreSQL if needed
pg_ctl start

# Test connection
psql -h localhost -U postgres -d agenda_fiscal
```

### Authentication Issues
1. Check JWT token in localStorage
2. Verify backend is running on port 3001
3. Check CORS configuration
4. Verify environment variables

### Build Issues
```bash
# Clear cache
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
expo r -c
```

## 📋 Environment Variables

### Frontend (.env)
```bash
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Backend (.env)
```bash
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agenda_fiscal
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

## 🔍 Debugging Commands

### Frontend Debugging
```bash
# Start with debugging
npm run dev -- --debug

# Check bundle size
npx expo export --platform web --dump-assetmap

# Analyze dependencies
npx expo install --fix
```

### Backend Debugging
```bash
# Start with debugging
node --inspect src/server.js

# Check logs
tail -f logs/app.log

# Test API endpoints
curl -X GET http://localhost:3001/api/v1/health
```

### Database Debugging
```bash
# Check database size
SELECT pg_size_pretty(pg_database_size('agenda_fiscal'));

# Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 📊 Performance Monitoring

### Frontend Performance
```bash
# Check bundle analyzer
npx expo export --platform web --dump-assetmap

# Monitor network requests
# Use browser dev tools Network tab
```

### Backend Performance
```bash
# Monitor memory usage
node --inspect src/server.js

# Check database performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

## 🔒 Security Checklist

### Before Deployment
- [ ] Environment variables are set
- [ ] JWT secret is secure
- [ ] Database passwords are strong
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is configured
- [ ] Input validation is implemented
- [ ] SQL injection protection is in place

## 📝 Git Workflow

### Common Git Commands
```bash
# Create feature branch
git checkout -b feature/new-feature

# Stage changes
git add .

# Commit with proper message
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
# Use GitHub/GitLab interface
```

### Commit Message Format
```
feat: add user registration
fix: resolve authentication issue
docs: update API documentation
style: format code
refactor: extract common logic
test: add unit tests
chore: update dependencies
```

## 🧪 Testing Commands

### Frontend Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- MyComponent.test.tsx
```

### Backend Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run tests with coverage
npm test -- --coverage
```

## 📦 Deployment Commands

### Frontend Deployment
```bash
# Build for production
npm run build:web

# Deploy to Expo
expo publish

# Deploy to web
npx expo export --platform web
```

### Backend Deployment
```bash
# Install production dependencies
npm install --production

# Start production server
npm start

# Use PM2 for process management
pm2 start src/server.js --name agenda-fiscal-backend
```

## 🔄 Database Migrations

### Creating Migration
```bash
# Create migration file
touch backend/src/database/migration_$(date +%Y%m%d_%H%M%S).sql

# Add migration logic
# Example:
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

### Running Migrations
```bash
# Run all migrations
cd backend && npm run migrate

# Run specific migration
psql agenda_fiscal < backend/src/database/migration_20241201_120000.sql
```

## 📞 Support & Resources

### Documentation
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Project structure guide
- [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) - Development standards
- [README.md](./README.md) - Main project documentation
- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Backend setup guide

### External Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Team Contacts
- **Project Lead**: [Contact Info]
- **Backend Developer**: [Contact Info]
- **Frontend Developer**: [Contact Info]

---

**Last Updated**: December 2024
**Version**: 1.0.0

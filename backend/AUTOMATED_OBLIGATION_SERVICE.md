# Automated Fiscal Obligation Generation Service

## Overview

The Automated Fiscal Obligation Generation Service automatically creates fiscal obligations for all companies based on the fiscal calendar entries. It operates with dynamic date ranges and can be triggered by various events.

## Features

### 🕒 **Automated Monthly Generation**
- **Schedule**: Runs on the 1st of each month at 2:00 AM (Europe/Paris timezone)
- **Scope**: Generates obligations for all active companies
- **Date Range**: Current year (from January 1st) + 12 months forward
- **Trigger**: Automatic via cron job

### 🏢 **New Company Generation**
- **Trigger**: When a new company is created
- **Scope**: Only the newly created company
- **Date Range**: Current year + 12 months forward
- **Automatic**: No manual intervention required

### 📅 **Calendar Update Regeneration**
- **Trigger**: When fiscal calendar entries are created, updated, or deleted
- **Scope**: All active companies
- **Action**: Deletes existing generated obligations and creates new ones
- **Automatic**: No manual intervention required

### 🔧 **Manual Generation**
- **Trigger**: Admin-initiated from dashboard
- **Scope**: All active companies
- **Date Range**: Current year + 12 months forward
- **Purpose**: Testing, immediate generation, or catch-up

## Date Range Logic

The service uses a dynamic date range calculation:

```javascript
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

// Start from January 1st of current year
const startDate = new Date(currentYear, 0, 1);

// End 12 months from current month
const endDate = new Date(currentYear, currentMonth + 12, 0);
```

**Example**: If it's March 2024, the service will generate obligations from January 1, 2024 to February 28, 2025.

## Obligation Generation Logic

### Company Matching
- Matches fiscal calendar entries to companies based on `categorie_personnes`
- Handles TVA-specific logic based on company settings (`is_tva_assujetti`, `regime_tva`)
- Only generates relevant obligations for each company

### Frequency Handling
- **Monthly**: 12 obligations per year
- **Quarterly**: 4 obligations per year (Q1=March, Q2=June, Q3=September, Q4=December)
- **Annual**: 1 obligation per year

### Due Date Calculation
- Uses `mois` and `jours` from calendar entries
- Automatically calculates correct due dates based on frequency
- Handles year transitions properly

## Service Architecture

### Core Components

1. **FiscalObligationService** (`fiscalObligationService.js`)
   - Core obligation generation logic
   - Database operations
   - Date calculations

2. **AutomatedObligationService** (`automatedObligationService.js`)
   - Cron job management
   - Event triggers
   - Logging and monitoring

3. **Controllers Integration**
   - Company creation triggers
   - Calendar update triggers
   - Manual generation endpoints

### Database Integration

The service integrates with existing tables:
- `fiscal_calendar`: Source of obligation templates
- `companies`: Target companies for obligation generation
- `fiscal_obligations`: Generated obligations storage
- `audit_logs`: Generation history and error tracking

## API Endpoints

### Manual Generation
```http
POST /api/v1/fiscal/obligations/generate/manual
Content-Type: application/json
Authorization: Bearer <token>

{
  "managerEmail": "admin@example.com"
}
```

### Dynamic Generation
```http
POST /api/v1/fiscal/obligations/generate/all-companies-dynamic
Content-Type: application/json
Authorization: Bearer <token>

{
  "managerEmail": "admin@example.com"
}
```

## Configuration

### Environment Variables
```bash
# Timezone for cron jobs (default: Europe/Paris)
TZ=Europe/Paris

# Cron schedule (default: 0 2 1 * *)
OBLIGATION_GENERATION_CRON=0 2 1 * *
```

### Cron Schedule Format
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of the month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

## Monitoring and Logging

### Audit Logs
All generation events are logged to the `audit_logs` table with:
- Generation type (monthly, new_company, calendar_update, manual)
- Summary statistics
- Success/failure status
- Error details (if applicable)

### Console Logging
The service provides detailed console output:
```
🚀 Initializing Automated Obligation Service...
✅ Automated Obligation Service initialized
📅 Monthly obligation generation triggered by cron
🔄 Starting monthly obligation generation...
👤 Using admin user: admin@example.com for automated generation
✅ Monthly generation completed: 150 obligations generated for 5 companies
```

## Error Handling

### Graceful Degradation
- Service failures don't affect core application functionality
- Generation errors are logged but don't prevent other operations
- Fallback mechanisms for missing data

### Error Recovery
- Automatic retry mechanisms for transient failures
- Detailed error logging for debugging
- Manual override capabilities

## Testing

### Test Script
Run the test script to verify service functionality:
```bash
cd backend
node test_automated_service.js
```

### Manual Testing
1. **Monthly Generation**: Wait for the 1st of the month or modify cron schedule
2. **New Company**: Create a company through the application
3. **Calendar Update**: Modify fiscal calendar entries
4. **Manual Generation**: Use the admin dashboard

## Deployment

### Production Setup
1. Ensure `node-cron` dependency is installed
2. Set appropriate timezone in environment
3. Verify admin user exists in database
4. Monitor logs for successful initialization

### Development Setup
1. Install dependencies: `npm install node-cron`
2. Start the server: `npm start`
3. Check console for service initialization messages
4. Test manual generation through admin dashboard

## Troubleshooting

### Common Issues

1. **Service Not Initializing**
   - Check database connection
   - Verify admin user exists
   - Review console logs

2. **No Obligations Generated**
   - Verify fiscal calendar entries exist
   - Check company-category matching
   - Review generation logs

3. **Cron Job Not Running**
   - Verify timezone settings
   - Check server time
   - Review cron schedule

### Debug Commands
```bash
# Check service status
curl http://localhost:3001/health

# Test manual generation
curl -X POST http://localhost:3001/api/v1/fiscal/obligations/generate/manual \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"managerEmail": "admin@example.com"}'
```

## Future Enhancements

- **Email Notifications**: Send alerts for generation results
- **Webhook Integration**: External system notifications
- **Advanced Scheduling**: Custom schedules per company
- **Performance Optimization**: Batch processing for large datasets
- **Dashboard Monitoring**: Real-time generation status

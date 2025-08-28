# Production Environment Setup for Agenda Fiscal
# This script sets critical environment variables for secure operation

Write-Host "🔧 Setting up production environment variables..." -ForegroundColor Green

# Critical security variables
$env:JWT_SECRET = "agenda_fiscal_production_secret_key_2024_very_secure_$(Get-Random)"
$env:NODE_ENV = "production"
$env:SESSION_SECRET = "agenda_fiscal_session_secret_2024_$(Get-Random)"

# Database configuration (adjust as needed)
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "agenda_fiscal"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "pmpm"
$env:DB_SSL = "false"

# Security settings
$env:BCRYPT_ROUNDS = "12"
$env:RATE_LIMIT_WINDOW_MS = "900000"
$env:RATE_LIMIT_MAX_REQUESTS = "100"

# CORS
$env:ALLOWED_ORIGINS = "http://localhost:3000,http://localhost:8081,http://localhost:19006"

Write-Host "✅ Environment variables set successfully!" -ForegroundColor Green
Write-Host "🔐 JWT_SECRET: SET (length: $($env:JWT_SECRET.Length) chars)" -ForegroundColor Yellow
Write-Host "🏭 NODE_ENV: $env:NODE_ENV" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 You can now start the server with: node src/server.js" -ForegroundColor Cyan
Write-Host "⚠️  Make sure to keep these secrets secure in production!" -ForegroundColor Red

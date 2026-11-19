# Development Setup Guide

## Prerequisites
- PHP 8.3+ with CLI and extensions (`pdo_mysql`, `curl`, `mbstring`, `intl`, `xml`)
- Composer 2.x
- Node.js 20+ & npm / pnpm
- MySQL 8.x

## Workspace Structure
The project uses a monorepo setup:
- Root workspace manages Node packages in `apps/` and `packages/`.
- `backend/` is an independent Laravel 11 application directory.

## Backend Quickstart
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Frontend Quickstart
```bash
# In repository root
npm install
npm run dev --workspace=apps/web
```

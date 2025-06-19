# Fraud Detection Project

## Overview

This project is a multi-component system for fraud detection simulation and user management:

- **Backend:** Laravel 12 API (`backend/`) secured with Sanctum for user authentication and registration.
- **Frontend:** React SPA (`frontend/`) built with Vite consuming the Laravel API.
- **Simulator API:** Python Flask app (`api/app.py`) serving simulated transactions and fraud predictions via a machine learning model.

---

## Folder Structure

/backend # Laravel backend API
/frontend # React frontend SPA
/api # Python Flask fraud detection simulator

---

## Prerequisites

- PHP >= 8.x, Composer
- Node.js >= 18.x, npm
- Python 3.x, pip
- MySQL or compatible database

---

## Setup Instructions

### 1. Backend (Laravel)

```bash
cd backend
composer install

# Copy .env and set your config
cp .env.example .env

# Update .env:
# APP_URL=http://localhost:8000
# SANCTUM_STATEFUL_DOMAINS=localhost:5173
# SESSION_DOMAIN=localhost
# DB_*

php artisan key:generate
php artisan migrate

# Clear config cache after changes
php artisan config:clear
php artisan cache:clear

# Serve the backend
php artisan serve --host=localhost --port=8000
##2. frontend
cd frontend
npm install
npm run dev
#3 .simulator
cd api
pip install -r requirements.txt
python app.py


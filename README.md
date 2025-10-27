# Fraud Detection Project

## Overview

This project is a multi-component system for fraud detection simulation and user management:

- **Backend:** Laravel 12 API (`backend/`) secured with Sanctum for user authentication and registration.
- **Frontend:** React SPA (`frontend/`) built with Vite consuming the Laravel API.
- **Simulator API:** Python Flask app (`api/app.py`) serving simulated transactions and fraud predictions via a machine learning model.

All three services can be launched simultaneously from the root directory using `npm run start`.

## Folder Structure


/backend # Laravel backend API
/frontend # React frontend SPA
/api # Python Flask fraud detection simulator
/package.json # Root script to start all services


---

## Prerequisites

- PHP >= 8.x, Composer
- Node.js >= 18.x, npm
- Python 3.x, pip
- MySQL or compatible database

---


## Prerequisites

- PHP >= 8.x, Composer
- Node.js >= 18.x, npm
- Python 3.x, pip
- MySQL or compatible database

## Setup Instructions

### 1. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
# Update .env with your local config:
# APP_URL=http://localhost:8000
# SANCTUM_STATEFUL_DOMAINS=localhost:5173
# SESSION_DOMAIN=localhost
# Database credentials (DB_*)
php artisan key:generate
php artisan migrate
php artisan config:clear
php artisan cache:clear
cd ..


### 2. frontend (react)
cd frontend
npm install
cd ..


### 2. api (python)
cd api
python -m venv .venv
# Activate the virtual environment:
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cd ..



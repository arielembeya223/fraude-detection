# Fraud Detection Project

## 🧠 Overview

This project is a multi-component system for fraud detection simulation and user management:

- **Backend:** Laravel 12 API (`backend/`) secured with Sanctum for user authentication and registration.  
- **Frontend:** React SPA (`frontend/`) built with Vite consuming the Laravel API.  
- **Simulator API:** Python Flask app (`api/app.py`) serving simulated transactions and fraud predictions via a machine learning model.  

---

## ⚡ Setup & Running

### 1️⃣ Clone the repository
```bash
git clone https://github.com/arielembeya223/fraude-detection.git
cd fraude-detection
###  2️⃣ Prepare the backend environment

Before running the setup, make sure to create or modify the .env file in the backend/ folder with your database credentials and other required environment variables. You can copy the example file and edit it:
cd backend
cp .env.example .env
Then edit the .env file to match your setup (database name, username, password, etc.). This step is important to make sure Laravel migrations and application key generation work correctly.
npm run setup
This command will:

Backend:

Install PHP dependencies (composer install)

Generate Laravel application key (php artisan key:generate)

Run database migrations (php artisan migrate --force)

Clear configuration and cache (php artisan config:clear && php artisan cache:clear)

Frontend: Install Node.js dependencies (npm install)

Simulator API: Install Python dependencies (pip install -r requirements.txt)
npm start

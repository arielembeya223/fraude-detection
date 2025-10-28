# Fraud Detection Project

## 🧠 Overview

This project is a multi-component system for fraud detection simulation and user management:

- **Backend:** Laravel 12 API (`backend/`) secured with Sanctum for user authentication and registration.  
- **Frontend:** React SPA (`frontend/`) built with Vite consuming the Laravel API.  
- **Simulator API:** Python Flask app (`api/app.py`) serving simulated transactions and fraud predictions via a machine learning model.  

💡 **All services (backend, frontend, and Python API) can be launched simultaneously with one command:**
```bash
npm start

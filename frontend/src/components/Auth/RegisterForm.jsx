import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterForm() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    password_confirmation: '' 
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'Les mots de passe ne correspondent pas' });
      setLoading(false);
      return;
    }

    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true
      });

      const { data } = await axios.post(
        'http://localhost:8000/api/register', 
        form,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/welcome');
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      if (err.response) {
        if (err.response.status === 422) {
          const validationErrors = {};
          Object.entries(err.response.data.errors).forEach(([key, value]) => {
            validationErrors[key] = value[0];
          });
          setErrors(validationErrors);
        } else {
          setErrors({
            general: err.response.data.message || `Erreur serveur (${err.response.status})`
          });
        }
      } else if (err.request) {
        setErrors({ general: 'Le serveur ne répond pas' });
      } else {
        setErrors({ general: 'Erreur de configuration' });
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    authBackground: {
      position: 'relative',
      minHeight: '100vh',
      overflowX: 'hidden',
      backgroundColor: '#f5f5f5',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    background: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `
        radial-gradient(circle at 20% 20%, rgba(142, 245, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(119, 216, 247, 0.3) 0%, transparent 50%)
      `,
      zIndex: -1,
      filter: 'blur(80px)',
      WebkitFilter: 'blur(80px)'
    },
    authHeader: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '15px 30px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '70px',
      maxHeight: '70px',
      backdropFilter: 'blur(5px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none'
    },
    logoImg: {
      height: '40px',
      width: 'auto',
      maxHeight: '100%'
    },
    logoText: {
      color: '#2c2c2c',
      fontWeight: '700',
      fontSize: '1.4rem',
      margin: 0
    },
    authFormContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '90px 20px 40px'
    },
    authForm: {
      background: 'white',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '450px',
      margin: '0 auto'
    },
    formTitle: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#333',
      fontSize: '1.8rem',
      fontWeight: '600'
    },
    authInput: {
      width: '100%',
      padding: '14px 16px',
      marginBottom: '8px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.3s',
      ':focus': {
        borderColor: '#6c63ff',
        outline: 'none'
      }
    },
    inputError: {
      borderColor: '#ff4d4f !important'
    },
    errorText: {
      color: '#ff4d4f',
      fontSize: '0.85rem',
      marginBottom: '15px',
      display: 'block',
      minHeight: '20px'
    },
    submitButton: {
      background: 'linear-gradient(135deg, #6c63ff 0%, #00d48c 100%)',
      color: 'white',
      border: 'none',
      padding: '14px',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      width: '100%',
      fontSize: '16px',
      position: 'relative',
      marginTop: '10px',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 5px 15px rgba(108, 99, 255, 0.4)'
      },
      ':disabled': {
        opacity: '0.7',
        cursor: 'not-allowed',
        transform: 'none'
      }
    },
    spinner: {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '20px',
      height: '20px',
      border: '3px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '50%',
      borderTopColor: 'white',
      animation: 'spin 1s linear infinite'
    },
    switchLink: {
      display: 'block',
      marginTop: '20px',
      color: '#6c63ff',
      textAlign: 'center',
      cursor: 'pointer',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'all 0.3s',
      ':hover': {
        textDecoration: 'underline'
      }
    },
    errorBox: {
      backgroundColor: '#fff5f5',
      border: '1px solid #ffd6d6',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      color: '#cc0000'
    },
    errorTitle: {
      fontWeight: 'bold',
      marginBottom: '8px'
    }
  };

  return (
    <div style={styles.authBackground}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={styles.background}></div>

      <header style={styles.authHeader}>
        <a href="/" style={styles.logo}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={styles.logoImg}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-logo.png';
            }}
          />
          <h1 style={styles.logoText}>Fraud Detection</h1>
        </a>
      </header>

      <div style={styles.authFormContainer}>
        <form onSubmit={handleSubmit} style={styles.authForm}>
          <h2 style={styles.formTitle}>Inscription</h2>
          
          {errors.general && (
            <div style={styles.errorBox}>
              <div style={styles.errorTitle}>Erreur</div>
              <div>{errors.general}</div>
            </div>
          )}

          <div>
            <input
              type="text"
              name="name"
              placeholder="Nom complet"
              value={form.name}
              onChange={handleChange}
              required
              style={{
                ...styles.authInput,
                ...(errors.name && styles.inputError)
              }}
            />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Adresse email"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                ...styles.authInput,
                ...(errors.email && styles.inputError)
              }}
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Mot de passe (min. 8 caractères)"
              value={form.password}
              onChange={handleChange}
              minLength="8"
              required
              style={{
                ...styles.authInput,
                ...(errors.password && styles.inputError)
              }}
            />
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>

          <div>
            <input
              type="password"
              name="password_confirmation"
              placeholder="Confirmez le mot de passe"
              value={form.password_confirmation}
              onChange={handleChange}
              required
              style={{
                ...styles.authInput,
                ...(errors.password_confirmation && styles.inputError)
              }}
            />
            {errors.password_confirmation && (
              <span style={styles.errorText}>{errors.password_confirmation}</span>
            )}
          </div>

          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                Inscription en cours...
                <span style={styles.spinner}></span>
              </>
            ) : 'Créer un compte'}
          </button>

          <a 
            href="/login" 
            style={styles.switchLink}
          >
            Déjà un compte ? Se connecter
          </a>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
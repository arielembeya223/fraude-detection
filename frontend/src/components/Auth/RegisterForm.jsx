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
      // 1. Récupération du cookie CSRF
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true
      });

      // 2. Enregistrement
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

      // 3. Stockage du token et redirection
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/FraudMonitoringDashboard');
    } catch (err) {
      console.log("ERREUR:", err);
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

  // Styles (conservés identiques)
  const styles = {
    authBackground: {
      position: 'relative',
      minHeight: '100vh',
      overflowX: 'hidden',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
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
    },
    errorMessage: {
      marginBottom: '10px'
    },
    errorDetails: {
      fontSize: '0.8rem',
      marginTop: '10px',
      cursor: 'pointer'
    },
    errorPre: {
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      backgroundColor: '#f8f8f8',
      padding: '10px',
      borderRadius: '4px',
      marginTop: '8px',
      overflowX: 'auto'
    },
    authHeader: {
      padding: '20px 40px',
      backgroundColor: 'white',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    logoImg: {
      height: '40px'
    },
    authFormContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 100px)',
      padding: '20px'
    },
    authForm: {
      background: 'white',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px'
    },
    authInput: {
      width: '100%',
      padding: '12px 15px',
      marginBottom: '5px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.3s'
    },
    inputError: {
      borderColor: '#e74c3c !important'
    },
    highlight: {
      background: 'linear-gradient(to right, #4666f4, #00d48c)',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '8px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s',
      width: '100%',
      fontSize: '16px',
      position: 'relative'
    },
    highlightDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed'
    },
    spinner: {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '20px',
      height: '20px',
      border: '3px solid rgba(255,255,255,0.3)',
      borderRadius: '50%',
      borderTopColor: '#fff',
      animation: 'spin 1s linear infinite',
    },
    switchLink: {
      display: 'block',
      marginTop: '20px',
      color: '#00c896',
      textAlign: 'center',
      cursor: 'pointer',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'text-decoration 0.3s'
    },
    errorText: {
      color: '#e74c3c',
      fontSize: '0.85rem',
      marginBottom: '15px',
      display: 'block'
    },
    generalError: {
      color: '#e74c3c',
      backgroundColor: '#fde8e8',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '20px',
      textAlign: 'center'
    },
    background: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `
        radial-gradient(circle at 20% 20%, #8ef5c6 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, #77d8f7 0%, transparent 50%)
      `,
      zIndex: -1,
      filter: 'blur(80px)',
      WebkitFilter: 'blur(80px)'
    }
  };

  return (
    <div style={styles.authBackground}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={styles.background}></div>

      <header style={styles.authHeader}>
        <div style={styles.logo}>
          <img src="logo.png" alt="Logo" style={styles.logoImg} />
          <span><strong>Fraud Detection</strong></span>
        </div>
      </header>

      <div style={styles.authFormContainer}>
        <form onSubmit={handleSubmit} style={styles.authForm}>
          <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>Inscription</h2>
          
          {errors.general && (
            <div style={styles.errorBox}>
              <div style={styles.errorTitle}>Erreur lors de l'inscription</div>
              <div style={styles.errorMessage}>{errors.general}</div>
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
                ...(errors.name ? styles.inputError : {})
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
                ...(errors.email ? styles.inputError : {})
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
                ...(errors.password ? styles.inputError : {})
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
                ...(errors.password_confirmation ? styles.inputError : {})
              }}
            />
            {errors.password_confirmation && (
              <span style={styles.errorText}>{errors.password_confirmation}</span>
            )}
          </div>

          <button
            type="submit"
            style={{
              ...styles.highlight,
              ...(loading ? styles.highlightDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                Inscription...
                <span style={styles.spinner}></span>
              </>
            ) : 'S\'inscrire'}
          </button>

          <a 
            href="/login" 
            style={styles.switchLink}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Déjà un compte ? Se connecter
          </a>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
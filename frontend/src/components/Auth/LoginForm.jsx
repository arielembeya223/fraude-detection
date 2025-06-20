import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Récupération du cookie CSRF
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true
      });

      // 2. Authentification
      const { data } = await axios.post('http://localhost:8000/api/login', form, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // 3. Stockage du token et redirection
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/FraudMonitoringDashboard');
    } catch (err) {
      let errorMessage = 'Erreur de connexion';
      
      if (err.response) {
        if (err.response.status === 422) {
          errorMessage = Object.values(err.response.data.errors).flat().join(', ');
        } else if (err.response.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else {
          errorMessage = err.response.data.message || `Erreur serveur (${err.response.status})`;
        }
      } else if (err.request) {
        errorMessage = 'Le serveur ne répond pas (vérifiez votre connexion)';
      } else {
        errorMessage = 'Erreur de configuration de la requête';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Styles (conservés identiques)
  const styles = {
    body: {
      margin: 0,
      fontFamily: 'Arial, sans-serif',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      position: 'relative',
      overflowX: 'hidden',
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
    },
    header: {
      padding: '20px 40px',
      backgroundColor: 'white',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    logoImg: {
      height: '40px',
    },
    formContainer: {
      marginTop: '60px',
      maxWidth: '400px',
      marginLeft: 'auto',
      marginRight: 'auto',
      background: 'white',
      padding: '30px 40px',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
      textAlign: 'center',
    },
    input: {
      width: '100%',
      padding: '12px',
      marginBottom: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      fontSize: '16px',
    },
    button: {
      width: '100%',
      backgroundColor: '#00c896',
      color: 'white',
      border: 'none',
      padding: '12px',
      fontSize: '16px',
      borderRadius: '8px',
      cursor: 'pointer',
      position: 'relative',
    },
    buttonDisabled: {
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
      marginTop: '15px',
      color: '#00c896',
      fontWeight: 'bold',
      cursor: 'pointer',
      textDecoration: 'underline',
    },
    errorMessage: {
      color: '#e74c3c',
      backgroundColor: '#fde8e8',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '15px',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.body}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.background}></div>

      <header style={styles.header}>
        <div style={styles.logo}>
          <img src="/logo.png" alt="Logo" style={styles.logoImg} />
          <h1>Connexion</h1>
        </div>
      </header>

      <div style={styles.formContainer}>
        {error && <div style={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                Connexion...
                <span style={styles.spinner}></span>
              </>
            ) : 'Se connecter'}
          </button>
        </form>

        <p 
          style={styles.switchLink} 
          onClick={() => navigate('/register')}
        >
          Pas encore inscrit ? Créer un compte
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
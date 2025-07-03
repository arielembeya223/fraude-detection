import React from 'react';
import './App.css'
const Welcome = () => {
  // Styles JSX
  const styles = {
    appContainer: {
      position: 'relative',
      minHeight: '100vh',
      overflowX: 'hidden',
      fontFamily: 'Arial, sans-serif',
    },
    backgroundOverlay: {
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
      WebkitFilter: 'blur(80px)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 40px',
      backgroundColor: 'white',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
      position: 'relative',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    logoImg: {
      height: '40px',
    },
    navLink: {
      marginLeft: '30px',
      textDecoration: 'none',
      color: '#333',
      fontWeight: 'bold',
      transition: 'color 0.3s',
    },
    main: {
      marginTop: '100px',
      padding: '40px',
      maxWidth: '1000px',
      marginLeft: 'auto',
      marginRight: 'auto',
      textAlign: 'center',
      position: 'relative',
    },
    h1: {
      textTransform: 'lowercase',
      fontSize: '28px',
      marginBottom: '5px',
      fontWeight: 500,
      color: '#333',
    },
    h2: {
      fontSize: '26px',
      fontWeight: 600,
      marginBottom: '30px',
      color: '#333',
    },
    highlight: {
      display: 'inline-block',
      padding: '10px 24px',
      background: 'linear-gradient(to right, #4666f4, #00d48c)',
      color: 'white',
      borderRadius: '999px',
      fontWeight: 500,
      marginBottom: '30px',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      textDecoration: 'none',
    },
    features: {
      display: 'flex',
      justifyContent: 'center',
      gap: '40px',
      marginTop: '50px',
      flexWrap: 'wrap',
    },
    featureCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '30px 20px',
      width: '220px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
      fontWeight: 500,
      fontSize: '16px',
      transition: 'all 0.3s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
    },
    featureIcon: {
      fontSize: '36px',
    },
  };

  // Données des fonctionnalités
  const features = [
    { icon: '⚡', text: 'Tableau de bord' ,link:"/FraudAccountManagement" },
    { icon: '🧠', text: 'account management',link:"/FraudAccountManagement" },
    { icon: '📊', text: 'Rapport détaillé', link: '/report' },
  ];

  return (
    <div style={styles.appContainer}>
      {/* Fond dégradé avec effet de flou */}
      <div style={styles.backgroundOverlay}></div>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <img src="logo.png" alt="Logo Froud Detection" style={styles.logoImg} />
          <span><strong>Froud Detection</strong></span>
        </div>
        <nav>
          <a href="#" style={styles.navLink}>Accueil</a>
          <a href="/login" style={styles.navLink}>Se connecter</a>
          <a href="/register" style={styles.navLink}>S'inscrire</a>
          
        </nav>
      </header>

      {/* Contenu principal */}
      <main style={styles.main}>
        <h1 style={styles.h1}>welcome to</h1>
        <h2 style={styles.h2}>Froud detection</h2>

        <a
          href="/dashboard"
          style={styles.highlight}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Analyser les transactions
        </a>

        {/* Section fonctionnalités */}
        <div style={styles.features}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow =
                  '0 12px 32px rgba(0, 168, 107, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 10px 30px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              {feature.link ? (
                <a
                  href={feature.link}
                  style={{ textDecoration: 'none', color: 'black' }}
                >
                  {feature.text}
                </a>
              ) : (
                <div>{feature.text}</div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Welcome;
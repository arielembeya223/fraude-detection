import React from 'react';
import './App.css';

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
      marginTop: '80px',
      padding: '40px',
      maxWidth: '1000px',
      marginLeft: 'auto',
      marginRight: 'auto',
      textAlign: 'center',
      position: 'relative',
    },
    highlight: {
      display: 'inline-block',
      padding: '14px 32px',
      background: 'linear-gradient(to right, #4666f4, #00d48c)',
      color: 'white',
      borderRadius: '999px',
      fontWeight: 600,
      marginBottom: '50px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      fontSize: '18px',
      boxShadow: '0 6px 20px rgba(70, 102, 244, 0.3)',
      transform: 'scale(1.05)',
    },
    features: {
      display: 'flex',
      justifyContent: 'center',
      gap: '40px',
      marginTop: '40px',
      flexWrap: 'wrap',
    },
    featureCard: {
      background: 'white',
      borderRadius: '18px',
      padding: '35px 25px',
      width: '260px',
      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.1)',
      fontWeight: 500,
      fontSize: '17px',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '18px',
      transform: 'scale(1.05)',
    },
    featureIcon: {
      fontSize: '48px',
      marginBottom: '15px',
      transition: 'transform 0.3s ease',
    },
    featureText: {
      textDecoration: 'none',
      color: 'black',
      fontWeight: '600',
      fontSize: '19px',
    },
  };

  // Données des fonctionnalités
  const features = [
    { icon: '📊', text: 'Tableau de bord', link: "/FraudMonitoringDashboard" },
    { icon: '👥', text: 'Gestion de compte', link: "/FraudAccountManagement" },
    { icon: '📑', text: 'Rapport détaillé', link: '/report' },
  ];

  return (
    <div style={styles.appContainer}>
      {/* Fond dégradé avec effet de flou */}
      <div style={styles.backgroundOverlay}></div>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <img src="logo.png" alt="Logo Fraud Detection" style={styles.logoImg} />
          <span><strong>Fraud Detection</strong></span>
        </div>
        <nav>
          <a href="#" style={styles.navLink}>Accueil</a>
          <a href="/login" style={styles.navLink}>Se connecter</a>
          <a href="/register" style={styles.navLink}>S'inscrire</a>
        </nav>
      </header>

      {/* Contenu principal */}
      <main style={styles.main}>
        <a
          href="/dashboard"
          style={styles.highlight}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(70, 102, 244, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(70, 102, 244, 0.3)';
          }}
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
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 18px 40px rgba(0, 168, 107, 0.15)';
                e.currentTarget.querySelector('div').style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.1)';
                e.currentTarget.querySelector('div').style.transform = 'scale(1)';
              }}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <a href={feature.link} style={styles.featureText}>
                {feature.text}
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Welcome;
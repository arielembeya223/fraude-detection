import React from 'react';
import './NotFound.css'; // Le CSS sera dans ce fichier séparé

const NotFound = () => {
  return (
    <div className="notfound-page">
      <header className="header">
        <div className="logo">
          <img src="logo.png" alt="Logo Froud Detection" />
          <span><strong>Froud Detection</strong></span>
        </div>
        <nav>
          <a href="/">Accueil</a>
          <a href="#">À propos</a>
          <a href="#">Contact</a>
        </nav>
      </header>

      <main className="main">
        <h1 className="code">404</h1>
        <h2 className="message">Page non trouvée</h2>
        <span className="highlight" onClick={() => window.location.href = '/'}>Retour à l'accueil</span>
      </main>
    </div>
  );
};

export default NotFound;

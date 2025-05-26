import React from 'react';
import './App.css'; // on importe les styles externes

const welcome = () => {
  return (
    <>
      <header>
        <div className="logo">
          <img src="logo.png" alt="Logo Froud Detection" />
          <span><strong>Froud Detection</strong></span>
        </div>
        <nav>
          <a href="#">Accueil</a>
          <a href="#">À propos</a>
          <a href="#">Contact</a>
        </nav>
      </header>

      <main>
        <h1>welcome to</h1>
        <h2>Froud detection</h2>

        <a className="highlight" href='/dashboard'>Analyser les transactions</a>

        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <div>Analyse rapide</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <div>Algorithme intelligent</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <div>Rapport détaillé</div>
          </div>
        </div>
      </main>
    </>
  );
};

export default welcome;

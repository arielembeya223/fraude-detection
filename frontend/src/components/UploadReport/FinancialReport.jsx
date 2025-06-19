import React from 'react';
import './App.css';

const FinancialReport = () => {
  const reports = Array(6).fill({
    date: "10/11/2025",
    time: "10:15",
    title: "Rapport financier"
  });

  const handleNewReport = () => {
    // Logique pour créer un nouveau rapport
    console.log("Création d'un nouveau rapport");
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <img src="logo.png" alt="Logo Fraud Detection" />
          <span><strong>Fraud Detection</strong></span>
        </div>
        <nav>
          <a href="#">Accueil</a>
          <a href="#">se connecter</a>
          <a href="#">s'inscrire</a>
        </nav>
      </header>

      <main className="report-main">
        <h1>Nouveau rapport</h1>
        
        <div className="button-container">
          <a
            onClick={handleNewReport}
            className="new-report-button highlight"
            href='/reportConfiguration'
          >
            + Nouveau rapport
          </a>
        </div>
        
        <div className="report-grid">
          {reports.map((report, index) => (
            <div key={index} className="report-card compact">
              <div className="report-meta">
                <span>{report.date}</span>
                <span>{report.time}</span>
              </div>
              <h3>{report.title}</h3>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FinancialReport;
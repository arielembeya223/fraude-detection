import React, { useState } from 'react';
import './App.css';

const ReportConfiguration = () => {
  const [selectedElements, setSelectedElements] = useState({
    graph: false,
    alerts: false,
    transactions1: false,
    transactions2: false,
    transactions3: false
  });

  const handleCheckboxChange = (element) => {
    setSelectedElements({
      ...selectedElements,
      [element]: !selectedElements[element]
    });
  };

  const generateReport = () => {
    console.log("Rapport généré avec les éléments:", selectedElements);
    // Ici vous ajouterez la logique pour générer le rapport
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

      <main className="config-main">
        <h1>Elements à inclure dans le rapport</h1>
        
        <div className="checklist-container">
          <div className="checklist-item">
            <input
              type="checkbox"
              id="graph"
              checked={selectedElements.graph}
              onChange={() => handleCheckboxChange('graph')}
            />
            <label htmlFor="graph">Graphe</label>
          </div>
          
          <div className="checklist-item">
            <input
              type="checkbox"
              id="alerts"
              checked={selectedElements.alerts}
              onChange={() => handleCheckboxChange('alerts')}
            />
            <label htmlFor="alerts">Alertes</label>
          </div>
          
          <div className="checklist-item">
            <input
              type="checkbox"
              id="transactions1"
              checked={selectedElements.transactions1}
              onChange={() => handleCheckboxChange('transactions1')}
            />
            <label htmlFor="transactions1">Transactions</label>
          </div>
          
          <div className="checklist-item">
            <input
              type="checkbox"
              id="transactions2"
              checked={selectedElements.transactions2}
              onChange={() => handleCheckboxChange('transactions2')}
            />
            <label htmlFor="transactions2">Transactions</label>
          </div>
          
          <div className="checklist-item">
            <input
              type="checkbox"
              id="transactions3"
              checked={selectedElements.transactions3}
              onChange={() => handleCheckboxChange('transactions3')}
            />
            <label htmlFor="transactions3">Transactions</label>
          </div>
        </div>
        
        <div className="generate-button-container">
          <a
            onClick={generateReport}
            className="generate-button highlight"
            href='/reportView'
          >
            Générer
          </a>
        </div>
      </main>
    </div>
  );
};

export default ReportConfiguration;
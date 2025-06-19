import React, { useState, useEffect } from 'react';
import WorldMap from './WorldMap';
import AlertsTable from './AlertsTable';
import LiveTransactions from './LiveTransactions';
import AnalyticsKPIs from './AnalyticsKPIs';
import './App.css';

const Dashboard = () => {
  const [accountsData, setAccountsData] = useState([]);
  const [connectionsData, setConnectionsData] = useState([]);
  const [alertsData, setAlertsData] = useState([]);
  const [liveTransactions, setLiveTransactions] = useState([]);
  const [kpiData, setKpiData] = useState({
    totalTransactions: 0,
    totalAlerts: 0,
    highRiskAlerts: 0
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [eventSource, setEventSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/transactions');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        processData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Process data for all components
  const processData = (transactions) => {
    const accountsMap = new Map();
    const connections = [];
    const alerts = [];
    
    transactions.forEach(tx => {
      // Process accounts
      if (!accountsMap.has(tx.source)) {
        accountsMap.set(tx.source, {
          id: tx.source,
          latitude: tx.source_latitude,
          longitude: tx.source_longitude,
          risk: tx.is_fraud || tx.prediction
        });
      }
      
      if (!accountsMap.has(tx.target)) {
        accountsMap.set(tx.target, {
          id: tx.target,
          latitude: tx.target_latitude,
          longitude: tx.target_longitude,
          risk: false
        });
      }

      // Process connections
      connections.push({
        source: tx.source,
        target: tx.target,
        amount: tx.amount,
        is_fraud: tx.is_fraud || tx.prediction
      });

      // Process alerts
      if (tx.is_fraud || tx.prediction) {
        alerts.push({
          id: tx.id,
          source: tx.source,
          target: tx.target,
          amount: `${tx.amount.toFixed(2)} €`,
          score: Math.floor(tx.features?.risk_score * 100) || 50
        });
      }
    });

    // Update state
    setAccountsData(Array.from(accountsMap.values()));
    setConnectionsData(connections);
    setAlertsData(alerts);
    setLiveTransactions(transactions.slice(-10).reverse());
    setKpiData({
      totalTransactions: transactions.length,
      totalAlerts: alerts.length,
      highRiskAlerts: alerts.filter(a => a.score >= 90).length
    });
  };

  // Handle streaming
  const toggleStreaming = () => {
    if (isStreaming) {
      eventSource.close();
      setIsStreaming(false);
      setEventSource(null);
    } else {
      const es = new EventSource('http://localhost:5000/api/transactions/stream');
      
      es.onmessage = (e) => {
        const newTx = JSON.parse(e.data);
        
        // Update accounts
        setAccountsData(prev => {
          const newAccounts = new Map(prev.map(a => [a.id, a]));
          
          if (!newAccounts.has(newTx.source)) {
            newAccounts.set(newTx.source, {
              id: newTx.source,
              latitude: newTx.source_latitude,
              longitude: newTx.source_longitude,
              risk: newTx.is_fraud || newTx.prediction
            });
          }
          
          if (!newAccounts.has(newTx.target)) {
            newAccounts.set(newTx.target, {
              id: newTx.target,
              latitude: newTx.target_latitude,
              longitude: newTx.target_longitude,
              risk: false
            });
          }
          
          return Array.from(newAccounts.values());
        });

        // Update connections
        setConnectionsData(prev => [...prev, {
          source: newTx.source,
          target: newTx.target,
          amount: newTx.amount,
          is_fraud: newTx.is_fraud || newTx.prediction
        }]);

        // Update alerts if fraudulent
        if (newTx.is_fraud || newTx.prediction) {
          setAlertsData(prev => [{
            id: newTx.id,
            source: newTx.source,
            target: newTx.target,
            amount: `${newTx.amount.toFixed(2)} €`,
            score: Math.floor((newTx.features?.risk_score || 0.7) * 100)
          }, ...prev.slice(0, 49)]); // Keep max 50 alerts
        }

        // Update live transactions
        setLiveTransactions(prev => [{
          id: newTx.id,
          source: newTx.source,
          target: newTx.target,
          amount: `${newTx.amount.toFixed(2)} €`,
          date: new Date(newTx.timestamp).toLocaleTimeString()
        }, ...prev.slice(0, 9)]); // Keep last 10

        // Update KPIs
        setKpiData(prev => ({
          totalTransactions: prev.totalTransactions + 1,
          totalAlerts: (newTx.is_fraud || newTx.prediction) ? prev.totalAlerts + 1 : prev.totalAlerts,
          highRiskAlerts: ((newTx.is_fraud || newTx.prediction) && (newTx.features?.risk_score >= 0.9)) 
            ? prev.highRiskAlerts + 1 
            : prev.highRiskAlerts
        }));
      };

      es.onerror = (err) => {
        console.error('SSE error:', err);
        es.close();
        setIsStreaming(false);
      };

      setEventSource(es);
      setIsStreaming(true);
    }
  };

  if (loading) return <div className="loading">Chargement des données...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="dashboard-container">
      {/* Carte avec bouton de streaming */}
      <div className="dashboard-card full-width">
        <div className="card-header">
          <h2>📊 Graphe des Transactions</h2>
          <a
          href='map'
            className={`stream-button ${isStreaming ? 'active' : ''}`}
          >
            full carte 
          </a>
          <button 
            onClick={toggleStreaming}
            className={`stream-button ${isStreaming ? 'active' : ''}`}
          >
            {isStreaming ? 'Arrêter le Streaming' : 'Démarrer le Streaming'}
          </button>
        </div>
        <WorldMap accounts={accountsData} connections={connectionsData} />
      </div>

      {/* KPIs */}
      <div className="kpi-container full-width">
        <AnalyticsKPIs data={kpiData} />
      </div>

      {/* Alertes */}
      <div className="dashboard-card">
        <h2>🔴 Alertes de Fraude ({alertsData.length})</h2>
        <AlertsTable alerts={alertsData} />
      </div>

      {/* Transactions */}
      <div className="dashboard-card">
        <h2>🔄 Transactions Temps Réel</h2>
        <LiveTransactions transactions={liveTransactions} />
      </div>
    </div>
  );
};

export default Dashboard;
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
      // Use backend-provided status or fallback to prediction
      const status = tx.status || (tx.prediction ? 'fraud' : 'no_fraud');
      const fraudProbability = tx.fraud_probability !== undefined ? 
                             tx.fraud_probability * 100 : 
                             (tx.features?.risk_score || 0) * 100;

      // Source account
      accountsMap.set(tx.source, {
        id: tx.source,
        latitude: tx.source_latitude,
        longitude: tx.source_longitude,
        status: status,
        fraud_probability: fraudProbability,
        amount: tx.amount
      });

      // Target account (always safe unless specified)
      accountsMap.set(tx.target, {
        id: tx.target,
        latitude: tx.target_latitude,
        longitude: tx.target_longitude,
        status: 'no_fraud',
        fraud_probability: 0,
        amount: tx.amount
      });

      // Connection
      connections.push({
        source: tx.source,
        target: tx.target,
        amount: tx.amount,
        status: status,
        fraud_probability: fraudProbability
      });

      // Alerts
      if (status === 'fraud' || fraudProbability >= 70) {
        alerts.push({
          id: tx.id,
          source: tx.source,
          target: tx.target,
          amount: `${tx.amount.toFixed(2)} €`,
          score: Math.floor(fraudProbability),
          timestamp: tx.timestamp,
          fraud_probability: fraudProbability
        });
      }
    });

    setAccountsData(Array.from(accountsMap.values()));
    setConnectionsData(connections);
    setAlertsData(alerts);
    setLiveTransactions(transactions.slice(-10).reverse());
    setKpiData({
      totalTransactions: transactions.length,
      totalAlerts: alerts.length,
      highRiskAlerts: alerts.filter(a => a.score >= 70).length
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
        const status = newTx.status || (newTx.is_fraud ? 'fraud' : 'no_fraud');
        const fraudProbability = newTx.fraud_probability !== undefined ? 
                               newTx.fraud_probability * 100 : 
                               (newTx.features?.risk_score || 0) * 100;

        // Update accounts
        setAccountsData(prev => {
          const newAccounts = new Map(prev.map(a => [a.id, a]));
          
          // Update source account
          newAccounts.set(newTx.source, {
            id: newTx.source,
            latitude: newTx.source_latitude,
            longitude: newTx.source_longitude,
            status: status,
            fraud_probability: fraudProbability,
            amount: newTx.amount
          });

          // Update target account
          newAccounts.set(newTx.target, {
            id: newTx.target,
            latitude: newTx.target_latitude,
            longitude: newTx.target_longitude,
            status: 'no_fraud',
            fraud_probability: 0,
            amount: newTx.amount
          });
          
          return Array.from(newAccounts.values());
        });

        // Update connections
        setConnectionsData(prev => [...prev, {
          source: newTx.source,
          target: newTx.target,
          amount: newTx.amount,
          status: status,
          fraud_probability: fraudProbability
        }]);

        // Update alerts if needed
        if (status === 'fraud' || fraudProbability >= 70) {
          setAlertsData(prev => [{
            id: newTx.id,
            source: newTx.source,
            target: newTx.target,
            amount: `${newTx.amount.toFixed(2)} €`,
            score: Math.floor(fraudProbability),
            timestamp: newTx.timestamp,
            fraud_probability: fraudProbability.toFixed(2),
          }, ...prev.slice(0, 49)]);
        }

        // Update live transactions
        setLiveTransactions(prev => [{
          id: newTx.id,
          source: newTx.source,
          target: newTx.target,
          amount: `${newTx.amount.toFixed(2)} €`,
          status: status,
          date: new Date(newTx.timestamp).toLocaleTimeString()
        }, ...prev.slice(0, 9)]);

        // Update KPIs
        setKpiData(prev => ({
          totalTransactions: prev.totalTransactions + 1,
          totalAlerts: (status === 'fraud' || fraudProbability >= 70) ? 
                      prev.totalAlerts + 1 : prev.totalAlerts,
          highRiskAlerts: (status === 'fraud' || fraudProbability >= 70) ? 
                          prev.highRiskAlerts + 1 : prev.highRiskAlerts
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
      <div className="dashboard-card full-width">
        <div className="card-header">
          <h2>📊 Graphe des Transactions</h2>
          <button 
            onClick={toggleStreaming}
            className={`stream-button ${isStreaming ? 'active' : ''}`}
          >
            {isStreaming ? 'Arrêter le Streaming' : 'Démarrer le Streaming'}
          </button>
          <a
            href='/map'
            className={`stream-button ${isStreaming ? 'active' : ''}`}
            style={{textDecoration:'none'}}
          >
            full map
          </a>
        </div>
        <WorldMap accounts={accountsData} connections={connectionsData} />
      </div>

      <div className="kpi-container full-width">
        <AnalyticsKPIs data={kpiData} />
      </div>

      <div className="dashboard-card">
        <h2>🔴 Alertes de Fraude ({alertsData.length})</h2>
        <AlertsTable alerts={alertsData} />
      </div>

      <div className="dashboard-card">
        <h2>🔄 Transactions Temps Réel</h2>
        <LiveTransactions transactions={liveTransactions} />
      </div>
    </div>
  );
};

export default Dashboard;
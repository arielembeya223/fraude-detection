import React from 'react';
import WorldMap from './WorldMap';
import AlertsTable from './AlertsTable';
import LiveTransactions from './LiveTransactions';
import AnalyticsKPIs from './AnalyticsKPIs';

const Dashboard = () => {
  // Données simulées
  const accountsData = [
    { id: 'Client X', latitude: 40.7128, longitude: -74.0060, risk: true },
    { id: 'Client Y', latitude: 48.8566, longitude: 2.3522, risk: false },
    { id: 'Client Z', latitude: 35.6762, longitude: 139.6503, risk: true }
  ];

  const connectionsData = [
    { source: 'Client X', target: 'Client Y', amount: '1.2M €' },
    { source: 'Client Z', target: 'Client X', amount: '750K €' }
  ];

  const alertsData = [
    { id: 'A001', source: 'Client X', target: 'Client Y', amount: '12,500 €', score: 95 },
    { id: 'A002', source: 'Client Z', target: 'Client W', amount: '8,200 €', score: 75 }
  ];

  const kpiData = {
    totalTransactions: 1242,
    totalAlerts: 42,
    highRiskAlerts: 15
  };

  return (
    <>
      {/* Première ligne - Carte et KPIs */}
      <div className="card">
        <h2>📊 Graphe des Transactions</h2>
        <WorldMap accounts={accountsData} connections={connectionsData} />
      </div>
      
      {/* Deuxième ligne - Alertes (pleine largeur) */}
            <div className="card" style={{ gridColumn: 'span 1' }}>
        <h2>🔴 Alertes de Fraude</h2>
        <AlertsTable alerts={alertsData} />
      </div>

      <div className="kpi-container">
        <AnalyticsKPIs data={kpiData} />
      </div>



      {/* Troisième ligne - Transactions */}
      <div className="card" style={{ gridColumn: 'span 1' }}>
        <h2>🔄 Transactions Temps Réel</h2>
        <LiveTransactions />
      </div>
    </>
  );
};

export default Dashboard;
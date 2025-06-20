import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const FraudMonitoringDashboard = () => {
  // États
  const [transactions, setTransactions] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [blockedAccounts, setBlockedAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [streamData, setStreamData] = useState([]);

  // Récupération des données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/transactions');
        const data = await response.json();
        setTransactions(data);
        prepareChartData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur de chargement:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Connexion au flux temps réel
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5000/api/transactions/stream');
    
    eventSource.onmessage = (event) => {
      const newTransaction = JSON.parse(event.data);
      setStreamData(prev => [...prev.slice(-9), newTransaction]);
      
      setTransactions(prev => {
        const updated = [...prev, newTransaction].slice(-500);
        prepareChartData(updated);
        return updated;
      });
    };

    return () => eventSource.close();
  }, []);

  // Préparation des données pour les graphiques
  const prepareChartData = (txs) => {
    if (!txs || txs.length === 0) return;

    // Données par heure
    const hourlyStats = Array.from({length: 24}, (_, hour) => {
      const hourTxs = txs.filter(tx => new Date(tx.timestamp).getHours() === hour);
      return {
        hour: `${hour}h`,
        transactions: hourTxs.length,
        frauds: hourTxs.filter(tx => tx.is_fraud).length,
        amount: hourTxs.reduce((sum, tx) => sum + tx.amount, 0)
      };
    });
    setHourlyData(hourlyStats);

    // Distribution des risques
    const riskLevels = [
      { name: 'High', min: 0.7, color: '#FB8C00' },
      { name: 'Medium', min: 0.3, color: '#FFA726' },
      { name: 'Low', min: 0, color: '#7CB342' }
    ];

    const riskDistribution = riskLevels.map(level => {
      const count = txs.filter(tx => {
        const riskScore = tx.features?.risk_score || 0;
        return riskScore >= level.min;
      }).length;
      return { ...level, value: count };
    });
    setRiskData(riskDistribution);
  };

  // Blocage d'un compte
  const blockAccount = (account) => {
    if (!blockedAccounts.includes(account)) {
      setBlockedAccounts([...blockedAccounts, account]);
      alert(`Account ${account} blocked`);
    }
  };

  // Calcul des statistiques
  const stats = {
    total: transactions.length,
    unusual: transactions.filter(tx => tx.prediction).length,
    fraud: transactions.filter(tx => tx.is_fraud).length,
    amount: transactions.reduce((sum, tx) => sum + tx.amount, 0)
  };

  // Données pour les alertes
  const unusualAlerts = transactions
    .filter(tx => tx.prediction)
    .slice(0, 3)
    .map(tx => ({
      id: tx.id,
      client: tx.source,
      description: `Transaction inhabituelle de $${tx.amount.toFixed(2)} vers ${tx.target}`
    }));

  // Données pour les investigations
  const investigations = transactions
    .filter(tx => tx.prediction || tx.is_fraud)
    .slice(0, 4)
    .map(tx => ({
      id: tx.id,
      bank: `Bank ${tx.source.slice(0, 4)}`,
      client: tx.source,
      assignedTo: `Agent ${tx.source.slice(0, 5)}`,
      status: tx.is_fraud ? 'Confirmed fraud' : tx.prediction ? 'In review' : 'Verified'
    }));

  return (
    <div style={styles.dashboardContainer}>
      {/* Première Ligne - 3 cartes horizontales */}
      <div style={styles.horizontalRow}>
        {/* Carte Recent Activity */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Recent Activity</h3>
          <div style={styles.activityStats}>
            <div style={styles.statItem}>
              <p style={styles.statLabel}>Total transactions</p>
              <p style={styles.statValue}>{stats.total.toLocaleString()}</p>
            </div>
            <div style={styles.statItem}>
              <p style={styles.statLabel}>Unusual transactions</p>
              <p style={{...styles.statValue, color: '#FFA726'}}>{stats.unusual}</p>
            </div>
          </div>
        </div>

        {/* Carte Transaction Size */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Transaction size (m/s)</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="hour" stroke="#757575" />
                <YAxis stroke="#757575" />
                <Tooltip />
                <Bar 
                  dataKey="transactions" 
                  fill="#FFA726" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carte Risk Distribution */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Risk distribution</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Deuxième Ligne - 2 colonnes */}
      <div style={styles.twoColumns}>
        {/* Colonne Alertes */}
        <div style={styles.column}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Unusual transaction alerts</h3>
            <div style={styles.alertsList}>
              {unusualAlerts.length > 0 ? (
                unusualAlerts.map(alert => (
                  <div key={alert.id} style={styles.alertItem}>
                    <p style={styles.alertText}>
                      <strong>Client {alert.client}</strong> {alert.description}
                    </p>
                    <button 
                      style={styles.alertButton}
                      onClick={() => blockAccount(alert.client)}
                    >
                      Block
                    </button>
                  </div>
                ))
              ) : (
                <p style={styles.noAlerts}>No unusual activity detected</p>
              )}
            </div>
          </div>
        </div>

        {/* Colonne Investigations */}
        <div style={styles.column}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Ongoing investigation</h3>
            <table style={styles.investigationTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Bank</th>
                  <th style={styles.tableHeader}>Client</th>
                  <th style={styles.tableHeader}>Assigned to</th>
                  <th style={styles.tableHeader}>Status</th>
                </tr>
              </thead>
              <tbody>
                {investigations.length > 0 ? (
                  investigations.map(invest => (
                    <tr key={invest.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{invest.bank}</td>
                      <td style={styles.tableCell}>{invest.client}</td>
                      <td style={styles.tableCell}>{invest.assignedTo}</td>
                      <td style={styles.tableCell}>
                        <span style={getStatusStyle(invest.status)}>
                          {invest.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{...styles.tableCell, textAlign: 'center'}}>
                      No ongoing investigations
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div style={styles.footer}>
        <p>Last updated: {new Date().toLocaleString()} | Status: {isLoading ? 'Loading...' : 'Active'}</p>
      </div>
    </div>
  );
};

// Styles
const styles = {
  dashboardContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Roboto', sans-serif",
    color: '#424242',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh'
  },
  horizontalRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    '@media (max-width: 1200px)': {
      flexDirection: 'column'
    }
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 15px 0',
    color: '#2c3e50'
  },
  activityStats: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'space-between'
  },
  statItem: {
    flex: 1,
    textAlign: 'center',
    padding: '15px',
    backgroundColor: '#FAFAFA',
    borderRadius: '6px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#7f8c8d',
    margin: '0 0 5px 0'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0',
    color: '#2c3e50'
  },
  chartWrapper: {
    height: '200px',
    marginTop: '10px'
  },
  twoColumns: {
    display: 'flex',
    gap: '20px',
    '@media (max-width: 768px)': {
      flexDirection: 'column'
    }
  },
  column: {
    flex: 1
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    height: '100%'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 15px 0',
    color: '#2c3e50',
    borderBottom: '1px solid #EEEEEE',
    paddingBottom: '10px'
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  alertItem: {
    backgroundColor: '#FFF3E0',
    padding: '15px',
    borderRadius: '6px',
    borderLeft: '4px solid #FB8C00'
  },
  alertText: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    lineHeight: '1.4'
  },
  alertButton: {
    backgroundColor: '#FB8C00',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#E65100'
    }
  },
  noAlerts: {
    color: '#9E9E9E',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px'
  },
  investigationTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  },
  tableHeader: {
    textAlign: 'left',
    padding: '12px 15px',
    backgroundColor: '#FAFAFA',
    borderBottom: '1px solid #E0E0E0',
    fontWeight: '600',
    color: '#424242'
  },
  tableRow: {
    borderBottom: '1px solid #EEEEEE',
    ':hover': {
      backgroundColor: '#FAFAFA'
    }
  },
  tableCell: {
    padding: '12px 15px',
    verticalAlign: 'middle'
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#757575',
    marginTop: '20px',
    padding: '15px'
  }
};

// Helper pour les styles de statut
function getStatusStyle(status) {
  const base = {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    display: 'inline-block'
  };

  switch(status) {
    case 'Confirmed fraud':
      return { ...base, backgroundColor: '#FFEBEE', color: '#C62828' };
    case 'In review':
      return { ...base, backgroundColor: '#FFF8E1', color: '#FF8F00' };
    case 'Verified':
      return { ...base, backgroundColor: '#E8F5E9', color: '#2E7D32' };
    default:
      return base;
  }
}

export default FraudMonitoringDashboard;
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
  const [timeFilter, setTimeFilter] = useState('second');
  const [investigations, setInvestigations] = useState([]);
  const [transactionsBySecond, setTransactionsBySecond] = useState([]);

  // Récupération des données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Charger les transactions avec le filtre par défaut (seconde)
        const txResponse = await fetch(`http://localhost:5000/api/transactions?time_filter=${timeFilter}`);
        const txData = await txResponse.json();
        setTransactions(txData);
        
        // Charger les investigations
        const invResponse = await fetch('http://localhost:5000/api/investigations');
        const invData = await invResponse.json();
        setInvestigations(invData);
        
        prepareChartData(txData);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur de chargement:", error);
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [timeFilter]);

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

      // Mettre à jour les investigations si la nouvelle transaction est suspecte
      if (newTransaction.is_fraud || newTransaction.prediction) {
        setInvestigations(prev => {
          const newInvestigation = {
            id: newTransaction.id,
            bank: `Bank ${newTransaction.source.slice(3, 6)}`,
            client: newTransaction.source,
            assignedTo: `Agent ${['A123', 'B456', 'C789'][Math.floor(Math.random() * 3)]}`,
            status: newTransaction.is_fraud ? 'Confirmed fraud' : 'In review',
            amount: newTransaction.amount,
            location: `${newTransaction.source_latitude.toFixed(2)}, ${newTransaction.source_longitude.toFixed(2)}`,
            timestamp: newTransaction.timestamp
          };
          return [newInvestigation, ...prev.slice(0, 9)]; // Garder seulement les 10 plus récentes
        });
      }
    };

    return () => eventSource.close();
  }, []);

  // Préparation des données par seconde
  const prepareTransactionsBySecond = (txs) => {
    if (!txs || txs.length === 0) return;

    // Grouper par seconde
    const secondsMap = {};
    
    txs.forEach(tx => {
      const date = new Date(tx.timestamp);
      const seconds = date.getSeconds();
      const minute = date.getMinutes();
      const hour = date.getHours();
      const secondKey = `${hour}:${minute}:${seconds}`;

      if (!secondsMap[secondKey]) {
        secondsMap[secondKey] = {
          second: secondKey,
          count: 0,
          frauds: 0,
          amount: 0
        };
      }

      secondsMap[secondKey].count++;
      if (tx.is_fraud) secondsMap[secondKey].frauds++;
      secondsMap[secondKey].amount += tx.amount;
    });

    // Convertir en tableau et trier par temps
    const result = Object.values(secondsMap).sort((a, b) => {
      return a.second.localeCompare(b.second);
    });

    // Garder seulement les 60 dernières secondes
    setTransactionsBySecond(result.slice(-60));
  };

  // Préparation des données pour les graphiques
  const prepareChartData = (txs) => {
    if (!txs || txs.length === 0) return;

    prepareTransactionsBySecond(txs);

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
        const riskScore = tx.fraud_probability || 0;
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
    unusual: transactions.filter(tx => tx.status === 'hot_potential').length,
    fraud: transactions.filter(tx => tx.is_fraud).length,
    amount: transactions.reduce((sum, tx) => sum + tx.amount, 0)
  };

  // Données pour les alertes
  const unusualAlerts = transactions
    .filter(tx => tx.status === 'hot_potential')
    .slice(0, 3)
    .map(tx => ({
      id: tx.id,
      client: tx.source,
      description: `Transaction inhabituelle de $${tx.amount.toFixed(2)} vers ${tx.target}`,
      timestamp: tx.timestamp
    }));

  // Gestion du changement de filtre temporel
  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    setIsLoading(true);
  };

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
          <div style={styles.timeFilterContainer}>
            <button 
              style={timeFilter === 'second' ? styles.activeTimeFilter : styles.timeFilter}
              onClick={() => handleTimeFilterChange('second')}
            >
              Second
            </button>
            <button 
              style={timeFilter === 'minute' ? styles.activeTimeFilter : styles.timeFilter}
              onClick={() => handleTimeFilterChange('minute')}
            >
              Minute
            </button>
            <button 
              style={timeFilter === 'hour' ? styles.activeTimeFilter : styles.timeFilter}
              onClick={() => handleTimeFilterChange('hour')}
            >
              Hour
            </button>
          </div>
        </div>

        {/* Carte Transaction Size */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Transactions par seconde</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={transactionsBySecond} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="second" 
                  stroke="#757575"
                  label={{ 
                    value: 'Secondes', 
                    position: 'insideBottom', 
                    offset: -40 
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#757575"
                  label={{ 
                    value: 'Nb transactions', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} transactions`, 'Nombre']}
                  labelFormatter={(value) => `Seconde ${value}`}
                />
                <Bar 
                  dataKey="count" 
                  fill="#FFA726" 
                  radius={[4, 4, 0, 0]}
                  name="Transactions"
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
                  <div key={`${alert.id}-${alert.timestamp}`} style={styles.alertItem}>
                    <p style={styles.alertText}>
                      <strong>Client {alert.client}</strong> {alert.description}
                    </p>
                    <div style={styles.alertActions}>
                      <button 
                        style={styles.alertButton}
                        onClick={() => blockAccount(alert.client)}
                      >
                        Block
                      </button>
                      <span style={styles.alertTime}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
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
            <h3 style={styles.sectionTitle}>Ongoing investigations</h3>
            <table style={styles.investigationTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Bank</th>
                  <th style={styles.tableHeader}>Client</th>
                  <th style={styles.tableHeader}>Amount</th>
                  <th style={styles.tableHeader}>Location</th>
                  <th style={styles.tableHeader}>Assigned to</th>
                  <th style={styles.tableHeader}>Status</th>
                </tr>
              </thead>
              <tbody>
                {investigations.length > 0 ? (
                  investigations.map(invest => (
                    <tr key={`${invest.id}-${invest.timestamp}`} style={styles.tableRow}>
                      <td style={styles.tableCell}>{invest.bank}</td>
                      <td style={styles.tableCell}>{invest.client}</td>
                      <td style={styles.tableCell}>${invest.amount.toFixed(2)}</td>
                      <td style={styles.tableCell}>{invest.location}</td>
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
                    <td colSpan="6" style={{...styles.tableCell, textAlign: 'center'}}>
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
        <p>Last updated: {new Date().toLocaleString()} | Status: {isLoading ? 'Loading...' : 'Active'} | Filter: {timeFilter}</p>
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
  timeFilterContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  },
  timeFilter: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  activeTimeFilter: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#FFA726',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s'
  },
  chartWrapper: {
    height: '300px',
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
  alertActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  alertButton: {
    backgroundColor: '#FB8C00',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#E65100'
    }
  },
  alertTime: {
    fontSize: '12px',
    color: '#757575'
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
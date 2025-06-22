import React, { useState, useEffect } from 'react';
import { faFileExport, faSyncAlt, faLock, faLockOpen, faEye, faBan, faUserLock, faUserCheck, faFileInvoiceDollar, faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FraudAccountManagement = () => {
  // États pour les données et l'interface
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bankFilter, setBankFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [stats, setStats] = useState({
    blockedAccounts: 42,
    investigations: 18,
    fraudAmount: 2.1,
    newCases: 7
  });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // URL de l'API Flask
  const API_URL = 'http://localhost:5000/api/transactions';
  const API_STREAM_URL = 'http://localhost:5000/api/transactions/stream';

  // Fonction pour formater une transaction
  const formatTransaction = (tx) => ({
    id: tx.id || `TX${Date.now()}${Math.floor(Math.random() * 1000)}`,
    client: tx.source || `Client${Math.floor(Math.random() * 1000)}`,
    bank: getRandomBank(),
    accountNumber: tx.target || `ACC${Math.floor(Math.random() * 1000000)}`,
    amount: `$${(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    lastActivity: tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : new Date().toLocaleDateString(),
    status: tx.is_fraud ? 'blocked' : (tx.prediction ? 'pending' : 'active'),
    statusText: tx.is_fraud ? 'Bloqué' : (tx.prediction ? 'En investigation' : 'Actif'),
    is_fraud: tx.is_fraud || false,
    prediction: tx.prediction || false,
    source_latitude: tx.source_latitude,
    source_longitude: tx.source_longitude,
    target_latitude: tx.target_latitude,
    target_longitude: tx.target_longitude
  });

  // Fonction utilitaire pour obtenir une banque aléatoire
  const getRandomBank = () => {
    const banks = ["Federal Bank USA", "Crédit Européen", "Global Finance", "Pacific Bank"];
    return banks[Math.floor(Math.random() * banks.length)];
  };
const generateReport = async () => {
  try {
    // 1. Préparer les données au même format que dans ta curl
    const reportData = {
      stats,           // doit être défini quelque part dans ton code
      accounts: filteredAccounts,  // idem, tableau filtré
      generatedAt: new Date().toISOString(),  // format ISO UTC exact
    };

    // 2. Envoyer la requête POST avec le bon body
    const response = await fetch('http://localhost:8000/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Si tu n'as pas besoin d'auth, tu peux retirer la ligne suivante
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        data: reportData,  // objet direct, exactement comme dans ta curl
        type: 'test_report' // identique à curl, sinon adapte ici
      }),
      credentials: 'include', // garde si tu utilises cookies de session
    });

    // 3. Validation du content-type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Réponse non JSON:', text);
      throw new Error('Le serveur a retourné une réponse non JSON');
    }

    // 4. Extraire JSON et vérifier succès
    const result = await response.json();

    if (!response.ok || result.success === false) {
      // Utilise le message du serveur si dispo, sinon un message générique
      const msg = result.error_message || result.message || 'Erreur lors de la sauvegarde';
      throw new Error(msg);
    }

    // 5. Retour et feedback utilisateur
    alert(`Rapport #${result.report_id} enregistré avec succès !`);
    console.log('Réponse serveur:', result);

    return result; // utile si tu veux utiliser la réponse ailleurs

  } catch (error) {
    console.error('Erreur complète:', error);

    const errorMessage = error.message.includes('JSON') 
      ? 'Erreur de communication avec le serveur' 
      : error.message;

    alert(`Échec de l'enregistrement : ${errorMessage}`);
  }
};

  // Charger les données initiales
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Erreur réseau');
      const data = await response.json();
      
      const formattedAccounts = Array.isArray(data) 
        ? data.map(formatTransaction)
        : (data.transactions || []).map(formatTransaction);
      
      setAccounts(formattedAccounts);
      updateStats(formattedAccounts);
    } catch (err) {
      setError(err.message);
      // Fallback avec des données mockées si l'API échoue
      setAccounts(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les statistiques
  const updateStats = (accounts) => {
    const blocked = accounts.filter(a => a.status === 'blocked').length;
    const investigations = accounts.filter(a => a.status === 'pending').length;
    const fraudAmount = accounts
      .filter(a => a.is_fraud)
      .reduce((sum, a) => sum + parseFloat(a.amount.replace(/[^0-9.]/g, '')), 0);
    
    setStats({
      blockedAccounts: blocked,
      investigations,
      fraudAmount,
      newCases: Math.floor(Math.random() * 10) + 1 // Valeur aléatoire pour l'exemple
    });
  };

  // Générer des données mockées pour le fallback
  const generateMockData = () => {
    const mockData = [];
    for (let i = 0; i < 20; i++) {
      mockData.push(formatTransaction({
        source: `Client${i}`,
        target: `ACC${Math.floor(100000 + Math.random() * 900000)}`,
        amount: Math.random() > 0.3 ? 
          Math.floor(10 + Math.random() * 500) : 
          Math.floor(500 + Math.random() * 4500),
        is_fraud: Math.random() > 0.7,
        prediction: Math.random() > 0.8,
        timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
      }));
    }
    return mockData;
  };

  // Configurer le streaming SSE
  useEffect(() => {
    const eventSource = new EventSource(API_STREAM_URL);
    
    eventSource.onmessage = (event) => {
      try {
        const newTx = JSON.parse(event.data);
        const formattedTx = formatTransaction(newTx);
        setAccounts(prev => [formattedTx, ...prev]);
        updateStats([formattedTx, ...accounts]);
      } catch (e) {
        console.error("Error parsing SSE data:", e);
      }
    };
    
    eventSource.onerror = () => {
      console.log("SSE error, reconnecting...");
      eventSource.close();
    };
    
    return () => eventSource.close();
  }, []);

  // Chargement initial
  useEffect(() => {
    fetchData();
  }, []);

  // Fonctions de gestion d'état
  const toggleAccountStatus = (id) => {
    setAccounts(accounts.map(account => {
      if (account.id === id) {
        const newStatus = account.status === 'blocked' ? 'active' : 'blocked';
        return {
          ...account,
          status: newStatus,
          statusText: newStatus === 'blocked' ? 'Bloqué' : 'Actif'
        };
      }
      return account;
    }));
  };

  // Filtrage et pagination
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'blocked' && account.status === 'blocked') ||
      (statusFilter === 'active' && account.status === 'active') ||
      (statusFilter === 'pending' && account.status === 'pending');
    
    const matchesBank = 
      bankFilter === 'all' || 
      account.bank.toLowerCase().includes(bankFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesBank;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Formatage des valeurs
  const formattedFraudAmount = `$${(stats.fraudAmount / 1000000).toFixed(1)}M`;

  if (loading) return <div className="loading">Chargement en cours...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="dashboard-container">
      <header>
        <div className="header-left">
          <h1>Gestion des Comptes Frauduleux</h1>
          <p>Surveillance et gestion des comptes suspects et frauduleux</p>
        </div>
        <div className="header-right">
        <button className="btn btn-primary" onClick={generateReport}>
          <FontAwesomeIcon icon={faFileExport} /> le rapport
        </button>
          <button className="btn btn-secondary" onClick={fetchData}>
            <FontAwesomeIcon icon={faSyncAlt} /> Actualiser
          </button>
        </div>
      </header>
      
      <div className="stats-container">
        <div className="stat-card warning">
          <div className="stat-value stat-fraud">{stats.blockedAccounts}</div>
          <div className="stat-label">Comptes bloqués</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.investigations}</div>
          <div className="stat-label">Comptes en investigation</div>
        </div>
        <div className="stat-card">
          <div className="stat-value stat-fraud">{formattedFraudAmount}</div>
          <div className="stat-label">Montant frauduleux total</div>
        </div>
        <div className="stat-card info">
          <div className="stat-value">{stats.newCases}</div>
          <div className="stat-label">Nouveaux cas (7 jours)</div>
        </div>
      </div>
      
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="search">Recherche</label>
          <input 
            type="text" 
            id="search" 
            placeholder="Nom, banque, numéro de compte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="status">Statut</label>
          <select 
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="blocked">Comptes bloqués</option>
            <option value="active">Comptes actifs</option>
            <option value="pending">En investigation</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="bank">Banque</label>
          <select 
            id="bank"
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
          >
            <option value="all">Toutes les banques</option>
            <option value="federal">Federal Bank USA</option>
            <option value="credit">Crédit Européen</option>
            <option value="global">Global Finance</option>
            <option value="pacific">Pacific Bank</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="date">Date de blocage</label>
          <input 
            type="date" 
            id="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>
      
      <div className="last-cards-container">
        <div className="card card-large">
          <div className="card-header">
            <h2 className="card-title">Liste des Comptes Frauduleux</h2>
            <div>
              <span>Total: {filteredAccounts.length} comptes</span>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Banque</th>
                  <th>Numéro de compte</th>
                  <th>Montant</th>
                  <th>Dernière activité</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAccounts.map(account => (
                  <tr key={account.id}>
                    <td>{account.client}</td>
                    <td>{account.bank}</td>
                    <td>{account.accountNumber}</td>
                    <td className={account.is_fraud ? "stat-fraud" : ""}>{account.amount}</td>
                    <td>{account.lastActivity}</td>
                    <td>
                      <span className={`status-badge status-${account.status}`}>
                        {account.statusText}
                      </span>
                    </td>
                    <td>
                      <div className="account-actions">
                        <button 
                          className={`action-btn ${account.status === 'blocked' ? 'unblock-btn' : 'block-btn'}`}
                          onClick={() => toggleAccountStatus(account.id)}
                        >
                          <FontAwesomeIcon icon={account.status === 'blocked' ? faLockOpen : faBan} />
                          {account.status === 'blocked' ? 'Débloquer' : 'Bloquer'}
                        </button>
                        <button className="action-btn details-btn">
                          <FontAwesomeIcon icon={faEye} /> Détails
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page} 
                className={`page-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
        
        <div className="card quick-actions-card">
          <div className="card-header">
            <h2 className="card-title">Actions Rapides</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            <button className="btn btn-primary" style={{ justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faUserLock} /> Bloquer un compte
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faUserCheck} /> Lever un blocage
            </button>
            <button className="btn" style={{ justifyContent: 'center', background: '#f5f5f5' }}>
              <FontAwesomeIcon icon={faFileInvoiceDollar} /> Générer un rapport
            </button>
            <button className="btn" style={{ justifyContent: 'center', background: '#f5f5f5' }}>
              <FontAwesomeIcon icon={faBell} /> Configurer alertes
            </button>
          </div>
          
          <div className="card-header" style={{ marginTop: '30px' }}>
            <h2 className="card-title">Statistiques Récentes</h2>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>Nouveaux comptes bloqués</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--warning-color)' }}>5</div>
              <div style={{ fontSize: '13px', color: '#4caf50' }}>+2 depuis hier</div>
            </div>
            
            <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>Investigations en cours</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>12</div>
              <div style={{ fontSize: '13px', color: '#2196f3' }}>3 terminées cette semaine</div>
            </div>
            
            <div style={{ background: '#fff8e1', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>Alertes non traitées</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>8</div>
              <div style={{ fontSize: '13px', color: '#ff9800' }}>Priorité haute: 3</div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        :root {
          --primary-color: #2e7d32;
          --secondary-color: #4caf50;
          --accent-color: #2196f3;
          --light-color: #e8f5e9;
          --dark-color: #1b5e20;
          --text-color: #333333;
          --background-color: #ffffff;
          --card-color: #f5f5f5;
          --warning-color: #f44336;
          --border-radius: 8px;
          --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          background: linear-gradient(135deg, #f0f4f8 0%, #e8f5e9 100%);
          color: var(--text-color);
          padding: 20px;
          min-height: 100vh;
        }
        
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background-color: var(--background-color);
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          border-left: 5px solid var(--primary-color);
        }
        
        .header-left h1 {
          color: var(--primary-color);
          margin-bottom: 5px;
          font-size: 28px;
        }
        
        .header-left p {
          color: #666;
          font-size: 16px;
        }
        
        .header-right {
          display: flex;
          gap: 15px;
        }
        
        .btn {
          padding: 12px 24px;
          border-radius: var(--border-radius);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-primary {
          background-color: var(--primary-color);
          color: white;
        }
        
        .btn-primary:hover {
          background-color: var(--dark-color);
          transform: translateY(-2px);
        }
        
        .btn-secondary {
          background-color: var(--accent-color);
          color: white;
        }
        
        .btn-secondary:hover {
          background-color: #1976d2;
          transform: translateY(-2px);
        }
        
        .loading, .error {
          padding: 20px;
          text-align: center;
          font-size: 18px;
          margin-top: 50px;
        }
        
        .error {
          color: var(--warning-color);
        }
        
        .stats-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        
        .card {
          background-color: var(--background-color);
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          padding: 25px;
          transition: transform 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--primary-color);
        }
        
        .card-large {
          flex: 3;
        }
        
        .quick-actions-card {
          flex: 1;
        }
        
        .last-cards-container {
          display: flex;
          gap: 25px;
        }
        
        .stat-card {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          padding: 20px;
          border-radius: var(--border-radius);
          text-align: center;
          transition: all 0.3s ease;
          border-left: 4px solid var(--primary-color);
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.1);
        }
        
        .stat-card.warning {
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
          border-left: 4px solid var(--warning-color);
        }
        
        .stat-card.info {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border-left: 4px solid var(--accent-color);
        }
        
        .stat-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #666;
        }
        
        .stat-fraud {
          color: var(--warning-color);
        }
        
        .filters-section {
          background-color: white;
          padding: 20px;
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: center;
        }
        
        .filter-group {
          flex: 1;
          min-width: 200px;
        }
        
        .filter-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #555;
        }
        
        .filter-group input, 
        .filter-group select {
          width: 100%;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: var(--border-radius);
          font-size: 15px;
        }
        
        .filter-group input:focus, 
        .filter-group select:focus {
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
        }
        
        .accounts-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        .accounts-table th {
          background-color: var(--light-color);
          color: var(--primary-color);
          text-align: left;
          padding: 16px 20px;
          font-weight: 600;
          position: sticky;
          top: 0;
        }
        
        .accounts-table td {
          padding: 14px 20px;
          border-bottom: 1px solid #eee;
        }
        
        .accounts-table tr:hover {
          background-color: rgba(232, 245, 233, 0.3);
        }
        
        .status-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }
        
        .status-active {
          background-color: #e8f5e9;
          color: var(--primary-color);
        }
        
        .status-blocked {
          background-color: #ffebee;
          color: var(--warning-color);
        }
        
        .status-pending {
          background-color: #fff8e1;
          color: #ff9800;
        }
        
        .action-btn {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        
        .block-btn {
          background-color: #ffebee;
          color: var(--warning-color);
        }
        
        .block-btn:hover {
          background-color: #ffcdd2;
        }
        
        .unblock-btn {
          background-color: #e8f5e9;
          color: var(--primary-color);
        }
        
        .unblock-btn:hover {
          background-color: #c8e6c9;
        }
        
        .details-btn {
          background-color: #e3f2fd;
          color: var(--accent-color);
        }
        
        .details-btn:hover {
          background-color: #bbdefb;
        }
        
        .account-actions {
          display: flex;
          gap: 8px;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 25px;
        }
        
        .page-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #ddd;
          background-color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .page-btn:hover {
          background-color: var(--light-color);
          border-color: var(--primary-color);
        }
        
        .page-btn.active {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        
        @media (max-width: 1024px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .last-cards-container {
            flex-direction: column;
          }
        }
        
        @media (max-width: 768px) {
          header {
            flex-direction: column;
            gap: 20px;
          }
          
          .header-right {
            width: 100%;
            justify-content: center;
          }
          
          .stats-container {
            grid-template-columns: 1fr;
          }
          
          .filters-section {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default FraudAccountManagement;
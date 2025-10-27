import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    pageStyle: `
      @page { 
        size: A4; 
        margin: 1cm; 
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
        }
        .no-print { 
          display: none !important; 
        }
        table { 
          page-break-inside: avoid;
          width: 100% !important;
        }
        .stat-card {
          background-color: #f8f9fa !important;
        }
      }
    `
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/reports/${id}`);
        const reportData = {
          ...response.data.report,
          parsedData: JSON.parse(response.data.report.full_data)
        };
        setReport(reportData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem'
    }}>
      Chargement en cours...
    </div>
  );

  if (error) return (
    <div style={{
      textAlign: 'center',
      padding: '2rem',
      color: '#e74c3c',
      fontSize: '1.2rem'
    }}>
      Erreur: {error}
    </div>
  );

  if (!report) return (
    <div style={{
      textAlign: 'center',
      padding: '2rem',
      color: '#7f8c8d',
      fontSize: '1.2rem'
    }}>
      Rapport non trouvé
    </div>
  );

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }} className="no-print">
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#3498db',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '8px 16px',
            ':hover': {
              textDecoration: 'underline'
            }
          }}
        >
          &larr; Retour
        </button>
        <button 
          onClick={handlePrint}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '16px',
            ':hover': {
              backgroundColor: '#2980b9'
            }
          }}
        >
          Imprimer le rapport
        </button>
      </div>

      <div ref={reportRef} style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          color: '#2c3e50',
          marginTop: '0',
          textAlign: 'center',
          fontSize: '28px'
        }}>
          {report.type || 'Rapport financier'}
        </h1>
        
        <p style={{
          textAlign: 'center',
          color: '#7f8c8d',
          marginBottom: '30px'
        }}>
          Généré le: {new Date(report.created_at).toLocaleString('fr-FR')}
        </p>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: '#2c3e50',
            borderBottom: '1px solid #eee',
            paddingBottom: '10px',
            fontSize: '22px'
          }}>
            Statistiques
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            <div className="stat-card" style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Nouveaux cas</h3>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0',
                color: '#2c3e50'
              }}>
                {report.parsedData.stats.newCases}
              </p>
            </div>
            <div className="stat-card" style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Montant fraudé</h3>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0',
                color: '#2c3e50'
              }}>
                {report.parsedData.stats.fraudAmount.toFixed(2)} €
              </p>
            </div>
            <div className="stat-card" style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Enquêtes</h3>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0',
                color: '#2c3e50'
              }}>
                {report.parsedData.stats.investigations}
              </p>
            </div>
            <div className="stat-card" style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Comptes bloqués</h3>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0',
                color: '#2c3e50'
              }}>
                {report.parsedData.stats.blockedAccounts}
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: '#2c3e50',
            borderBottom: '1px solid #eee',
            paddingBottom: '10px',
            fontSize: '22px'
          }}>
            Comptes concernés
          </h2>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8f9fa',
                textAlign: 'left'
              }}>
                <th style={{ padding: '12px 15px' }}>ID</th>
                <th style={{ padding: '12px 15px' }}>Banque</th>
                <th style={{ padding: '12px 15px' }}>Montant</th>
                <th style={{ padding: '12px 15px' }}>Client</th>
                <th style={{ padding: '12px 15px' }}>Statut</th>
                <th style={{ padding: '12px 15px' }}>Dernière activité</th>
              </tr>
            </thead>
            <tbody>
              {report.parsedData.accounts.map((account, index) => (
                <tr key={index} style={{
                  borderBottom: '1px solid #eee',
                  ':hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}>
                  <td style={{ padding: '12px 15px' }}>{account.id}</td>
                  <td style={{ padding: '12px 15px' }}>{account.bank}</td>
                  <td style={{ padding: '12px 15px' }}>{account.amount}</td>
                  <td style={{ padding: '12px 15px' }}>{account.client}</td>
                  <td style={{ padding: '12px 15px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: account.status === 'active' ? '#e3f9e5' : '#ffebee',
                      color: account.status === 'active' ? '#1b5e20' : '#c62828'
                    }}>
                      {account.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 15px' }}>{account.lastActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          color: '#7f8c8d',
          fontSize: '14px'
        }}>
          <p>Rapport généré automatiquement le {new Date(report.parsedData.generatedAt).toLocaleString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
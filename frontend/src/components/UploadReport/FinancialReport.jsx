import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FinancialReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/reports');
        const reportsData = Array.isArray(response.data) ? response.data : response.data.reports || [];
        setReports(reportsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleCardClick = (reportId) => {
    navigate(`/report/${reportId}`);
  };

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem'
    }}>
      Chargement...
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

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: '2rem'
      }}>
        Rapports Financiers
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {reports.map((report) => (
          <div 
            key={report.id} 
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              ':hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
              }
            }}
            onClick={() => handleCardClick(report.id)}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              color: '#7f8c8d',
              fontSize: '0.9rem'
            }}>
              <span>
                {new Date(report.created_at).toLocaleDateString('fr-FR')}
              </span>
              <span>
                {new Date(report.created_at).toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <h3 style={{
              color: '#2c3e50',
              margin: '0',
              fontSize: '1.2rem'
            }}>
              {report.type || 'Rapport financier'}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialReports;
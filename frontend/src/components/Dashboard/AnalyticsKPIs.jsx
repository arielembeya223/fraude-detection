import React from 'react';

const AnalyticsKPIs = ({ data }) => {
  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <h3>📊 Transactions Analysées</h3>
        <div className="kpi-value">{data.totalTransactions}</div>
        <div className="kpi-label">Total</div>
      </div>
      <div className="kpi-card">
        <h3>🔴 Alertes de Fraude</h3>
        <div className="kpi-value">{data.totalAlerts}</div>
        <div className="kpi-label">
          Dont risques élevés: <span>{data.highRiskAlerts}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsKPIs;
import React from 'react';

const AnalyticsKPIs = ({ data }) => {
  return (
    <>
      <div className="kpi-card">
        <h3>📊 Transactions Analysées</h3>
        <div className="kpi-value" id="total-transactions">{data.totalTransactions}</div>
        <div className="kpi-label">Total</div>
      </div>
      <div className="kpi-card">
        <h3>🔴 Alertes de Fraude</h3>
        <div className="kpi-value" id="total-alerts">{data.totalAlerts}</div>
        <div className="kpi-label">Dont risques élevés: <span id="high-risk-alerts">{data.highRiskAlerts}</span></div>
      </div>
    </>
  );
};

export default AnalyticsKPIs;
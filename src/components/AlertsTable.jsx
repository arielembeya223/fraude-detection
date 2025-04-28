import React from 'react';

const AlertsTable = ({ alerts }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Source</th>
          <th>Cible</th>
          <th>Montant</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map(alert => (
          <tr key={alert.id} className={alert.score >= 90 ? 'high-risk' : alert.score >= 50 ? 'medium-risk' : 'low-risk'}>
            <td>{alert.id}</td>
            <td>{alert.source}</td>
            <td>{alert.target}</td>
            <td>{alert.amount}</td>
            <td>{alert.score}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AlertsTable;
import React from 'react';
import styled from 'styled-components';

// Styles avec styled-components
const TableContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const TableHeader = styled.thead`
  th {
    background-color: #2c3e50;
    color: white;
    padding: 12px 15px;
    text-align: left;
    position: sticky;
    top: 0;
  }
`;

const TableRow = styled.tr`
  td {
    padding: 12px 15px;
    border-bottom: 1px solid #ecf0f1;
  }

  &:hover {
    background-color: #f5f5f5;
  }

  /* Styles des différents niveaux de risque */
  &.high-risk {
    background-color: #ffebee;
    border-left: 5px solid #e74c3c;

    &:hover {
      background-color: #ffcdd2;
    }
  }

  &.medium-risk {
    background-color: #fff3e0;
    border-left: 5px solid #f39c12;

    &:hover {
      background-color: #ffe0b2;
    }
  }

  &.low-risk {
    background-color: #e8f5e9;
    border-left: 5px solid #2ecc71;

    &:hover {
      background-color: #c8e6c9;
    }
  }

  &.no-risk {
    background-color: #e3f2fd;
    border-left: 5px solid #3498db;

    &:hover {
      background-color: #bbdefb;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  color: white;

  &.high-risk {
    background-color: #e74c3c;
  }

  &.medium-risk {
    background-color: #f39c12;
  }

  &.low-risk {
    background-color: #2ecc71;
  }

  &.no-risk {
    background-color: #3498db;
  }
`;

const Scrollbar = styled.div`
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #bdc3c7;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #95a5a6;
  }
`;

// Composant principal
const AlertsTable = ({ alerts }) => {
  // Fonction pour déterminer le niveau de risque
  const getRiskLevel = (probability) => {
    const prob = Number(probability); // Conversion forcée en nombre
    if (prob >= 70) return { class: 'high-risk', label: 'Fraude' };
    if (prob >= 50) return { class: 'medium-risk', label: 'Suspicion' };
    return { class: 'low-risk', label: 'Normal' };
  };

  return (
    <Scrollbar>
      <TableContainer>
        <StyledTable>
          <TableHeader>
            <tr>
              <th>ID Transaction</th>
              <th>Compte Source</th>
              <th>Compte Cible</th>
              <th>Montant</th>
              <th>Probabilité</th>
              <th>Statut</th>
              <th>Heure</th>
            </tr>
          </TableHeader>
          <tbody>
            {alerts.map(alert => {
              const risk = getRiskLevel(alert.fraud_probability);
              const date = new Date(alert.timestamp);
              const timeString = date.toLocaleTimeString();
              
              return (
                <TableRow key={alert.id} className={risk.class}>
                  <td>{alert.id}</td>
                  <td>{alert.source}</td>
                  <td>{alert.target}</td>
                  <td>{alert.amount}</td>
                  <td>{parseFloat(alert.fraud_probability).toFixed(0)}%</td>
                  <td>
                    <StatusBadge className={risk.class}>{risk.label}</StatusBadge>
                  </td>
                  <td>{timeString}</td>
                </TableRow>
              );
            })}
          </tbody>
        </StyledTable>
      </TableContainer>
    </Scrollbar>
  );
};

export default AlertsTable;
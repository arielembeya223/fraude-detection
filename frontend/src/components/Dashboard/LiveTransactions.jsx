import React, { useEffect, useState } from 'react';

const LiveTransactions = ({ transactions }) => {
  const [displayedTransactions, setDisplayedTransactions] = useState([]);

  useEffect(() => {
    if (transactions.length > 0) {
      // Ajoute la nouvelle transaction avec highlight
      setDisplayedTransactions(prev => {
        const newTx = transactions[0];
        return [
          { ...newTx, isNew: true },
          ...prev.slice(0, 9).map(tx => ({ ...tx, isNew: false }))
        ];
      });

      // Retire le highlight après l'animation
      const timer = setTimeout(() => {
        setDisplayedTransactions(prev => 
          prev.map(tx => ({ ...tx, isNew: false }))
        );
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [transactions]);

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Source</th>
          <th>Cible</th>
          <th>Montant</th>
          <th>Heure</th>
        </tr>
      </thead>
      <tbody>
        {displayedTransactions.map((tx, index) => (
          <tr key={`${tx.id}-${index}`} className={tx.isNew ? 'new-transaction' : ''}>
            <td>{tx.id}</td>
            <td>{tx.source}</td>
            <td>{tx.target}</td>
            <td>{tx.amount}</td>
            <td>{tx.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LiveTransactions;
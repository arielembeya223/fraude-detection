import React, { useState, useEffect } from 'react';

const LiveTransactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTransaction = {
        id: `#${Math.floor(Math.random() * 10000)}`,
        source: `Client${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
        target: `Client${String.fromCharCode(88 + Math.floor(Math.random() * 5))}`,
        amount: `${Math.floor(Math.random() * 10000)} €`,
        date: new Date().toLocaleTimeString()
      };
      setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Source</th>
          <th>Cible</th>
          <th>Montant</th>
          <th>Date/Heure</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx, index) => (
          <tr key={index}>
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
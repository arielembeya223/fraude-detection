// Données fictives pour les alertes
const alertsData = [
    { id: '#456', source: 'ClientX', target: 'ClientY', amount: '9 500 €', reason: 'Boucle de virements', score: 92, date: '2024-05-21 14:30' },
    { id: '#789', source: 'ClientA', target: 'ClientB', amount: '15 000 €', reason: 'Montant anormal', score: 97, date: '2024-05-21 14:25' },
    { id: '#123', source: 'ClientC', target: 'ClientD', amount: '2 000 €', reason: 'Transaction inhabituelle', score: 65, date: '2024-05-21 14:20' },
    { id: '#321', source: 'ClientE', target: 'ClientF', amount: '500 €', reason: 'Virement standard', score: 10, date: '2024-05-21 14:15' }
];

// Données fictives pour les transactions temps réel
const transactionsData = [
    { id: '#111', source: 'ClientA', target: 'ClientB', amount: '1 200 €', date: '2024-05-21 14:35', reason: 'Paiement' },
    { id: '#222', source: 'ClientC', target: 'ClientD', amount: '3 500 €', date: '2024-05-21 14:32', reason: 'Virement' },
    { id: '#333', source: 'ClientE', target: 'ClientF', amount: '800 €', date: '2024-05-21 14:30', reason: 'Transfert' }
];

// Données pour le graphes
const graphData = {
    nodes: [
        { id: 'ClientX', risk: true },
        { id: 'ClientY', risk: true },
        { id: 'ClientA', risk: false },
        { id: 'ClientB', risk: false },
        { id: 'ClientC', risk: false }
    ],
    links: [
        { source: 'ClientX', target: 'ClientY' },
        { source: 'ClientA', target: 'ClientB' },
        { source: 'ClientB', target: 'ClientC' },
        { source: 'ClientX', target: 'ClientA' }
    ]
};
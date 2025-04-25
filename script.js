// Initialisation des données et du dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Remplir les tableaux
    renderAlertsTable();
    renderTransactionsTable();
    
    // Initialiser le graphe
    renderGraph();
    
    // Configurer les filtres
    document.getElementById('risk-filter').addEventListener('change', filterAlerts);
    document.getElementById('search').addEventListener('input', searchAlerts);
    
    // Simuler des mises à jour en temps réel
    setInterval(updateLiveTransactions, 3000);
});

// Remplir le tableau des alertes
function renderAlertsTable() {
    const tbody = document.querySelector('#alerts-table tbody');
    tbody.innerHTML = '';
    
    alertsData.forEach(alert => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${alert.id}</td>
            <td>${alert.source}</td>
            <td>${alert.target}</td>
            <td>${alert.amount}</td>
            <td>${alert.reason}</td>
            <td class="${getRiskClass(alert.score)}">${alert.score}%</td>
            <td><button onclick="showAlertDetails('${alert.id}')">Voir</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Remplir le tableau des transactions
function renderTransactionsTable() {
    const tbody = document.querySelector('#transactions-table tbody');
    tbody.innerHTML = '';
    
    transactionsData.forEach(tx => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tx.id}</td>
            <td>${tx.source}</td>
            <td>${tx.target}</td>
            <td>${tx.amount}</td>
            <td>${tx.date}</td>
            <td>${tx.reason}</td>
        `;
        tbody.appendChild(row);
    });
}

// Afficher le graphe avec D3.js
function renderGraph() {
    const width = document.getElementById('graph-container').clientWidth;
    const height = 400;
    
    // Créer un SVG
    const svg = d3.select('#graph-container')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Simulation de forces
    const simulation = d3.forceSimulation(graphData.nodes)
        .force('link', d3.forceLink(graphData.links).id(d => d.id))
        .force('charge', d3.forceManyBody().strength(-1000))
        .force('center', d3.forceCenter(width / 2, height / 2));
    
    // Dessiner les liens
    const link = svg.append('g')
        .selectAll('line')
        .data(graphData.links)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-width', 2);
    
    // Dessiner les nœuds
    const node = svg.append('g')
        .selectAll('circle')
        .data(graphData.nodes)
        .enter().append('circle')
        .attr('r', 10)
        .attr('fill', d => d.risk ? '#e74c3c' : '#3498db')
        .call(drag(simulation));
    
    // Ajouter les étiquettes
    const label = svg.append('g')
        .selectAll('text')
        .data(graphData.nodes)
        .enter().append('text')
        .text(d => d.id)
        .attr('font-size', 12)
        .attr('dx', 15)
        .attr('dy', 4);
    
    // Mettre à jour la position
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        
        label
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    });
    
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        
        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }
}

// Fonction pour filtrer les alertes
function filterAlerts() {
    const filter = document.getElementById('risk-filter').value;
    const rows = document.querySelectorAll('#alerts-table tbody tr');
    
    rows.forEach(row => {
        const score = parseInt(row.querySelector('td:nth-child(6)').textContent);
        let show = true;
        
        if (filter === 'high' && score < 90) show = false;
        if (filter === 'medium' && (score < 50 || score >= 90)) show = false;
        
        row.style.display = show ? '' : 'none';
    });
}

// Fonction pour rechercher
function searchAlerts() {
    const query = document.getElementById('search').value.toLowerCase();
    const rows = document.querySelectorAll('#alerts-table tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

// Afficher les détails dans une modal
function showAlertDetails(alertId) {
    const alert = alertsData.find(a => a.id === alertId);
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-data');
    
    modalContent.innerHTML = `
        <p><strong>ID:</strong> ${alert.id}</p>
        <p><strong>Source:</strong> ${alert.source}</p>
        <p><strong>Cible:</strong> ${alert.target}</p>
        <p><strong>Montant:</strong> ${alert.amount}</p>
        <p><strong>Motif:</strong> ${alert.reason}</p>
        <p><strong>Score:</strong> <span class="${getRiskClass(alert.score)}">${alert.score}%</span></p>
    `;
    
    // Afficher un mini-graphe
    renderMiniGraph(alert);
    modal.style.display = 'block';
}

// Fermer la modal
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('modal').style.display = 'none';
});

// Mettre à jour les transactions en temps réel
function updateLiveTransactions() {
    // Ajouter une nouvelle transaction aléatoire
    const newTx = {
        id: '#' + Math.floor(Math.random() * 1000),
        source: ['ClientA', 'ClientB', 'ClientC'][Math.floor(Math.random() * 3)],
        target: ['ClientX', 'ClientY', 'ClientZ'][Math.floor(Math.random() * 3)],
        amount: Math.floor(Math.random() * 10000) + ' €',
        date: new Date().toLocaleString(),
        reason: ['Virement', 'Paiement', 'Transfert'][Math.floor(Math.random() * 3)]
    };
    
    transactionsData.unshift(newTx);
    if (transactionsData.length > 10) transactionsData.pop();
    
    renderTransactionsTable();
}

// Helper pour la classe de risque
function getRiskClass(score) {
    if (score >= 90) return 'high-risk';
    if (score >= 50) return 'medium-risk';
    return 'low-risk';
}

// Fonction pour mettre à jour les KPI
function updateKPIs() {
    // Compter les alertes à haut risque (>90%)
    const highRiskAlerts = alertsData.filter(alert => alert.score >= 90).length;
    
    // Mettre à jour les éléments HTML
    document.getElementById('total-transactions').textContent = transactionsData.length;
    document.getElementById('total-alerts').textContent = alertsData.length;
    document.getElementById('high-risk-alerts').textContent = highRiskAlerts;
    document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
}

// Appeler la fonction au chargement et à chaque mise à jour
document.addEventListener('DOMContentLoaded', updateKPIs);

// Si vous avez des mises à jour en temps réel, appelez aussi updateKPIs()
// Par exemple, dans votre fonction updateLiveTransactions() :
function updateLiveTransactions() {
    // [...] (votre code existant)
    updateKPIs(); // Ajoutez cette ligne à la fin
}

////
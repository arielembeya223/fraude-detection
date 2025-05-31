import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { geoMercator, geoPath } from 'd3-geo';
import axios from 'axios';
import './WorldMap.css';

const WorldMap = () => {
  const svgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [nodeInfo, setNodeInfo] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [eventSource, setEventSource] = useState(null);
  const width = '100%';
  const height = 500;

  // Fonction pour charger les données initiales
  const fetchInitialData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions');
      processTransactionData(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Fonction pour traiter les données de transaction
  const processTransactionData = (transactions) => {
    const accountsData = [];
    const connectionsData = [];
    const accountSet = new Set();

    transactions.forEach(tx => {
      // Ajouter le compte source
      if (!accountSet.has(tx.source)) {
        accountsData.push({
          id: tx.source,
          latitude: tx.latitude,
          longitude: tx.longitude,
          risk: tx.is_fraud || tx.prediction,
          type: 'account',
          transactions: 1
        });
        accountSet.add(tx.source);
      }

      // Ajouter le compte cible (avec un léger décalage si même position)
      if (!accountSet.has(tx.target)) {
        accountsData.push({
          id: tx.target,
          latitude: tx.latitude + (Math.random() - 0.5) * 2,
          longitude: tx.longitude + (Math.random() - 0.5) * 2,
          risk: false, // Par défaut, le destinataire n'est pas considéré à risque
          type: 'account',
          transactions: 1
        });
        accountSet.add(tx.target);
      }

      // Ajouter la connexion
      connectionsData.push({
        source: tx.source,
        target: tx.target,
        amount: tx.amount,
        is_fraud: tx.is_fraud,
        prediction: tx.prediction,
        id: tx.id
      });
    });

    setAccounts(accountsData);
    setConnections(connectionsData);
  };

  // Démarrer/arrêter le streaming
  const toggleStreaming = () => {
    if (isStreaming) {
      eventSource.close();
      setEventSource(null);
      setIsStreaming(false);
    } else {
      const es = new EventSource('http://localhost:5000/api/transactions/stream');
      es.onmessage = (event) => {
        const newTx = JSON.parse(event.data);
        setAccounts(prevAccounts => {
          const updatedAccounts = [...prevAccounts];
          
          // Mettre à jour ou ajouter le compte source
          const sourceIndex = updatedAccounts.findIndex(a => a.id === newTx.source);
          if (sourceIndex >= 0) {
            updatedAccounts[sourceIndex] = {
              ...updatedAccounts[sourceIndex],
              risk: newTx.is_fraud || newTx.prediction,
              transactions: (updatedAccounts[sourceIndex].transactions || 0) + 1
            };
          } else {
            updatedAccounts.push({
              id: newTx.source,
              latitude: newTx.latitude,
              longitude: newTx.longitude,
              risk: newTx.is_fraud || newTx.prediction,
              type: 'account',
              transactions: 1
            });
          }

          // Mettre à jour ou ajouter le compte cible
          const targetIndex = updatedAccounts.findIndex(a => a.id === newTx.target);
          if (targetIndex >= 0) {
            updatedAccounts[targetIndex] = {
              ...updatedAccounts[targetIndex],
              transactions: (updatedAccounts[targetIndex].transactions || 0) + 1
            };
          } else {
            updatedAccounts.push({
              id: newTx.target,
              latitude: newTx.latitude + (Math.random() - 0.5) * 2,
              longitude: newTx.longitude + (Math.random() - 0.5) * 2,
              risk: false,
              type: 'account',
              transactions: 1
            });
          }

          return updatedAccounts;
        });

        setConnections(prevConnections => [
          ...prevConnections,
          {
            source: newTx.source,
            target: newTx.target,
            amount: newTx.amount,
            is_fraud: newTx.is_fraud,
            prediction: newTx.prediction,
            id: newTx.id
          }
        ]);
      };
      setEventSource(es);
      setIsStreaming(true);
    }
  };

  // Effet pour charger les données initiales
  useEffect(() => {
    fetchInitialData();
    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // Effet pour dessiner la carte
  useEffect(() => {
    if (accounts.length === 0) return;

    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(worldData => {
        const countries = topojson.feature(worldData, worldData.objects.countries);
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const projection = geoMercator()
          .scale(150 * zoomLevel)
          .translate([svgRef.current.clientWidth / 2, height / 2]);

        const path = geoPath().projection(projection);

        const g = svg.append('g');

        // Fond de carte
        g.append('path')
          .datum({ type: 'Sphere' })
          .attr('class', 'sphere')
          .attr('d', path)
          .attr('fill', '#e6f3ff');

        // Pays
        g.append('g')
          .selectAll('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr('class', 'country')
          .attr('d', path)
          .attr('fill', '#f8f9fa')
          .attr('stroke', '#ddd');

        // Connexions
        g.append('g')
          .selectAll('line')
          .data(connections)
          .enter()
          .append('line')
          .attr('class', 'link')
          .attr('stroke', d => d.is_fraud || d.prediction ? '#e74c3c' : '#3498db')
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.6)
          .attr('x1', d => {
            const source = accounts.find(a => a.id === d.source);
            return source ? projection([source.longitude, source.latitude])?.[0] : 0;
          })
          .attr('y1', d => {
            const source = accounts.find(a => a.id === d.source);
            return source ? projection([source.longitude, source.latitude])?.[1] : 0;
          })
          .attr('x2', d => {
            const target = accounts.find(a => a.id === d.target);
            return target ? projection([target.longitude, target.latitude])?.[0] : 0;
          })
          .attr('y2', d => {
            const target = accounts.find(a => a.id === d.target);
            return target ? projection([target.longitude, target.latitude])?.[1] : 0;
          });

        // Points (comptes)
        g.append('g')
          .selectAll('circle')
          .data(accounts)
          .enter()
          .append('circle')
          .attr('class', d => `point ${d.risk ? 'risk' : ''} ${selectedNode?.id === d.id ? 'selected' : ''}`)
          .attr('cx', d => projection([d.longitude, d.latitude])?.[0] || 0)
          .attr('cy', d => projection([d.longitude, d.latitude])?.[1] || 0)
          .attr('r', d => 4 + Math.min((d.transactions || 1) * 0.5, 10) * zoomLevel)
          .attr('fill', d => d.risk ? '#e74c3c' : '#3498db')
          .on('click', (event, d) => {
            setSelectedNode(d);
            setNodeInfo({
              ...d,
              connections: connections.filter(conn => conn.source === d.id || conn.target === d.id)
            });
            setZoomLevel(2);
            projection.center([d.longitude, d.latitude]);
            
            svg.selectAll('.link')
              .classed('highlight', link => 
                link.source === d.id || link.target === d.id
              );
          })
          .on('mouseover', (event, d) => {
            d3.select(event.target).attr('r', 8 * zoomLevel);
          })
          .on('mouseout', (event, d) => {
            if (selectedNode?.id !== d.id) {
              d3.select(event.target).attr('r', 4 + Math.min((d.transactions || 1) * 0.5, 10) * zoomLevel);
            }
          });

        // Zoom avec la molette
        svg.call(d3.zoom()
          .scaleExtent([1, 8])
          .on('zoom', (event) => {
            const newZoom = event.transform.k;
            setZoomLevel(newZoom);
            g.attr('transform', event.transform);
          }));

      });
  }, [accounts, connections, zoomLevel, selectedNode]);

  const handleResetZoom = () => {
    setZoomLevel(1);
    setSelectedNode(null);
    setNodeInfo(null);
    d3.select(svgRef.current).selectAll('.link').classed('highlight', false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} id="graph-container" />
      
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        display: 'flex',
        gap: '10px'
      }}>
        <button 
          onClick={toggleStreaming}
          style={{
            padding: '5px 10px',
            background: isStreaming ? '#e74c3c' : '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isStreaming ? 'Arrêter le streaming' : 'Démarrer le streaming'}
        </button>
        
        {selectedNode && (
          <button 
            onClick={handleResetZoom}
            style={{
              padding: '5px 10px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset View
          </button>
        )}
      </div>
      
      {nodeInfo && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          maxWidth: '300px',
          zIndex: 10
        }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Compte {nodeInfo.id}</h3>
          <div style={{ margin: '10px 0' }}>
            <strong>Localisation:</strong> 
            <div>Lat: {nodeInfo.latitude.toFixed(2)}, Long: {nodeInfo.longitude.toFixed(2)}</div>
          </div>
          <div style={{ margin: '10px 0' }}>
            <strong>Statut:</strong> 
            <span style={{ color: nodeInfo.risk ? '#e74c3c' : '#2ecc71', fontWeight: 'bold' }}>
              {nodeInfo.risk ? '🚨 Risque élevé' : '✅ Sécurisé'}
            </span>
          </div>
          <div style={{ margin: '10px 0' }}>
            <strong>Transactions:</strong> {nodeInfo.transactions || 1}
          </div>
          <div style={{ margin: '10px 0' }}>
            <strong>Connexions:</strong>
            <ul style={{ paddingLeft: '20px', margin: '5px 0', maxHeight: '200px', overflowY: 'auto' }}>
              {nodeInfo.connections?.map((conn, i) => (
                <li key={i} style={{ color: conn.is_fraud || conn.prediction ? '#e74c3c' : '#3498db' }}>
                  {conn.source === nodeInfo.id ? '→ ' + conn.target : '← ' + conn.source}
                  {conn.amount && ` (${conn.amount.toFixed(2)})`}
                  {(conn.is_fraud || conn.prediction) && ' 🚨'}
                </li>
              ))}
            </ul>
          </div>
          <button 
            onClick={() => setNodeInfo(null)}
            style={{
              padding: '5px 10px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
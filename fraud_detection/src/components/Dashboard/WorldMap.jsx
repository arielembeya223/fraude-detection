import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { geoMercator, geoPath } from 'd3-geo';
import axios from 'axios';
import './WorldMap.css';

const WorldMap = () => {
  const svgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomTransform, setZoomTransform] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [eventSource, setEventSource] = useState(null);

  // Fonction helper pour la projection sécurisée
  const safeProjection = (projection, lon, lat) => {
    try {
      const coords = projection([lon, lat]);
      return coords && coords.every(Number.isFinite) ? coords : [0, 0];
    } catch {
      return [0, 0];
    }
  };

  // Chargement des données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/transactions');
        processData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // Traitement des données
  const processData = (transactions) => {
    const accountMap = new Map();
    const newConnections = [];

    transactions.forEach(tx => {
      // Gestion des comptes
      if (!accountMap.has(tx.source)) {
        accountMap.set(tx.source, {
          id: tx.source,
          latitude: tx.latitude,
          longitude: tx.longitude,
          risk: tx.is_fraud || tx.prediction,
          transactionCount: 1
        });
      }

      if (!accountMap.has(tx.target)) {
        accountMap.set(tx.target, {
          id: tx.target,
          latitude: tx.latitude + (Math.random() - 0.5) * 2,
          longitude: tx.longitude + (Math.random() - 0.5) * 2,
          risk: false,
          transactionCount: 1
        });
      }

      // Gestion des connexions
      newConnections.push({
        id: tx.id,
        source: tx.source,
        target: tx.target,
        amount: tx.amount,
        is_fraud: tx.is_fraud,
        prediction: tx.prediction
      });
    });

    setAccounts(Array.from(accountMap.values()));
    setConnections(newConnections);
  };

  // Streaming SSE
  const toggleStreaming = () => {
    if (isStreaming) {
      eventSource.close();
      setIsStreaming(false);
    } else {
      const es = new EventSource('http://localhost:5000/api/transactions/stream');
      es.onmessage = (e) => {
        const tx = JSON.parse(e.data);
        setAccounts(prev => {
          const newAccounts = new Map(prev.map(a => [a.id, a]));
          
          // Mise à jour compte source
          if (newAccounts.has(tx.source)) {
            const acc = newAccounts.get(tx.source);
            newAccounts.set(tx.source, {
              ...acc,
              risk: acc.risk || (tx.is_fraud || tx.prediction),
              transactionCount: (acc.transactionCount || 0) + 1
            });
          } else {
            newAccounts.set(tx.source, {
              id: tx.source,
              latitude: tx.latitude,
              longitude: tx.longitude,
              risk: tx.is_fraud || tx.prediction,
              transactionCount: 1
            });
          }

          // Mise à jour compte cible
          if (!newAccounts.has(tx.target)) {
            newAccounts.set(tx.target, {
              id: tx.target,
              latitude: tx.latitude + (Math.random() - 0.5) * 2,
              longitude: tx.longitude + (Math.random() - 0.5) * 2,
              risk: false,
              transactionCount: 1
            });
          }

          return Array.from(newAccounts.values());
        });

        setConnections(prev => [...prev, {
          id: tx.id,
          source: tx.source,
          target: tx.target,
          amount: tx.amount,
          is_fraud: tx.is_fraud,
          prediction: tx.prediction
        }]);
      };
      setEventSource(es);
      setIsStreaming(true);
    }
  };

  // Dessin de la carte
  useEffect(() => {
    if (accounts.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = 500;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const projection = geoMercator()
      .scale(150)
      .translate([width / 2, height / 2]);

    const path = geoPath().projection(projection);

    const g = svg.append('g');
    if (zoomTransform) {
      g.attr('transform', zoomTransform);
    }

    // Fond de carte
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(worldData => {
      const countries = topojson.feature(worldData, worldData.objects.countries);

      g.append('path')
        .datum({ type: 'Sphere' })
        .attr('class', 'sphere')
        .attr('d', path)
        .attr('fill', '#e6f3ff');

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
          const src = accounts.find(a => a.id === d.source);
          return src ? safeProjection(projection, src.longitude, src.latitude)[0] : 0;
        })
        .attr('y1', d => {
          const src = accounts.find(a => a.id === d.source);
          return src ? safeProjection(projection, src.longitude, src.latitude)[1] : 0;
        })
        .attr('x2', d => {
          const tgt = accounts.find(a => a.id === d.target);
          return tgt ? safeProjection(projection, tgt.longitude, tgt.latitude)[0] : 0;
        })
        .attr('y2', d => {
          const tgt = accounts.find(a => a.id === d.target);
          return tgt ? safeProjection(projection, tgt.longitude, tgt.latitude)[1] : 0;
        });

      // Comptes
      g.append('g')
        .selectAll('circle')
        .data(accounts)
        .enter()
        .append('circle')
        .attr('class', d => `node ${d.risk ? 'risk' : ''} ${selectedNode?.id === d.id ? 'selected' : ''}`)
        .attr('cx', d => safeProjection(projection, d.longitude, d.latitude)[0])
        .attr('cy', d => safeProjection(projection, d.longitude, d.latitude)[1])
        .attr('r', d => 5 + Math.min(d.transactionCount * 0.3, 8))
        .attr('fill', d => d.risk ? '#e74c3c' : '#3498db')
        .on('click', (event, d) => {
          setSelectedNode(d);
        });

      // Zoom
      svg.call(d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
          setZoomTransform(event.transform);
          g.attr('transform', event.transform);
        }));
    });
  }, [accounts, connections, selectedNode, zoomTransform]);

  return (
    <div className="world-map-container">
      <svg ref={svgRef} width="100%" height={500} />
      
      <div className="map-controls">
        <button 
          onClick={toggleStreaming}
          className={`stream-button ${isStreaming ? 'active' : ''}`}
        >
          {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
        </button>
      </div>

      {selectedNode && (
        <div className="node-info">
          <h3>Account {selectedNode.id}</h3>
          <p>Location: {selectedNode.latitude.toFixed(2)}, {selectedNode.longitude.toFixed(2)}</p>
          <p>Status: <span className={selectedNode.risk ? 'risk' : 'safe'}>
            {selectedNode.risk ? 'High Risk' : 'Safe'}
          </span></p>
          <p>Transactions: {selectedNode.transactionCount}</p>
          <button onClick={() => setSelectedNode(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
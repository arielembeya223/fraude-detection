import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { geoMercator, geoPath } from 'd3-geo';
import axios from 'axios';

const FullScreenMap = () => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomTransform, setZoomTransform] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [eventSource, setEventSource] = useState(null);
  const [darkTheme, setDarkTheme] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Styles CSS intégrés
  const styles = {
    worldMapContainer: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: darkTheme ? '#1a1a2e' : '#f0f0f0'
    },
    mapControls: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 1000,
      display: 'flex',
      gap: '10px'
    },
    streamButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      background: isStreaming ? '#2ecc71' : '#3498db',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    },
    themeToggle: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      background: '#333',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    },
    nodeDetailsPanel: {
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      background: darkTheme ? '#16213e' : 'white',
      padding: '15px',
      borderRadius: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      zIndex: 1000,
      maxWidth: '300px',
      color: darkTheme ? 'white' : '#333'
    },
    mapStats: {
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      background: darkTheme ? 'rgba(22, 33, 62, 0.9)' : 'rgba(255,255,255,0.9)',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 1000,
      color: darkTheme ? 'white' : '#333'
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(0,0,0,0.7)',
      zIndex: 2000,
      color: 'white'
    },
    spinner: {
      border: '5px solid rgba(255,255,255,0.3)',
      borderRadius: '50%',
      borderTop: '5px solid #3498db',
      width: '50px',
      height: '50px',
      animation: 'spin 1s linear infinite'
    },
    errorMessage: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#e74c3c',
      color: 'white',
      padding: '20px',
      borderRadius: '5px',
      zIndex: 2000,
      textAlign: 'center'
    },
    risk: { 
      color: '#e74c3c', 
      fontWeight: 'bold' 
    },
    safe: { 
      color: '#2ecc71', 
      fontWeight: 'bold' 
    }
  };

  // Animation keyframes
  const spinKeyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  // Projection sécurisée
  const safeProjection = (projection, lon, lat) => {
    try {
      const normalizedLon = Math.max(-180, Math.min(180, lon));
      const normalizedLat = Math.max(-90, Math.min(90, lat));
      const coords = projection([normalizedLon, normalizedLat]);
      
      if (!coords || !coords.every(Number.isFinite)) {
        console.warn('Projection invalide pour:', { lon, lat, coords });
        return [0, 0];
      }
      return coords;
    } catch (error) {
      console.error('Erreur de projection:', error);
      return [0, 0];
    }
  };

  // Chargement des données initiales
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/transactions');
        processData(response.data);
      } catch (error) {
        console.error("Erreur de chargement:", error);
        setError("Erreur de chargement des données");
      } finally {
        setIsLoading(false);
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
      if (!tx.source_latitude || !tx.source_longitude) return;
      
      if (!accountMap.has(tx.source)) {
        accountMap.set(tx.source, {
          id: tx.source,
          latitude: tx.source_latitude,
          longitude: tx.source_longitude,
          risk: tx.is_fraud || tx.prediction,
          transactionCount: 1
        });
      }

      if (!tx.target_latitude || !tx.target_longitude) return;

      if (!accountMap.has(tx.target)) {
        accountMap.set(tx.target, {
          id: tx.target,
          latitude: tx.target_latitude,
          longitude: tx.target_longitude,
          risk: false,
          transactionCount: 1
        });
      }

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

  // SSE Stream
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
          
          if (!tx.source_latitude || !tx.source_longitude) return prev;
          if (!newAccounts.has(tx.source)) {
            newAccounts.set(tx.source, {
              id: tx.source,
              latitude: tx.source_latitude,
              longitude: tx.source_longitude,
              risk: tx.is_fraud || tx.prediction,
              transactionCount: 1
            });
          }

          if (!tx.target_latitude || !tx.target_longitude) return prev;
          if (!newAccounts.has(tx.target)) {
            newAccounts.set(tx.target, {
              id: tx.target,
              latitude: tx.target_latitude,
              longitude: tx.target_longitude,
              risk: false,
              transactionCount: 1
            });
          }

          return Array.from(newAccounts.values());
        });

        setConnections(prev => [...prev.slice(-1000), {
          id: tx.id,
          source: tx.source,
          target: tx.target,
          amount: tx.amount,
          is_fraud: tx.is_fraud,
          prediction: tx.prediction
        }]);
      };

      es.onerror = (err) => {
        console.error('Erreur SSE:', err);
        es.close();
        setIsStreaming(false);
      };

      setEventSource(es);
      setIsStreaming(true);
    }
  };

  // Rendu D3
  useEffect(() => {
    if (accounts.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

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
    g.append('path')
      .datum({ type: 'Sphere' })
      .attr('d', path)
      .attr('fill', darkTheme ? '#1a1a2e' : '#e6f3ff');

    // Chargement des pays
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(worldData => {
        const countries = topojson.feature(worldData, worldData.objects.countries);

        // Pays
        g.append('g')
          .selectAll('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('fill', darkTheme ? '#2a2a4a' : '#f8f9fa')
          .attr('stroke', darkTheme ? '#444' : '#ddd');

        // Connexions
        g.append('g')
          .selectAll('line')
          .data(connections)
          .enter()
          .append('line')
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
          })
          .attr('stroke', d => d.is_fraud ? '#ff0000' : darkTheme ? '#0af' : '#3498db')
          .attr('stroke-width', d => d.is_fraud ? 2 : 1)
          .attr('opacity', 0.7);

        // Points
        g.append('g')
          .selectAll('circle')
          .data(accounts)
          .enter()
          .append('circle')
          .attr('cx', d => safeProjection(projection, d.longitude, d.latitude)[0])
          .attr('cy', d => safeProjection(projection, d.longitude, d.latitude)[1])
          .attr('r', d => 3 + Math.min(d.transactionCount * 0.3, 5))
          .attr('fill', d => d.risk ? '#e74c3c' : darkTheme ? '#0af' : '#3498db')
          .on('click', (event, d) => {
            event.stopPropagation();
            setSelectedNode(d);
          });

        // Zoom
        svg.call(d3.zoom()
          .scaleExtent([1, 8])
          .on('zoom', (event) => {
            setZoomTransform(event.transform);
            g.attr('transform', event.transform);
          }));
      })
      .catch(error => {
        console.error('Erreur chargement carte:', error);
        setError("Erreur de chargement de la carte");
      });
  }, [accounts, connections, darkTheme, zoomTransform]);

  // Gestion du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      setAccounts(prev => [...prev]); // Force le recalcul
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <style>{spinKeyframes}</style>
      <div style={styles.worldMapContainer} ref={containerRef}>
        <div style={styles.mapControls}>
          <button 
            onClick={toggleStreaming}
            style={styles.streamButton}
          >
            {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
          </button>
          
          <button
            onClick={() => setDarkTheme(!darkTheme)}
            style={styles.themeToggle}
          >
            {darkTheme ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {error && (
          <div style={styles.errorMessage}>
            {error}
            <button onClick={() => window.location.reload()}>Réessayer</button>
          </div>
        )}

        {isLoading ? (
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner}></div>
            <p>Chargement des données...</p>
          </div>
        ) : (
          <svg 
            ref={svgRef} 
            width="100%" 
            height="100%"
          />
        )}

        {selectedNode && (
          <div style={styles.nodeDetailsPanel}>
            <h3>Account {selectedNode.id}</h3>
            <p>Location: {selectedNode.latitude.toFixed(2)}, {selectedNode.longitude.toFixed(2)}</p>
            <p>Status: <span style={selectedNode.risk ? styles.risk : styles.safe}>
              {selectedNode.risk ? 'High Risk' : 'Safe'}
            </span></p>
            <p>Transactions: {selectedNode.transactionCount}</p>
            <button onClick={() => setSelectedNode(null)}>Close</button>
          </div>
        )}

        <div style={styles.mapStats}>
          <p>Accounts: {accounts.length}</p>
          <p>Connections: {connections.length}</p>
        </div>
      </div>
    </>
  );
};

export default FullScreenMap;
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const WorldMap = ({ accounts, connections }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomTransform, setZoomTransform] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Styles
  const styles = {
    container: {
      width: '100%',
      height: '600px',
      position: 'relative',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      margin: '20px 0',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    svg: {
      width: '100%',
      height: '100%',
      display: 'block'
    },
    nodeInfoCard: {
      position: 'absolute',
      top: '25px',
      right: '25px',
      background: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 100,
      maxWidth: '300px',
      fontFamily: 'Arial, sans-serif'
    },
    riskText: {
      color: '#e74c3c',
      fontWeight: 'bold',
      fontSize: '16px'
    },
    mediumRiskText: {
      color: '#f39c12',
      fontWeight: 'bold',
      fontSize: '16px'
    },
    safeText: {
      color: '#2ecc71',
      fontWeight: 'bold',
      fontSize: '16px'
    },
    closeBtn: {
      marginTop: '15px',
      padding: '8px 16px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: '#2980b9'
      }
    },
    legend: {
      position: 'absolute',
      bottom: '25px',
      left: '25px',
      background: 'rgba(255,255,255,0.9)',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '14px'
    },
    legendColor: {
      width: '14px',
      height: '14px',
      borderRadius: '50%'
    }
  };

  // Effet pour gérer le redimensionnement
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effet principal pour dessiner la carte
  useEffect(() => {
     console.log("💽 Données reçues dans WorldMap:");
  console.log("Comptes:", accounts);
  console.log("Connexions:", connections)
    if (!accounts || !connections || !containerRef.current || dimensions.width === 0) return;

    const width = dimensions.width;
    const height = dimensions.height;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Clear previous elements
    svg.selectAll('*').remove();

    // Projection
    const projection = d3.geoMercator()
      .scale(width / 6.5)
      .translate([width / 2, height / 2]);

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        setZoomTransform(event.transform);
        svg.selectAll('g.map-group').attr('transform', event.transform);
      });

    svg.call(zoom);

    // Group for map elements
    const g = svg.append('g').attr('class', 'map-group');

    if (zoomTransform) {
      g.attr('transform', zoomTransform);
    }

    // Load and draw world map
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(world => {
        const countries = topojson.feature(world, world.objects.countries);

        // Draw countries
        g.append('g')
          .selectAll('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr('fill', '#dfe6e9')
          .attr('stroke', '#b2bec3')
          .attr('stroke-width', 0.5)
          .attr('d', d3.geoPath().projection(projection));

        // Draw connections
        const linkGroup = g.append('g');
        linkGroup.selectAll('line')
          .data(connections)
          .enter()
          .append('line')
          .attr('stroke', d => {
            if (d.fraud_probability >= 70) return '#e74c3c';
            if (d.fraud_probability >= 40) return '#f39c12';
            return '#3498db';
          })
          .attr('stroke-width', d => {
            if (d.fraud_probability >= 70) return 2.5;
            if (d.fraud_probability >= 40) return 1.5;
            return 1;
          })
          .attr('stroke-opacity', d => {
            if (d.fraud_probability >= 70) return 0.9;
            if (d.fraud_probability >= 40) return 0.7;
            return 0.5;
          })
          .attr('x1', d => {
            const source = accounts.find(a => a.id === d.source);
            return source ? projection([source.longitude, source.latitude])[0] : 0;
          })
          .attr('y1', d => {
            const source = accounts.find(a => a.id === d.source);
            return source ? projection([source.longitude, source.latitude])[1] : 0;
          })
          .attr('x2', d => {
            const target = accounts.find(a => a.id === d.target);
            return target ? projection([target.longitude, target.latitude])[0] : 0;
          })
          .attr('y2', d => {
            const target = accounts.find(a => a.id === d.target);
            return target ? projection([target.longitude, target.latitude])[1] : 0;
          });

        // Draw account nodes
        const nodeGroup = g.append('g');
        nodeGroup.selectAll('circle')
          .data(accounts)
          .enter()
          .append('circle')
// Modifiez la partie de coloration des cercles
.attr('fill', d => {
  // Nouveaux seuils plus stricts
  if (d.status === 'fraud' || d.fraud_probability >= 75) {
    console.log(`🔴 Fraude confirmée: ${d.id} (${d.fraud_probability}%)`);
    return '#e74c3c'; 
  }
  if (d.status === 'hot_potential' || d.fraud_probability >= 45) {
    return '#f39c12';
  }
  return '#3498db';
})

// Et pour les tailles
.attr('r', d => {
  if (d.status === 'fraud' || d.fraud_probability >= 75) return 10;
  if (d.status === 'hot_potential' || d.fraud_probability >= 45) return 7;
  return 5;
})
          .attr('stroke', 'white')
          .attr('stroke-width', 1.5)
          .attr('cx', d => projection([d.longitude, d.latitude])[0])
          .attr('cy', d => projection([d.longitude, d.latitude])[1])
          .attr('r', d => {
            if (d.fraud_probability >= 70) return 8;
            if (d.fraud_probability >= 40) return 6;
            return 5;
          })
          .attr('data-id', d => d.id)
          .style('cursor', 'pointer')
          .on('click', (event, d) => {
            event.stopPropagation();
            setSelectedNode(d);
          })
          .on('mouseover', function(event, d) {
            d3.select(this).attr('r', 10);
            
            // Highlight connected links
            linkGroup.selectAll('line')
              .filter(link => link.source === d.id || link.target === d.id)
              .attr('stroke-width', 3)
              .attr('stroke-opacity', 1);
          })
          .on('mouseout', function(event, d) {
            if (!selectedNode || selectedNode.id !== d.id) {
              if (d.fraud_probability >= 70) d3.select(this).attr('r', 8);
              else if (d.fraud_probability >= 40) d3.select(this).attr('r', 6);
              else d3.select(this).attr('r', 5);
            }
            
            // Reset connected links
            linkGroup.selectAll('line')
              .filter(link => link.source === d.id || link.target === d.id)
              .attr('stroke-width', link => {
                if (link.fraud_probability >= 70) return 2.5;
                if (link.fraud_probability >= 40) return 1.5;
                return 1;
              })
              .attr('stroke-opacity', link => {
                if (link.fraud_probability >= 70) return 0.9;
                if (link.fraud_probability >= 40) return 0.7;
                return 0.5;
              });
          });

        // Highlight selected node
        if (selectedNode) {
          nodeGroup.selectAll('circle')
            .filter(d => d.id === selectedNode.id)
            .attr('fill', '#f1c40f')
            .attr('stroke', '#e67e22')
            .attr('stroke-width', 2)
            .attr('r', 10);
        }

        // Add zoom reset button
        const zoomReset = svg.append('g')
          .attr('class', 'zoom-reset')
          .attr('transform', `translate(${width - 50}, 20)`)
          .style('cursor', 'pointer')
          .on('click', () => {
            svg.transition()
              .duration(750)
              .call(zoom.transform, d3.zoomIdentity);
          });

        zoomReset.append('rect')
          .attr('width', 30)
          .attr('height', 30)
          .attr('rx', 5)
          .attr('fill', 'white')
          .attr('stroke', '#ddd')
          .attr('stroke-width', 1);

        zoomReset.append('text')
          .attr('x', 15)
          .attr('y', 18)
          .attr('text-anchor', 'middle')
          .attr('font-size', '14px')
          .text('↻');
      })
      .catch(error => {
        console.error('Error loading world map:', error);
      });
  }, [accounts, connections, selectedNode, zoomTransform, dimensions]);

  return (
    <div ref={containerRef} style={styles.container}>
      <svg ref={svgRef} style={styles.svg}></svg>
      
      {selectedNode && (
        <div style={styles.nodeInfoCard}>
          <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Compte: {selectedNode.id}</h3>
          <p><strong>Localisation:</strong> {selectedNode.latitude.toFixed(4)}, {selectedNode.longitude.toFixed(4)}</p>
          {selectedNode.amount && (
            <p><strong>Montant:</strong> {selectedNode.amount.toFixed(2)} €</p>
          )}
          <p><strong>Statut:</strong> 
            {selectedNode.fraud_probability >= 70 ? (
              <span style={styles.riskText}> Fraude ({selectedNode.fraud_probability.toFixed(0)}%)</span>
            ) : selectedNode.fraud_probability >= 40 ? (
              <span style={styles.mediumRiskText}> Risque élevé ({selectedNode.fraud_probability.toFixed(0)}%)</span>
            ) : (
              <span style={styles.safeText}> Sécurisé ({selectedNode.fraud_probability.toFixed(0)}%)</span>
            )}
          </p>
          <button 
            style={styles.closeBtn}
            onClick={() => setSelectedNode(null)}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
          >
            Fermer
          </button>
        </div>
      )}

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: '#e74c3c' }}></div>
          <span>Fraude (≥70%)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: '#f39c12' }}></div>
          <span>Risque élevé (40-69%)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: '#3498db' }}></div>
          <span>Sécurisé (&lt;40%)</span>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
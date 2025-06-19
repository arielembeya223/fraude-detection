import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const WorldMap = ({ accounts, connections }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomTransform, setZoomTransform] = useState(null);

  // Styles intégrés
  const styles = {
    container: {
      width: '100%',
      height: '500px',
      position: 'relative',
      backgroundColor: '#e6f3ff',
      borderRadius: '8px',
      margin: '15px 0',
      overflow: 'hidden'
    },
    svg: {
      width: '100%',
      height: '100%',
      display: 'block'
    },
    nodeInfoCard: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      zIndex: 100,
      maxWidth: '250px'
    },
    riskText: {
      color: '#e74c3c',
      fontWeight: 'bold'
    },
    safeText: {
      color: '#2ecc71'
    },
    closeBtn: {
      marginTop: '10px',
      padding: '6px 12px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9em'
    },
    closeBtnHover: {
      backgroundColor: '#2980b9'
    }
  };

  useEffect(() => {
    if (!accounts || !connections || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 500;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .style('background-color', '#e6f3ff');

    // Clear previous elements
    svg.selectAll('*').remove();

    // Projection
    const projection = d3.geoMercator()
      .scale(150)
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
          .attr('fill', '#f8f9fa')
          .attr('stroke', '#ddd')
          .attr('stroke-width', 0.5)
          .attr('d', d3.geoPath().projection(projection));

        // Draw connections
        g.append('g')
          .selectAll('line')
          .data(connections)
          .enter()
          .append('line')
          .attr('stroke', d => d.risk ? '#e74c3c' : '#3498db')
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', d => d.risk ? 0.8 : 0.6)
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
        g.append('g')
          .selectAll('circle')
          .data(accounts)
          .enter()
          .append('circle')
          .attr('fill', d => d.risk ? '#e74c3c' : '#3498db')
          .attr('stroke', 'white')
          .attr('stroke-width', 1.5)
          .attr('cx', d => projection([d.longitude, d.latitude])[0])
          .attr('cy', d => projection([d.longitude, d.latitude])[1])
          .attr('r', 8)
          .style('cursor', 'pointer')
          .on('click', (event, d) => {
            event.stopPropagation();
            setSelectedNode(d);
          })
          .on('mouseover', function() {
            d3.select(this).attr('r', 10);
          })
          .on('mouseout', function() {
            if (!selectedNode || selectedNode.id !== d3.select(this).datum().id) {
              d3.select(this).attr('r', 8);
            }
          });

        // Selected node style
        if (selectedNode) {
          svg.selectAll('circle')
            .filter(d => d.id === selectedNode.id)
            .attr('fill', '#f1c40f')
            .attr('stroke', '#e67e22')
            .attr('stroke-width', 2)
            .attr('r', 10);
        }
      })
      .catch(error => {
        console.error('Error loading world map:', error);
      });

  }, [accounts, connections, selectedNode, zoomTransform]);

  return (
    <div ref={containerRef} style={styles.container}>
      <svg ref={svgRef} style={styles.svg}></svg>
      
      {selectedNode && (
        <div style={styles.nodeInfoCard}>
          <h3>{selectedNode.id}</h3>
          <p>Location: {selectedNode.latitude.toFixed(4)}, {selectedNode.longitude.toFixed(4)}</p>
          <p>Status: <span style={selectedNode.risk ? styles.riskText : styles.safeText}>
            {selectedNode.risk ? 'High Risk' : 'Normal'}
          </span></p>
          <button 
            style={styles.closeBtn}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.closeBtnHover.backgroundColor}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.closeBtn.backgroundColor}
            onClick={() => setSelectedNode(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
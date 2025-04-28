import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { geoMercator, geoPath } from 'd3-geo';

const WorldMap = ({ accounts, connections }) => {
  const svgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [nodeInfo, setNodeInfo] = useState(null);
  const width = '100%';
  const height = 500;

  useEffect(() => {
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
          .attr('r', 6 * zoomLevel)
          .on('click', (event, d) => {
            setSelectedNode(d);
            setNodeInfo(d);
            setZoomLevel(2);
            projection.center([d.longitude, d.latitude]);
            
            // Mettre en évidence les connexions
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
              d3.select(event.target).attr('r', 6 * zoomLevel);
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
      
      {selectedNode && (
        <button 
          onClick={handleResetZoom}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '5px 10px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          Reset View
        </button>
      )}
      
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
          <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{nodeInfo.id}</h3>
          <div style={{ margin: '10px 0' }}>
            <strong>Localisation:</strong> 
            <div>Lat: {nodeInfo.latitude.toFixed(2)}, Long: {nodeInfo.longitude.toFixed(2)}</div>
          </div>
          <div style={{ margin: '10px 0' }}>
            <strong>Statut:</strong> 
            <span style={{ color: nodeInfo.risk ? '#e74c3c' : '#2ecc71', fontWeight: 'bold' }}>
              {nodeInfo.risk ? 'Risque élevé' : 'Sécurisé'}
            </span>
          </div>
          <div style={{ margin: '10px 0' }}>
            <strong>Connexions:</strong>
            <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
              {connections
                .filter(conn => conn.source === nodeInfo.id || conn.target === nodeInfo.id)
                .map((conn, i) => (
                  <li key={i}>
                    {conn.source === nodeInfo.id ? 'Vers ' + conn.target : 'De ' + conn.source}
                    {conn.amount && ` (${conn.amount})`}
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
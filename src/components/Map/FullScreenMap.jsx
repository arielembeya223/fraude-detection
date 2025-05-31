import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

// Fix icône default Leaflet sous React (problème fréquent)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const FullScreenMap = ({
  accounts = [
    { id: 'Client X', latitude: 40.7128, longitude: -74.006, risk: true },
    { id: 'Client Y', latitude: 48.8566, longitude: 2.3522, risk: false },
    { id: 'Client Z', latitude: 35.6762, longitude: 139.6503, risk: true },
  ],
  connections = [
    { source: 'Client X', target: 'Client Y' },
    { source: 'Client Z', target: 'Client X' },
  ],
}) => {
  const navigate = useNavigate();
  const [darkTheme, setDarkTheme] = useState(false);

  const lines = (connections || []).map(({ source, target }) => {
    const sourceAccount = (accounts || []).find(a => a.id === source);
    const targetAccount = (accounts || []).find(a => a.id === target);
    if (!sourceAccount || !targetAccount) return null;
    return [
      [sourceAccount.latitude, sourceAccount.longitude],
      [targetAccount.latitude, targetAccount.longitude],
    ];
  }).filter(Boolean);

  // URL des tuiles selon le thème
  const tileLayerUrl = darkTheme
    ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileLayerAttribution = darkTheme
    ? '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    : '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>';

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1100,
          padding: '8px 16px',
          backgroundColor: '#3498db',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontWeight: 'bold',
          userSelect: 'none',
        }}
      >
        ← Retour
      </button>

      <button
        onClick={() => setDarkTheme(prev => !prev)}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1100,
          padding: '8px 16px',
          backgroundColor: darkTheme ? '#fff' : '#333',
          color: darkTheme ? '#333' : '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontWeight: 'bold',
          userSelect: 'none',
        }}
        aria-label="Changer le thème de la carte"
      >
        {darkTheme ? 'Thème Clair' : 'Thème Sombre'}
      </button>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution={tileLayerAttribution}
          url={tileLayerUrl}
        />

        {(accounts || []).map(account => (
          <Marker
            key={account.id}
            position={[account.latitude, account.longitude]}
            title={account.id}
          >
            <Popup>
              <strong>ID:</strong> {account.id}<br />
              <strong>Latitude:</strong> {account.latitude.toFixed(2)}<br />
              <strong>Longitude:</strong> {account.longitude.toFixed(2)}<br />
              <strong>Status:</strong>{' '}
              <span style={{ color: account.risk ? 'red' : 'green' }}>
                {account.risk ? 'Risque élevé' : 'Sécurisé'}
              </span>
            </Popup>
          </Marker>
        ))}

        {lines.map((lineCoords, idx) => (
          <Polyline key={idx} positions={lineCoords} color={darkTheme ? '#0af' : 'blue'} />
        ))}
      </MapContainer>
    </div>
  );
};

export default FullScreenMap;

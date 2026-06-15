import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { listAmbulanceTypes, createFleetWebSocket, getMediaUrl } from '../../utils/admin-api';

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4'];

const getDynamicIcon = (color: string, photoUrl?: string) => {
  const svgTemplate = photoUrl 
    ? `<div style="background-image: url('${getMediaUrl(photoUrl)}'); background-size: cover; width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${color};"></div>`
    : `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="32" height="32" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
      <path fill="${color}" d="M192 0C86 0 0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0C267 435 384 279.4 384 192C384 86 298 0 192 0zm0 288c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96z"/>
      <path fill="#ffffff" d="M212 112h-40c-6.6 0-12 5.4-12 12v36h-36c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h36v36c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12v-36h36c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-36v-36c0-6.6-5.4-12-12-12z"/>
    </svg>
  `;
  return L.divIcon({
    className: 'custom-div-icon',
    html: svgTemplate,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function AdminRealMap() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [ambulanceTypes, setAmbulanceTypes] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  // Keep track of WS connection to prevent re-connects
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. Fetch available ambulance types
    fetchTypes();

    // 2. Connect WebSocket
    const ws = createFleetWebSocket(
      (data) => {
        if (data && Array.isArray(data.data)) {
          setDrivers(data.data);
        } else if (Array.isArray(data)) {
          setDrivers(data);
        }
      },
      (err) => {
        console.error("WebSocket Error:", err);
        setError('Lost connection to live tracking');
      }
    );
    
    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const fetchTypes = async () => {
    try {
      const data = await listAmbulanceTypes();
      if (Array.isArray(data)) {
        setAmbulanceTypes(data);
      }
    } catch (err) {
      console.error("Failed to load ambulance types", err);
    }
  };

  const getTypeColor = (typeName: string) => {
    const index = ambulanceTypes.findIndex(t => t.name === typeName);
    return index >= 0 ? COLORS[index % COLORS.length] : '#64748b'; // Slate color fallback
  };


  
  const validDrivers = drivers.filter(d => d.location && d.location.coordinates && d.location.coordinates.length >= 2);

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '600px', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, background: 'rgba(255, 255, 255, 0.95)', padding: '20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', minWidth: '220px', backdropFilter: 'blur(10px)' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1e293b' }}>Fleet Status <span className="live-dot" style={{ display: 'inline-block', width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', marginLeft: '8px', animation: 'pulse 2s infinite' }}></span></h3>
        
        {error && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Total Active</span>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{validDrivers.length}</span>
        </div>
        
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0' }}/>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Array.from(new Set(validDrivers.map(d => d.vehicle_type).filter(Boolean))).map(typeId => {
            const count = validDrivers.filter(d => d.vehicle_type === typeId).length;
            const t = ambulanceTypes.find(a => a._id === typeId);
            const typeName = t ? t.name : typeId;
            const color = getTypeColor(t ? t.name : typeId as string);
            return (
              <div key={typeId as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {t && t.photo ? (
                    <img src={getMediaUrl(t.photo)} alt="Vehicle" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: color }} />
                  )}
                  <span style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>{typeName as string}</span>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>{count}</span>
              </div>
            );
          })}
          
          {drivers.length === 0 && (
             <div style={{ fontSize: '12px', color: '#94a3b8' }}>No active vehicles...</div>
          )}
        </div>
      </div>

      <MapContainer center={[14.6815, 77.6006]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {validDrivers.map((driver) => {
          const [lng, lat] = driver.location.coordinates;
          const t = ambulanceTypes.find(a => a._id === driver.vehicle_type);
          const typeName = t ? t.name : driver.vehicle_type;
          const markerColor = getTypeColor(typeName);
          
          return (
            <Marker key={driver._id} position={[lat, lng]} icon={getDynamicIcon(markerColor, t?.photo)}>
              <Popup>
                <div style={{ padding: '8px', minWidth: '150px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '16px' }}>{driver.name}</h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b' }}>{driver.mobile}</p>
                  <div style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '4px', background: markerColor + '20', color: markerColor, fontWeight: 'bold', fontSize: '12px' }}>
                    {typeName}
                  </div>
                  {driver.status && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', fontWeight: 'bold', color: driver.status === 'ON_TRIP' ? '#ef4444' : '#22c55e' }}>
                      • {driver.status.replace('_', ' ')}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        .custom-div-icon {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}

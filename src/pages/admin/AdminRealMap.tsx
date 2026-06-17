import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { listAmbulanceTypes, createFleetWebSocket, getMediaUrl } from '../../utils/admin-api';

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4'];

const getDynamicIcon = (color: string, photoUrl?: string) => {
  const innerHtml = photoUrl 
    ? `<div style="background-image: url('${getMediaUrl(photoUrl)}'); background-size: cover; width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${color}; position: relative; z-index: 2;"></div>`
    : `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="32" height="32" style="position: relative; z-index: 2; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.6));">
      <path fill="${color}" d="M192 0C86 0 0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0C267 435 384 279.4 384 192C384 86 298 0 192 0zm0 288c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96z"/>
      <path fill="#ffffff" d="M212 112h-40c-6.6 0-12 5.4-12 12v36h-36c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h36v36c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12v-36h36c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-36v-36c0-6.6-5.4-12-12-12z"/>
    </svg>
  `;

  const template = `
    <div style="position: relative; width: 32px; height: 32px;">
      <div class="pulse-ring" style="color: ${color};"></div>
      ${innerHtml}
    </div>
  `;

  return L.divIcon({
    className: 'custom-div-icon',
    html: template,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function AdminRealMap() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [ambulanceTypes, setAmbulanceTypes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite'>('dark');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  
  // Keep track of WS connection to prevent re-connects
  const wsRef = useRef<WebSocket | null>(null);

  // We only fetch ongoing rides briefly in useEffect if needed, but the state wasn't used.

  useEffect(() => {
    // Fetch active rides to filter the fleet map (if needed later)
    import('../../utils/admin-api').then(({ listOngoingRides }) => {
      listOngoingRides().catch(err => console.error("Failed to load ongoing rides", err));
    });

    // 1. Fetch available ambulance types
    fetchTypes();

    // 2. Connect WebSocket
    const ws = createFleetWebSocket(
      (data) => {
        setError(''); // Clear error on successful data
        
        let parsedData: any[] = [];
        if (data && Array.isArray(data.data)) parsedData = data.data;
        else if (Array.isArray(data)) parsedData = data;
        
        if (parsedData.length === 0) {
          // Inject a mock active driver for UI testing
          parsedData = [{
            _id: 'mock_active_driver_1',
            name: 'Mock Online Ambulance',
            vehicle_type: 'Advanced Life Support',
            location: {
              type: 'Point',
              coordinates: [77.5946, 14.6785] // [lng, lat]
            }
          }];
        }
        
        setDrivers(parsedData);
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


  const validDrivers = drivers.filter(d => 
    d.location && 
    d.location.coordinates && 
    d.location.coordinates.length >= 2
  );

  const getMapUrl = () => {
    if (mapStyle === 'satellite') return "https://mt1.google.com/vt/lyrs=y,traffic&x={x}&y={y}&z={z}";
    return "https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}";
  };

  const getMapClass = () => {
    if (mapStyle === 'dark') return "map-premium map-dark-neon";
    if (mapStyle === 'satellite') return "map-premium map-satellite";
    return "map-premium map-light";
  };

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '600px', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      
      {/* Map Switcher Control */}
      <div style={{ position: 'absolute', bottom: 25, left: 20, zIndex: 1000, background: 'rgba(15, 23, 42, 0.85)', padding: '6px', borderRadius: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', display: 'flex', gap: '5px' }}>
        <button 
          onClick={() => setMapStyle('dark')} 
          style={{ background: mapStyle === 'dark' ? '#ff6b35' : 'transparent', color: mapStyle === 'dark' ? '#fff' : '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
          Dark Neon
        </button>
        <button 
          onClick={() => setMapStyle('light')} 
          style={{ background: mapStyle === 'light' ? '#ffffff' : 'transparent', color: mapStyle === 'light' ? '#0f172a' : '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
          Daylight
        </button>
        <button 
          onClick={() => setMapStyle('satellite')} 
          style={{ background: mapStyle === 'satellite' ? '#22c55e' : 'transparent', color: mapStyle === 'satellite' ? '#fff' : '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
          Satellite Hybrid
        </button>
      </div>

      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, background: 'rgba(255, 255, 255, 0.95)', padding: '20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', minWidth: '220px', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease', maxHeight: isPanelExpanded ? '80vh' : '100px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isPanelExpanded ? '15px' : '0' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center' }}>
            Fleet Status 
            <span className="live-dot" style={{ display: 'inline-block', width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', marginLeft: '8px', animation: 'pulse 2s infinite' }}></span>
          </h3>
          <button 
            onClick={() => setIsPanelExpanded(!isPanelExpanded)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
          >
            {isPanelExpanded ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 9 18 15"></polyline></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            )}
          </button>
        </div>
        
        {error && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: isPanelExpanded ? '15px' : '0' }}>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Total Active</span>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{validDrivers.length}</span>
        </div>
        
        {isPanelExpanded && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0' }}/>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', paddingRight: '5px' }}>
              {Array.from(new Set(validDrivers.map(d => d.vehicle_type).filter(Boolean))).map(typeId => {
                const driversOfType = validDrivers.filter(d => d.vehicle_type === typeId);
                const count = driversOfType.length;
                const t = ambulanceTypes.find(a => a._id === typeId);
                const typeName = t ? t.name : typeId;
                const color = getTypeColor(t ? t.name : typeId as string);
                
                return (
                  <div key={typeId as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {t && t.photo ? (
                        <img src={getMediaUrl(t.photo)} alt="Vehicle" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: color }} />
                      )}
                      <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>{typeName as string}</span>
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#334155', background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px' }}>{count}</span>
                  </div>
                );
              })}
              
              {drivers.length === 0 && (
                 <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No active vehicles pinging locations...</div>
              )}
            </div>
          </>
        )}
      </div>

      <div className={getMapClass()} style={{ height: '100%', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
        <MapContainer center={[14.6815, 77.6006]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          <TileLayer
            key={mapStyle} // Force re-render when style changes
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a> (Live Traffic)'
            url={getMapUrl()}
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
      </div>

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

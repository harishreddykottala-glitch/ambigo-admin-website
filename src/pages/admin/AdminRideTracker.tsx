import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { createFleetWebSocket } from '../../utils/admin-api';

const MapAutoFramer = ({ routePath }: { routePath: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (routePath.length > 0) {
      const bounds = L.latLngBounds(routePath);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
    }
  }, [routePath, map]);
  return null;
};

const createDotIcon = (color: string, label?: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${color}; opacity: 0.3; animation: pulse 2s infinite;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color}; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 2;"></div>
        </div>
        ${label ? `<div style="margin-top: 4px; background: rgba(0,0,0,0.7); color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">${label}</div>` : ''}
      </div>
    `,
    iconSize: [60, 40],
    iconAnchor: [30, 20],
  });
};

const createAmbulanceIcon = (heading: number) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="position: relative; width: 36px; height: 36px;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #3b82f6; animation: radarPulse 2s ease-out infinite; z-index: 0;"></div>
        <div style="position: relative; z-index: 2; width: 36px; height: 36px; transform: rotate(${heading}deg); transition: transform 0.5s ease-out;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="36" height="36" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.6));">
            <path fill="#3b82f6" d="M192 0C86 0 0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0C267 435 384 279.4 384 192C384 86 298 0 192 0zm0 288c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96z"/>
            <path fill="#ffffff" d="M212 112h-40c-6.6 0-12 5.4-12 12v36h-36c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h36v36c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12v-36h36c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-36v-36c0-6.6-5.4-12-12-12z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

export default function AdminRideTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const ride = location.state?.ride;

  const [driverLoc, setDriverLoc] = useState<[number, number] | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [heading, setHeading] = useState(0);
  const prevLocRef = useRef<[number, number] | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const pickupLoc: [number, number] = ride ? [ride.pickup.coordinates[1], ride.pickup.coordinates[0]] : [0,0];
  const dropLoc: [number, number] = ride ? [ride.drop.coordinates[1], ride.drop.coordinates[0]] : [0,0];

  const [liveDistance, setLiveDistance] = useState<number>(parseFloat(ride?.distance || "0"));
  const [progressPercent, setProgressPercent] = useState<number>(0);

  useEffect(() => {
    if (driverLoc && dropLoc[0] !== 0) {
      const p1 = L.latLng(driverLoc[0], driverLoc[1]);
      const p2 = L.latLng(dropLoc[0], dropLoc[1]);
      const distKm = p1.distanceTo(p2) / 1000;
      setLiveDistance(distKm);
      
      const initialDist = parseFloat(ride?.distance || "1");
      const progress = Math.max(0, Math.min(100, (1 - (distKm / initialDist)) * 100));
      setProgressPercent(progress);
    }
  }, [driverLoc]);

  useEffect(() => {
    if (!ride) {
      // If accessed directly without state, you would ideally fetch the ride by ID here.
      return;
    }

    // Connect to WebSocket to get driver location
    const ws = createFleetWebSocket((data) => {
      const drivers = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      const driver = drivers.find((d: any) => d._id === ride.driver_id || String(d.id) === String(ride.driver_id));
      if (driver && driver.location && driver.location.coordinates) {
        const newLoc = [driver.location.coordinates[1], driver.location.coordinates[0]] as [number, number];
        
        if (prevLocRef.current) {
          const p1 = prevLocRef.current;
          const p2 = newLoc;
          if (p1[0] !== p2[0] || p1[1] !== p2[1]) {
            const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * (180 / Math.PI);
            setHeading(angle);
          }
        }
        prevLocRef.current = newLoc;
        setDriverLoc(newLoc);
      }
    }, (err) => console.error("WS Error", err));
    wsRef.current = ws;

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [ride]);

  useEffect(() => {
    if (!ride) return;
    
    // Determine path points
    const pickup: [number, number] = [ride.pickup.coordinates[1], ride.pickup.coordinates[0]]; // [lat, lng]
    const drop: [number, number] = [ride.drop.coordinates[1], ride.drop.coordinates[0]]; // [lat, lng]
    
    // We fetch a route from Driver (if available) -> Pickup -> Drop.
    // If no driver yet, just Pickup -> Drop
    const coordsStr = driverLoc 
      ? `${driverLoc[1]},${driverLoc[0]};${pickup[1]},${pickup[0]};${drop[1]},${drop[0]}`
      : `${pickup[1]},${pickup[0]};${drop[1]},${drop[0]}`;

    fetch(`https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]); // to [lat, lng]
          setRoutePath(coords);
        }
      })
      .catch(err => console.error("OSRM Route Error", err));
  }, [ride, driverLoc]); // Re-fetch if driver moves significantly, or just once (currently runs on every update, maybe optimize later if too many requests)

  if (!ride) {
    return <div className="admin-page">Ride not found or accessed directly. Please go back to bookings.</div>;
  }

  const centerLoc = driverLoc || pickupLoc;

  return (
    <div className="admin-layout" style={{ position: 'relative' }}>
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/admin/bookings')}
        style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000, background: 'rgba(15, 23, 42, 0.85)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Bookings
      </button>

      {/* Top Status Bar */}
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(15, 23, 42, 0.9)', padding: '12px 24px', borderRadius: '30px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', background: driverLoc ? '#22c55e' : '#eab308', borderRadius: '50%', boxShadow: driverLoc ? '0 0 10px #22c55e' : '0 0 10px #eab308', animation: 'pulse 2s infinite' }}></span>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px', letterSpacing: '0.5px' }}>
            {driverLoc ? 'AMBULANCE ON ROUTE' : 'SEARCHING FOR DRIVER'}
          </span>
        </div>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
        <div style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
          ETA: <span style={{ color: '#fff', fontWeight: 'bold' }}>14 MINS</span>
        </div>
      </div>

      {/* Premium Bottom Details Card */}
      <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(255, 255, 255, 0.95)', padding: '24px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', width: '90%', maxWidth: '600px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Route Progress Overview */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Pickup</span>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Patient Location</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{liveDistance.toFixed(1)} km</span>
            <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', position: 'relative', marginTop: '4px', overflow: 'hidden' }}>
               <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progressPercent}%`, background: '#3b82f6', borderRadius: '2px', transition: 'width 1s ease-in-out' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Drop-off</span>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Destination Hospital</span>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0' }}/>

        {/* Profiles Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Driver Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #3b82f6' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{driverLoc ? 'Driver Assigned' : 'Searching...'}</div>
              <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#eab308" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                4.8 Rating
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
             <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
             </button>
             <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#22c55e', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(34,197,94,0.3)' }}>
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
             </button>
          </div>
        </div>
      </div>

      {/* Subtle Vignette Overlay for Depth */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 500, background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }}></div>

      {/* Map Container */}
      <div className="map-premium map-dark-neon" style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <MapContainer center={centerLoc} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          />
          
          {/* Glowing Route Polyline */}
          {routePath.length > 0 && (
            <>
              {/* Outer Glow */}
              <Polyline positions={routePath} color="#3b82f6" weight={12} opacity={0.2} />
              {/* Inner Core */}
              <Polyline positions={routePath} color="#60a5fa" weight={4} opacity={0.8} />
              {/* Moving Traffic Particles */}
              <Polyline positions={routePath} color="#ffffff" weight={2} opacity={0.9} className="animated-route" dashArray="5 15" />
            </>
          )}

          <Marker position={pickupLoc} icon={createDotIcon('#22c55e', 'Pickup')}>
            <Popup>Pickup Location</Popup>
          </Marker>
          <Marker position={dropLoc} icon={createDotIcon('#ef4444', 'Drop-off')}>
            <Popup>Drop-off Location</Popup>
          </Marker>

          {driverLoc && (
            <Marker position={driverLoc} icon={createAmbulanceIcon(heading)}>
              <Popup>Live Ambulance</Popup>
            </Marker>
          )}
          <MapAutoFramer routePath={routePath} />
        </MapContainer>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        @keyframes radarPulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes dashMove {
          to { stroke-dashoffset: -40; }
        }
        .animated-route {
          animation: dashMove 1s linear infinite;
        }
        .custom-div-icon {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { EmergencyMapScene } from '../../utils/three-scene';
import '../../assets/admin.css';

const AdminLiveMap = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<EmergencyMapScene | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    sceneRef.current = new EmergencyMapScene(mountRef.current);
    
    return () => {
      sceneRef.current?.dispose();
    };
  }, []);

  return (
    <div className="map-viewport" ref={mountRef}></div>
  );
};

export default AdminLiveMap;

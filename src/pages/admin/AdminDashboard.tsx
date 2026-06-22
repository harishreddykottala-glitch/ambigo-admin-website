import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats } from '../../utils/admin-api';
import { Activity, CarFront, Zap, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import AdminRealMap from './AdminRealMap';
import '../../assets/admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ ongoing: 0, completed: 0, fleet: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchDashboardStats();
        setStats({
          ongoing: data.ongoing || 0,
          completed: data.completed || 0,
          fleet: data.fleet || 0
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <div className="admin-hero-banner fade-in">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2}}>
          <div>
            <h1 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px'}}>Hello Admin!</h1>
            <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', maxWidth: '600px'}}>We are on a mission to help you build and manage successful fleets efficiently.</p>
          </div>
          <button style={{background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600}}>
            Announcements
          </button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="admin-stats-overlap admin-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
        
        <div className="glass-panel fade-in" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
              <ArrowUpRight size={18} />
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>Active Bookings</div>
              <div style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: 600 }}>{stats.ongoing}</div>
            </div>
          </div>
        </div>

        <div className="glass-panel fade-in" style={{ padding: '16px', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
              <ArrowUpRight size={18} />
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>Total Fleet</div>
              <div style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: 600 }}>{stats.fleet}</div>
            </div>
          </div>
        </div>

        <div className="glass-panel fade-in" style={{ padding: '16px', animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', flexShrink: 0 }}>
              <ArrowUpRight size={18} />
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>Completed Trips</div>
              <div style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: 600 }}>{stats.completed}</div>
            </div>
          </div>
        </div>

        <div className="glass-panel fade-in" style={{ padding: '16px', animationDelay: '0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
              <ArrowDownRight size={18} />
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>Avg Response</div>
              <div style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: 600 }}>4.2 <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Mins</span></div>
            </div>
          </div>
        </div>

      </div>

      <div style={{display: 'flex', gap: '16px', padding: '0 24px', minHeight: '400px', paddingBottom: '16px'}}>
         {/* Left Side: Real-Time Map (Acting as the big chart in Hope UI) */}
         <div className="glass-panel fade-in" style={{flex: 2, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
            <div style={{padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0}}>
               <div>
                  <h3 style={{fontSize: '1.1rem', fontWeight: 700, color: '#1e293b'}}>Fleet Live Locator</h3>
                  <p style={{color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px'}}>Real-time GPS tracking of active dispatch</p>
               </div>
               <button onClick={() => navigate('/admin/map')} style={{background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b', padding: '6px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'}}>View Details</button>
            </div>
            <div style={{flex: 1, minHeight: 0, position: 'relative'}}>
               <AdminRealMap />
            </div>
         </div>

         {/* Right Side: Simple Stats / Readiness Card (Acting as the side stats in Hope UI) */}
         <div className="glass-panel fade-in" style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
            <div style={{background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px', padding: '16px', color: 'white', marginBottom: '16px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'}}>
               <div style={{fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9}}>Fleet Readiness</div>
               <div style={{fontSize: '2rem', fontWeight: 800, margin: '4px 0'}}>94%</div>
               <div style={{fontSize: '0.75rem', opacity: 0.9}}>Optimal readiness for dispatches.</div>
            </div>
            
            <h4 style={{fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px'}}>Fleet Categories</h4>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
               <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px'}}><CarFront size={20} color="#3b82f6"/></div>
               <div style={{flex: 1}}>
                  <div style={{fontWeight: 600, color: '#1e293b', fontSize: '0.95rem'}}>BLS Units</div>
                  <div style={{fontSize: '0.8rem', color: '#64748b', marginTop: '2px'}}>Basic Life Support</div>
               </div>
               <div style={{fontWeight: 700, fontSize: '1.1rem', color: '#1e293b'}}>12</div>
            </div>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
               <div style={{background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px'}}><Activity size={20} color="#10b981"/></div>
               <div style={{flex: 1}}>
                  <div style={{fontWeight: 600, color: '#1e293b', fontSize: '0.95rem'}}>ALS Units</div>
                  <div style={{fontSize: '0.8rem', color: '#64748b', marginTop: '2px'}}>Advanced Support</div>
               </div>
               <div style={{fontWeight: 700, fontSize: '1.1rem', color: '#1e293b'}}>2</div>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
               <div style={{background: 'rgba(244, 67, 54, 0.1)', padding: '12px', borderRadius: '12px'}}><AlertTriangle size={20} color="#f44336"/></div>
               <div style={{flex: 1}}>
                  <div style={{fontWeight: 600, color: '#1e293b', fontSize: '0.95rem'}}>Maintenance</div>
                  <div style={{fontSize: '0.8rem', color: '#64748b', marginTop: '2px'}}>In Garage</div>
               </div>
               <div style={{fontWeight: 700, fontSize: '1.1rem', color: '#1e293b'}}>3</div>
            </div>
            
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

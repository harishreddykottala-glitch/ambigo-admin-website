import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOngoingRides, listCompletedRides, listDrivers } from '../../utils/admin-api';
import { Activity, CarFront, Zap, AlertTriangle } from 'lucide-react';
import AdminRealMap from './AdminRealMap';
import '../../assets/admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ ongoing: 0, completed: 0, fleet: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const [ongoing, completed, drivers] = await Promise.all([
          listOngoingRides(),
          listCompletedRides(),
          listDrivers()
        ]);
        setStats({
          ongoing: ongoing.length || 0,
          completed: completed.length || 0,
          fleet: drivers.total || 0
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      {/* Top Stats Row */}
      <div className="admin-stats-row">
        <div className="glass-panel admin-mini-stat fade-in">
          <div className="label">Active Bookings</div>
          <div className="value-row">
            <span className="val" style={{color: '#3b82f6'}}>{stats.ongoing}</span>
            <span className="sub">Rides in progress</span>
          </div>
        </div>
        <div className="glass-panel admin-mini-stat fade-in" style={{animationDelay: '0.1s'}}>
          <div className="label">Total Fleet</div>
          <div className="value-row">
            <span className="val" style={{color: '#10b981'}}>{stats.fleet}</span>
            <span className="sub">Registered Drivers</span>
          </div>
        </div>
        <div className="glass-panel admin-mini-stat fade-in" style={{animationDelay: '0.2s'}}>
          <div className="label">Completed Trips</div>
          <div className="value-row">
            <span className="val" style={{color: '#8b5cf6'}}>{stats.completed}</span>
            <span className="sub">Overall</span>
          </div>
        </div>
        <div className="glass-panel admin-mini-stat fade-in" style={{animationDelay: '0.3s'}}>
          <div className="label">Avg Response</div>
          <div className="value-row">
            <span className="val" style={{color: '#f59e0b'}}>4.2</span>
            <span className="sub">Mins</span>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        {/* Left Grid */}
        <div className="admin-left-grid">
          {/* Status Panel */}
          <div className="glass-panel fade-in" style={{animationDelay: '0.4s'}}>
            <div className="status-card-header">Fleet Readiness Score</div>
            <div className="progress-value-large">94%</div>
            <p style={{fontSize: '0.85rem', color: '#64748b'}}>Optimal readiness for incoming dispatches.</p>
            <div className="progress-bar-container">
              <div className="progress-track">
                <div className="progress-fill"></div>
              </div>
            </div>
            <div className="flex-between mt-4">
              <span className="admin-badge" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>Excellent</span>
              <span style={{fontSize: '0.85rem', color: '#64748b'}}>Updated 1m ago</span>
            </div>
          </div>

          {/* Alerts List */}
          <div className="glass-panel fade-in" style={{animationDelay: '0.5s'}}>
            <div className="status-card-header flex-between">
              <span>Why The Risk?</span>
              <button className="admin-btn-text" style={{fontSize: '0.75rem'}}>View all</button>
            </div>
            <div className="alert-list">
              <div className="alert-item">
                <div className="alert-icon bg-red"><AlertTriangle size={14} /></div>
                <div className="alert-content">
                  <h4>High Traffic - Zone C</h4>
                  <p>Increases estimated arrival times.</p>
                </div>
              </div>
              <div className="alert-item">
                <div className="alert-icon bg-orange"><Activity size={14} /></div>
                <div className="alert-content">
                  <h4>ALS Vehicle Shortage</h4>
                  <p>Only 2 Advanced Life Support units available.</p>
                </div>
              </div>
              <div className="alert-item">
                <div className="alert-icon bg-blue"><Zap size={14} /></div>
                <div className="alert-content">
                  <h4>Surge Expected</h4>
                  <p>Peak hour starting in 30 mins.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Epigenetic-style cards (Fleet Categories) */}
          <div className="glass-panel fade-in" style={{gridColumn: '1 / -1', animationDelay: '0.6s'}}>
            <div className="status-card-header">Fleet Categories Overview</div>
            <div style={{display: 'flex', gap: '16px'}}>
              <div style={{flex: 1, padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                <div className="flex-between mb-4">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{background: '#3b82f6', color: 'white', padding: '6px', borderRadius: '50%'}}>
                      <CarFront size={14} />
                    </div>
                    <span style={{fontWeight: 600}}>BLS Units</span>
                  </div>
                  <span style={{color: '#10b981', fontSize: '0.8rem', fontWeight: 600}}>Optimal</span>
                </div>
                <div style={{fontSize: '2rem', fontWeight: 700}}>12 <span style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 400}}>available</span></div>
                <div style={{marginTop: '16px', fontSize: '0.8rem', color: '#64748b'}}>Basic Life Support vehicles equipped for standard transport.</div>
              </div>
              
              <div style={{flex: 1, padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                <div className="flex-between mb-4">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{background: '#8b5cf6', color: 'white', padding: '6px', borderRadius: '50%'}}>
                      <Activity size={14} />
                    </div>
                    <span style={{fontWeight: 600}}>ALS Units</span>
                  </div>
                  <span style={{color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600}}>Suboptimal</span>
                </div>
                <div style={{fontSize: '2rem', fontWeight: 700}}>2 <span style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 400}}>available</span></div>
                <div style={{marginTop: '16px', fontSize: '0.8rem', color: '#64748b'}}>Advanced Life Support with paramedics on board.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Digital Twin / 3D Map) */}
        <div className="admin-right-column fade-in" style={{animationDelay: '0.7s'}}>
          <div className="glass-panel map-container-card">
            <div className="map-card-header flex-between">
              <div>
                <h3>Real-Time Fleet Locator</h3>
                <p>Live GPS tracking of your active fleet.</p>
              </div>
              <button className="admin-btn secondary" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => navigate('/admin/map')}>View Full Map</button>
            </div>
            <AdminRealMap />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

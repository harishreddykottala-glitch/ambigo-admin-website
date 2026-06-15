import { useEffect, useState } from 'react';
import { listOngoingRides, listCompletedRides } from '../../utils/admin-api';
import '../../assets/admin.css';

const AdminLiveBookings = () => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRides();
  }, [activeTab]);

  const fetchRides = async () => {
    setLoading(true);
    try {


      let data;
      if (activeTab === 'ongoing') {
        data = await listOngoingRides();
      } else {
        data = await listCompletedRides();
      }
      setRides(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page fade-in">
      <div className="admin-page-header">
        <h1>Bookings Management</h1>
        <p>View and manage passenger ride requests.</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'ongoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('ongoing')}
        >
          Ongoing Rides
        </button>
        <button 
          className={`admin-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed Rides
        </button>
      </div>

      <div className="glass-panel mt-4 overflow-x-auto">
        {loading ? (
          <div className="admin-loading">Loading rides...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ride ID</th>
                <th>User</th>
                <th>Driver</th>
                <th>Distance</th>
                {activeTab === 'completed' && <th>Fare / Cost</th>}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rides.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'completed' ? 6 : 5} className="text-center">No {activeTab} rides found.</td>
                </tr>
              ) : (
                rides.map((r, i) => (
                  <tr key={i}>
                    <td><span style={{color: '#94a3b8'}}>{(r.id || r._id || `R-${1000 + i}`).substring(0,8)}...</span></td>
                    <td>{r.user_id || 'Unknown'}</td>
                    <td>{r.driver_id || 'Pending'}</td>
                    <td>{r.distance ? `${r.distance} km` : 'N/A'}</td>
                    {activeTab === 'completed' && <td>{r.cost ? `₹${r.cost}` : '₹0'}</td>}
                    <td>
                      <span className={`admin-badge ${activeTab === 'ongoing' ? 'bg-orange' : 'bg-green'}`} style={{background: activeTab === 'ongoing' ? '#3b82f6' : '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem'}}>
                        {r.status || activeTab.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminLiveBookings;

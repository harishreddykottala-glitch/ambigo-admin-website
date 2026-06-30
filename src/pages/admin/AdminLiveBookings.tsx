import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchOngoingRides, fetchCompletedRides } from '../../store/slices/ridesSlice';
import '../../assets/admin.css';

const AdminLiveBookings = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { liveRides, completedRides, status, completedStatus } = useAppSelector(state => state.rides);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [selectedRide, setSelectedRide] = useState<any | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [skip, setSkip] = useState(0);
  const limit = 10;

  useEffect(() => {
    if (activeTab === 'ongoing' && status === 'idle') {
      dispatch(fetchOngoingRides());
    } else if (activeTab === 'completed' && completedStatus === 'idle') {
      dispatch(fetchCompletedRides());
    }
  }, [activeTab, status, completedStatus, dispatch]);

  useEffect(() => {
    setSkip(0);
  }, [searchQuery, filterType, activeTab]);

  const rides = activeTab === 'ongoing' ? liveRides : completedRides;
  const isLoading = activeTab === 'ongoing' ? status === 'loading' : completedStatus === 'loading';

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

      <div className="admin-toolbar flex-between" style={{ marginTop: '1.5rem', marginBottom: '1rem', background: '#fff', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
          <div className="admin-search-bar" style={{ flex: 1, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', transition: 'color 0.2s' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              className="admin-filter-input"
              placeholder="Search by Ride ID, User, or Driver..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="admin-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All Payments</option>
            <option value="CASH">Cash</option>
            <option value="ONLINE">Online</option>
          </select>
        </div>
      </div>

      {(() => {
        const filteredRides = rides.filter(r => {
          const q = searchQuery.toLowerCase();
          const idStr = (r.id || r._id || '').toLowerCase();
          const userStr = (r.user_id || '').toLowerCase();
          const driverStr = (r.driver_id || '').toLowerCase();
          if (q && !idStr.includes(q) && !userStr.includes(q) && !driverStr.includes(q)) {
            return false;
          }
          if (filterType !== 'ALL') {
            const pay = (r.payment_mode || '').toUpperCase();
            if (pay !== filterType) return false;
          }
          return true;
        });
        
        const paginatedRides = filteredRides.slice(skip, skip + limit);
        const total = filteredRides.length;

        return (
          <>
            <div className="glass-panel overflow-x-auto">
              {isLoading ? (
                <div className="admin-loading">Loading rides...</div>
              ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ride ID</th>
                <th>User</th>
                <th>Driver</th>
                <th>Distance</th>
                <th>Payment</th>
                {activeTab === 'completed' && <th>Fare</th>}
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRides.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'completed' ? 7 : 6} className="text-center">No rides found.</td>
                </tr>
              ) : (
                paginatedRides.map((r, i) => (
                  <tr key={i}>
                    <td><span style={{color: '#94a3b8'}}>{(r.id || r._id || `R-${1000 + i}`).substring(0,8)}...</span></td>
                    <td>{r.user_id || 'Unknown'}</td>
                    <td>{r.driver_id || 'Pending'}</td>
                    <td>{r.distance !== undefined && r.distance !== null ? `${Number(r.distance).toFixed(1)} km` : 'N/A'}</td>
                    <td><span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{r.payment_mode || 'N/A'}</span></td>
                    {activeTab === 'completed' && <td>{r.cost ? `₹${Number(r.cost).toFixed(1)}` : '₹0.0'}</td>}
                    <td>
                      <span className={`admin-badge ${activeTab === 'ongoing' ? 'bg-orange' : 'bg-green'}`} style={{background: activeTab === 'ongoing' ? '#3b82f6' : '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem'}}>
                        {r.status || activeTab.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          className="admin-btn secondary" 
                          style={{padding: '4px 10px', fontSize: '0.75rem'}} 
                          onClick={() => setSelectedRide(r)}
                        >
                          View Details
                        </button>
                        {activeTab === 'ongoing' && (
                          <button 
                            className="admin-btn admin-btn-dark"
                            onClick={() => navigate(`/admin/live-ride/${r.id || r._id}`, { state: { ride: r } })}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                            Track Live
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

        {/* Pagination Controls */}
        {!isLoading && total > limit && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '1rem', alignItems: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Showing <span style={{ fontWeight: 600, color: '#0f172a' }}>{skip + 1}</span> to <span style={{ fontWeight: 600, color: '#0f172a' }}>{Math.min(skip + limit, total)}</span> of <span style={{ fontWeight: 600, color: '#0f172a' }}>{total}</span> rides
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="admin-btn secondary" 
              disabled={skip === 0} 
              onClick={() => setSkip(skip - limit)}
              style={{ opacity: skip === 0 ? 0.5 : 1 }}
            >
              Previous
            </button>
            <button 
              className="admin-btn secondary" 
              disabled={skip + limit >= total} 
              onClick={() => setSkip(skip + limit)}
              style={{ opacity: skip + limit >= total ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        </div>
      )}
      </>
      );
      })()}
      {selectedRide && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content fade-in" style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header flex-between" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Ride Details</h3>
              <button onClick={() => setSelectedRide(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            <div style={{ padding: '0 0.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '3px solid #f97316' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>Distance</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: '#0f172a' }}>{selectedRide.distance !== undefined && selectedRide.distance !== null ? `${Number(selectedRide.distance).toFixed(1)} km` : 'N/A'}</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '3px solid #10b981' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>Payment</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: '#10b981', textTransform: 'uppercase' }}>{selectedRide.payment_mode || 'N/A'}</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '3px solid #3b82f6' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>User Phone</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: '#0f172a' }}>{selectedRide.user_phone || 'N/A'}</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '3px solid #eab308' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>Ambulance Type</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: '#0f172a', textTransform: 'uppercase' }}>{selectedRide.amb_type_name || selectedRide.amb_type_id || 'N/A'}</p>
                </div>
              </div>

              <h5 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Locations
              </h5>
              <div style={{ marginBottom: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '14px', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '19px', top: '35px', bottom: '-15px', width: '2px', background: '#e2e8f0' }}></div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', marginTop: '4px', zIndex: 1, border: '2px solid #fff', boxShadow: '0 0 0 1px #10b981' }}></div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>Pickup Point</p>
                      <p style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem', fontWeight: 500 }}>
                        {typeof selectedRide.pickup_address === 'string' ? selectedRide.pickup_address : selectedRide.pickup_address?.name || selectedRide.pickup_address?.address || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', marginTop: '4px', zIndex: 1, border: '2px solid #fff', boxShadow: '0 0 0 1px #ef4444' }}></div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>Drop Point</p>
                      <p style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem', fontWeight: 500 }}>
                        {typeof selectedRide.drop_address === 'string' ? selectedRide.drop_address : selectedRide.drop_address?.name || selectedRide.drop_address?.address || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLiveBookings;

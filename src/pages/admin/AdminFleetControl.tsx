import { useEffect, useState } from 'react';
import { getMediaUrl, fetchDriverDetails, listAmbulanceTypes } from '../../utils/admin-api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDrivers } from '../../store/slices/fleetSlice';
import { X, Wallet, Image as ImageIcon, MapPin, Search } from 'lucide-react';
import '../../assets/admin.css';

const AdminFleetControl = () => {
  const dispatch = useAppDispatch();
  const { drivers, status } = useAppSelector((state) => state.fleet);
  
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [ambulanceTypes, setAmbulanceTypes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchDrivers());
    }
    fetchAmbulanceTypes();
  }, [status, dispatch]);

  useEffect(() => {
    setSkip(0);
  }, [searchQuery, filterType]);

  const fetchAmbulanceTypes = async () => {
    try {
      const types = await listAmbulanceTypes();
      const typeMap: Record<string, string> = {};
      types.forEach((t: any) => {
        typeMap[t._id] = t.name;
      });
      setAmbulanceTypes(typeMap);
    } catch (error) {
      console.error('Failed to fetch ambulance types', error);
    }
  };

  // Local function for fetching ambulance types


  const handleView360 = async (driver: any) => {
    setSelectedDriver(driver);
    try {
      if (localStorage.getItem('admin_token') !== 'demo-token') {
        const fullDriver = await fetchDriverDetails(driver._id);
        setSelectedDriver(fullDriver);
      }
    } catch (err) {
      console.error("Failed to fetch driver details:", err);
    }
  };

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.mobile?.includes(searchQuery) ||
                          d.vehicle_registration?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || d.vehicle_type === filterType;
    return matchesSearch && matchesType;
  });

  const total = filteredDrivers.length;
  const paginatedDrivers = filteredDrivers.slice(skip, skip + 10);

  return (
    <div className="admin-page fade-in">
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1>Fleet Control</h1>
          <p>Manage verified drivers and their vehicles.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">All Vehicles</option>
            {Object.entries(ambulanceTypes).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search by name, mobile, or vehicle..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
        </div>
      </div>

      <div className="glass-panel mt-4 overflow-x-auto">
        {status === 'loading' ? (
          <div className="admin-loading">Loading fleet data...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>Mobile</th>
                <th>Vehicle Type</th>
                <th>Registration</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDrivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">No drivers found.</td>
                </tr>
              ) : (
                paginatedDrivers.map((d, i) => (
                  <tr key={i}>
                    <td>{d.name || 'Unknown'}</td>
                    <td>{d.mobile || 'N/A'}</td>
                    <td>{ambulanceTypes[d.vehicle_type] || d.vehicle_type || 'Unknown'}</td>
                    <td>{d.vehicle_registration || 'N/A'}</td>
                    <td><span className="admin-badge bg-green">Verified</span></td>
                    <td>
                      <button className="admin-btn secondary" style={{padding: '4px 10px', fontSize: '0.75rem'}} onClick={() => handleView360(d)}>View 360</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        
        {/* Pagination Controls */}
        {status !== 'loading' && total > 10 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderTop: '1px solid #e2e8f0', alignItems: 'center' }}>
            <button 
              onClick={() => setSkip(Math.max(0, skip - 10))} 
              disabled={skip === 0}
              className="admin-btn secondary"
              style={{ opacity: skip === 0 ? 0.5 : 1, cursor: skip === 0 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.9rem', color: '#64748b', alignSelf: 'center' }}>
              Showing {skip + 1} to {Math.min(skip + 10, total)} of {total} drivers
            </span>
            <button 
              onClick={() => setSkip(skip + 10)} 
              disabled={skip + 10 >= total}
              className="admin-btn secondary"
              style={{ opacity: skip + 10 >= total ? 0.5 : 1, cursor: skip + 10 >= total ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Driver Deep Dive Panel */}
      {selectedDriver && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content fade-in" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header flex-between" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>Driver 360 View</h2>
              <button onClick={() => setSelectedDriver(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Top Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #0f172a, #1e293b)', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <img src={getMediaUrl(selectedDriver.photo) || `https://ui-avatars.com/api/?name=${selectedDriver.name}&background=10b981&color=fff`} alt="Driver" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #f97316', boxShadow: '0 0 10px rgba(249,115,22,0.4)' }} />
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {selectedDriver.name} 
                    <span className="admin-badge bg-green" style={{fontSize: '0.7rem'}}>Verified</span>
                  </h3>
                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '6px' }}>
                    {selectedDriver.mobile} <span style={{color: '#64748b', margin: '0 4px'}}>|</span> {ambulanceTypes[selectedDriver.vehicle_type] || selectedDriver.vehicle_type} <span style={{color: '#64748b', margin: '0 4px'}}>|</span> {selectedDriver.vehicle_registration}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>ID: {selectedDriver._id}</div>
                </div>
              </div>

              {/* Grid 1: Wallet & Ref Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><Wallet size={16} color="#10b981" /> Wallet & Banking</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981', marginBottom: '12px' }}>₹{selectedDriver.wallet_balance || 0}</div>
                  
                  {selectedDriver.wallet_details ? (
                    <div style={{ fontSize: '0.85rem', color: '#475569', background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{marginBottom: '4px'}}><strong>Acc:</strong> {selectedDriver.wallet_details.account_no}</div>
                      <div style={{marginBottom: '4px'}}><strong>IFSC:</strong> {selectedDriver.wallet_details.ifsc_code}</div>
                      <div><strong>Name:</strong> {selectedDriver.wallet_details.benf_name}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No bank details added.</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> Referral Code</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#3b82f6', letterSpacing: '2px' }}>{selectedDriver.referral_code || 'N/A'}</div>
                  </div>
                  
                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f97316', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} color="#f97316" /> GPS Coords</div>
                    {selectedDriver.location && selectedDriver.location.coordinates ? (
                      <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '12px', color: '#334155', fontWeight: 500 }}>
                        <span>[{selectedDriver.location.coordinates[0]}, {selectedDriver.location.coordinates[1]}]</span>
                        <button
                          className="admin-btn admin-btn-dark"
                          style={{ padding: '6px 14px', fontSize: '12px', width: 'fit-content', display: 'flex', alignItems: 'center' }}
                          onClick={() => window.open(`https://www.google.com/maps?q=${selectedDriver.location.coordinates[1]},${selectedDriver.location.coordinates[0]}`, '_blank')}
                        >
                          <MapPin size={14} style={{ marginRight: '6px', color: '#f97316' }} /> View on Map
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Not active</div>
                    )}
                  </div>
                </div>
              </div>

              {/* KYC Documents */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><ImageIcon size={14} /> KYC Documents</div>
                
                {selectedDriver.details ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    {selectedDriver.details.poi_image && (
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Proof of Identity</div>
                        <img 
                          src={getMediaUrl(selectedDriver.details.poi_image)} 
                          alt="POI" 
                          className="document-image" 
                          onClick={() => setPreviewImage(getMediaUrl(selectedDriver.details.poi_image))}
                        />
                      </div>
                    )}
                    {selectedDriver.details.rc_image && (
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>RC Document</div>
                        <img 
                          src={getMediaUrl(selectedDriver.details.rc_image)} 
                          alt="RC" 
                          className="document-image"
                          onClick={() => setPreviewImage(getMediaUrl(selectedDriver.details.rc_image))}
                        />
                      </div>
                    )}
                    {selectedDriver.details.dl_image && (
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Driving License</div>
                        <img 
                          src={getMediaUrl(selectedDriver.details.dl_image)} 
                          alt="DL" 
                          className="document-image"
                          onClick={() => setPreviewImage(getMediaUrl(selectedDriver.details.dl_image))}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Driver details not fully populated in current record.</div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Lightbox Overlay */}
      {previewImage && (
        <div className="lightbox-overlay" onClick={() => setPreviewImage(null)}>
          <button className="lightbox-close" onClick={() => setPreviewImage(null)}>✕</button>
          <img src={previewImage} className="lightbox-image" alt="Enlarged Document" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default AdminFleetControl;

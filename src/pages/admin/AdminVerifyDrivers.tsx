import { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, UserX, Loader, Search } from 'lucide-react';
import { fetchUnverifiedDriver, acceptDriver, rejectDriver, getMediaUrl, listAmbulanceTypes } from '../../utils/admin-api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUnverifiedDrivers } from '../../store/slices/fleetSlice';
import '../../assets/admin.css';

export default function AdminVerifyDrivers() {
  const dispatch = useAppDispatch();
  const { unverifiedDrivers: drivers, unverifiedStatus: status } = useAppSelector(state => state.fleet);

  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [ambulanceTypes, setAmbulanceTypes] = useState<Record<string, string>>({});
  const [skip, setSkip] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDrivers = () => {
    dispatch(fetchUnverifiedDrivers());
  };

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

  useEffect(() => {
    if (status === 'idle') {
      loadDrivers();
    }
    fetchAmbulanceTypes();
  }, [status, dispatch]);

  useEffect(() => {
    setSkip(0);
  }, [searchQuery]);

  const handleSelectDriver = async (id: string) => {
    try {
      const details = await fetchUnverifiedDriver(id);
      setSelectedDriver(details);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAccept = async (driver: any) => {
    try {
      // Map UnverifiedDriver schema to Verified Driver schema for acceptance
      const verifiedDriverData = {
        _id: driver._id,
        name: driver.name,
        mobile: driver.mobile,
        photo: driver.portrait_image || 'https://via.placeholder.com/150',
        vehicle_type: driver.vehicle_type || 'Unknown',
        vehicle_registration: driver.vehicle_registration || 'Unknown',
        fcm_token: driver.fcm_token,
        location: driver.location,
        details: {
          poi_image: driver.poi_image || '',
          rc_number: driver.vehicle_registration || '',
          rc_image: driver.rc_image || '',
          dl_number: '',
          dl_image: driver.dl_image || ''
        }
      };

      await acceptDriver(verifiedDriverData);
      setSelectedDriver(null);
      loadDrivers();
    } catch (error) {
      console.error('Failed to accept:', error);
      alert('Failed to accept driver.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const reason = prompt("Enter rejection reason:");
      if (!reason) return;
      await rejectDriver(id, reason);
      setSelectedDriver(null);
      loadDrivers();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to reject driver.');
    }
  };

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h3 className="admin-card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={18} /> Pending Verifications</h3>
          
          <div style={{ position: 'relative', width: '250px' }}>
            <input 
              type="text" 
              placeholder="Search by name or mobile..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
        </div>
        {status === 'loading' && drivers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><Loader className="spin" /></div>
        ) : drivers.length === 0 ? (
          <p style={{ padding: '1rem', color: '#64748b' }}>No pending drivers.</p>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Vehicle</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredDrivers = drivers.filter(d => {
                    return d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           d.mobile?.includes(searchQuery);
                  });
                  const paginatedDrivers = filteredDrivers.slice(skip, skip + 10);
                  
                  if (paginatedDrivers.length === 0) {
                    return <tr><td colSpan={4} className="text-center" style={{ padding: '1rem', color: '#64748b' }}>No drivers match your search.</td></tr>;
                  }

                  return paginatedDrivers.map(d => (
                    <tr key={d._id}>
                      <td>{d.name}</td>
                      <td>{d.mobile}</td>
                      <td>{ambulanceTypes[d.vehicle_type] || d.vehicle_type || '-'} {d.vehicle_registration ? `- ${d.vehicle_registration}` : ''}</td>
                  <td>
                    <button 
                      className="admin-btn-secondary"
                      onClick={() => handleSelectDriver(d._id)}
                    >
                      Review
                    </button>
                  </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {status !== 'loading' && drivers.length > 10 && (
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
                  Showing {skip + 1} to {Math.min(skip + 10, drivers.filter(d => d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || d.mobile?.includes(searchQuery)).length)} of {drivers.filter(d => d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || d.mobile?.includes(searchQuery)).length} pending
                </span>
                <button 
                  onClick={() => setSkip(skip + 10)} 
                  disabled={skip + 10 >= drivers.filter(d => d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || d.mobile?.includes(searchQuery)).length}
                  className="admin-btn secondary"
                  style={{ opacity: skip + 10 >= drivers.filter(d => d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || d.mobile?.includes(searchQuery)).length ? 0.5 : 1, cursor: skip + 10 >= drivers.filter(d => d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || d.mobile?.includes(searchQuery)).length ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox Overlay */}
      {previewImage && (
        <div className="lightbox-overlay" onClick={() => setPreviewImage(null)}>
          <button className="lightbox-close" onClick={() => setPreviewImage(null)}>✕</button>
          <img src={previewImage} className="lightbox-image" alt="Enlarged Document" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Verification Modal Overlay */}
      {selectedDriver && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content fade-in" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header flex-between" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Document Review</h3>
              <button onClick={() => setSelectedDriver(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <img src={getMediaUrl(selectedDriver.portrait_image || selectedDriver.photo) || `https://ui-avatars.com/api/?name=${selectedDriver.name}&background=0f172a&color=fff`} alt="Driver" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{selectedDriver.name}</h4>
                <p style={{ margin: '4px 0 0', color: '#64748b' }}>{selectedDriver.mobile}</p>
              </div>
            </div>

            {selectedDriver.error_message && (
              <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px' }}>Previous Rejection Reason</strong>
                {selectedDriver.error_message}
              </div>
            )}

            <h5 style={{ margin: '0 0 10px', color: '#1e293b' }}>Vehicle Info</h5>
            <p style={{ margin: '0 0 5px', color: '#475569' }}>Type: {ambulanceTypes[selectedDriver.vehicle_type] || selectedDriver.vehicle_type || 'Unknown'}</p>
            <p style={{ margin: '0 0 20px', color: '#475569' }}>Registration: {selectedDriver.vehicle_registration || 'Unknown'}</p>

            <h5 style={{ margin: '0 0 10px', color: '#1e293b' }}>KYC Documents & Images</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              
              {selectedDriver.portrait_image && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 8px', fontWeight: 500 }}>Portrait Image</p>
                  <img 
                    src={getMediaUrl(selectedDriver.portrait_image)} 
                    alt="Portrait" 
                    className="document-image"
                    onClick={() => setPreviewImage(getMediaUrl(selectedDriver.portrait_image))}
                  />
                </div>
              )}
              
              {selectedDriver.poi_image && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 8px', fontWeight: 500 }}>Proof of Identity</p>
                  <img 
                    src={getMediaUrl(selectedDriver.poi_image)} 
                    alt="POI" 
                    className="document-image"
                    onClick={() => setPreviewImage(getMediaUrl(selectedDriver.poi_image))}
                  />
                </div>
              )}
              
              {selectedDriver.dl_image && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 8px', fontWeight: 500 }}>Driving License</p>
                  <img 
                    src={getMediaUrl(selectedDriver.dl_image)} 
                    alt="DL" 
                    className="document-image"
                    onClick={() => setPreviewImage(getMediaUrl(selectedDriver.dl_image))}
                  />
                </div>
              )}

              {selectedDriver.rc_image && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 8px', fontWeight: 500 }}>Vehicle RC</p>
                  <img 
                    src={getMediaUrl(selectedDriver.rc_image)} 
                    alt="RC" 
                    className="document-image"
                    onClick={() => setPreviewImage(getMediaUrl(selectedDriver.rc_image))}
                  />
                </div>
              )}

              {selectedDriver.amb_front && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 8px', fontWeight: 500 }}>Ambulance (Front)</p>
                  <img 
                    src={getMediaUrl(selectedDriver.amb_front)} 
                    alt="Amb Front" 
                    className="document-image"
                    onClick={() => setPreviewImage(getMediaUrl(selectedDriver.amb_front))}
                  />
                </div>
              )}

              {selectedDriver.amb_inside && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 8px', fontWeight: 500 }}>Ambulance (Inside)</p>
                  <img 
                    src={getMediaUrl(selectedDriver.amb_inside)} 
                    alt="Amb Inside" 
                    className="document-image"
                    onClick={() => setPreviewImage(getMediaUrl(selectedDriver.amb_inside))}
                  />
                </div>
              )}

            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                className="admin-btn-approve" 
                onClick={() => handleAccept(selectedDriver)}
              >
                <UserCheck size={18} /> Approve Driver
              </button>
              <button 
                className="admin-btn-reject" 
                onClick={() => handleReject(selectedDriver._id)}
              >
                <UserX size={18} /> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
}

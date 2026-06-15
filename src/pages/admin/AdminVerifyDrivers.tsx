import { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, UserX, Loader } from 'lucide-react';
import { listUnverifiedDrivers, fetchUnverifiedDriver, acceptDriver, rejectDriver, getMediaUrl } from '../../utils/admin-api';
import '../../assets/admin.css';

export default function AdminVerifyDrivers() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await listUnverifiedDrivers();
      setDrivers(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

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
        <div className="admin-card-header">
          <h3 className="admin-card-title"><ShieldCheck size={18} /> Pending Verifications</h3>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><Loader className="spin" /></div>
        ) : drivers.length === 0 ? (
          <p style={{ padding: '1rem', color: '#64748b' }}>No pending drivers.</p>
        ) : (
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
              {drivers.map(d => (
                <tr key={d._id}>
                  <td>{d.name}</td>
                  <td>{d.mobile}</td>
                  <td>{d.vehicle_type} - {d.vehicle_registration}</td>
                  <td>
                    <button 
                      className="admin-btn-secondary"
                      onClick={() => handleSelectDriver(d._id)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <p style={{ margin: '0 0 5px', color: '#475569' }}>Type: {selectedDriver.vehicle_type || 'Unknown'}</p>
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
                className="admin-btn-primary" 
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                onClick={() => handleAccept(selectedDriver)}
              >
                <UserCheck size={18} /> Approve Driver
              </button>
              <button 
                className="admin-btn-secondary" 
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#ef4444', borderColor: '#ef4444' }}
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

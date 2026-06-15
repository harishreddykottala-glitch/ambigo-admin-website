import { useEffect, useState } from 'react';
import { listDrivers, getMediaUrl } from '../../utils/admin-api';
import { X, Wallet, Image as ImageIcon, MapPin, FileText } from 'lucide-react';
import '../../assets/admin.css';

const AdminFleetControl = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      if (localStorage.getItem('admin_token') === 'demo-token') {
        setTimeout(() => {
          setDrivers([
            { _id: 'D-001', name: 'Alice Driver', mobile: '9998887776', vehicle_registration: 'KA-01-AB-1234', vehicle_type: 'ALS' },
            { _id: 'D-002', name: 'Bob Wheeler', mobile: '9998887777', vehicle_registration: 'KA-02-CD-5678', vehicle_type: 'BLS' },
          ]);
          setLoading(false);
        }, 500);
        return;
      }
      
      const res = await listDrivers(0);
      setDrivers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page fade-in">
      <div className="admin-page-header">
        <h1>Fleet Control</h1>
        <p>Manage verified drivers and their vehicles.</p>
      </div>

      <div className="glass-panel mt-4 overflow-x-auto">
        {loading ? (
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
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">No drivers found.</td>
                </tr>
              ) : (
                drivers.map((d, i) => (
                  <tr key={i}>
                    <td>{d.name || 'Unknown'}</td>
                    <td>{d.mobile || 'N/A'}</td>
                    <td>{d.vehicle_type || 'Unknown'}</td>
                    <td>{d.vehicle_registration || 'N/A'}</td>
                    <td><span className="admin-badge bg-green">Verified</span></td>
                    <td>
                      <button className="admin-btn secondary" style={{padding: '4px 10px', fontSize: '0.75rem'}} onClick={() => setSelectedDriver(d)}>View 360</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <img src={getMediaUrl(selectedDriver.photo) || `https://ui-avatars.com/api/?name=${selectedDriver.name}&background=10b981&color=fff`} alt="Driver" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>{selectedDriver.name} <span className="admin-badge bg-green" style={{fontSize: '0.7rem', verticalAlign: 'middle', marginLeft: '8px'}}>Verified</span></h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {selectedDriver.mobile} | {selectedDriver.vehicle_type} | {selectedDriver.vehicle_registration}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>ID: {selectedDriver._id}</div>
                </div>
              </div>

              {/* Grid 1: Wallet & Ref Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Wallet size={14} /> Wallet & Banking</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>₹{selectedDriver.wallet_balance || 0}</div>
                  
                  {selectedDriver.wallet_details ? (
                    <div style={{ fontSize: '0.8rem', color: '#475569', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <div><strong>Acc:</strong> {selectedDriver.wallet_details.account_no}</div>
                      <div><strong>IFSC:</strong> {selectedDriver.wallet_details.ifsc_code}</div>
                      <div><strong>Name:</strong> {selectedDriver.wallet_details.benf_name}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No bank details added.</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Referral Code</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#3b82f6' }}>{selectedDriver.referral_code || 'N/A'}</div>
                  </div>
                  
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> GPS Coords</div>
                    {selectedDriver.location && selectedDriver.location.coordinates ? (
                      <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        [{selectedDriver.location.coordinates[0]}, {selectedDriver.location.coordinates[1]}]
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Not active</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tokens */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /> System Tokens</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>FCM Token (Push):</span>
                    <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.7rem', color: selectedDriver.fcm_token ? '#475569' : '#94a3b8', background: '#fff', padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0', marginTop: '2px', maxHeight: '60px', overflowY: 'auto' }}>
                      {selectedDriver.fcm_token || 'Not available'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>JWT Token (Auth):</span>
                    <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.7rem', color: selectedDriver.jwt_token ? '#475569' : '#94a3b8', background: '#fff', padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0', marginTop: '2px', maxHeight: '60px', overflowY: 'auto' }}>
                      {selectedDriver.jwt_token || 'Not available'}
                    </div>
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

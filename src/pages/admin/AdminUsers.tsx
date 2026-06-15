import { useEffect, useState } from 'react';
import { Users, Loader, X, FileText, Smartphone, Key, MapPin } from 'lucide-react';
import { listUsers } from '../../utils/admin-api';
import '../../assets/admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await listUsers();
      setUsers(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="admin-card-title"><Users size={18} /> Registered Riders</h3>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}><Loader className="spin" /></div>
      ) : users.length === 0 ? (
        <p style={{ padding: '1rem', color: '#64748b' }}>No users found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>OTP</th>
              <th>Ref Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{u._id.substring(0, 8)}...</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={`https://ui-avatars.com/api/?name=${u.name}&background=3b82f6&color=fff`} 
                      alt="avatar" 
                      style={{ width: 32, height: 32, borderRadius: '50%' }} 
                    />
                    {u.name}
                  </div>
                </td>
                <td>{u.mobile}</td>
                <td>{u.otp || 'N/A'}</td>
                <td>{u.referral_code || 'N/A'}</td>
                <td>
                  <button className="admin-btn secondary" style={{padding: '4px 10px', fontSize: '0.75rem'}} onClick={() => setSelectedUser(u)}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Deep Dive Panel / Modal */}
      {selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content fade-in" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header flex-between" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Rider Profile</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            <div style={{ padding: '0 0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <img src={`https://ui-avatars.com/api/?name=${selectedUser.name}&background=3b82f6&color=fff`} alt="Avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{selectedUser.name}</h4>
                  <p style={{ margin: '4px 0 0', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Smartphone size={14} /> {selectedUser.mobile}
                  </p>
                </div>
              </div>

              <h5 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>Account Details</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>OTP Code</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: '#0f172a' }}>{selectedUser.otp || 'N/A'}</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>Referral Code</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: '#10b981' }}>{selectedUser.referral_code || 'N/A'}</p>
                </div>
              </div>

              <h5 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>Location & Technical</h5>
              
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> Last Known Location</p>
                {selectedUser.location && selectedUser.location.coordinates ? (
                  <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155' }}>
                    Lng: {selectedUser.location.coordinates[0]} <br/> Lat: {selectedUser.location.coordinates[1]}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>No location recorded.</div>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><Key size={14} /> FCM Token</p>
                <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', color: selectedUser.fcm_token ? '#3b82f6' : '#94a3b8', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {selectedUser.fcm_token || 'Not registered'}
                </div>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /> JWT Token</p>
                <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', color: selectedUser.jwt_token ? '#8b5cf6' : '#94a3b8', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', maxHeight: '80px', overflowY: 'auto' }}>
                  {selectedUser.jwt_token || 'Not logged in'}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

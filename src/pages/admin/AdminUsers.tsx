import { useEffect, useState } from 'react';
import { Users, Loader, Smartphone, MapPin, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUsers } from '../../store/slices/usersSlice';
import '../../assets/admin.css';

export default function AdminUsers() {
  const dispatch = useAppDispatch();
  const { users, status } = useAppSelector(state => state.users);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUsers());
    }
  }, [status, dispatch]);

  useEffect(() => {
    setSkip(0);
  }, [searchQuery]);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.mobile?.includes(searchQuery)
  );

  const total = filteredUsers.length;
  const paginatedUsers = filteredUsers.slice(skip, skip + 10);

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h3 className="admin-card-title"><Users size={18} /> Registered Riders</h3>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search by name or mobile..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '8px 12px 8px 32px', borderRadius: '6px', border: '1px solid #e2e8f0', width: '250px', outline: 'none', fontSize: '14px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>
      </div>
      {status === 'loading' ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}><Loader className="spin" /></div>
      ) : filteredUsers.length === 0 ? (
        <p style={{ padding: '1rem', color: '#64748b' }}>No users found matching your search.</p>
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
            {paginatedUsers.map(u => (
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
            Showing {skip + 1} to {Math.min(skip + 10, total)} of {total} riders
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

      {/* Deep Dive Panel / Modal */}
      {selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content fade-in" style={{ maxWidth: '600px', padding: '0' }}>
            <div className="admin-modal-header flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff', borderRadius: '12px 12px 0 0' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>Rider Profile</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(to right, #0f172a, #1e293b)', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <img src={`https://ui-avatars.com/api/?name=${selectedUser.name}&background=f97316&color=fff`} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #f97316', boxShadow: '0 0 10px rgba(249,115,22,0.4)' }} />
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', color: '#ffffff' }}>{selectedUser.name}</h4>
                  <p style={{ margin: '0', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                    <Smartphone size={16} /> {selectedUser.mobile}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 8px', textTransform: 'uppercase', fontWeight: 600 }}>OTP Code</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: '#8b5cf6', letterSpacing: '2px' }}>{selectedUser.otp || 'N/A'}</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 8px', textTransform: 'uppercase', fontWeight: 600 }}>Referral Code</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: '#3b82f6', letterSpacing: '2px' }}>{selectedUser.referral_code || 'N/A'}</p>
                </div>
              </div>
              
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f97316' }}>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} color="#f97316" /> Last Known Location</p>
                {selectedUser.location && selectedUser.location.coordinates ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#334155', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span>Lng: {selectedUser.location.coordinates[0]}</span>
                      <span>Lat: {selectedUser.location.coordinates[1]}</span>
                    </div>
                    <button
                      className="admin-btn admin-btn-dark"
                      style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                      onClick={() => window.open(`https://www.google.com/maps?q=${selectedUser.location.coordinates[1]},${selectedUser.location.coordinates[0]}`, '_blank')}
                    >
                      <MapPin size={14} style={{ marginRight: '6px', color: '#f97316' }} /> View on Map
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>No location recorded.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

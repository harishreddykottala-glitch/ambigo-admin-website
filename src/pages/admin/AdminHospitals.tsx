import { useEffect, useState } from 'react';
import { Building2, Loader, MapPin, Clock } from 'lucide-react';
import { listHospitals } from '../../utils/admin-api';
import '../../assets/admin.css';

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);

  const getI18nText = (field: any) => {
    if (!field) return 'N/A';
    if (typeof field === 'string') return field;
    return field.en || field[Object.keys(field)[0]] || 'N/A';
  };

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const data = await listHospitals();
      setHospitals(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  return (
    <div className="admin-card fade-in">
      <div className="admin-card-header flex-between">
        <h3 className="admin-card-title"><Building2 size={18} /> Partner Hospitals</h3>
        <span className="admin-badge bg-blue">{hospitals.length} Total</span>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><Loader className="spin text-blue" /></div>
      ) : hospitals.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <Building2 size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
          <p>No partner hospitals found in the database.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hospital Name</th>
                <th>City</th>
                <th>Address</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map(h => (
                <tr key={h._id}>
                  <td style={{ fontWeight: 500, color: '#0f172a' }}>{getI18nText(h.name)}</td>
                  <td>{getI18nText(h.city)}</td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{getI18nText(h.address).substring(0, 30)}...</td>
                  <td>
                    {h.always_open ? (
                      <span className="admin-badge bg-green">24/7 Open</span>
                    ) : (
                      <span className="admin-badge bg-orange">Scheduled</span>
                    )}
                  </td>
                  <td>
                    <button className="admin-btn secondary" style={{padding: '4px 10px', fontSize: '0.75rem'}} onClick={() => setSelectedHospital(h)}>View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deep Dive Panel */}
      {selectedHospital && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content fade-in" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header flex-between" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Hospital Profile</h3>
              <button onClick={() => setSelectedHospital(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            <div style={{ padding: '0 0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <Building2 size={32} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>{getI18nText(selectedHospital.name)}</h4>
                  <p style={{ margin: '4px 0 0', color: '#64748b', display: 'flex', alignItems: 'flex-start', gap: '4px', fontSize: '0.9rem' }}>
                    <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} /> 
                    <span>{getI18nText(selectedHospital.address)}, {getI18nText(selectedHospital.city)}</span>
                  </p>
                </div>
              </div>

              <h5 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>Operational Details</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 6px', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Operating Hours</p>
                  {selectedHospital.always_open ? (
                    <p style={{ margin: 0, fontWeight: 600, color: '#10b981', fontSize: '1.05rem' }}>24 Hours / 7 Days</p>
                  ) : (
                    <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 500 }}>
                      {selectedHospital.timing ? (
                        <>
                          <div style={{ marginBottom: '4px' }}>Open: <span style={{ fontWeight: 600 }}>{selectedHospital.timing.start_time}</span></div>
                          <div>Close: <span style={{ fontWeight: 600 }}>{selectedHospital.timing.end_time}</span></div>
                        </>
                      ) : 'Timings not specified'}
                    </div>
                  )}
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 6px', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> Coordinates</p>
                  {selectedHospital.location && selectedHospital.location.coordinates ? (
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#334155' }}>
                      {selectedHospital.location.coordinates[0]},<br/>
                      {selectedHospital.location.coordinates[1]}
                    </div>
                  ) : <span style={{ color: '#94a3b8' }}>N/A</span>}
                </div>
              </div>

              <h5 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>Available Services</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2rem' }}>
                {selectedHospital.services && selectedHospital.services.length > 0 ? (
                  selectedHospital.services.map((service: string, idx: number) => (
                    <span key={idx} style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 500, border: '1px solid #bfdbfe' }}>
                      {service}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No specific services listed.</span>
                )}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                Database ID: {selectedHospital._id}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

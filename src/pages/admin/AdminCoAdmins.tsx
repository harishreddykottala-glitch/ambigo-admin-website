import React, { useState, useEffect } from 'react';
import '../../assets/admin.css';

interface CoAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

const AdminCoAdmins = () => {
  const [coAdmins, setCoAdmins] = useState<CoAdmin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Viewer' });

  useEffect(() => {
    const saved = localStorage.getItem('ambigo_coadmins');
    if (saved) {
      setCoAdmins(JSON.parse(saved));
    } else {
      const initial: CoAdmin[] = [
        { id: '1', name: 'Super Admin', email: 'admin@ambigo.com', role: 'Super Admin', active: true },
      ];
      setCoAdmins(initial);
      localStorage.setItem('ambigo_coadmins', JSON.stringify(initial));
    }
  }, []);

  const saveToLocal = (data: CoAdmin[]) => {
    setCoAdmins(data);
    localStorage.setItem('ambigo_coadmins', JSON.stringify(data));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email) return;
    const admin: CoAdmin = {
      id: Date.now().toString(),
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      active: true,
    };
    saveToLocal([...coAdmins, admin]);
    setNewAdmin({ name: '', email: '', role: 'Viewer' });
    setShowForm(false);
  };

  const toggleStatus = (id: string) => {
    if (id === '1') return; // Cannot disable super admin
    const updated = coAdmins.map(a => a.id === id ? { ...a, active: !a.active } : a);
    saveToLocal(updated);
  };

  return (
    <div className="admin-page fade-in">
      <div className="admin-page-header flex-between">
        <div>
          <h1>Co-Admins</h1>
          <p>Manage portal access and roles (Locally Persisted)</p>
        </div>
        <button className="admin-btn primary" onClick={() => setShowForm(!showForm)}>
          + Add New
        </button>
      </div>

      {showForm && (
        <div className="glass-panel mt-4 fade-in">
          <h3>Add Co-Admin</h3>
          <form className="admin-form-inline mt-2" onSubmit={handleAdd}>
            <input type="text" placeholder="Name" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} required />
            <input type="email" placeholder="Email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} required />
            <select value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}>
              <option>Viewer</option>
              <option>Editor</option>
              <option>Manager</option>
            </select>
            <button type="submit" className="admin-btn primary">Save</button>
          </form>
        </div>
      )}

      <div className="glass-panel mt-4 overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coAdmins.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td>{a.role}</td>
                <td>
                  <span className={`admin-badge ${a.active ? 'bg-green' : 'bg-red'}`}>
                    {a.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <button 
                    className="admin-btn-text" 
                    onClick={() => toggleStatus(a.id)}
                    disabled={a.id === '1'}
                  >
                    {a.active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoAdmins;

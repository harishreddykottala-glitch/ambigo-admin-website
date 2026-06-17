import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import '../../assets/admin.css';
import { listCoAdmins, addCoAdmin, toggleCoAdmin, deleteCoAdmin } from '../../utils/admin-api';

interface CoAdmin {
  id: string;
  name: string;
  mobile: string;
  role: string;
  active: boolean;
}

const AdminCoAdmins = () => {
  const [coAdmins, setCoAdmins] = useState<CoAdmin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', mobile: '', role: 'Viewer' });


  const fetchAdmins = async () => {
    try {
      const data = await listCoAdmins();
      setCoAdmins(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.mobile || newAdmin.mobile.length !== 10) {
      alert("Please provide a valid name and exactly 10-digit mobile number.");
      return;
    }
    try {
      await addCoAdmin(newAdmin.name, newAdmin.mobile, newAdmin.role);
      setNewAdmin({ name: '', mobile: '', role: 'Viewer' });
      setShowForm(false);
      fetchAdmins();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await toggleCoAdmin(id);
      fetchAdmins();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely remove this admin?")) return;
    try {
      await deleteCoAdmin(id);
      fetchAdmins();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="admin-page fade-in">
      <div className="admin-page-header flex-between">
        <div>
          <h1>Co-Admins</h1>
          <p>Manage portal access and roles</p>
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
            <input type="tel" placeholder="Mobile Number (10 digits)" value={newAdmin.mobile} onChange={e => setNewAdmin({...newAdmin, mobile: e.target.value.replace(/\D/g, '')})} maxLength={10} required />
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
              <th>Mobile Number</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coAdmins.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.mobile}</td>
                <td>{a.role}</td>
                <td>
                  <span className={`admin-badge ${a.active ? 'bg-green' : 'bg-red'}`}>
                    {a.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="admin-btn-text" 
                    onClick={() => toggleStatus(a.id)}
                    disabled={a.role === 'Super Admin'}
                  >
                    {a.active ? 'Disable' : 'Enable'}
                  </button>
                  <button 
                    className="admin-btn-text" 
                    style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                    onClick={() => handleDelete(a.id)}
                    disabled={a.role === 'Super Admin'}
                    title="Remove Admin"
                  >
                    <Trash2 size={16} />
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

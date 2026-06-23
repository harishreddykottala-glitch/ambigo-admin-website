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
  const [newAdmin, setNewAdmin] = useState({ name: '', mobile: '', username: '', password: '', role: 'Operations Manager' });


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
    if (!newAdmin.name || !newAdmin.username || !newAdmin.password) {
      alert("Name, Username, and Password are required fields.");
      return;
    }
    try {
      await addCoAdmin(newAdmin.name, newAdmin.mobile, newAdmin.role, newAdmin.username, newAdmin.password);
      setNewAdmin({ name: '', mobile: '', username: '', password: '', role: 'Operations Manager' });
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
          <h1>Staff Management</h1>
          <p>Manage portal access, roles, and staff credentials</p>
        </div>
        <button className="admin-btn primary" onClick={() => setShowForm(!showForm)}>
          + Add Staff
        </button>
      </div>

      {showForm && (
        <div className="glass-panel mt-4 fade-in">
          <h3>Create Staff Account</h3>
          <form className="admin-form-inline mt-2" onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input style={{ flex: 1 }} type="text" placeholder="Full Name" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} required />
              <input style={{ flex: 1 }} type="tel" placeholder="Mobile Number (Optional)" value={newAdmin.mobile} onChange={e => setNewAdmin({...newAdmin, mobile: e.target.value.replace(/\D/g, '')})} maxLength={10} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input style={{ flex: 1 }} type="text" placeholder="Username (e.g. support.john)" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} required />
              <input style={{ flex: 1 }} type="text" placeholder="Temporary Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} required />
              <select style={{ flex: 1 }} value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}>
                <option>Founder / Co-founder</option>
                <option>Operations Manager</option>
                <option>HR Manager</option>
                <option>Call Center Executive</option>
                <option>Support Executive</option>
                <option>Customer Executive</option>
                <option>Verification Executive</option>
              </select>
            </div>
            <button type="submit" className="admin-btn primary" style={{ alignSelf: 'flex-start' }}>Generate Credentials & Save</button>
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
                    disabled={a.role === 'Super Admin' || a.role === 'Founder / Co-founder'}
                  >
                    {a.active ? 'Disable' : 'Enable'}
                  </button>
                  <button 
                    className="admin-btn-text" 
                    style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                    onClick={() => handleDelete(a.id)}
                    disabled={a.role === 'Super Admin' || a.role === 'Founder / Co-founder'}
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

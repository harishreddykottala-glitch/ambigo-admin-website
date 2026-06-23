import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Home, Map, Activity, Users, ShieldCheck, Users2, Settings, Building2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import '../../assets/admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const role = useAppSelector(state => state.auth.role) || 'Viewer';
  const username = useAppSelector(state => state.auth.username) || 'Admin';

  const hasAccess = (path: string) => {
    const normalizedRole = role?.trim().toLowerCase() || '';
    const normalizedPath = path.replace(/\/$/, '').toLowerCase();

    if (normalizedRole === 'founder / co-founder' || normalizedRole === 'super admin' || normalizedRole === 'superadmin') return true;
    
    if (normalizedRole === 'operations manager') {
      return ['/admin/dashboard', '/admin/map', '/admin/fleet', '/admin/hospitals', '/admin/bookings'].includes(normalizedPath);
    }
    if (normalizedRole === 'hr manager') {
      return ['/admin/co-admins'].includes(normalizedPath);
    }
    if (normalizedRole === 'call center executive') {
      return ['/admin/map', '/admin/bookings'].includes(normalizedPath);
    }
    if (normalizedRole === 'support executive') {
      return ['/admin/bookings', '/admin/fleet', '/admin/users'].includes(normalizedPath);
    }
    if (normalizedRole === 'customer executive') {
      return ['/admin/users', '/admin/bookings'].includes(normalizedPath);
    }
    if (normalizedRole === 'verification executive') {
      return ['/admin/verify-drivers'].includes(normalizedPath);
    }
    return false;
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (location.pathname !== '/admin' && !hasAccess(location.pathname)) {
    return (
      <div style={{ padding: 50, textAlign: 'center', background: '#fff', color: '#000', height: '100vh' }}>
        <h2>Access Denied</h2>
        <p>You are being blocked by AdminLayout.</p>
        <p><strong>Your Current Role in System:</strong> "{role}"</p>
        <p><strong>Attempted Path:</strong> "{location.pathname}"</p>
        <button onClick={handleLogout} style={{ padding: '10px 20px', marginTop: 20 }}>Force Sign Out</button>
      </div>
    );
  }

  return (
    <div className="admin-layout-sidebar-wrapper">
      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-brand" style={{gap: '12px', padding: '24px 32px'}}>
          <div style={{background: 'var(--admin-primary)', padding: '6px', borderRadius: '8px', display: 'flex'}}>
            <Activity size={24} color="white" />
          </div>
          <div className="admin-logo-text">
            <span style={{fontWeight: 800, fontSize: '1.5rem', color: '#1e293b'}}>Ambigo</span>
          </div>
        </div>

        <div className="admin-sidebar-links">
          {hasAccess('/admin/dashboard') && (
            <>
              <div className="admin-sidebar-section-title">Home</div>
              <NavLink to="/admin/dashboard" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
                <div className="icon-wrapper"><Home size={18} /></div> <span>Dashboard</span>
              </NavLink>
            </>
          )}
          
          <div className="admin-sidebar-section-title">Pages</div>
          {hasAccess('/admin/map') && (
            <NavLink to="/admin/map" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
              <div className="icon-wrapper"><Map size={18} /></div> <span>Live Map</span>
            </NavLink>
          )}
          {hasAccess('/admin/bookings') && (
            <NavLink to="/admin/bookings" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
              <div className="icon-wrapper"><Activity size={18} /></div> <span>Bookings</span>
            </NavLink>
          )}
          {hasAccess('/admin/fleet') && (
            <NavLink to="/admin/fleet" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
              <div className="icon-wrapper"><Users size={18} /></div> <span>Fleet</span>
            </NavLink>
          )}
          {hasAccess('/admin/verify-drivers') && (
            <NavLink to="/admin/verify-drivers" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
              <div className="icon-wrapper"><ShieldCheck size={18} /></div> <span>Verify</span>
            </NavLink>
          )}
          {hasAccess('/admin/users') && (
            <NavLink to="/admin/users" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
              <div className="icon-wrapper"><Users2 size={18} /></div> <span>Riders</span>
            </NavLink>
          )}
          {hasAccess('/admin/hospitals') && (
            <NavLink to="/admin/hospitals" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
              <div className="icon-wrapper"><Building2 size={18} /></div> <span>Hospitals</span>
            </NavLink>
          )}
          
          {hasAccess('/admin/co-admins') && (
            <>
              <div className="admin-sidebar-divider" style={{height: '1px', background: 'var(--admin-border)', margin: '16px 0'}}></div>
              <NavLink to="/admin/co-admins" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
                <div className="icon-wrapper"><Settings size={18} /></div> <span>Staff Management</span>
              </NavLink>
            </>
          )}
        </div>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout} title="Sign Out">
            <img src="https://ui-avatars.com/api/?name=Admin&background=ff6b35&color=fff" alt="Profile" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main-content-area">
        <div className="admin-topbar" style={{justifyContent: 'flex-end', padding: '16px 32px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '24px'}}>
            <div className="admin-topbar-profile" style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'}}>
               <img src={`https://ui-avatars.com/api/?name=${username}&background=0f172a&color=fff`} alt="Profile" style={{width: '40px', height: '40px', borderRadius: '50%'}} />
               <div style={{display: 'flex', flexDirection: 'column'}}>
                 <span style={{fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2}}>{username}</span>
                 <span style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 500}}>{role}</span>
               </div>
            </div>
          </div>
        </div>
        
        <div className="admin-container-inner fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

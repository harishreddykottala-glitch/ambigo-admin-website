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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const getBreadcrumbName = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'System Reports / Dashboard Overview';
    if (path.includes('map')) return 'Live Monitor / Live Fleet Map';
    if (path.includes('bookings')) return 'Operations / Live Bookings';
    if (path.includes('fleet')) return 'Operations / Fleet Control';
    if (path.includes('verify-drivers')) return 'Operations / Verify Drivers';
    if (path.includes('users')) return 'Operations / Registered Riders';
    if (path.includes('hospitals')) return 'Operations / Partner Hospitals';
    if (path.includes('co-admins')) return 'Settings / Co-Admins';
    return 'Dashboard';
  };

  return (
    <div className="admin-layout-sidebar-wrapper">
      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-logo-text">
            <span className="text-orange" style={{fontWeight: 700, fontSize: '1.5rem'}}>Ambigo</span>
            <span style={{fontWeight: 400, color: '#94a3b8', fontSize: '0.8rem', display: 'block'}}>Admin Platform</span>
          </div>
        </div>

        <div className="admin-sidebar-links">
          <NavLink to="/admin/dashboard" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="icon-wrapper"><Home size={18} /></div> <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/map" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="icon-wrapper"><Map size={18} /></div> <span>Live Map</span>
          </NavLink>
          <NavLink to="/admin/bookings" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="icon-wrapper"><Activity size={18} /></div> <span>Bookings</span>
          </NavLink>
          <NavLink to="/admin/fleet" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="icon-wrapper"><Users size={18} /></div> <span>Fleet</span>
          </NavLink>
          <NavLink to="/admin/verify-drivers" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="icon-wrapper"><ShieldCheck size={18} /></div> <span>Verify</span>
          </NavLink>
          <NavLink to="/admin/users" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="icon-wrapper"><Users2 size={18} /></div> <span>Riders</span>
          </NavLink>
          <NavLink to="/admin/hospitals" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="icon-wrapper"><Building2 size={18} /></div> <span>Hospitals</span>
          </NavLink>
          <div className="admin-sidebar-divider" style={{height: '1px', background: 'var(--admin-border)', margin: '16px 0'}}></div>
          <NavLink to="/admin/co-admins" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="icon-wrapper"><Settings size={18} /></div> <span>Co-Admins</span>
          </NavLink>
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
        <div className="admin-topbar">
          <div className="admin-breadcrumbs">
            <Home size={14} /> / <span className="current">{getBreadcrumbName()}</span>
          </div>
          <div className="admin-topbar-profile">
             <span style={{fontSize: '0.85rem', color: '#64748b'}}>Administrator</span>
             <img src="https://ui-avatars.com/api/?name=Admin&background=0f172a&color=fff" alt="Profile" className="admin-topbar-avatar" />
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

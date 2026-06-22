import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Home, Map, Activity, Users, ShieldCheck, Users2, Settings, Building2, Search, Bell, Mail, ArrowLeft, Send } from 'lucide-react';
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
        <div className="admin-sidebar-brand" style={{gap: '12px', padding: '24px 32px'}}>
          <div style={{background: 'var(--admin-primary)', padding: '6px', borderRadius: '8px', display: 'flex'}}>
            <Activity size={24} color="white" />
          </div>
          <div className="admin-logo-text">
            <span style={{fontWeight: 800, fontSize: '1.5rem', color: '#1e293b'}}>Ambigo</span>
          </div>
        </div>

        <div className="admin-sidebar-links">
          <div className="admin-sidebar-section-title">Home</div>
          <NavLink to="/admin/dashboard" className={({isActive}) => `admin-sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="icon-wrapper"><Home size={18} /></div> <span>Dashboard</span>
          </NavLink>
          
          <div className="admin-sidebar-section-title">Pages</div>
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
        <div className="admin-topbar" style={{justifyContent: 'space-between', padding: '16px 32px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <div style={{background: 'var(--admin-primary)', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex'}}>
              <ArrowLeft size={16} />
            </div>
            <div className="topbar-search">
              <Search size={16} color="#94a3b8" />
              <input type="text" placeholder="Search..." />
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '24px'}}>
            <button style={{background: 'var(--admin-primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'}}>
              <Send size={14} /> Go Pro
            </button>
            <div style={{fontSize: '1.2rem', cursor: 'pointer'}}>🇺🇸</div>
            <div className="topbar-icons" style={{gap: '20px', margin: 0}}>
              <div className="topbar-icon"><Mail size={20} color="#94a3b8" /></div>
              <div className="topbar-icon"><Bell size={20} color="#94a3b8" /><span className="badge">3</span></div>
            </div>
            <div className="admin-topbar-profile" style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'}}>
               <img src="https://ui-avatars.com/api/?name=Austin+Robertson&background=0f172a&color=fff" alt="Profile" style={{width: '40px', height: '40px', borderRadius: '50%'}} />
               <div style={{display: 'flex', flexDirection: 'column'}}>
                 <span style={{fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2}}>Austin Robertson</span>
                 <span style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 500}}>Marketing Administrator</span>
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

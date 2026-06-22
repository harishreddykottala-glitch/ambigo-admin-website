import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdminPassword } from '../../utils/admin-api';
import { useAppDispatch } from '../../store/hooks';
import { loginSuccess } from '../../store/slices/authSlice';
import '../../assets/admin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await loginAdminPassword(username, password);
      if (data.token) {
        const userRole = data.role || 'Viewer';
        dispatch(loginSuccess({ token: data.token, role: userRole }));
        
        if (userRole === 'HR Manager') navigate('/admin/co-admins');
        else if (userRole === 'Verification Executive') navigate('/admin/verify-drivers');
        else if (userRole === 'Call Center Executive') navigate('/admin/map');
        else if (userRole === 'Support Executive' || userRole === 'Customer Executive') navigate('/admin/bookings');
        else navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.85)), url('/login-bg.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div className="fade-in" style={{
         background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.4))',
         backdropFilter: 'blur(30px)',
         WebkitBackdropFilter: 'blur(30px)',
         border: '1px solid rgba(255, 255, 255, 0.05)',
         borderTop: '1px solid rgba(255, 255, 255, 0.2)',
         borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
         boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 107, 53, 0.05)',
         borderRadius: '28px',
         padding: '48px 40px',
         width: '100%',
         maxWidth: '440px',
         textAlign: 'center'
      }}>
        <div className="admin-logo-large" style={{ marginBottom: '20px' }}>
          <span className="text-orange" style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Ambigo</span> <span style={{ color: '#fff', fontWeight: 300 }}>Admin</span>
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#ffffff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>Welcome Back</h2>
        <p className="login-subtitle" style={{ color: '#94a3b8', marginBottom: '35px', fontSize: '0.95rem', fontWeight: 400 }}>
          Enter your username and password
        </p>
        
        {error && <div className="admin-error-alert" style={{ marginBottom: '25px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '12px', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleLogin} className="admin-form" style={{ textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="e.g. support.john"
              required
              style={{ padding: '14px 18px', fontSize: '1.05rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.06)', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box', marginTop: '10px', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)' }}
              onFocus={(e) => { e.target.style.border = '1px solid rgba(255, 107, 53, 0.5)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
              onBlur={(e) => { e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'; }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
              style={{ padding: '14px 18px', fontSize: '1.05rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.06)', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box', marginTop: '10px', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)' }}
              onFocus={(e) => { e.target.style.border = '1px solid rgba(255, 107, 53, 0.5)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
              onBlur={(e) => { e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'; }}
            />
          </div>
          <button type="submit" className="admin-btn primary full-width" disabled={loading} style={{ padding: '16px', borderRadius: '14px', fontSize: '1.05rem', fontWeight: 600, background: 'linear-gradient(135deg, #ff6b35 0%, #f97316 100%)', border: 'none', boxShadow: '0 8px 20px -6px rgba(255, 107, 53, 0.6)', transition: 'transform 0.2s', cursor: loading ? 'not-allowed' : 'pointer' }}
            onMouseOver={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseOut={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

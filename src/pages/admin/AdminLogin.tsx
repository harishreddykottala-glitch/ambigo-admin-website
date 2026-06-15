import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginEmail } from '../../utils/admin-api';
import '../../assets/admin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginEmail(email, password);
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card glass-panel">
        <div className="admin-logo-large">
          <span className="text-orange">Ambigo</span> Admin
        </div>
        <h2>Admin Login</h2>
        <p className="login-subtitle">Please enter your credentials to access the portal.</p>
        
        {error && <div className="admin-error-alert">{error}</div>}

        <form onSubmit={handleLogin} className="admin-form">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="admin@ambigo.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="admin-btn primary full-width" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
          
          <div className="demo-hint">
            <p>Demo Credentials: admin@ambigo.com / admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendAdminOTP, verifyAdminOTP } from '../../utils/admin-api';
import '../../assets/admin.css';

const AdminLogin = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError('Mobile number must be 10 digits');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendAdminOTP(mobile);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await verifyAdminOTP(mobile, otp);
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
        <p className="login-subtitle">
          {step === 1 ? 'Enter your registered mobile number' : 'Enter the OTP sent to your mobile'}
        </p>
        
        {error && <div className="admin-error-alert">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="admin-form">
            <div className="form-group">
              <label>Mobile Number (10 digits)</label>
              <input 
                type="tel" 
                value={mobile} 
                onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} 
                placeholder="e.g. 9876543210"
                maxLength={10}
                required
              />
            </div>
            <button type="submit" className="admin-btn primary full-width" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="admin-form">
            <div className="form-group">
              <label>Enter OTP</label>
              <input 
                type="text" 
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                placeholder="••••"
                maxLength={6}
                required
              />
            </div>
            <button type="submit" className="admin-btn primary full-width" disabled={loading}>
              {loading ? 'Verifying...' : 'Login'}
            </button>
            <button 
              type="button" 
              className="admin-btn secondary full-width" 
              style={{marginTop: '10px'}} 
              onClick={() => { setStep(1); setOtp(''); setError(''); }}
              disabled={loading}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;

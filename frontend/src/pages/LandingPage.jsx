import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Network, Lock, ArrowRight } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Engineer');
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const res = await login(email, password);
      if (res.success) navigate('/dashboard');
      else setError(res.message);
    } else {
      const res = await register(email, password, role);
      if (res.success) {
        alert('Registration successful! Please check the backend terminal logs for the Ethereal email verify link. Click it, then log in here.');
        setIsLogin(true);
        setPassword('');
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="landing-container">
      <div className="landing-content container">
        
        {/* Hero Section */}
        <div className="hero-section">
          <div className="badge badge-blue hero-badge">European HealthTech</div>
          <h1 className="hero-title">Co-Creation & Innovation <span className="text-highlight">Platform</span></h1>
          <p className="hero-subtitle">
            Bridging the gap between <strong>Healthcare Professionals</strong> and <strong>Engineers</strong>. 
            Structured, secure, and GDPR-compliant matchmaking to transform medical concepts into viable solutions.
          </p>
          
          <div className="features-grid">
            <div className="feature-item">
              <Network className="feature-icon text-primary" />
              <div>
                <h3>Structured Discovery</h3>
                <p>Find complementary interdisciplinary expertise.</p>
              </div>
            </div>
            <div className="feature-item">
              <ShieldCheck className="feature-icon text-accent" />
              <div>
                <h3>Controlled Disclosure</h3>
                <p>Secure first-contact with integrated NDA workflow.</p>
              </div>
            </div>
            <div className="feature-item">
              <Lock className="feature-icon text-warning" />
              <div>
                <h3>Institutional Trust</h3>
                <p>Exclusive access for verified .edu email accounts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Section */}
        <div className="auth-section">
          <div className="card auth-card">
            <div className="auth-header">
              <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
              <p>{isLogin ? 'Login to access your dashboard' : 'Join the co-creation network'}</p>
            </div>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label>Institutional Email (.edu only)</label>
                <input 
                  type="email" 
                  className="input-base" 
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              
              <div className="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  className="input-base" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              {!isLogin && (
                <div className="input-group">
                  <label>I am a...</label>
                  <select 
                    className="input-base" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Engineer">Engineer / Technologist</option>
                    <option value="Healthcare Professional">Healthcare Professional</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full mt-4">
                {isLogin ? 'Sign In' : 'Register Now'} <ArrowRight size={18}/>
              </button>
            </form>

            <div className="auth-footer">
              {isLogin ? (
                <p>Don't have an account? <button onClick={() => setIsLogin(false)} className="btn-link">Register</button></p>
              ) : (
                <p>Already have an account? <button onClick={() => setIsLogin(true)} className="btn-link">Sign In</button></p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LandingPage;

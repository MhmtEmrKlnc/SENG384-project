import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, User, PlusCircle, Bell } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        const token = localStorage.getItem('healthtech_token');
        try {
          const resp = await fetch('http://localhost:5000/api/meetings/my-requests', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resp.ok) {
            const data = await resp.json();
            // Count incoming requests that need action from the user
            const actionNeeded = data.incoming.filter(r => r.status === 'Interest Expressed' || r.status === 'Meeting Requested').length;
            setPendingCount(actionNeeded);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchNotifications();
    }
  }, [user, location.pathname]); // Re-check when navigating

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          <Activity className="nav-logo-icon" />
          <span className="nav-logo-text">HEALTH AI</span>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              {(user.role === 'Engineer' || user.role === 'Healthcare Professional') && (
                <Link to="/create-post" className="nav-link btn btn-outline btn-sm">
                  <PlusCircle size={16} /> New Post
                </Link>
              )}
              {user.role === 'Admin' && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}
              <div className="nav-user flex-center">
                <Link to="/dashboard" className="notification-icon-wrapper" title="Pending Notifications" style={{position: 'relative', marginRight: '0.75rem', color: 'var(--text-color)'}}>
                  <Bell size={18} />
                  {pendingCount > 0 && <span className="notification-dot" style={{position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger-color)', color: 'white', fontSize: '10px', width: '15px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'}}>{pendingCount}</span>}
                </Link>
                
                <Link to="/profile" className="flex-center" style={{textDecoration: 'none', color: 'inherit', gap: '0.25rem'}} title="Profile & GDPR Settings">
                  <User size={18} />
                  <span className="badge badge-gray">{user.role}</span>
                </Link>
                
                <button onClick={handleLogout} className="btn-logout" title="Logout" style={{marginLeft: '0.5rem'}}>
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <span className="nav-info">Co-Creation Platform</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

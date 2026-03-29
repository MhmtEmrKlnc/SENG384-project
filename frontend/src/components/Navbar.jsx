import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, User, PlusCircle } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
                <User size={18} />
                <span className="badge badge-gray">{user.role}</span>
                <button onClick={handleLogout} className="btn-logout" title="Logout">
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

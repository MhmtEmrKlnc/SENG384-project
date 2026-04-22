import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';
import { Navigate } from 'react-router-dom';
import { Trash2, Ban, CheckCircle } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  
  if (!user || user.role !== 'Admin') {
    return <Navigate to="/dashboard" />;
  }

  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [logFilter, setLogFilter] = useState('');

  useEffect(() => {
    if (activeTab === 'users' && user?.role === 'Admin') {
      const fetchUsers = async () => {
        const token = localStorage.getItem('healthtech_token');
        const resp = await fetch('http://localhost:5000/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
        if (resp.ok) setUsers(await resp.json());
      };
      fetchUsers();
    }
    if (activeTab === 'logs' && user?.role === 'Admin') {
      const fetchLogsAndStats = async () => {
        const token = localStorage.getItem('healthtech_token');
        const [logsResp, statsResp] = await Promise.all([
          fetch('http://localhost:5000/api/admin/logs/json', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (logsResp.ok) setLogs(await logsResp.json());
        if (statsResp.ok) setStats(await statsResp.json());
      };
      fetchLogsAndStats();
    }
  }, [activeTab, user]);

  const handleToggleSuspend = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus === 'Suspended' ? 'reactivate' : 'suspend'} this user?`)) return;
    
    const token = localStorage.getItem('healthtech_token');
    const suspend = currentStatus !== 'Suspended';
    try {
      const resp = await fetch(`http://localhost:5000/api/admin/users/suspend/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ suspend })
      });
      if (resp.ok) {
        // Refresh users list
        const rows = await fetch('http://localhost:5000/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
        setUsers(await rows.json());
      }
    } catch(err) {
      console.error(err);
    }
  };


  const { posts, deletePost } = usePosts();

  const handleDeletePost = (id) => {
    if (window.confirm('Are you sure you want to remove this post?')) {
      deletePost(id);
    }
  };

  const handleDownloadLogs = async () => {
    const token = localStorage.getItem('healthtech_token');
    try {
      const resp = await fetch('http://localhost:5000/api/admin/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit_logs.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download logs.");
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="container admin-container">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Platform management and oversight.</p>
        </div>
        <button onClick={handleDownloadLogs} className="btn btn-outline" title="Download Audit CSV">
          Export DB Logs
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Manage Posts
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Statistics & Logs
        </button>
      </div>

      <div className="card admin-content-card">
        {activeTab === 'posts' && (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author Role</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id}>
                    <td><strong>{post.title}</strong></td>
                    <td>{post.authorRole}</td>
                    <td>{post.domain}</td>
                    <td><span className="badge badge-green">{post.status}</span></td>
                    <td>
                      <button onClick={() => handleDeletePost(post.id)} className="btn-icon text-danger" title="Remove Post">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.joined}</td>
                    <td>
                      <span className={`badge ${u.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {u.status !== 'Suspended' ? (
                        <button onClick={() => handleToggleSuspend(u.id, u.status)} className="btn-icon text-warning" title="Suspend User">
                          <Ban size={18} />
                        </button>
                      ) : (
                        <button onClick={() => handleToggleSuspend(u.id, u.status)} className="btn-icon text-accent" title="Reactivate User">
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{padding: '1.5rem', textAlign: 'center'}}>
                  <h3 style={{fontSize: '2rem', color: 'var(--color-primary)', margin: 0}}>{stats.totalUsers}</h3>
                  <p className="text-muted" style={{margin: 0}}>Total Users</p>
                </div>
                <div className="card" style={{padding: '1.5rem', textAlign: 'center'}}>
                  <h3 style={{fontSize: '2rem', color: 'var(--color-accent)', margin: 0}}>{stats.totalPosts}</h3>
                  <p className="text-muted" style={{margin: 0}}>Total Posts</p>
                </div>
                <div className="card" style={{padding: '1.5rem', textAlign: 'center'}}>
                  <h3 style={{fontSize: '2rem', color: 'var(--color-secondary)', margin: 0}}>{stats.activeMeetings}</h3>
                  <p className="text-muted" style={{margin: 0}}>Active Meetings</p>
                </div>
                <div className="card" style={{padding: '1.5rem', textAlign: 'center'}}>
                  <h3 style={{fontSize: '2rem', color: 'var(--color-text)', margin: 0}}>{stats.totalLogins}</h3>
                  <p className="text-muted" style={{margin: 0}}>Successful Logins</p>
                </div>
              </div>
            )}

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h3>Recent Audit Logs</h3>
              <input 
                type="text" className="input-base" style={{width: '300px'}}
                placeholder="Filter by action (e.g. LOGIN, UPDATE)..."
                value={logFilter} onChange={(e) => setLogFilter(e.target.value)}
              />
            </div>
            
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User / Email</th>
                    <th>Action</th>
                    <th>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.filter(l => l.action.toLowerCase().includes(logFilter.toLowerCase())).map(log => (
                    <tr key={log.id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.user_email || 'System / Unknown'}</td>
                      <td><span className="badge badge-gray">{log.action}</span></td>
                      <td>{log.target || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

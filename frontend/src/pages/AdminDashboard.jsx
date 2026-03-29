import { useState } from 'react';
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

  // Mock Users Data
  const [users] = useState([
    { id: 101, email: 'j.smith@cambridge.edu', role: 'Engineer', status: 'Active', joined: '2026-03-20' },
    { id: 102, email: 'm.chen@stanford.edu', role: 'Healthcare Professional', status: 'Active', joined: '2026-03-21' },
    { id: 103, email: 't.becker@tum.de', role: 'Engineer', status: 'Suspended', joined: '2026-03-22' },
  ]);

  const { posts, deletePost } = usePosts();

  const handleDeletePost = (id) => {
    if (window.confirm('Are you sure you want to remove this post?')) {
      deletePost(id);
    }
  };

  return (
    <div className="container admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Platform management and oversight.</p>
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
                      {u.status === 'Active' ? (
                        <button className="btn-icon text-warning" title="Suspend User">
                          <Ban size={18} />
                        </button>
                      ) : (
                        <button className="btn-icon text-accent" title="Reactivate User">
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
      </div>
    </div>
  );
};

export default AdminDashboard;

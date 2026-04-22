import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Save, Download, Trash2, ShieldAlert } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    domain: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    setFormData({
      name: user.name || '',
      city: user.city || '',
      domain: user.domain || ''
    });
  }, [user, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    const res = await updateProfile(formData);
    setIsSaving(false);
    if (res.success) {
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      alert(res.message);
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('healthtech_token');
      const resp = await fetch('http://localhost:5000/api/auth/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Export failed');
      
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gdpr_export.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch(err) {
      alert("Failed to export data.");
      console.error(err);
    }
  };

  const handleDeleteAccount = () => {
    const confirm1 = window.confirm("WARNING: Account deletion is permanent. Are you absolutely certain you want to proceed?");
    if (confirm1) {
      // Simulated Account Deletion
      alert("Safe Mode: Simulated account marked for deletion. Data is retained for audit purposes. You will be logged out.");
      logout();
      navigate('/');
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{maxWidth: '800px', marginTop: '2rem'}}>
      <div className="dashboard-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your personal information and privacy settings.</p>
      </div>

      <div className="card" style={{padding: '2rem', marginBottom: '2rem'}}>
        <h2 style={{marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>Personal Information</h2>
        
        {successMsg && (
          <div style={{background: 'var(--color-primary)', color: 'white', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.5rem'}}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSave} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" name="name" className="input-base" value={formData.name} onChange={handleChange} required />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="input-group">
              <label>City</label>
              <input type="text" name="city" className="input-base" value={formData.city} onChange={handleChange} placeholder="e.g. Ankara" />
              <small className="text-muted" style={{display: 'block', marginTop: '4px'}}>Helps find localized matches.</small>
            </div>
            <div className="input-group">
              <label>Primary Domain</label>
              <input type="text" name="domain" className="input-base" value={formData.domain} onChange={handleChange} placeholder="e.g. Cardiology OR Software Dev" />
              <small className="text-muted" style={{display: 'block', marginTop: '4px'}}>Used for automated expertise matching.</small>
            </div>
          </div>

          <div className="input-group">
            <label>Role</label>
            <input type="text" className="input-base" value={user.role} disabled style={{background: 'var(--color-surface-hover)'}} />
            <small className="text-muted" style={{display: 'block', marginTop: '4px'}}>Your role is locked. Contact support to change it.</small>
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
            <button type="submit" className="btn btn-primary" disabled={isSaving} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Save size={18} /> {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{padding: '2rem'}}>
        <h2 style={{marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--danger-color)'}}>
          <ShieldAlert size={20} style={{marginRight: '0.5rem', verticalAlign: 'text-bottom'}} /> 
          GDPR & Privacy Rights
        </h2>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          <div>
            <h4 style={{marginBottom: '0.5rem'}}>Data Portability (GDPR Art. 20)</h4>
            <p className="text-muted" style={{marginBottom: '1rem'}}>You have the right to receive the personal data concerning you, which you have provided to us, in a structured, commonly used and machine-readable format.</p>
            <button onClick={handleExportData} className="btn btn-outline" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Download size={18} /> Export My Data (.json)
            </button>
          </div>

          <div>
            <h4 style={{marginBottom: '0.5rem'}}>Right to Erasure (GDPR Art. 17)</h4>
            <p className="text-muted" style={{marginBottom: '1rem'}}>You have the right to request the deletion of your personal data. This will revoke your access to the platform and remove all personal identifiers from your postings.</p>
            <button onClick={handleDeleteAccount} className="btn btn-outline text-danger" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Trash2 size={18} /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

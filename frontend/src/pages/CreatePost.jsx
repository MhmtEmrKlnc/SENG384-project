import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';
import { ShieldCheck, Info } from 'lucide-react';

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const isEngineer = user?.role === 'Engineer';

  const [formData, setFormData] = useState({
    title: '',
    domain: '',
    expertiseRequired: '',
    shortExplanation: '',
    highLevelIdea: '',
    projectStage: 'Idea/Concept',
    levelOfCommitment: 'Advisor',
    confidentialityLevel: 'Public short pitch',
    country: '',
    city: ''
  });

  const { addPost, editPost, posts } = usePosts();

  useEffect(() => {
    if (isEditMode && posts.length > 0) {
      const existing = posts.find(p => p.id === parseInt(id));
      if (existing) {
        setFormData({
          title: existing.title || '',
          domain: existing.domain || '',
          expertiseRequired: existing.expertiseRequired || '',
          shortExplanation: existing.shortExplanation || '',
          highLevelIdea: existing.highLevelIdea || '',
          projectStage: existing.projectStage || 'Idea/Concept',
          levelOfCommitment: existing.levelOfCommitment || 'Advisor',
          confidentialityLevel: existing.confidentialityLevel || 'Public short pitch',
          country: existing.country || '',
          city: existing.city || ''
        });
      }
    }
  }, [id, isEditMode, posts]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (status) => {
    const payload = { ...formData, authorRole: user.role, status };
    if (isEditMode) {
      editPost(id, payload);
    } else {
      addPost(payload);
    }
    navigate('/dashboard');
  };

  if (!user) return <div className="container mt-4">Please log in to create a post.</div>;

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">{isEditMode ? 'Edit Announcement' : 'Create Announcement'}</h1>
        <p className="page-subtitle">
          Structure your co-creation request. {isEngineer ? 'Specify the clinical expertise you need.' : 'Specify the technical infrastructure you need.'}
        </p>
      </div>

      <div className="card">
        <form onSubmit={(e) => e.preventDefault()}>
          
          <div className="input-group">
            <label>Project Title</label>
            <input name="title" value={formData.title} onChange={handleChange} className="input-base" required placeholder="e.g. AI-Powered Cardiology Imaging..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Working Domain</label>
              <input name="domain" value={formData.domain} onChange={handleChange} className="input-base" required placeholder="e.g. Cardiology, Orthopedics, Machine Learning" />
            </div>

            <div className="input-group">
              <label>{isEngineer ? 'Healthcare Expertise Needed' : 'Technical Expertise Needed'}</label>
              <input name="expertiseRequired" value={formData.expertiseRequired} onChange={handleChange} className="input-base" required placeholder={isEngineer ? "e.g. Cardiologist" : "e.g. Frontend Dev"} />
            </div>
          </div>

          <div className="input-group">
            <label>Short Explanation (Public)</label>
            <textarea name="shortExplanation" value={formData.shortExplanation} onChange={handleChange} className="input-base" required rows={3} placeholder="Briefly describe what you are trying to achieve..." />
          </div>

          {isEngineer && (
            <div className="input-group">
              <label>High-level Idea (Confidential)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <ShieldCheck size={14} /> Only visible to matched partners. Do not include patents or sensitive IP.
              </div>
              <textarea name="highLevelIdea" value={formData.highLevelIdea} onChange={handleChange} className="input-base" rows={3} placeholder="Describe the technical approach without revealing core IP..." />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Project Stage</label>
              <select name="projectStage" value={formData.projectStage} onChange={handleChange} className="input-base">
                <option value="Idea/Concept">Idea / Concept</option>
                <option value="Concept Validation">Concept Validation</option>
                <option value="Prototype Developed">Prototype Developed</option>
                <option value="Pilot Testing">Pilot Testing</option>
                <option value="Pre-deployment">Pre-deployment</option>
              </select>
            </div>

            <div className="input-group">
              <label>Level of Commitment</label>
              <select name="levelOfCommitment" value={formData.levelOfCommitment} onChange={handleChange} className="input-base">
                <option value="Advisor">Advisor</option>
                <option value="Co-founder">Co-founder</option>
                <option value="Research Partner">Research Partner</option>
              </select>
            </div>

            <div className="input-group">
              <label>Confidentiality</label>
              <select name="confidentialityLevel" value={formData.confidentialityLevel} onChange={handleChange} className="input-base">
                <option value="Public short pitch">Public short pitch</option>
                <option value="Details discussed in meeting only">Details discussed in meeting only</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Country</label>
              <input name="country" value={formData.country} onChange={handleChange} className="input-base" required />
            </div>
            <div className="input-group">
              <label>City</label>
              <input name="city" value={formData.city} onChange={handleChange} className="input-base" required />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <Info size={18} style={{color: 'var(--color-primary)', marginTop: '2px'}}/>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              <strong>Important:</strong> Ensure you do NOT upload any patient data, medical records, or confidential intellectual property. The system intentionally avoids storing confidential technical materials to reduce IP risks.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-outline">Cancel</button>
            <button type="button" onClick={() => handleSave('Draft')} className="btn btn-outline" style={{borderColor: 'var(--color-accent)', color: 'var(--color-accent)'}}>Save as Draft</button>
            <button type="button" onClick={() => handleSave('Active')} className="btn btn-primary">{isEditMode ? 'Update Announcement' : 'Publish Announcement'}</button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default CreatePost;

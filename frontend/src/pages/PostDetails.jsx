import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import { User, MapPin, Calendar, Clock, Lock, FileText, CheckCircle2 } from 'lucide-react';
import './PostDetails.css';

import { useAuth } from '../context/AuthContext';

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [showNDA, setShowNDA] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [proposedTimes, setProposedTimes] = useState("Let's discuss next week anytime between 2 PM - 5 PM CET.");

  const { posts } = usePosts();

  useEffect(() => {
    const found = posts.find(p => p.id === parseInt(id));
    if (found) setPost(found);
    else navigate('/dashboard');
  }, [id, navigate, posts]);

  if (!post) return null;

  const handleSendRequest = async () => {
    try {
      const token = localStorage.getItem('healthtech_token');
      const resp = await fetch('http://localhost:5000/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          post_id: post.id,
          owner_id: post.user_id,
          message: proposedTimes
        })
      });

      if (resp.ok) {
        setRequestSent(true);
        setShowNDA(false);
      } else {
        alert("Failed to send meeting request. Are you logged in?");
      }
    } catch(err) {
      console.error(err);
      alert("Network error.");
    }
  };

  const isOwner = user && user.id === post.user_id;

  return (
    <div className="container post-details-container">
      <button onClick={() => navigate(-1)} className="btn btn-outline" style={{marginBottom: '2rem'}}>
        &larr; Back to Dashboard
      </button>

      {requestSent ? (
        <div className="card success-card">
          <CheckCircle2 size={48} className="text-secondary" style={{color: 'var(--color-accent)'}} />
          <h2>Meeting Request Sent Successfully!</h2>
          <p>The partner will review your request and proposed time slots. You'll receive a notification when they accept.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-4">Return to Dashboard</button>
        </div>
      ) : (
        <div className="post-details-layout">
          {/* Main Info */}
          <div className="post-main">
            <div className="card">
              <div className="post-header-large">
                <span className="badge badge-gray">{post.domain}</span>
                <span className={`badge ${post.authorRole === 'Engineer' ? 'badge-blue' : 'badge-green'}`}>
                  {post.authorRole}
                </span>
              </div>
              
              <h1 className="post-title-large">{post.title}</h1>
              
              <div className="post-meta-row">
                <div className="meta-item"><MapPin size={16}/> {post.city}, {post.country}</div>
                <div className="meta-item"><Calendar size={16}/> Posted: {new Date(post.createdAt).toLocaleDateString()}</div>
                <div className="meta-item"><Lock size={16}/> {post.confidentialityLevel}</div>
              </div>

              <div className="section-divider"></div>

              <h3>About the Project</h3>
              <p className="large-text">{post.shortExplanation}</p>

              <div className="req-grid mt-4">
                <div className="req-box">
                  <span className="req-label">Expertise Needed</span>
                  <span className="req-value">{post.expertiseRequired}</span>
                </div>
                <div className="req-box">
                  <span className="req-label">Project Stage</span>
                  <span className="req-value">{post.projectStage}</span>
                </div>
                <div className="req-box">
                  <span className="req-label">Commitment Level</span>
                  <span className="req-value">{post.levelOfCommitment}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Action */}
          {!isOwner && (
            <div className="post-sidebar">
              <div className="card action-card">
                <h3>Interested in Co-Creating?</h3>
                <p className="text-muted" style={{fontSize: '0.9rem', marginBottom: '1.5rem'}}>
                  Express your interest with a short message. The partner will review and suggest meeting times.
                </p>

                {!showNDA ? (
                  <button onClick={() => setShowNDA(true)} className="btn btn-primary btn-full">
                    Express Interest
                  </button>
                ) : (
                  <div className="meeting-form">
                    <h4>Short Message</h4>
                    <textarea 
                      className="input-base" 
                      rows={4} 
                      value={proposedTimes}
                      onChange={(e) => setProposedTimes(e.target.value)}
                      placeholder="Hi, I am very interested in your project because..."
                      style={{marginBottom: '1rem'}}
                    />

                    <div className="action-buttons">
                      <button onClick={() => setShowNDA(false)} className="btn btn-outline">Cancel</button>
                      <button onClick={handleSendRequest} className="btn btn-primary" disabled={proposedTimes.trim() === ''}>
                        Send Message
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostDetails;

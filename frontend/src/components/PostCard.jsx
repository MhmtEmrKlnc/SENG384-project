import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, ShieldAlert, UserCheck, Stethoscope, Wrench } from 'lucide-react';
import './PostCard.css';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isEngineer = post.authorRole === "Engineer";
  const RoleIcon = isEngineer ? Wrench : Stethoscope;

  return (
    <div className="card post-card">
      <div className="post-header">
        <div className="post-badges">
          <span className={`badge ${isEngineer ? 'badge-blue' : 'badge-green'}`}>
            <RoleIcon size={12} style={{marginRight: '4px'}} />
            {post.authorRole}
          </span>
          <span className="badge badge-gray">{post.projectStage}</span>
        </div>
        <span className="post-date">{date}</span>
      </div>
      
      <h3 className="post-title">{post.title}</h3>
      <p className="post-domain">{post.domain}</p>
      
      <p className="post-description">{post.shortExplanation}</p>
      
      <div className="post-details-grid">
        <div className="detail-item">
          <span className="detail-label">Needs Expertise:</span>
          <span className="detail-value">{post.expertiseRequired}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Commitment:</span>
          <span className="detail-value">{post.levelOfCommitment}</span>
        </div>
      </div>
      
      <div className="post-footer">
        <div className="post-meta">
          <div className="meta-item text-muted">
            <MapPin size={14} />
            <span>{post.city}, {post.country}</span>
          </div>
          <div className="meta-item text-warning" title="Confidentiality Level">
            <ShieldAlert size={14} />
            <span style={{fontSize: '0.75rem'}}>
              {post.confidentialityLevel.includes('meeting') ? 'NDA Required' : 'Public'}
            </span>
          </div>
        </div>
        
        <Link to={`/post/${post.id}`} className="btn btn-primary btn-sm">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PostCard;

import { useState, useEffect } from 'react';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { Filter, Search, Inbox, LayoutDashboard, UserSquare2 } from 'lucide-react';
import './Dashboard.css';

import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('board'); // board, my-posts, requests
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  
  const [negotiationInputs, setNegotiationInputs] = useState({});
  const handleNegotiationInput = (id, field, value) => setNegotiationInputs(prev => ({...prev, [id]: {...prev[id], [field]: value}}));

  const fetchRequests = async () => {
    const token = localStorage.getItem('healthtech_token');
    const resp = await fetch('http://localhost:5000/api/meetings/my-requests', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (resp.ok) {
      const data = await resp.json();
      setIncomingRequests(data.incoming);
      setOutgoingRequests(data.outgoing);
    }
  };

  useEffect(() => {
    if (activeTab === 'requests' && user) {
      fetchRequests();
    }
  }, [activeTab, user]);

  const handleMeetingRespond = async (id, status) => {
    const token = localStorage.getItem('healthtech_token');
    try {
      const resp = await fetch(`http://localhost:5000/api/meetings/${id}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (resp.ok) { fetchRequests(); } 
    } catch(err) { console.error(err); }
  };

  const handleSuggestDates = async (id) => {
    const times = negotiationInputs[id]?.suggestedTimes;
    if (!times) return;
    const token = localStorage.getItem('healthtech_token');
    try {
      const resp = await fetch(`http://localhost:5000/api/meetings/${id}/suggest`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ proposed_times: times })
      });
      if (resp.ok) fetchRequests();
    } catch(err) { console.error(err); }
  };

  const handleFinalRequest = async (id) => {
    const final_time = negotiationInputs[id]?.finalTime;
    const nda_accepted = negotiationInputs[id]?.ndaAccepted;
    if (!final_time || !nda_accepted) return alert("Select a time and accept the NDA");
    const token = localStorage.getItem('healthtech_token');
    try {
      const resp = await fetch(`http://localhost:5000/api/meetings/${id}/request`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ final_time, nda_accepted })
      });
      if (resp.ok) fetchRequests();
    } catch(err) { console.error(err); }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm("Cancel this request?")) return;
    const token = localStorage.getItem('healthtech_token');
    try {
      const resp = await fetch(`http://localhost:5000/api/meetings/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) fetchRequests();
    } catch(err) { console.error(err); }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterDomain, setFilterDomain] = useState('All');
  const [filterExpertise, setFilterExpertise] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterStage, setFilterStage] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const { posts, updatePostStatus } = usePosts();
  
  const domains = ['All', 'Cardiology Imaging', 'Endocrinology', 'Surgery', 'Orthopedics / Neurology'];
  const stages = ['All', 'Idea/Concept', 'Concept Validation', 'Prototype Developed', 'Pilot Testing', 'Pre-deployment'];

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'my-posts' && post.user_id !== user?.id) return false;
    if (activeTab === 'board' && !['Active', 'Meeting Scheduled'].includes(post.status)) return false;

    const safeToLowerCase = (str) => str ? str.toLowerCase() : '';

    const matchesSearch = safeToLowerCase(post.title).includes(safeToLowerCase(searchTerm)) || 
                          safeToLowerCase(post.shortExplanation).includes(safeToLowerCase(searchTerm));
    const matchesRole = filterRole === 'All' || post.authorRole === filterRole;
    const matchesDomain = filterDomain === 'All' || (post.domain && post.domain.includes(filterDomain));
    const matchesExpertise = filterExpertise === '' || safeToLowerCase(post.expertiseRequired).includes(safeToLowerCase(filterExpertise));
    const matchesCity = filterCity === '' || safeToLowerCase(post.city).includes(safeToLowerCase(filterCity));
    const matchesCountry = filterCountry === '' || safeToLowerCase(post.country).includes(safeToLowerCase(filterCountry));
    const matchesStage = filterStage === 'All' || post.projectStage === filterStage;
    const matchesStatus = filterStatus === 'All' || post.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesDomain && matchesExpertise && matchesCity && matchesCountry && matchesStage && matchesStatus;
  });

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">{activeTab === 'requests' ? 'Incoming Requests' : 'Innovation Board'}</h1>
          <p className="page-subtitle">Discover opportunities and connect with interdisciplinary partners.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setActiveTab('board')} className={`btn ${activeTab === 'board' ? 'btn-primary' : 'btn-outline'}`}><LayoutDashboard size={18}/> Board</button>
          {user && <button onClick={() => setActiveTab('my-posts')} className={`btn ${activeTab === 'my-posts' ? 'btn-primary' : 'btn-outline'}`}><UserSquare2 size={18}/> My Posts</button>}
          {user && <button onClick={() => setActiveTab('requests')} className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-outline'}`}><Inbox size={18}/> Requests</button>}
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Sidebar Filters */}
        <aside className="dashboard-sidebar">
          <div className="card filter-card">
            <div className="filter-header">
              <Filter size={18} />
              <h3>Filters</h3>
            </div>
            
            <div className="filter-group">
              <label>Search keywords</label>
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  className="input-base pl-8" 
                  placeholder="e.g. AI model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Partner Type</label>
              <select 
                className="input-base"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="Engineer">Engineers looking for Clinical Experts</option>
                <option value="Healthcare Professional">Clinicians looking for Tech Experts</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Domain</label>
              <select className="input-base" value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)}>
                {domains.map(d => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>

            <div className="filter-group" style={{marginTop: '1.25rem'}}>
              <label>Required Expertise</label>
              <input type="text" className="input-base" placeholder="e.g. Cardiologist" value={filterExpertise} onChange={(e) => setFilterExpertise(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
              <div className="filter-group" style={{marginBottom: 0}}>
                <label>City</label>
                <input type="text" className="input-base" placeholder="City" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} />
              </div>
              <div className="filter-group" style={{marginBottom: 0}}>
                <label>Country</label>
                <input type="text" className="input-base" placeholder="Country" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} />
              </div>
            </div>

            <div className="filter-group" style={{marginTop: '1.25rem'}}>
              <label>Project Stage</label>
              <select className="input-base" value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                {stages.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>

            <div className="filter-group" style={{marginTop: '1.25rem'}}>
              <label>Status</label>
              <select className="input-base" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Meeting Scheduled">Meeting Scheduled</option>
                <option value="Closed">Partner Found (Closed)</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Main Content Grid */}
        <main className="dashboard-main">
          {activeTab === 'requests' ? (
            <div className="requests-container">
              <h2>Action Required: Incoming Requests ({incomingRequests.filter(r => r.status !== 'Accepted' && r.status !== 'Declined' && r.status !== 'Cancelled').length})</h2>
              {incomingRequests.length === 0 ? <p>No incoming requests yet.</p> : (
                <div className="requests-grid">
                  {incomingRequests.map(req => (
                    <div key={req.id} className="card request-card" style={{padding: '1.5rem', marginBottom: '1rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <h4>Re: {req.post_title}</h4>
                        <span className={`badge ${['Accepted'].includes(req.status) ? 'badge-green' : ['Declined', 'Cancelled'].includes(req.status) ? 'badge-gray' : 'badge-warning'}`}>{req.status}</span>
                      </div>
                      <p><strong>From:</strong> {req.requester_name} ({req.requester_email})</p>
                      
                      {/* Step 1 for Owner: Receive Interest Message and suggest dates */}
                      <p><strong>Initial Message:</strong> <i>"{req.message}"</i></p>
                      
                      {req.status === 'Interest Expressed' && (
                        <div style={{marginTop: '1rem', background: 'var(--color-background)', padding: '1rem', borderRadius: '4px'}}>
                          <p><strong>Action:</strong> Suggest meeting dates</p>
                          <textarea 
                            className="input-base" rows="2" 
                            placeholder="e.g. Next Monday 10:00 AM CET or Tuesday 2:00 PM CET"
                            value={negotiationInputs[req.id]?.suggestedTimes || ''}
                            onChange={(e) => handleNegotiationInput(req.id, 'suggestedTimes', e.target.value)}
                          />
                          <div style={{marginTop: '0.5rem', display: 'flex', gap: '0.5rem'}}>
                            <button onClick={() => handleSuggestDates(req.id)} className="btn btn-primary btn-sm">Send Dates</button>
                            <button onClick={() => handleMeetingRespond(req.id, 'Declined')} className="btn btn-outline btn-sm">Decline</button>
                          </div>
                        </div>
                      )}

                      {/* Wait for Requester */}
                      {req.status === 'Dates Suggested' && (
                        <p className="text-muted mt-2">You proposed: {req.proposed_times}. Waiting for requester to confirm.</p>
                      )}

                      {/* Step 3 for Owner: Accept/Decline final request */}
                      {req.status === 'Meeting Requested' && (
                        <div style={{marginTop: '1rem', background: 'var(--color-background)', padding: '1rem', borderRadius: '4px'}}>
                          <p><strong>Confirmed Time:</strong> {req.proposed_times}</p>
                          <p><strong>NDA Accepted:</strong> {req.nda_accepted ? 'Yes' : 'No'}</p>
                          <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
                            <button onClick={() => handleMeetingRespond(req.id, 'Accepted')} className="btn btn-primary btn-sm">Accept Meeting</button>
                            <button onClick={() => handleMeetingRespond(req.id, 'Declined')} className="btn btn-outline btn-sm">Decline</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <h2 style={{marginTop: '3rem'}}>Sent Requests ({outgoingRequests.length})</h2>
              {outgoingRequests.length === 0 ? <p>You haven't requested any meetings yet.</p> : (
                <div className="requests-grid">
                  {outgoingRequests.map(req => (
                    <div key={req.id} className="card request-card" style={{padding: '1.5rem', marginBottom: '1rem', background: 'var(--color-surface-hover)'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <h4>Re: {req.post_title}</h4>
                        <span className={`badge ${req.status === 'Accepted' ? 'badge-green' : ['Declined', 'Cancelled'].includes(req.status) ? 'badge-gray' : 'badge-warning'}`}>{req.status}</span>
                      </div>
                      <p><strong>To:</strong> {req.owner_name} ({req.owner_email})</p>
                      
                      {req.status === 'Interest Expressed' && (
                        <p className="text-muted mt-2">Waiting for {req.owner_name} to suggest times.</p>
                      )}

                      {req.status === 'Dates Suggested' && (
                        <div style={{marginTop: '1rem', background: 'var(--color-background)', padding: '1rem', borderRadius: '4px'}}>
                          <p><strong>Suggested Times:</strong> {req.proposed_times}</p>
                          <input 
                            type="text" className="input-base mb-2" 
                            placeholder="Type the final time from the options above..."
                            value={negotiationInputs[req.id]?.finalTime || ''}
                            onChange={(e) => handleNegotiationInput(req.id, 'finalTime', e.target.value)}
                          />
                          <label className="checkbox-label mb-2" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <input 
                              type="checkbox" 
                              checked={negotiationInputs[req.id]?.ndaAccepted || false} 
                              onChange={(e) => handleNegotiationInput(req.id, 'ndaAccepted', e.target.checked)} 
                            />
                            I accept the Non-Disclosure Agreement for this meeting.
                          </label>
                          <button onClick={() => handleFinalRequest(req.id)} className="btn btn-primary btn-sm block w-full">Finalize Request</button>
                        </div>
                      )}

                      {req.status === 'Meeting Requested' && (
                        <p className="text-muted mt-2">Waiting for owner to accept the final meeting at: {req.proposed_times}</p>
                      )}

                      {/* Cancel feature for active negotiations */}
                      {['Interest Expressed', 'Dates Suggested', 'Meeting Requested'].includes(req.status) && (
                        <button onClick={() => handleCancelRequest(req.id)} className="btn btn-outline btn-sm" style={{marginTop: '1rem', width: '100%'}}>
                          Cancel Request
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="results-count">
                Showing {filteredPosts.length} announcements
              </div>
              
              {filteredPosts.length > 0 ? (
                <div className="posts-grid">
                  {filteredPosts.map(post => {
                    const isMyPostTab = activeTab === 'my-posts';
                    let matchExplanation = null;
                    if (user && !isMyPostTab && user.role !== post.authorRole) {
                      if (post.city && user.city && post.city.toLowerCase() === user.city.toLowerCase()) {
                        matchExplanation = "Strong Match: Shared City";
                      } else if (post.expertiseRequired && user.domain && post.expertiseRequired.toLowerCase().includes("ai") && user.domain.toLowerCase().includes("ai")) {
                        matchExplanation = "Expertise Match";
                      }
                    }

                    return (
                      <div key={post.id} style={{position: 'relative'}}>
                        {matchExplanation && (
                          <div style={{position: 'absolute', top: '-10px', right: '10px', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', zIndex: 10}}>
                            {matchExplanation}
                          </div>
                        )}
                        <PostCard 
                          post={post} 
                        >
                          {isMyPostTab && (
                            <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-start'}}>
                              {post.status !== 'Closed' && <button onClick={() => updatePostStatus(post.id, 'Closed')} className="btn btn-outline btn-sm">Mark Partner Found</button>}
                              {post.status !== 'Archived' && <button onClick={() => updatePostStatus(post.id, 'Archived')} className="btn btn-outline btn-sm text-danger">Archive</button>}
                              <button onClick={() => navigate(`/edit-post/${post.id}`)} className="btn btn-outline btn-sm text-accent">Edit</button>
                            </div>
                          )}
                        </PostCard>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state card">
                  <div className="empty-icon-wrapper">
                    <Search size={32} />
                  </div>
                  <h3>No announcements found</h3>
                  <p>Try adjusting your search filters to find more partner opportunities.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

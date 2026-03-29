import { useState } from 'react';
import { usePosts } from '../context/PostContext';
import PostCard from '../components/PostCard';
import { Filter, Search } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterDomain, setFilterDomain] = useState('All');
  const [filterExpertise, setFilterExpertise] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterStage, setFilterStage] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const { posts } = usePosts();
  
  // In a real app, domains would come from API distinct values
  const domains = ['All', 'Cardiology Imaging', 'Endocrinology', 'Surgery', 'Orthopedics / Neurology'];
  const stages = ['All', 'Idea/Concept', 'Concept Validation', 'Prototype Developed', 'Pilot Testing', 'Pre-deployment'];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.shortExplanation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || post.authorRole === filterRole;
    const matchesDomain = filterDomain === 'All' || post.domain.includes(filterDomain);
    const matchesExpertise = filterExpertise === '' || post.expertiseRequired.toLowerCase().includes(filterExpertise.toLowerCase());
    const matchesCity = filterCity === '' || post.city.toLowerCase().includes(filterCity.toLowerCase());
    const matchesCountry = filterCountry === '' || post.country.toLowerCase().includes(filterCountry.toLowerCase());
    const matchesStage = filterStage === 'All' || post.projectStage === filterStage;
    const matchesStatus = filterStatus === 'All' || post.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesDomain && matchesExpertise && matchesCity && matchesCountry && matchesStage && matchesStatus;
  });

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Innovation Board</h1>
          <p className="page-subtitle">Discover opportunities and connect with interdisciplinary partners.</p>
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
          <div className="results-count">
            Showing {filteredPosts.length} announcements
          </div>
          
          {filteredPosts.length > 0 ? (
            <div className="posts-grid">
              {filteredPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
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
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

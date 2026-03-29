import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import PostDetails from './pages/PostDetails';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <AuthProvider>
        <PostProvider>
          <div className="app-layout">
            <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/post/:id" element={<PostDetails />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        </PostProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

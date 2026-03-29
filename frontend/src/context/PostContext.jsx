import { createContext, useState, useContext, useEffect } from 'react';
import { mockPosts } from '../data/mockPosts';

const PostContext = createContext();

export const usePosts = () => useContext(PostContext);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Load from local storage or fallback to mock data
    const saved = localStorage.getItem('healthtech_posts');
    if (saved) {
      setPosts(JSON.parse(saved));
    } else {
      setPosts(mockPosts);
      localStorage.setItem('healthtech_posts', JSON.stringify(mockPosts));
    }
  }, []);

  const addPost = (newPost) => {
    const post = {
      ...newPost,
      id: Date.now(),
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    const updated = [post, ...posts];
    setPosts(updated);
    localStorage.setItem('healthtech_posts', JSON.stringify(updated));
  };

  const deletePost = (id) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    localStorage.setItem('healthtech_posts', JSON.stringify(updated));
  };

  return (
    <PostContext.Provider value={{ posts, addPost, deletePost }}>
      {children}
    </PostContext.Provider>
  );
};

import { createContext, useState, useContext, useEffect } from 'react';
import { mockPosts } from '../data/mockPosts';

const PostContext = createContext();

export const usePosts = () => useContext(PostContext);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async (filters = {}) => {
    try {
      const resp = await fetch('http://localhost:5000/api/posts');
      if (resp.ok) {
        const data = await resp.json();
        setPosts(data);
      }
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const addPost = async (newPost) => {
    const token = localStorage.getItem('healthtech_token');
    try {
      const resp = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newPost)
      });
      if (resp.ok) {
        await fetchPosts(); // Refresh board
      }
    } catch(err) {
      console.error(err);
    }
  };

  const deletePost = async (id) => {
    const token = localStorage.getItem('healthtech_token');
    try {
      const resp = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        setPosts(posts.filter(p => p.id !== id));
      }
    } catch(err) {
      console.error(err);
    }
  };

  const updatePostStatus = async (id, status) => {
    const token = localStorage.getItem('healthtech_token');
    try {
      const resp = await fetch(`http://localhost:5000/api/posts/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (resp.ok) {
        await fetchPosts();
      }
    } catch(err) {
      console.error(err);
    }
  };

  const editPost = async (id, updatedData) => {
    const token = localStorage.getItem('healthtech_token');
    try {
      const resp = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updatedData)
      });
      if (resp.ok) {
        await fetchPosts();
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <PostContext.Provider value={{ posts, addPost, deletePost, fetchPosts, updatePostStatus, editPost }}>
      {children}
    </PostContext.Provider>
  );
};

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = (pool) => {
  
  // GET /api/posts - filtre ile postları getir
  router.get('/', async (req, res) => {
    try {
      const { domain, expertise, city, country, stage, status } = req.query;
      let query = `
        SELECT p.*, u.name as author_name, u.role as author_role 
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE 1=1
      `;
      const values = [];
      let idx = 1;

      if (domain && domain !== 'All') { query += ` AND p.domain = $${idx++}`; values.push(domain); }
      if (stage && stage !== 'All') { query += ` AND p.project_stage = $${idx++}`; values.push(stage); }
      if (status && status !== 'All') { query += ` AND p.status = $${idx++}`; values.push(status); }
      // Mocking simple IKILI text search for expertise & local city
      if (expertise) { query += ` AND p.expertise_required ILIKE $${idx++}`; values.push(`%${expertise}%`); }
      if (city) { query += ` AND p.city ILIKE $${idx++}`; values.push(`%${city}%`); }
      if (country) { query += ` AND p.country ILIKE $${idx++}`; values.push(`%${country}%`); }

      query += ` ORDER BY p.created_at DESC`;

      const result = await pool.query(query, values);
      
      const formattedPosts = result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        domain: row.domain,
        authorName: row.author_name,
        authorRole: row.author_role,
        expertiseRequired: row.expertise_required,
        shortExplanation: row.short_explanation,
        highLevelIdea: row.high_level_idea,
        projectStage: row.project_stage,
        levelOfCommitment: row.level_of_commitment,
        confidentialityLevel: row.confidentiality_level,
        status: row.status,
        country: row.country,
        city: row.city,
        createdAt: row.created_at
      }));

      res.json(formattedPosts);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // POST /api/posts - Create post
  router.post('/', auth, async (req, res) => {
    try {
      const { title, domain, expertiseRequired, shortExplanation, highLevelIdea, projectStage, levelOfCommitment, confidentialityLevel, country, city, status } = req.body;
      const finalStatus = status || 'Active'; // If not draft, default to active
      
      const newPost = await pool.query(
        `INSERT INTO posts (user_id, title, domain, expertise_required, short_explanation, high_level_idea, project_stage, level_of_commitment, confidentiality_level, country, city, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [req.user.id, title, domain, expertiseRequired, shortExplanation, highLevelIdea, projectStage, levelOfCommitment, confidentialityLevel, country, city, finalStatus]
      );

      await pool.query('INSERT INTO audit_logs (user_id, action, target) VALUES ($1, $2, $3)', [req.user.id, 'CREATE_POST', newPost.rows[0].id]);

      res.json(newPost.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // PUT /api/posts/:id - Edit post
  router.put('/:id', auth, async (req, res) => {
    try {
      const postId = req.params.id;
      const { title, domain, expertiseRequired, shortExplanation, highLevelIdea, projectStage, levelOfCommitment, confidentialityLevel, country, city, status } = req.body;
      
      const postResponse = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
      if (postResponse.rows.length === 0) return res.status(404).send('Post not found');
      if (postResponse.rows[0].user_id !== req.user.id) return res.status(403).send('Not authorized');

      const updated = await pool.query(
        `UPDATE posts SET title = $1, domain = $2, expertise_required = $3, short_explanation = $4, high_level_idea = $5, project_stage = $6, level_of_commitment = $7, confidentiality_level = $8, country = $9, city = $10, status = $11 WHERE id = $12 RETURNING *`,
        [title, domain, expertiseRequired, shortExplanation, highLevelIdea, projectStage, levelOfCommitment, confidentialityLevel, country, city, status || 'Active', postId]
      );

      await pool.query('INSERT INTO audit_logs (user_id, action, target) VALUES ($1, $2, $3)', [req.user.id, 'EDIT_POST', postId]);
      
      res.json(updated.rows[0]);
    } catch(err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // DELETE /api/posts/:id (Admin or Owner)
  router.delete('/:id', auth, async (req, res) => {
    try {
      const postId = req.params.id;
      
      const postResponse = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
      if (postResponse.rows.length === 0) return res.status(404).send('Post not found');
      
      if (postResponse.rows[0].user_id !== req.user.id && req.user.role !== 'Admin') {
         return res.status(403).send('Not authorized');
      }

      await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
      
      await pool.query('INSERT INTO audit_logs (user_id, action, target) VALUES ($1, $2, $3)', [req.user.id, 'DELETE_POST', postId]);
      
      res.json({ msg: 'Post removed' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // PUT /api/posts/:id/status
  router.put('/:id/status', auth, async (req, res) => {
    try {
      const { status } = req.body;
      const postId = req.params.id;

      const postResponse = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
      if (postResponse.rows.length === 0) return res.status(404).json({ message: 'Post not found' });
      if (postResponse.rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

      await pool.query('UPDATE posts SET status = $1 WHERE id = $2', [status, postId]);
      await pool.query('INSERT INTO audit_logs (user_id, action, target) VALUES ($1, $2, $3)', [req.user.id, `POST_UPDATE_${status.toUpperCase()}`, postId]);

      res.json({ success: true, message: `Post status updated to ${status}` });
    } catch(err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  return router;
};

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Middleware
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
  
  // POST /api/meetings - Step 1: Express Interest
  router.post('/', auth, async (req, res) => {
    try {
      const { post_id, owner_id, message } = req.body;
      if (req.user.id === owner_id) return res.status(400).json({ message: "You cannot request a meeting for your own post" });

      const newMeeting = await pool.query(
        'INSERT INTO meetings (post_id, requester_id, owner_id, message, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [post_id, req.user.id, owner_id, message, 'Interest Expressed']
      );

      await pool.query('INSERT INTO audit_logs (user_id, action, target) VALUES ($1, $2, $3)', [req.user.id, 'CREATE_MEETING_INTEREST', post_id]);

      res.status(201).json({ success: true, meeting: newMeeting.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // PUT /api/meetings/:id/suggest - Step 2: Owner suggests dates
  router.put('/:id/suggest', auth, async (req, res) => {
    try {
      const { proposed_times } = req.body;
      const meetingId = req.params.id;

      const meetingCheck = await pool.query('SELECT owner_id FROM meetings WHERE id = $1', [meetingId]);
      if (meetingCheck.rows.length === 0) return res.status(404).json({ message: 'Meeting not found' });
      if (meetingCheck.rows[0].owner_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

      await pool.query('UPDATE meetings SET proposed_times = $1, status = $2 WHERE id = $3', [proposed_times, 'Dates Suggested', meetingId]);
      
      res.json({ success: true, message: 'Dates suggested' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // PUT /api/meetings/:id/request - Step 3: Requester picks date and sends official request + NDA
  router.put('/:id/request', auth, async (req, res) => {
    try {
      const { final_time, nda_accepted } = req.body;
      const meetingId = req.params.id;

      const meetingCheck = await pool.query('SELECT requester_id, post_id FROM meetings WHERE id = $1', [meetingId]);
      if (meetingCheck.rows.length === 0) return res.status(404).json({ message: 'Meeting not found' });
      if (meetingCheck.rows[0].requester_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

      await pool.query('UPDATE meetings SET proposed_times = $1, nda_accepted = $2, status = $3 WHERE id = $4', [final_time, nda_accepted, 'Meeting Requested', meetingId]);
      await pool.query("UPDATE posts SET status = 'Meeting Scheduled' WHERE id = $1", [meetingCheck.rows[0].post_id]);
      
      res.json({ success: true, message: 'Official meeting request sent' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // GET /api/meetings/my-requests
  router.get('/my-requests', auth, async (req, res) => {
    try {
      const incoming = await pool.query(`
        SELECT m.*, p.title as post_title, u.name as requester_name, u.email as requester_email
        FROM meetings m
        JOIN posts p ON m.post_id = p.id
        JOIN users u ON m.requester_id = u.id
        WHERE m.owner_id = $1
        ORDER BY m.created_at DESC
      `, [req.user.id]);
      
      const outgoing = await pool.query(`
        SELECT m.*, p.title as post_title, u.name as owner_name, u.email as owner_email
        FROM meetings m
        JOIN posts p ON m.post_id = p.id
        JOIN users u ON m.owner_id = u.id
        WHERE m.requester_id = $1
        ORDER BY m.created_at DESC
      `, [req.user.id]);

      res.json({ incoming: incoming.rows, outgoing: outgoing.rows });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // PUT /api/meetings/:id/respond
  router.put('/:id/respond', auth, async (req, res) => {
    try {
      const { status } = req.body; // accepted ya da declined
      const meetingId = req.params.id;

      // Ensure user is the owner
      const meetingCheck = await pool.query('SELECT owner_id, post_id FROM meetings WHERE id = $1', [meetingId]);
      if (meetingCheck.rows.length === 0) return res.status(404).json({ message: 'Meeting not found' });
      if (meetingCheck.rows[0].owner_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

      await pool.query('UPDATE meetings SET status = $1 WHERE id = $2', [status, meetingId]);
      
      if (status === 'Declined') {
        const checkActive = await pool.query("SELECT id FROM meetings WHERE post_id = $1 AND status = 'Accepted'", [meetingCheck.rows[0].post_id]);
        if(checkActive.rows.length === 0) {
            await pool.query('UPDATE posts SET status = $1 WHERE id = $2', ['Active', meetingCheck.rows[0].post_id]);
        }
      }

      await pool.query('INSERT INTO audit_logs (user_id, action, target) VALUES ($1, $2, $3)', [req.user.id, `RESPOND_MEETING_${status}`, meetingId]);

      res.json({ success: true, message: `Meeting ${status}` });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // PUT /api/meetings/:id/cancel
  router.put('/:id/cancel', auth, async (req, res) => {
    try {
      const meetingId = req.params.id;
      // Ensure user is the requester
      const meetingCheck = await pool.query('SELECT requester_id FROM meetings WHERE id = $1', [meetingId]);
      if (meetingCheck.rows.length === 0) return res.status(404).json({ message: 'Meeting not found' });
      if (meetingCheck.rows[0].requester_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

      await pool.query('UPDATE meetings SET status = $1 WHERE id = $2', ['Cancelled', meetingId]);
      await pool.query('INSERT INTO audit_logs (user_id, action, target) VALUES ($1, $2, $3)', [req.user.id, 'CANCEL_MEETING', meetingId]);

      res.json({ success: true, message: 'Meeting Cancelled' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  return router;
};

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Parser } = require('json2csv');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const authAdmin = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied: Requires Admin role' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = (pool) => {
  
  // GET /api/admin/logs - Export logs as CSV
  router.get('/logs', authAdmin, async (req, res) => {
    try {
      const logsResult = await pool.query(`
        SELECT a.id, u.email, a.action, a.target, a.timestamp 
        FROM audit_logs a 
        LEFT JOIN users u ON a.user_id = u.id 
        ORDER BY a.timestamp DESC
      `);
      
      const logs = logsResult.rows;
      if (logs.length === 0) {
        return res.send("id,email,action,target,timestamp\n");
      }

      const fields = ['id', 'email', 'action', 'target', 'timestamp'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(logs);

      res.header('Content-Type', 'text/csv');
      res.attachment('audit_logs.csv');
      return res.send(csv);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error generating CSV');
    }
  });

  // GET /api/admin/logs/json - Returns logs for visual table
  router.get('/logs/json', authAdmin, async (req, res) => {
    try {
      const logsResult = await pool.query(`
        SELECT a.id, u.email as user_email, a.action, a.target, a.timestamp 
        FROM audit_logs a 
        LEFT JOIN users u ON a.user_id = u.id 
        ORDER BY a.timestamp DESC
        LIMIT 100
      `);
      res.json(logsResult.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // GET /api/admin/stats
  router.get('/stats', authAdmin, async (req, res) => {
    try {
      const postsCount = await pool.query('SELECT COUNT(*) FROM posts');
      const usersCount = await pool.query('SELECT COUNT(*) FROM users');
      const activeMeetings = await pool.query("SELECT COUNT(*) FROM meetings WHERE status != 'Cancelled' AND status != 'Declined'");
      const logins = await pool.query("SELECT COUNT(*) FROM audit_logs WHERE action = 'LOGIN_SUCCESS'");

      res.json({
        totalPosts: postsCount.rows[0].count,
        totalUsers: usersCount.rows[0].count,
        activeMeetings: activeMeetings.rows[0].count,
        totalLogins: logins.rows[0].count
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });
  router.get('/users', authAdmin, async (req, res) => {
    try {
      const usersResponse = await pool.query(`SELECT id, email, role, is_verified, is_suspended, created_at as joined FROM users ORDER BY created_at DESC`);
      
      const mappedUsers = usersResponse.rows.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        status: u.is_suspended ? 'Suspended' : (u.is_verified ? 'Active' : 'Unverified'),
        joined: new Date(u.joined).toISOString().split('T')[0]
      }));

      res.json(mappedUsers);
    } catch (err) {
      res.status(500).send('Server Error retrieving users');
    }
  });

  // PUT /api/admin/users/suspend/:userId
  router.put('/users/suspend/:userId', authAdmin, async (req, res) => {
    try {
      const { suspend } = req.body;
      await pool.query('UPDATE users SET is_suspended = $1 WHERE id = $2', [suspend, req.params.userId]);
      
      const action = suspend ? 'SUSPEND_USER' : 'REACTIVATE_USER';
      await pool.query('INSERT INTO audit_logs (user_id, action, target) VALUES ($1, $2, $3)', [req.user.id, action, `User_ID: ${req.params.userId}`]);
      
      res.json({ message: "User status updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  return router;
};

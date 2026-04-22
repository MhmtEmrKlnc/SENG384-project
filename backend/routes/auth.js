const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// use Ethereal for testing, or pull from .env
async function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  } else {
    // generate test SMTP service account from ethereal.email
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
  }
}

module.exports = (pool) => {
  // POST /api/auth/register
  router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    if (!email.includes('.edu') && !email.includes('.ac.')) {
      return res.status(400).json({ success: false, message: 'Only institutional (.edu or .ac) emails are allowed.' });
    }

    try {
      // user exists mi
      const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const name = email.split('@')[0];
      const finalRole = email.toLowerCase().includes('admin') ? 'Admin' : role;

      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, role, name) VALUES ($1, $2, $3, $4) RETURNING id, email',
        [email, hashedPassword, finalRole, name]
      );

      // Generate Verification Token
      const verifyToken = jwt.sign({ id: newUser.rows[0].id }, JWT_SECRET, { expiresIn: '1d' });
      const verifyUrl = `http://localhost:5000/api/auth/verify/${verifyToken}`;

      const transporter = await createTransporter();
      const info = await transporter.sendMail({
        from: '"HealthTech Platform" <noreply@healthtech.eu>',
        to: email,
        subject: "Verify your Account",
        text: `Please verify your account by clicking: ${verifyUrl}`,
        html: `<b>Please verify your account: <a href="${verifyUrl}">${verifyUrl}</a></b>`,
      });

      console.log("Preview Email URL: %s", nodemailer.getTestMessageUrl(info));

      res.status(201).json({ 
        success: true, 
        message: 'Registration successful. Check console for verification link.' 
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
  });

  // GET /api/auth/verify/:token
  router.get('/verify/:token', async (req, res) => {
    try {
      const decoded = jwt.verify(req.params.token, JWT_SECRET);
      await pool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [decoded.id]);
      res.send('Account successfully verified! You can now log in <a href="http://localhost:5173/">here</a>.');
    } catch (err) {
      res.status(400).send('Invalid or expired token.');
    }
  });

  // POST /api/auth/login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        // bulamadı -> fail
        await pool.query('INSERT INTO audit_logs (action, target) VALUES ($1, $2)', ['LOGIN_FAILED', email]);
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }

      const user = result.rows[0];

      if (!user.is_verified) {
        return res.status(403).json({ success: false, message: 'Please verify your email first.' });
      }

      if (user.is_suspended) {
        return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        await pool.query('INSERT INTO audit_logs (user_id, action, target) VALUES ($1, $2, $3)', [user.id, 'LOGIN_FAILED', email]);
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }

      const payload = { id: user.id, email: user.email, role: user.role, name: user.name, city: user.city, domain: user.domain };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      await pool.query('INSERT INTO audit_logs (user_id, action) VALUES ($1, $2)', [user.id, 'LOGIN_SUCCESS']);

      res.json({ success: true, token, user: payload });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error during login.' });
    }
  });

  const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };

  // PUT /api/auth/profile
  router.put('/profile', authMiddleware, async (req, res) => {
    const { name, city, domain } = req.body;
    
    try {
      await pool.query(
        'UPDATE users SET name = $1, city = $2, domain = $3 WHERE id = $4',
        [name, city, domain, req.user.id]
      );
    } catch (updateErr) {
      console.error("Profile update DB error:", updateErr);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }

    try {
      await pool.query('INSERT INTO audit_logs (user_id, action, target) VALUES ($1, $2, $3)', [req.user.id, 'UPDATE_PROFILE', 'Profile updated']);
    } catch (auditErr) {
      console.error("Audit log error ignored:", auditErr);
    }
      
    try {
      const payload = { ...req.user, name, city, domain };
      const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, user: payload, token: newToken });
    } catch (tokenErr) {
      console.error("Token error:", tokenErr);
      res.status(500).json({ success: false, message: 'Failed to refresh login' });
    }
  });

  // GET /api/auth/export
  router.get('/export', authMiddleware, async (req, res) => {
    try {
      const userRes = await pool.query('SELECT id, email, role, name, city, domain, created_at FROM users WHERE id = $1', [req.user.id]);
      const postsRes = await pool.query('SELECT * FROM posts WHERE user_id = $1', [req.user.id]);
      const meetingsRes = await pool.query('SELECT * FROM meetings WHERE requester_id = $1 OR owner_id = $1', [req.user.id]);
      
      const exportData = {
        personal_information: userRes.rows[0],
        owned_announcements: postsRes.rows,
        meeting_engagements: meetingsRes.rows,
        export_date: new Date().toISOString()
      };

      await pool.query('INSERT INTO audit_logs (user_id, action, target) VALUES ($1, $2, $3)', [req.user.id, 'EXPORT_DATA', 'GDPR Export']);

      res.header('Content-Type', 'application/json');
      res.attachment('gdpr_export.json');
      res.send(JSON.stringify(exportData, null, 2));
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to export data' });
    }
  });

  return router;
};

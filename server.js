const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_antigravity_2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Auth Middleware for protected routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
}

// Routes

// 1. Health Check
app.get('/api/health', async (req, res) => {
  const count = await db.getUserCount();
  res.json({
    status: 'OK',
    message: 'Backend server and database connection are working!',
    totalUsers: count,
    timestamp: new Date().toISOString()
  });
});

// 2. Register Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Basic Validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (username.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // Check if email already exists
    const existingEmail = await db.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email is already registered. Please login.' });
    }

    // Check if username already exists
    const existingUser = await db.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username is already taken. Try another.' });
    }

    // Hash Password safely with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Store in Database
    const newUser = await db.createUser({
      name,
      username,
      email,
      passwordHash
    });

    // Generate JWT Token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome aboard.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// 3. Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { loginInput, password } = req.body; // loginInput can be email OR username

    if (!loginInput || !password) {
      return res.status(400).json({ success: false, message: 'Username/Email and Password are required.' });
    }

    // Lookup user by email or username
    let user = await db.findByEmail(loginInput);
    if (!user) {
      user = await db.findByUsername(loginInput);
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid username/email or password.' });
    }

    // Verify Password Hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid username/email or password.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful! Redirecting...',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// 4. Get Current User Profile (Protected)
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving user profile.' });
  }
});

// Serve frontend fallback for SPA if needed
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Route not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Export app for serverless function & start standalone server if executed directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
    console.log(`📊 Connected to Database`);
  });
}

module.exports = app;

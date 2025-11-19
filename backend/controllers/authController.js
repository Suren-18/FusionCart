const User = require('../models/User');
const Session = require('../models/Session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
exports.register = async (req, res) => {
  try {
    let { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Normalize email and trim username/password
    email = email.trim().toLowerCase();
    username = username.trim();
    password = password.trim();

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Normalize input
    email = email.trim().toLowerCase();
    password = password.trim();

    console.log("Login attempt email:", email);
    console.log("Login attempt password:", password);

    // Find user
    const user = await User.findOne({ email });
    console.log("Found user:", user ? user.email : "No user found");

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    // Create session
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    const session = new Session({
      userId: user._id,
      token,
      expiresAt
    });

    await session.save();

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Logout user
exports.logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      await Session.deleteOne({ token });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Refresh session
exports.refreshSession = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Update session expiry
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await Session.findOneAndUpdate(
      { token },
      { expiresAt }
    );

    res.json({ message: 'Session refreshed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
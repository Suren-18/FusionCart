const jwt = require('jsonwebtoken');
const Session = require('../models/Session');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if session exists and is not expired
    const session = await Session.findOne({ token, userId: decoded.userId });

    if (!session) {
      return res.status(401).json({ message: 'Session not found' });
    }

    if (new Date() > session.expiresAt) {
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({ message: 'Session expired' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};

module.exports = auth;
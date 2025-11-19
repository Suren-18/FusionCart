const Session = require('../models/Session');

const cleanupExpiredSessions = async () => {
  try {
    const result = await Session.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} expired sessions`);
    }
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  }
};

module.exports = { cleanupExpiredSessions };
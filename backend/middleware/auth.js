const jwt = require('jsonwebtoken');

// JWT Secret (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

console.log('🔍 auth.js - JWT_SECRET being used:', JWT_SECRET);
console.log('🔍 auth.js - process.env.JWT_SECRET:', process.env.JWT_SECRET);

// Generic JWT verification middleware
const verifyToken = (req, res, next) => {
  console.log('🔍 verifyToken - Request received for:', req.method, req.url);
  console.log('🔍 verifyToken - Request headers:', {
    authorization: req.headers.authorization ? 'Present' : 'Missing',
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent']
  });
  
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
  console.log('🔍 verifyToken - Token extracted:', !!token);
  if (token) {
    console.log('🔍 verifyToken - Token preview:', token.substring(0, 20) + '...');
  }

  if (!token) {
    console.log('🔍 verifyToken - No token found, returning 401');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    console.log('🔍 verifyToken - Attempting to verify token with JWT_SECRET:', JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('🔍 verifyToken - Token decoded successfully:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      exp: decoded.exp
    });
    req.user = decoded;
    next();
  } catch (error) {
    console.error('🔍 verifyToken - Token verification failed:', error.message);
    console.error('🔍 verifyToken - Error details:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  verifyToken,
  JWT_SECRET
}; 
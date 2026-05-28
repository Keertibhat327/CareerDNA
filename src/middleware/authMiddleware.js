import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware to authenticate requests using JWT.
 * Attaches decoded user payload { id, email, role } to req.user.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expected format: Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please sign in.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Access denied. Invalid or expired token.' });
  }

  req.user = decoded;
  next();
}

/**
 * Middleware to optionally authenticate requests using JWT.
 * If token is present and valid, attaches decoded payload to req.user, but does not block.
 */
export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}


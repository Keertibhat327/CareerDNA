/**
 * Middleware to restrict access to specific roles.
 * Must be used after authenticateToken middleware.
 * @param {...string} allowedRoles - The roles permitted to access the route (e.g., 'student', 'recruiter').
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Access denied. Role information missing.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. This action is restricted to: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

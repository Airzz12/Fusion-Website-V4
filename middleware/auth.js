const auth = (req, res, next) => {
    // For API routes, return 401 if not authenticated
    if (req.path.startsWith('/api/') && !req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // For regular routes, attach user to req object
    req.user = req.session.user || null;
    next();
};

module.exports = auth; 
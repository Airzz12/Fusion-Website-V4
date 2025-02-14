function admin(req, res, next) {
    if (!req.user || req.user.rank.toLowerCase() !== 'admin') {
        console.log('Unauthorized access attempt to admin panel');
        return res.status(403).redirect('/');
    }
    next();
}

module.exports = admin; 

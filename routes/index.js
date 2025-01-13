const express = require('express');
const router = express.Router();


router.get('/tools/modpolicy', (req, res) => {
    res.render('tools/modpolicy', {
        user: req.session.user || null,
        currentPage: 'tools'
    });
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/modpolicy', (req, res) => {
    res.render('tools/modpolicy', {
        user: req.session.user || null,
        currentPage: 'tools'
    });
});

router.get('/scanner', (req, res) => {
    res.render('tools/scanner', {
        user: req.session.user || null,
        currentPage: 'tools'
    });
});

router.get('/download/minecrafthackscanner.exe', (req, res) => {
    const filePath = path.join(__dirname, '../public/downloads/Minecraft Hack Scanner.exe');
    res.download(filePath, 'Minecraft Hack Scanner.exe');
});

module.exports = router; 
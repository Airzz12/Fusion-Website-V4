const express = require('express');
const router = express.Router();
const { getDb } = require('../database');


router.use((req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
});

router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        const user = await db.get(`
            SELECT 
                u.*,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM staff_applications 
                        WHERE user_id = u.id 
                        AND status IS NOT NULL
                    ) THEN (
                        SELECT status FROM staff_applications 
                        WHERE user_id = u.id 
                        AND status IS NOT NULL 
                        ORDER BY created_at DESC LIMIT 1
                    )
                    ELSE NULL
                END as application_status
            FROM users u
            WHERE u.id = ?
        `, [req.session.user.id]);
        
        if (!user) {
            req.session.destroy();
            return res.redirect('/login');
        }

        res.render('profile', { user });
    } catch (error) {
        console.error('Profile route error:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router; 
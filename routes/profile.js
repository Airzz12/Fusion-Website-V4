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

router.get('/:username', async (req, res) => {
    try {
        const db = await getDb();
        const username = req.params.username;

        // Get user data
        const profileUser = await db.get('SELECT username, minecraft_username, rank, created_at FROM users WHERE username = ?', [username]);

        if (!profileUser) {
            return res.render('profile/not-found', { 
                user: req.session.user || null,
                username: username
            });
        }

        res.render('profile/view', {
            user: req.session.user || null,
            profileUser,
            currentPage: 'profile',
            title: `${profileUser.username}'s Profile | Fusion Network`,
            description: `View ${profileUser.username}'s profile on Fusion Network`
        });
    } catch (error) {
        console.error('Profile view error:', error);
        res.status(500).send('Server error');
    }
});

router.get('/users/all', async (req, res) => {
    try {
        const db = await getDb();
        const users = await db.all('SELECT username, minecraft_username, rank FROM users ORDER BY rank DESC, username ASC');

        res.render('profile/users', {
            user: req.session.user || null,
            users,
            currentPage: 'users',
            title: 'All Users | Fusion Network',
            description: 'View all registered users on Fusion Network'
        });
    } catch (error) {
        console.error('Users list error:', error);
        res.status(500).send('Server error');
    }
});

// Add this route to handle account deletion
router.delete('/delete', async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.session.user.id;

        // Delete the user from the database
        await db.run('DELETE FROM users WHERE id = ?', [userId]);

        // Clear the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ error: 'Failed to logout' });
            }
            res.json({ success: true });
        });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

module.exports = router; 

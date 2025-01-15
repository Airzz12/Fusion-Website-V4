const express = require('express');
const router = express.Router();
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const { getDb } = require('../database');
const bcrypt = require('bcrypt');

// Store maintenance mode state (in a real application, this should be in a database)
let maintenanceMode = false;


const checkMaintenance = (req, res, next) => {
    const allowedPaths = [
        '/admin',
        '/api/admin',
        '/public',
        '/login',
        '/register',
        '/api/auth/login',
        '/api/auth/register'
    ];

    // Check if user is admin
    const isAdmin = req.session.user && (req.session.user.username === 'Admin' || req.session.user.rank === 'Admin');

    // If user is admin, allow access to all pages
    if (isAdmin) {
        return next();
    }

    // Check if the current path is allowed
    const isAllowedPath = allowedPaths.some(path => req.path.startsWith(path));

    if (maintenanceMode && !isAllowedPath) {
        // If user tries to access any other URL during maintenance
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            // For API requests
            return res.status(503).json({ 
                error: 'Site is under maintenance' 
            });
        }
        // For regular page requests
        return res.render('maintenance', { 
            user: req.session.user || null,
            maintenanceMode: true
        });
    }
    next();
};


const isInMaintenance = () => maintenanceMode;


router.get('/', [auth, admin], async (req, res) => {
    try {
        if (!req.user || req.user.username !== 'Admin') {
            console.log('Unauthorized access attempt to admin panel');
            return res.redirect('/');
        }

        const db = await getDb();
        const stats = await db.get('SELECT COUNT(*) as userCount FROM users');
        
        res.render('admin', { 
            user: req.user,
            stats,
            currentPage: 'admin',
            maintenanceMode
        });
    } catch (error) {
        console.error('Admin panel error:', error);
        res.status(500).send('Server error');
    }
});

router.post('/reset-applications', async (req, res) => {
    try {
        const db = getDb();
        await db.run('DELETE FROM staff_applications');
        
        res.json({
            success: true,
            message: 'All applications have been reset successfully'
        });
    } catch (error) {
        console.error('Error resetting applications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset applications'
        });
    }
});

router.post('/promote', [auth, admin], async (req, res) => {
    try {
        const { username, newRank } = req.body;
        const db = getDb();

   
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

  
        await db.run('UPDATE users SET rank = ? WHERE username = ?', [newRank, username]);
        
        res.json({
            success: true,
            message: `Successfully promoted ${username} to ${newRank}`
        });
    } catch (error) {
        console.error('Promote error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to promote user'
        });
    }
});

router.post('/demote', [auth, admin], async (req, res) => {
    try {
        const { username, newRank } = req.body;
        const db = getDb();

      
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

    
        await db.run('UPDATE users SET rank = ? WHERE username = ?', [newRank, username]);
        
        res.json({
            success: true,
            message: `Successfully demoted ${username} to ${newRank}`
        });
    } catch (error) {
        console.error('Demote error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to demote user'
        });
    }
});

router.post('/reset-password', [auth, admin], async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        const db = getDb();

      
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

     
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
   
        await db.run('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username]);
        
        res.json({
            success: true,
            message: `Successfully reset password for ${username}`
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset password'
        });
    }
});

// Site settings endpoint
router.post('/site-settings', [auth, admin], async (req, res) => {
    try {
        const { maintenanceMode: newMaintenanceMode } = req.body;
        maintenanceMode = newMaintenanceMode;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Export both the router and the middleware
module.exports = {
    router,
    checkMaintenance,
    isInMaintenance
}; 

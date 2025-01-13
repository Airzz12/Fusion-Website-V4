const express = require('express');
const router = express.Router();
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const { getDb } = require('../database');
const bcrypt = require('bcrypt');

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
            currentPage: 'admin'
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

module.exports = router; 
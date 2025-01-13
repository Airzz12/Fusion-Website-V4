const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');


router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const db = await getDb();
        
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }


        req.session.user = {
            id: user.id,
            username: user.username,
            minecraft_username: user.minecraft_username || null,
            rank: user.rank,
            created_at: user.created_at
        };


        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Failed to create session' });
            }
            res.json({ success: true, redirect: '/' });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});


router.post('/register', async (req, res) => {
    try {
        const db = await getDb();
        const { username, password, 'minecraft-username': minecraftUsername } = req.body;

        // Validate input
        if (!username || !password || !minecraftUsername) {
            return res.status(400).json({ 
                error: 'Please fill in all fields'
            });
        }

   
        const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

      
        const hashedPassword = await bcrypt.hash(password, 10);

        
        const result = await db.run(`
            INSERT INTO users (username, password, minecraft_username, rank)
            VALUES (?, ?, ?, 'member')
        `, [username, hashedPassword, minecraftUsername]);

      
        req.session.user = {
            id: result.lastID,
            username,
            minecraft_username: minecraftUsername,
            rank: 'member'
        };

        res.json({ 
            success: true,
            redirect: '/'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: 'Registration failed. Please try again.' });
    }
});


router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.clearCookie('fusionSession');
        res.json({ success: true });
    });
});


router.post('/change-username', async (req, res) => {
    try {
        const { newUsername } = req.body;
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const db = await getDb();
        
        
        const user = await db.get('SELECT username_changed_at FROM users WHERE id = ?', [req.session.user.id]);
        if (user.username_changed_at) {
            const lastChange = new Date(user.username_changed_at);
            const daysSinceChange = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysSinceChange < 15) {
                const daysRemaining = Math.ceil(15 - daysSinceChange);
                return res.status(400).json({ 
                    error: `You can change your username again in ${daysRemaining} days`,
                    daysRemaining
                });
            }
        }

       
        const existingUser = await db.get('SELECT id FROM users WHERE username = ? AND id != ?', [newUsername, req.session.user.id]);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        
        await db.run(
            'UPDATE users SET username = ?, username_changed_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newUsername, req.session.user.id]
        );
        
       
        req.session.user.username = newUsername;
        
        res.json({ success: true, message: 'Username updated successfully!' });
    } catch (error) {
        console.error('Username change error:', error);
        res.status(500).json({ error: 'Failed to change username' });
    }
});


router.get('/username-cooldown', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const db = await getDb();
        const user = await db.get('SELECT username_changed_at FROM users WHERE id = ?', [req.session.user.id]);
        
        if (!user.username_changed_at) {
            return res.json({ canChange: true });
        }

        const lastChange = new Date(user.username_changed_at);
        const daysSinceChange = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceChange < 15) {
            const daysRemaining = Math.ceil(15 - daysSinceChange);
            const nextChangeDate = new Date(lastChange.getTime() + (15 * 24 * 60 * 60 * 1000));
            return res.json({ 
                canChange: false, 
                daysRemaining,
                nextChangeDate: nextChangeDate.toISOString()
            });
        }

        res.json({ canChange: true });
    } catch (error) {
        console.error('Cooldown check error:', error);
        res.status(500).json({ error: 'Failed to check cooldown' });
    }
});


router.get('/minecraft-cooldown', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const db = await getDb();
        const user = await db.get(
            'SELECT minecraft_changed_at FROM users WHERE id = ?',
            [req.session.user.id]
        );

        const cooldownDays = 15;
        const now = new Date();
        const lastChange = user.minecraft_changed_at ? new Date(user.minecraft_changed_at) : new Date(0);
        const nextChangeDate = new Date(lastChange.getTime() + (cooldownDays * 24 * 60 * 60 * 1000));
        
        res.json({
            canChange: now >= nextChangeDate,
            nextChangeDate: nextChangeDate.toISOString()
        });
    } catch (error) {
        console.error('Minecraft cooldown check error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.post('/update-minecraft', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const db = await getDb();
        const user = await db.get(
            'SELECT minecraft_changed_at FROM users WHERE id = ?',
            [req.session.user.id]
        );

        const cooldownDays = 15;
        const now = new Date();
        const lastChange = user.minecraft_changed_at ? new Date(user.minecraft_changed_at) : new Date(0);
        const nextChangeDate = new Date(lastChange.getTime() + (cooldownDays * 24 * 60 * 60 * 1000));

        if (now < nextChangeDate) {
            return res.status(403).json({ 
                error: 'You must wait 15 days between Minecraft username changes',
                nextChangeDate: nextChangeDate.toISOString()
            });
        }

        const { minecraftUsername } = req.body;
        await db.run(
            'UPDATE users SET minecraft_username = ?, minecraft_changed_at = CURRENT_TIMESTAMP WHERE id = ?',
            [minecraftUsername, req.session.user.id]
        );

        req.session.user.minecraft_username = minecraftUsername;
        res.json({ success: true });
    } catch (error) {
        console.error('Minecraft update error:', error);
        res.status(500).json({ error: 'Failed to update Minecraft username' });
    }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const auth = require('../middleware/auth');

router.get('/apply', auth, async (req, res) => {
    try {
        const db = getDb();
        
        const status = await db.get('SELECT is_open FROM application_status LIMIT 1');
        const isOpen = status ? status.is_open : true;


        let hasExistingApplication = false;
        if (isOpen) {
            const existingApplication = await db.get(
                'SELECT * FROM staff_applications WHERE user_id = ?',
                [req.user.id]
            );
            hasExistingApplication = !!existingApplication;
        }

        res.render('staff/apply', { 
            user: req.user,
            hasExistingApplication,
            isOpen,
            currentPage: 'apply'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});


router.post('/apply', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, error: 'Please login to submit an application' });
    }
    
    try {
        const db = getDb();
        const { inGameName, why, scenario, availability, experience } = req.body;
        const userId = req.session.user.id;
        
  
        const existingApp = await db.get('SELECT * FROM staff_applications WHERE user_id = ?', [userId]);
        if (existingApp) {
            return res.status(400).json({ 
                success: false, 
                error: 'You already have a pending application' 
            });
        }

  
        await db.run(`
            INSERT INTO staff_applications 
            (user_id, in_game_name, reason, scenario, availability, experience, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `, [userId, inGameName, why, scenario, availability, experience]);

   
        await db.run('UPDATE users SET application_status = ? WHERE id = ?', ['pending', userId]);

        res.json({ 
            success: true, 
            message: 'Application submitted successfully!' 
        });
    } catch (error) {
        console.error('Application submission error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to submit application. Please try again.' 
        });
    }
});

router.get('/applications', async (req, res) => {
    if (!req.session.user || req.session.user.rank !== 'admin') {
        return res.redirect('/');
    }

    try {
        const db = getDb();
        const applications = await db.all(`
            SELECT 
                sa.id,
                sa.created_at,
                u.username,
                u.minecraft_username,
                sa.status
            FROM staff_applications sa
            JOIN users u ON sa.user_id = u.id
            ORDER BY sa.created_at DESC
        `);

        res.render('staff/applications', { 
            user: req.session.user,
            applications: applications
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).send('Error loading applications');
    }
});

router.get('/application/:id', async (req, res) => {
    if (!req.session.user || req.session.user.rank !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const db = getDb();
        const application = await db.get(`
            SELECT 
                sa.*,
                u.username,
                u.minecraft_username
            FROM staff_applications sa
            JOIN users u ON sa.user_id = u.id
            WHERE sa.id = ?
        `, [req.params.id]);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json(application);
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.post('/toggle-applications', auth, async (req, res) => {
    try {
        const db = getDb();
        const { status } = req.body;
        
        await db.run(
            'UPDATE application_status SET is_open = ?, updated_at = CURRENT_TIMESTAMP',
            [status === 'open' ? 1 : 0]
        );
        
        res.json({ success: true, message: `Applications ${status === 'open' ? 'opened' : 'closed'} successfully` });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update application status' });
    }
});

router.get('/ourstaff', (req, res) => {
    res.render('staff/ourstaff', {
        user: req.session.user || null,
        currentPage: 'staff'
    });
});

router.post('/applications/:id/:action', async (req, res) => {
    if (!req.session.user || req.session.user.rank !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const db = await getDb();
        const { id, action } = req.params;
        const status = action === 'accept' ? 'accepted' : 'rejected';

        
        await db.run('UPDATE staff_applications SET status = ? WHERE id = ?', [status, id]);
      
        const application = await db.get('SELECT user_id FROM staff_applications WHERE id = ?', [id]);
        
        if (application) {
            
            await db.run('UPDATE users SET application_status = ? WHERE id = ?', [status, application.user_id]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
});


const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.rank === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Unauthorized' });
    }
};


router.post('/applications/:id/accept', isAdmin, async (req, res) => {
    try {
        const applicationId = req.params.id;
        
     
        await db.query('UPDATE applications SET status = $1 WHERE id = $2', ['accepted', applicationId]);
        
       
        const { rows } = await db.query('SELECT user_id FROM applications WHERE id = $1', [applicationId]);
        if (rows.length > 0) {
            await db.query('UPDATE users SET application_status = $1 WHERE id = $2', ['accepted', rows[0].user_id]);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error accepting application:', error);
        res.status(500).json({ error: 'Failed to accept application' });
    }
});


router.post('/applications/:id/reject', isAdmin, async (req, res) => {
    try {
        const applicationId = req.params.id;
        
    
        await db.query('UPDATE applications SET status = $1 WHERE id = $2', ['rejected', applicationId]);
        
    
        const { rows } = await db.query('SELECT user_id FROM applications WHERE id = $1', [applicationId]);
        if (rows.length > 0) {
            await db.query('UPDATE users SET application_status = $1 WHERE id = $2', ['rejected', rows[0].user_id]);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error rejecting application:', error);
        res.status(500).json({ error: 'Failed to reject application' });
    }
});


router.post('/applications/:id/reset', async (req, res) => {
    if (!req.session.user || req.session.user.rank !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const db = await getDb();
        const { id } = req.params;

     
        const application = await db.get('SELECT user_id FROM staff_applications WHERE id = ?', [id]);
        
        if (application) {
           
            await db.run('UPDATE staff_applications SET status = NULL WHERE id = ?', [id]);
            await db.run('UPDATE users SET application_status = NULL WHERE id = ?', [application.user_id]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error resetting application:', error);
        res.status(500).json({ error: 'Failed to reset application' });
    }
});

module.exports = router; 
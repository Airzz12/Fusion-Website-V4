const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const auth = require('../middleware/auth');


router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        
  
        const stats = await db.get(`
            SELECT 
                (SELECT COUNT(*) FROM users) as totalMembers,
                (SELECT COUNT(*) FROM forums) as totalForums,
                (SELECT COUNT(*) FROM replies) as totalReplies,
                (SELECT username FROM users ORDER BY created_at DESC LIMIT 1) as newestMember
        `);
        

        const onlineUsers = await db.all(`
            SELECT username, minecraft_username, rank
            FROM users 
            WHERE last_active >= datetime('now', '-5 minutes')
            ORDER BY username
        `);


        const latestPosts = await db.all(`
            SELECT 
                t.id as threadId,
                t.title,
                u.username as author,
                t.created_at
            FROM threads t
            LEFT JOIN users u ON u.id = t.user_id
            ORDER BY t.created_at DESC
            LIMIT 5
        `);


        const categories = await db.all(`
            SELECT DISTINCT 
                c.id, 
                c.name, 
                c.description,
                c.order_position,
                COALESCE(u.username, 'System') as username,
                COALESCE(u.rank, 'system') as rank,
                COALESCE(u.minecraft_username, 'System') as minecraft_username
            FROM categories c
            LEFT JOIN users u ON u.id = c.id
            ORDER BY c.order_position ASC
        `);

  
        for (let category of categories) {
            const forums = await db.all(`
                SELECT 
                    f.*,
                    CASE 
                        WHEN f.user_id IS NULL THEN 'System'
                        ELSE COALESCE(u.username, 'System')
                    END as creator_name,
                    CASE 
                        WHEN f.user_id IS NULL THEN 'system'
                        ELSE COALESCE(u.rank, 'member')
                    END as creator_rank,
                    CASE 
                        WHEN f.user_id IS NULL THEN 'System'
                        ELSE COALESCE(u.minecraft_username, 'Steve')
                    END as creator_minecraft,
                    f.user_id IS NULL as is_system,
                    f.user_id
                FROM forums f
                LEFT JOIN users u ON u.id = f.user_id
                WHERE f.category_id = ?
                ORDER BY f.created_at DESC
            `, [category.id]);
            
         
            for (let forum of forums) {
                forum.replies = await db.all(`
                    SELECT 
                        r.*,
                        u.username,
                        u.rank,
                        u.minecraft_username
                    FROM replies r
                    LEFT JOIN users u ON u.id = r.user_id
                    WHERE r.forum_id = ?
                    ORDER BY r.created_at DESC
                `, [forum.id]);
            }
            
            category.forums = forums;
        }

        res.render('forums', { 
            categories, 
            user: req.session.user || null,
            stats: stats || {
                totalMembers: 0,
                totalForums: 0,
                totalReplies: 0,
                newestMember: 'None'
            },
            onlineUsers: onlineUsers || [],
            latestPosts: latestPosts || []
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { error: 'Failed to load forums' });
    }
});


router.post('/reply', auth, async (req, res) => {
    try {
        const db = await getDb();
        const { threadId, content } = req.body;
        
        if (!content || !threadId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }


        await db.run(`
            INSERT INTO posts (content, user_id, thread_id, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `, [content, req.user.id, threadId]);

        res.status(201).json({ message: 'Reply posted successfully' });
    } catch (error) {
        console.error('Reply error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.post('/create', auth, async (req, res) => {
    try {
        const db = await getDb();
        
        if (!req.user) {
            return res.status(401).json({ error: 'Must be logged in to create a forum' });
        }

        const { title, description, categoryId, icon } = req.body;
        
  
        console.log('Creating forum with:', { title, description, categoryId, icon, userId: req.user.id });

      
        if (!title || !description || !categoryId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }


        const category = await db.get('SELECT id FROM categories WHERE id = ?', [categoryId]);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        if (categoryId === 1 && req.user.rank !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create announcement forums' });
        }


        const result = await db.run(`
            INSERT INTO forums (
                title, 
                description, 
                category_id, 
                user_id, 
                icon, 
                created_at
            ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [
            title,
            description,
            categoryId,
            req.user.id,
            icon || 'fas fa-comments'
        ]);

        res.status(201).json({ 
            message: 'Forum created successfully',
            forumId: result.lastID 
        });
    } catch (error) {
        console.error('Forum creation error:', error);
        res.status(500).json({ error: 'Failed to create forum: ' + error.message });
    }
});


router.get('/:id', auth, async (req, res) => {
    try {
        const db = await getDb();
        const forum = await db.get('SELECT * FROM forums WHERE id = ?', [req.params.id]);
        
        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }
        
        res.json(forum);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.delete('/:id', auth, async (req, res) => {
    try {
        const db = await getDb();
        const forumId = req.params.id;
        
        // Check permissions
        const forum = await db.get('SELECT * FROM forums WHERE id = ?', [forumId]);
        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }

        if (req.session.user.id !== forum.user_id && !['admin', 'mod', 'helper'].includes(req.session.user.rank)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

  
        await db.run('DROP TABLE IF EXISTS replies');
        await db.run(`
            CREATE TABLE IF NOT EXISTS replies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                forum_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (forum_id) REFERENCES forums(id)
            )
        `);
        
    
        await db.run('DELETE FROM forums WHERE id = ?', [forumId]);
        
        res.json({ message: 'Forum deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.post('/:id/reply', auth, async (req, res) => {
    try {
        const db = await getDb();
        const { content } = req.body;
        const forumId = req.params.id;
        
        if (!content) {
            return res.status(400).json({ error: 'Reply content is required' });
        }

        await db.run(`
            INSERT INTO replies (content, user_id, forum_id, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `, [content, req.session.user.id, forumId]);

        res.json({ message: 'Reply posted successfully' });
    } catch (error) {
        console.error('Reply error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.put('/:id', auth, async (req, res) => {
    try {
        const db = await getDb();
        const forumId = req.params.id;
        const { title, description } = req.body;
        

        const forum = await db.get('SELECT * FROM forums WHERE id = ?', [forumId]);
        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }

        if (req.session.user.id !== forum.user_id && !['admin', 'mod'].includes(req.session.user.rank)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await db.run(`
            UPDATE forums 
            SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [title, description, forumId]);

        res.json({ message: 'Forum updated successfully' });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 
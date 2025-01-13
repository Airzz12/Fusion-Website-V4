const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcrypt');

let db = null;

const dbPath = path.join(__dirname, 'database.sqlite');
const dbDir = path.join(__dirname, 'database');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}


fs.chmodSync(dbDir, 0o766);

async function initializeDb() {
    try {
       
        const dbExists = fs.existsSync(dbPath);
        
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

   
        fs.chmodSync(dbPath, 0o666);

    
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                minecraft_username TEXT,
                rank TEXT DEFAULT 'member',
                avatar TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
                username_changed_at DATETIME,
                minecraft_changed_at DATETIME,
                application_status TEXT DEFAULT NULL
            );

            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                order_position INTEGER
            );

            CREATE TABLE IF NOT EXISTS forums (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                category_id INTEGER,
                user_id INTEGER,
                icon TEXT DEFAULT 'fas fa-comments',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS threads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                forum_id INTEGER,
                user_id INTEGER,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (forum_id) REFERENCES forums(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                thread_id INTEGER,
                user_id INTEGER,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (thread_id) REFERENCES threads(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS replies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                forum_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (forum_id) REFERENCES forums(id)
            );

            CREATE TABLE IF NOT EXISTS staff_applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                in_game_name TEXT NOT NULL,
                reason TEXT NOT NULL,
                scenario TEXT NOT NULL,
                availability TEXT NOT NULL,
                experience TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS application_status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                is_open BOOLEAN DEFAULT 1,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            INSERT OR IGNORE INTO application_status (is_open) VALUES (1);
        `);

  
        if (!dbExists) {
            const adminExists = await db.get('SELECT id FROM users WHERE username = ?', ['Admin']);
            if (!adminExists) {
                const adminPassword = await bcrypt.hash('FusionNetwork', 10);
                await db.run(`
                    INSERT INTO users (username, password, minecraft_username, rank)
                    VALUES ('Admin', ?, 'FusionNetwork', 'admin')
                `, [adminPassword]);
            }

     
            await db.run(`
                INSERT OR IGNORE INTO categories (name, description, order_position)
                VALUES 
                    ('Announcements', 'Official announcements from the staff team', 1),
                    ('General Discussion', 'Discuss anything related to the server', 2),
                    ('Suggestions', 'Share your ideas to improve the server', 3),
                    ('Support', 'Get help with any issues you encounter', 4)
            `);

     
            await db.run(`
                INSERT OR IGNORE INTO forums (title, description, category_id, icon)
                VALUES 
                    ('Server Announcements', 'Official server announcements and updates', 1, 'fas fa-bullhorn'),
                    ('General Discussion', 'Discuss anything about Fusion Network', 2, 'fas fa-comments'),
                    ('Suggestions Box', 'Share your ideas for server improvement', 3, 'fas fa-lightbulb'),
                    ('Help & Support', 'Get assistance with any issues', 4, 'fas fa-question-circle')
            `);
        }

        return db;
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
}

module.exports = { initializeDb, getDb }; 
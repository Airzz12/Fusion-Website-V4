const { getDb } = require('../database');

async function runMigrations() {
    const db = await getDb();
    
    try {
        // Create users table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                minecraft_username TEXT,
                avatar TEXT,
                rank TEXT DEFAULT 'member' NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                username_changed_at TIMESTAMP,
                minecraft_changed_at TIMESTAMP
            )
        `);

        // Check if minecraft_changed_at column exists
        const columns = await db.all('PRAGMA table_info(users)');
        const hasColumn = columns.some(col => col.name === 'minecraft_changed_at');
        
        if (!hasColumn) {
            await db.run(`
                ALTER TABLE users 
                ADD COLUMN minecraft_changed_at TIMESTAMP DEFAULT NULL
            `);
            console.log('Added minecraft_changed_at column');
        }

        console.log('Database migration completed successfully');
    } catch (error) {
        console.error('Migration error:', error);
        throw error;
    }
}

module.exports = { runMigrations }; 
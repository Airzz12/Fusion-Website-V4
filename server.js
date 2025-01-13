require('dotenv').config();
const express = require('express');
const { initializeDb } = require('./database');
const session = require('express-session');
const path = require('path');
const fs = require('fs');


const forumsRouter = require('./routes/forums');
const authRouter = require('./routes/auth');


const profileAuth = require('./middleware/profileAuth');

// Import SQLite session store
const SQLiteStore = require('connect-sqlite3')(session);


const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

async function startServer() {
    try {
      
        await initializeDb();
        
        const app = express();
        const PORT = process.env.PORT || 3000;

        // Middleware
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use('/public', express.static('public'));
        app.set('view engine', 'ejs');

       
        app.use(session({
            store: new SQLiteStore({
                db: 'sessions.db',
                dir: dbDir,
                table: 'sessions'
            }),
            secret: process.env.SESSION_SECRET || 'your-secret-key',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                httpOnly: true
            },
            name: 'fusionSession'
        }));

       
        app.use((req, res, next) => {
            if (req.session.user) {
                const db = require('./database').getDb();
                db.then(db => {
                    db.run('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?', [req.session.user.id]);
                }).catch(console.error);
            }
            next();
        });

        
        app.use('/api/auth', authRouter);
        app.use('/forums', forumsRouter);

     
        app.get('/login', (req, res) => {
            res.render('login', { user: req.session.user || null });
        });

        app.get('/register', (req, res) => {
            res.render('register', { user: req.session.user || null });
        });

        app.get('/profile', profileAuth, (req, res) => {
            res.render('profile', { user: req.session.user });
        });

      
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 
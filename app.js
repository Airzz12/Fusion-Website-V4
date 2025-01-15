require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const { initializeDb } = require('./database');
const SQLiteStore = require('connect-sqlite3')(session);
const fs = require('fs');
const { router: adminRouter, checkMaintenance } = require('./routes/admin');


const authRouter = require('./routes/auth');
const forumsRouter = require('./routes/forums');
const profileRouter = require('./routes/profile');
const newsRouter = require('./routes/news');
const guideRouter = require('./routes/guide');
const staffRouter = require('./routes/staff');
const toolsRouter = require('./routes/tools');
const staffRoutes = require('./routes/staff');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use('/public', express.static(path.join(__dirname, 'public')));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser());

const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

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
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000, 
        httpOnly: true,
        sameSite: 'lax'
    },
    name: 'fusionSession'
}));


app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user;
    }
    next();
});


app.use((req, res, next) => {
    if (req.session.user) {
        const db = require('./database').getDb();
        try {
            db.run('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?', [req.session.user.id]);
        } catch (error) {
            console.error('Error updating last_active:', error);
        }
    }
    next();
});


app.use(checkMaintenance);

app.use('/api/auth', authRouter);
app.use('/forums', forumsRouter);
app.use('/admin', adminRouter);
app.use('/profile', profileRouter);
app.use('/news', newsRouter);
app.use('/guide', guideRouter);
app.use('/staff', staffRouter);
app.use('/tools', toolsRouter);
app.use('/staff', staffRoutes);

app.get('/', (req, res) => {
    res.render('index', { user: req.session.user || null });
});


app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { user: null });
});

app.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('register', { user: null });
});

app.use((req, res) => {
    res.status(404).render('404', { user: req.session.user || null });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('error', { 
        error: 'Something went wrong!',
        user: req.session.user || null 
    });
});

async function startServer() {
    try {
        await initializeDb();
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 

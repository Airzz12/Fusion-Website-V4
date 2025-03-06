const express = require('express');
const router = express.Router();

const newsItems = [
    {
        id: 2,
        title: "Duels Release",
        category: "Feature",
        date: "Feb 19, 2025",
        author: "Airzz",
        description: "Challenge your friends in epic 1v1 battles with our new Duels system!",
        image: "/public/images/news/duelsrelease.png",
        content: `
            <p>We're thrilled to announce the official release of our highly anticipated Duels system! Get ready to showcase your PvP skills in intense 1v1 battles across various custom-designed arenas.</p>
            
            <h2>🎮 Features</h2>
            <ul>
                <li>Multiple game modes including Classic, UHC, and Bridge duels</li>
                <li>Custom-designed arenas for each mode</li>
                <li>Real-time leaderboards and statistics</li>
                <li>Competitive ranking system</li>
                <li>Challenge specific players or join the queue</li>
            </ul>

            <h2>🏆 Ranking System</h2>
            <p>Compete in ranked matches to climb the leaderboards! Our ELO-based ranking system ensures fair matchmaking and competitive gameplay. Start at Bronze and work your way up to the prestigious Diamond rank!</p>

            <h2>🎯 How to Play</h2>
            <ol>
                <li>Join the server at <strong>fusion-network.xyz</strong></li>
                <li>Type <code>/duel</code> to open the duels menu</li>
                <li>Select your preferred game mode</li>
                <li>Challenge a specific player or join the queue</li>
                <li>Battle it out and claim victory!</li>
            </ol>

            <h2>🎉 Launch Event</h2>
            <p>Join us this weekend for our special launch event featuring:</p>
            <ul>
                <li>Double XP for all duels</li>
                <li>Special titles for top performers</li>
                <li>Exclusive cosmetic rewards</li>
            </ul>

            <div class="article-cta">
                <p>Ready to prove your skills? Join now at <strong>fusion-network.xyz</strong> and become the ultimate duelist!</p>
            </div>
        `
    },
    {
        id: 1,
        title: "Season 9 Has Dropped!",
        category: "Update",
        date: "Jan 21, 2025",
        author: "Airzz",
        description: "New Season 9 Battle Pass has been released with major PvP improvements!",
        image: "/public/images/news/season9.png",
        content: `
            <p>Season 9 brings massive changes to our combat system, featuring a complete PvP rework, enhanced Lifesteal mechanics, and an exciting new Duels mode!</p>
            
            <h2>Combat Overhaul</h2>
            <ul>
                <li>Completely reworked PvP system for better combat flow</li>
                <li>Enhanced hit registration and combat mechanics</li>
                <li>New combat animations and effects</li>
            </ul>

            <img src="/public/images/news/season9.webp" alt="Season 9 Combat">
            <div class="image-caption">Kit Editor Preview</div>

            <h2>Lifesteal Improvements</h2>
            <p>We've completely revamped the Lifesteal system to provide a more engaging experience:</p>
            <ul>
                <li>Dynamic health stealing based on weapon type</li>
                <li>New visual effects for health absorption</li>
                <li>Balanced healing mechanics for fair gameplay</li>
            </ul>

            <h2>New Duels Mode</h2>
            <p>Challenge other players in our brand new Duels mode:</p>
            <ul>
                <li>1v1 competitive matches</li>
                <li>Multiple arena options</li>
                <li>Seasonal rankings and rewards</li>
                <li>Custom loadout selection</li>
            </ul>
        `
    },

   
];

router.get('/', (req, res) => {
    res.render('news', { 
        user: req.session.user || null,
        news: newsItems
    });
});

router.get('/load-more', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 4;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    
    const nextItems = newsItems.slice(start, end);
    res.json({ news: nextItems });
});

router.get('/:id', (req, res) => {
    const articleId = parseInt(req.params.id);
    const article = newsItems.find(item => item.id === articleId);
    
    if (!article) {
        return res.status(404).render('404', { 
            user: req.session.user || null 
        });
    }
    
    res.render('articles/template', { 
        user: req.session.user || null,
        article: article
    });
});

module.exports = router; 

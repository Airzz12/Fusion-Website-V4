const express = require('express');
const router = express.Router();

const newsItems = [
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
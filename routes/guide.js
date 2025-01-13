const express = require('express');
const router = express.Router();

const gamemodeDetails = {
    lifesteal: {
        id: 'lifesteal',
        name: 'Lifesteal',
        icon: '/public/images/guide/lifestealicon.png',
        banner: '/public/images/lifesteal.jpg',
        description: 'Battle other players in our unique Lifesteal gamemode where every hit steals health from your opponents.',
        content: `
            <h2>How It Works</h2>
            <p>In Lifesteal, every time you damage another player, you steal a portion of their health. If a player dies, they lose one of their hearts permanently!</p>

            <h2>Key Features</h2>
            <ul>
                <li>Heart stealing mechanics</li>
                <li>Custom shop system</li>
                <li>Player auctions</li>
                <li>Special abilities and enchantments</li>
            </ul>

            <h2>Getting Started</h2>
            <p>When you first join, you'll start with 10 hearts. Here's what you need to know:</p>
            <ul>
                <li>Kill players to steal their hearts</li>
                <li>Visit the shop to buy materials and items</li>
                <li>Use /ah to access the auction house</li>
                <li>Form alliances to protect your hearts</li>
            </ul>

            <h2>Commands</h2>
            <div class="commands-list">
                <div class="command-item">
                    <code>/shop</code>
                    <span>Access the server shop for materials</span>
                </div>
                <div class="command-item">
                    <code>/ah</code>
                    <span>Open the auction house</span>
                </div>
                <div class="command-item">
                    <code>/spawn</code>
                    <span>Return to spawn</span>
                </div>
            </div>
        `
    },
    pvp: {
        id: 'pvp',
        name: 'PvP',
        icon: '/public/images/guide/pvpicon.png',
        banner: '/public/images/pvp.png',
        description: 'Experience intense PvP combat across multiple unique gamemodes, each with their own distinct playstyle and strategy.',
        content: `
            <h2>Main Gamemodes</h2>
            <div class="gamemode-list">
                <div class="gamemode-item">
                    <h3>Nethpot</h3>
                    <p>Classic Netherite combat with potions. Master the art of potion management and strategic engagements.</p>
                </div>
                
                <div class="gamemode-item">
                    <h3>Diamondpot</h3>
                    <p>Traditional diamond armor combat with potions. Perfect balance of defense and offensive capabilities.</p>
                </div>
                
                <div class="gamemode-item">
                    <h3>UHC</h3>
                    <p>No natural regeneration, golden apples and heads are key. Test your survival and PvP skills.</p>
                </div>
                
                <div class="gamemode-item">
                    <h3>SmpKit</h3>
                    <p>SMP-style combat with custom kits. Experience realistic survival combat scenarios.</p>
                </div>
                
                <div class="gamemode-item">
                    <h3>Crystal PvP</h3>
                    <p>End crystal combat with advanced mechanics. Master the art of crystal placement and timing.</p>
                </div>
                
                <div class="gamemode-item">
                    <h3>Axe and Shield</h3>
                    <p>Combat focused on axes and shields. Test your blocking timing and axe critical hits.</p>
                </div>
                
                <div class="gamemode-item">
                    <h3>Swords</h3>
                    <p>Pure sword combat with no shields. Focus on movement and combo mechanics.</p>
                </div>
            </div>

            <h2>Honourable Mentions</h2>
            <div class="gamemode-list">
                <div class="gamemode-item">
                    <h3>Mace PvP</h3>
                    <p>Unique combat style featuring custom mace weapons with special abilities.</p>
                </div>
                
                <div class="gamemode-item">
                    <h3>Fusion Manhunt</h3>
                    <p>Our unique take on Manhunt with Fusion Network twists and custom mechanics.</p>
                </div>
            </div>

            <h2>Getting Started</h2>
            <div class="gamemode-list">
                <div class="gamemode-item">
                    <h3>Nethpot & Diamondpot</h3>
                    <p>Start with /kit pot and practice your pot accuracy in our training arena</p>
                </div>
                
                <div class="gamemode-item">
                    <h3>UHC & SmpKit</h3>
                    <p>Use /kit uhc or /kit smp to get started with survival-based combat</p>
                </div>
                
                <div class="gamemode-item">
                    <h3>Crystal PvP</h3>
                    <p>Begin with /kit crystal and learn crystal placement in the practice area</p>
                </div>
                
                <div class="gamemode-item">
                    <h3>Axe and Shield & Swords</h3>
                    <p>Get your gear with /kit axe or /kit sword and master combat mechanics</p>
                </div>
            </div>

            <h2>Commands</h2>
            <div class="commands-list">
                <div class="command-item">
                    <code>/kit [gamemode]</code>
                    <span>Get your gamemode-specific kit</span>
                </div>
                <div class="command-item">
                    <code>/spawn</code>
                    <span>Return to the main spawn area</span>
                </div>
            </div>
        `
    }
};


router.get('/', (req, res) => {
    res.render('guide', {
        user: req.session.user || null,
        gamemodes: Object.values(gamemodeDetails)
    });
});

router.get('/:mode', (req, res) => {
    const mode = gamemodeDetails[req.params.mode];
    
    if (!mode) {
        return res.status(404).render('404', { 
            user: req.session.user || null 
        });
    }
    
    res.render('guide/mode', { 
        user: req.session.user || null,
        mode: mode
    });
});

module.exports = router; 
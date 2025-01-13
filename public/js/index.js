document.addEventListener('DOMContentLoaded', function() {
    // Server status code
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // Initialize server status
    getServerStatus();
    getDiscordStatus();
    
    // Update status every minute
    setInterval(() => {
        getServerStatus();
        getDiscordStatus();
    }, 60000);

    // Add event listeners for modals
    const joinButton = document.querySelector('.join-button');
    const closeJoinModalButton = document.querySelector('.close-join-modal');
    const modalOkButton = document.querySelector('.modal-ok-button');
    const joinModalOverlay = document.querySelector('.join-modal-overlay');
    const joinModal = document.querySelector('.join-modal');

    if (joinButton) {
        joinButton.removeEventListener('click', showJoinModal);
        joinButton.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = document.querySelector('.join-modal');
            const overlay = document.querySelector('.join-modal-overlay');
            if (modal && overlay) {
                overlay.style.display = 'flex';
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (closeJoinModalButton) {
        closeJoinModalButton.removeEventListener('click', closeJoinModal);
        closeJoinModalButton.addEventListener('click', function() {
            const modal = document.querySelector('.join-modal');
            const overlay = document.querySelector('.join-modal-overlay');
            if (modal && overlay) {
                overlay.style.display = 'none';
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    if (modalOkButton) {
        modalOkButton.addEventListener('click', closeJoinModal);
    }

    // Close modal when clicking outside
    if (joinModalOverlay) {
        joinModalOverlay.addEventListener('click', function(e) {
            if (e.target === joinModalOverlay) {
                const modal = document.querySelector('.join-modal');
                if (modal) {
                    joinModalOverlay.style.display = 'none';
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            }
        });
    }

    // Handle Discord status widget click
    const discordStatus = document.getElementById('discord-status');
    if (discordStatus) {
        discordStatus.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('https://discord.gg/fusion-network-893030510073348146', '_blank');
        });
    }
});

// Server status function
async function getServerStatus() {
    const statusElement = document.getElementById("server-status");
    const playerCountElement = document.getElementById("player-count");
    
    if (!statusElement || !playerCountElement) return;
    
    const apiUrl = "https://api.mcstatus.io/v2/status/java/fusion-network.xyz";
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const statusText = statusElement.querySelector(".status-text");
        const countText = playerCountElement.querySelector(".count-text");

        if (data.online) {
            statusElement.classList.add("online");
            statusElement.classList.remove("offline");
            statusText.textContent = "Online";
            countText.textContent = `${data.players.online} / ${data.players.max}`;
        } else {
            statusElement.classList.add("offline");
            statusElement.classList.remove("online");
            statusText.textContent = "Offline";
            countText.textContent = "-";
        }
    } catch (error) {
        console.error("Error fetching server status:", error);
    }
}

// Discord status function
async function getDiscordStatus() {
    const widgetUrl = "https://discord.com/api/guilds/893030510073348146/widget.json";
    try {
        const response = await fetch(widgetUrl);
        const data = await response.json();

        const discordStatusElement = document.getElementById("discord-status");
        if (discordStatusElement) {
            const discordCountText = discordStatusElement.querySelector(".discord-count-text");
            if (discordCountText) {
                if (data.presence_count !== undefined) {
                    discordCountText.textContent = `${data.presence_count} online`;
                } else {
                    discordCountText.textContent = "Unable to fetch";
                }
            }
        }
    } catch (error) {
        console.error("Error fetching Discord status:", error);
        const discordElement = document.getElementById("discord-status");
        if (discordElement) {
            const countText = discordElement.querySelector(".discord-count-text");
            if (countText) {
                countText.textContent = "Error";
            }
        }
    }
}

// Modal functions
function showJoinModal() {
    const modal = document.querySelector('.join-modal');
    const overlay = document.querySelector('.join-modal-overlay');
    if (modal && overlay) {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeJoinModal() {
    const modal = document.querySelector('.join-modal');
    const overlay = document.querySelector('.join-modal-overlay');
    if (modal && overlay) {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyModal();
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showCopyModal();
        } catch (err) {
            console.error('Failed to copy:', err);
        }
        document.body.removeChild(textArea);
    });
}

function showCopyModal() {
    const toast = document.getElementById('copyToast');
    if (toast) {
        toast.classList.add('show');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

function updateActivity() {
    if (document.cookie.includes('token')) {
        fetch('/api/auth/update-activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(error => console.error('Error updating activity:', error));
    }
}

// Update activity every 2 minutes
setInterval(updateActivity, 120000);
// Initial update
updateActivity();

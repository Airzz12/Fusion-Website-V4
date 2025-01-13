document.addEventListener('DOMContentLoaded', function() {
    // Fix modal event listener
    const usernameModal = document.getElementById('usernameModal');
    const minecraftModal = document.getElementById('minecraftModal');

    if (usernameModal) {
        usernameModal.addEventListener('click', (e) => {
            if (e.target === usernameModal) {
                closeUsernameModal();
            }
        });
    }

    if (minecraftModal) {
        minecraftModal.addEventListener('click', (e) => {
            if (e.target === minecraftModal) {
                closeMinecraftModal();
            }
        });
    }
    
    checkUsernameCooldown();
    checkMinecraftCooldown();
    
    // Add smooth scroll reveal animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all info items
    document.querySelectorAll('.info-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.6s ease';
        observer.observe(item);
    });

    // Add class for animation
    document.querySelectorAll('.info-item').forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('revealed');
        }, 200 * (index + 1));
    });

    // Update cooldowns every minute
    setInterval(() => {
        checkUsernameCooldown();
        checkMinecraftCooldown();
    }, 60000);
});

function showUsernameModal() {
    document.getElementById('usernameModal').classList.add('active');
}

function closeUsernameModal() {
    document.getElementById('usernameModal').classList.remove('active');
}

function showMinecraftModal() {
    document.getElementById('minecraftModal').classList.add('active');
}

function closeMinecraftModal() {
    document.getElementById('minecraftModal').classList.remove('active');
}

async function checkUsernameCooldown() {
    try {
        const response = await fetch('/api/auth/username-cooldown');
        const data = await response.json();
        
        const usernameBtn = document.getElementById('change-username-btn');
        if (!usernameBtn) return;

        if (!data.canChange) {
            usernameBtn.disabled = true;
            const countdownDisplay = document.createElement('span');
            countdownDisplay.className = 'countdown';
            usernameBtn.innerHTML = `
                <i class="fas fa-user-edit"></i>
                Change Username (<span class="countdown"></span>)
            `;
            updateCooldownTimer(data.nextChangeDate);
        } else {
            usernameBtn.disabled = false;
            usernameBtn.innerHTML = `
                <i class="fas fa-user-edit"></i>
                Change Username
            `;
        }
    } catch (error) {
        console.error('Error checking username cooldown:', error);
    }
}

function updateCooldownTimer(nextChangeDate) {
    const countdownElement = document.querySelector('.countdown');
    if (!countdownElement) return;

    // Clear existing interval if any
    if (window.cooldownInterval) {
        clearInterval(window.cooldownInterval);
    }

    function updateTimer() {
        const now = new Date().getTime();
        const changeTime = new Date(nextChangeDate).getTime();
        const distance = changeTime - now;

        if (distance < 0) {
            if (window.cooldownInterval) {
                clearInterval(window.cooldownInterval);
            }
            checkUsernameCooldown();
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Format the time string
        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (hours > 0 || days > 0) timeString += `${hours}h `;
        if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m `;
        timeString += `${seconds}s`;

        countdownElement.textContent = timeString;
    }

    // Update immediately and start interval
    updateTimer();
    window.cooldownInterval = setInterval(updateTimer, 1000);
}

async function checkMinecraftCooldown() {
    try {
        const response = await fetch('/api/auth/minecraft-cooldown');
        const data = await response.json();
        
        const minecraftBtn = document.getElementById('link-minecraft-btn');
        if (!minecraftBtn) return;

        if (!data.canChange) {
            minecraftBtn.disabled = true;
            minecraftBtn.style.pointerEvents = 'none'; // Prevent hover
            minecraftBtn.innerHTML = `
                <i class="fas fa-gamepad"></i>
                Change Minecraft (<span class="minecraft-countdown"></span>)
            `;
            updateMinecraftCooldownTimer(data.nextChangeDate);
        } else {
            minecraftBtn.disabled = false;
            minecraftBtn.style.pointerEvents = 'auto'; // Enable hover
            minecraftBtn.innerHTML = `
                <i class="fas fa-gamepad"></i>
                ${document.querySelector('.minecraft-username')?.textContent?.includes('Not linked') ? 'Link Minecraft Account' : 'Change Minecraft Account'}
            `;
        }
    } catch (error) {
        console.error('Error checking Minecraft cooldown:', error);
    }
}

function updateMinecraftCooldownTimer(nextChangeDate) {
    const countdownElement = document.querySelector('.minecraft-countdown');
    if (!countdownElement) return;

    if (window.minecraftCooldownInterval) {
        clearInterval(window.minecraftCooldownInterval);
    }

    function updateTimer() {
        const now = new Date().getTime();
        const changeTime = new Date(nextChangeDate).getTime();
        const distance = changeTime - now;

        if (distance < 0) {
            if (window.minecraftCooldownInterval) {
                clearInterval(window.minecraftCooldownInterval);
            }
            checkMinecraftCooldown();
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (hours > 0 || days > 0) timeString += `${hours}h `;
        if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m `;
        timeString += `${seconds}s`;

        countdownElement.textContent = timeString;
    }

    updateTimer();
    window.minecraftCooldownInterval = setInterval(updateTimer, 1000);
}

function formatTimeRemaining(ms) {
    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return { days, hours, minutes };
}

function showPopup(message, type = 'success') {
    const popup = document.createElement('div');
    popup.className = `popup ${type}`;
    popup.textContent = message;
    document.body.appendChild(popup);

    // Add styles if they don't exist
    if (!document.querySelector('#popup-styles')) {
        const style = document.createElement('style');
        style.id = 'popup-styles';
        style.textContent = `
            .popup {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 5px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                animation: slideIn 0.5s ease-out;
            }
            .popup.success {
                background-color: #4CAF50;
            }
            .popup.error {
                background-color: #f44336;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Remove popup after 3 seconds
    setTimeout(() => {
        popup.style.animation = 'slideIn 0.5s ease-out reverse';
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}

document.getElementById('username-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newUsername = document.getElementById('new-username').value;
    
    try {
        const response = await fetch('/api/auth/change-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newUsername })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showPopup('Username updated successfully!', 'success');
            closeUsernameModal();
            // Reload the page after a short delay to show updated username
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showPopup(data.error || 'Failed to update username', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showPopup('Failed to update username', 'error');
    }
});

document.getElementById('minecraft-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const minecraftUsername = document.getElementById('minecraft-username').value;
    try {
        const response = await fetch('/api/auth/update-minecraft', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ minecraftUsername })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showPopup('Minecraft account updated successfully!', 'success');
            setTimeout(() => window.location.reload(), 2000);
        } else {
            showPopup(data.error || 'Failed to update Minecraft account', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showPopup('Failed to update Minecraft account', 'error');
    }
});

document.head.insertAdjacentHTML('beforeend', `
    <style>
        .info-item.revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        @keyframes pulseButton {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        #change-username-btn:not(:disabled) {
            animation: pulseButton 2s infinite;
        }
        .cooldown-text {
            font-size: 0.9em;
        }
        .countdown {
            font-weight: bold;
        }
        .countdown {
            font-weight: bold;
            color: #fff;
            margin-left: 4px;
        }
        #change-username-btn {
            min-width: 200px;
            text-align: center;
        }
        #change-username-btn:disabled {
            opacity: 0.8;
        }
        .minecraft-countdown {
            font-weight: bold;
            color: #fff;
            margin-left: 4px;
        }
        #link-minecraft-btn {
            min-width: 200px;
            text-align: center;
        }
        #link-minecraft-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            pointer-events: none !important;
            background: #4b4b4b;
            transform: none !important;
            box-shadow: none !important;
        }
    </style>
`); 
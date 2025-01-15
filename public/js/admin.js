
function showPromoteModal() {
    const modal = document.getElementById('promoteModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closePromoteModal() {
    const modal = document.getElementById('promoteModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function showDemoteModal() {
    const modal = document.getElementById('demoteModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeDemoteModal() {
    const modal = document.getElementById('demoteModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function showResetPasswordModal() {
    const modal = document.getElementById('resetPasswordModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeResetPasswordModal() {
    const modal = document.getElementById('resetPasswordModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function showUserManagement() {
    const modal = document.getElementById('userManagementModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function showApplicationControl() {
    const modal = document.getElementById('applicationControlModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeApplicationControl() {
    const modal = document.getElementById('applicationControlModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function viewApplications() {
   
    window.location.href = '/staff/applications';
}

function closeUserManagement() {
    const modal = document.getElementById('userManagementModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

async function resetApplications() {
    if (confirm('Are you sure you want to reset all applications? This action cannot be undone.')) {
        try {
            const response = await fetch('/admin/reset-applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                showNotification('success', 'All applications have been reset successfully');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                showNotification('error', data.error || 'Failed to reset applications');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', 'Failed to reset applications. Please try again.');
        }
    }
}

function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <p>${message}</p>
    `;
    document.body.appendChild(notification);

   
    setTimeout(() => {
        notification.remove();
    }, 3000);
}


document.addEventListener('DOMContentLoaded', () => {

    const promoteForm = document.getElementById('promote-form');
    if (promoteForm) {
        promoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const username = document.getElementById('promote-username').value;
                const newRank = document.getElementById('promote-rank').value;

                if (!username || !newRank) {
                    showNotification('error', 'Please fill in all fields');
                    return;
                }

                const response = await fetch('/admin/promote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, newRank })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('success', data.message);
                    closePromoteModal();
                 
                    promoteForm.reset();
                } else {
                    showNotification('error', data.error || 'Failed to promote user');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('error', 'Failed to promote user');
            }
        });
    }



    const demoteForm = document.getElementById('demote-form');
    if (demoteForm) {
        demoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const username = document.getElementById('demote-username').value;
                const newRank = document.getElementById('demote-rank').value;

                if (!username || !newRank) {
                    showNotification('error', 'Please fill in all fields');
                    return;
                }

                const response = await fetch('/admin/demote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, newRank })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('success', data.message);
                    closeDemoteModal();
                   
                    demoteForm.reset();
                } else {
                    showNotification('error', data.error || 'Failed to demote user');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('error', 'Failed to demote user');
            }
        });
    }

    
    const resetPasswordForm = document.getElementById('reset-password-form');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const username = document.getElementById('reset-username').value;
                const newPassword = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;

                if (!username || !newPassword || !confirmPassword) {
                    showNotification('error', 'Please fill in all fields');
                    return;
                }

                if (newPassword !== confirmPassword) {
                    showNotification('error', 'Passwords do not match');
                    return;
                }

                const response = await fetch('/admin/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, newPassword })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('success', data.message);
                    closeResetPasswordModal();
                   
                    resetPasswordForm.reset();
                } else {
                    showNotification('error', data.error || 'Failed to reset password');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('error', 'Failed to reset password');
            }
        });
    }
});

async function toggleApplications(status) {
    try {
        const response = await fetch('/staff/toggle-applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('success', `Applications ${status === 'open' ? 'opened' : 'closed'} successfully`);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            showNotification('error', data.error || 'Failed to update application status');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('error', 'Failed to update application status');
    }
}

function showSiteSettings() {
    const modal = document.getElementById('siteSettingsModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSiteSettings() {
    const modal = document.getElementById('siteSettingsModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

async function saveSiteSettings() {
    const maintenanceMode = document.getElementById('maintenanceMode').checked;
    
    try {
        const response = await fetch('/admin/site-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                maintenanceMode
            })
        });

        if (response.ok) {
            alert('Settings saved successfully!');
            closeSiteSettings();
        
            window.location.reload();
        } else {
            alert('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings');
    }
}

async function handleApplication(id, action) {
    try {
        const response = await fetch(`/staff/applications/${id}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (data.success) {
            location.reload();
        } else {
            console.error('Failed to update application:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

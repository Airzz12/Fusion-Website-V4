document.addEventListener('DOMContentLoaded', () => {
    const createForumForm = document.getElementById('create-forum-form');
    const createForumModal = document.getElementById('createForumModal');

    // Show/Hide forum creation modal
    window.showCreateForumModal = () => {
        const modal = document.getElementById('createForumModal');
        if (modal) {
            modal.classList.add('active');
        }
    };

    window.closeCreateForumModal = () => {
        const modal = document.getElementById('createForumModal');
        const form = document.getElementById('create-forum-form');
        if (modal) {
            modal.classList.remove('active');
            if (form) form.reset();
        }
    };

    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('createForumModal');
        if (e.target === modal) {
            closeCreateForumModal();
        }
    });

    // Handle forum creation
    if (createForumForm) {
        createForumForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                title: document.getElementById('forum-title').value.trim(),
                description: document.getElementById('forum-description').value.trim(),
                categoryId: parseInt(document.getElementById('forum-category').value),
                icon: document.getElementById('forum-icon').value
            };

            // Validate form data
            if (!formData.title || !formData.description || !formData.categoryId) {
                showPopup('Please fill in all required fields', 'error');
                return;
            }

            console.log('Sending form data:', formData); // Debug log

            try {
                const response = await fetch('/forums/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to create forum');
                }

                const data = await response.json();
                showPopup('Forum created successfully!', 'success');
                closeCreateForumModal();
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                console.error('Error:', error);
                showPopup(error.message || 'Failed to create forum', 'error');
            }
        });
    }
});

// Popup notification function
function showPopup(message, type = 'success') {
    const popup = document.createElement('div');
    popup.className = `popup ${type}`;
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => popup.classList.add('show'), 100);
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

// Add this function to handle replies
async function handleReply(event, threadId) {
    event.preventDefault();
    const form = event.target;
    const content = form.querySelector('textarea').value;

    try {
        const response = await fetch('/api/forums/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                threadId,
                content
            })
        });

        const data = await response.json();

        if (response.ok) {
            showPopup('Reply posted successfully!', 'success');
            form.reset();
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showPopup(data.error || 'Failed to post reply', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showPopup('Failed to post reply', 'error');
    }
}

// Add these functions for forum management
async function deleteForum(forumId) {
    if (!confirm('Are you sure you want to delete this forum?')) return;

    try {
        const response = await fetch(`/forums/${forumId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok) {
            showPopup('Forum deleted successfully', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showPopup(data.error || 'Failed to delete forum', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showPopup('Failed to delete forum', 'error');
    }
}

async function editForum(forumId) {
    const modal = document.getElementById('editForumModal');
    const titleInput = document.getElementById('edit-forum-title');
    const descInput = document.getElementById('edit-forum-description');
    
    try {
        const response = await fetch(`/forums/${forumId}`);
        const forum = await response.json();
        
        titleInput.value = forum.title;
        descInput.value = forum.description;
        document.getElementById('edit-forum-id').value = forumId;
        
        modal.classList.add('active');
    } catch (error) {
        console.error('Edit error:', error);
        showPopup('Failed to load forum data', 'error');
    }
}

// Show edit modal
window.showEditModal = (forumId, title, description) => {
    const modal = document.getElementById('editForumModal');
    document.getElementById('edit-forum-id').value = forumId;
    document.getElementById('edit-forum-title').value = title;
    document.getElementById('edit-forum-description').value = description;
    modal.classList.add('active');
};

// Show reply modal
window.showReplyModal = (forumId) => {
    const modal = document.getElementById('replyModal');
    document.getElementById('forum-id').value = forumId;
    modal.classList.add('active');
};

// Close modals
window.closeEditModal = () => {
    document.getElementById('editForumModal').classList.remove('active');
};

window.closeReplyModal = () => {
    document.getElementById('replyModal').classList.remove('active');
    document.getElementById('reply-content').value = '';
};

document.getElementById('reply-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const forumId = document.getElementById('forum-id').value;
    const content = document.getElementById('reply-content').value;

    try {
        const response = await fetch(`/forums/${forumId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        const data = await response.json();
        if (response.ok) {
            showPopup('Reply posted successfully', 'success');
            closeReplyModal();
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showPopup(data.error || 'Failed to post reply', 'error');
        }
    } catch (error) {
        console.error('Reply error:', error);
        showPopup('Failed to post reply', 'error');
    }
});

// Toggle replies visibility
function toggleReplies(forumId) {
    const repliesContainer = document.getElementById(`replies-${forumId}`);
    repliesContainer.style.display = repliesContainer.style.display === 'none' ? 'block' : 'none';
}

// Add edit form submit handler
document.getElementById('edit-forum-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const forumId = document.getElementById('edit-forum-id').value;
    const title = document.getElementById('edit-forum-title').value;
    const description = document.getElementById('edit-forum-description').value;

    try {
        const response = await fetch(`/forums/${forumId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description })
        });

        const data = await response.json();
        if (response.ok) {
            showPopup('Forum updated successfully', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showPopup(data.error || 'Failed to update forum', 'error');
        }
    } catch (error) {
        console.error('Edit error:', error);
        showPopup('Failed to update forum', 'error');
    }
});

function closeEditModal() {
    document.getElementById('editForumModal').classList.remove('active');
} 
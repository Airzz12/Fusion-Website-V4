function confirmDelete() {
    const modal = document.createElement('div');
    modal.className = 'delete-modal';
    modal.innerHTML = `
        <div class="delete-modal-content">
            <h2><i class="fas fa-exclamation-triangle"></i> Delete Account</h2>
            <p>Are you absolutely sure you want to delete your account? This action cannot be undone.</p>
            <div class="delete-modal-buttons">
                <button onclick="closeDeleteModal()" class="cancel-button">Cancel</button>
                <button onclick="deleteAccount()" class="confirm-delete-button">Yes, Delete My Account</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeDeleteModal() {
    const modal = document.querySelector('.delete-modal');
    if (modal) {
        modal.remove();
    }
}

async function deleteAccount() {
    try {
        const response = await fetch('/profile/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            window.location.href = '/';
        } else {
            throw new Error('Failed to delete account');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account. Please try again.');
    }
} 

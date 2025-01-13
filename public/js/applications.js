async function viewApplication(id) {
    console.log("Viewing application:", id);
    const modal = document.getElementById('applicationModal');
    const detailsContainer = document.getElementById('applicationDetails');
    
    try {
        const response = await fetch(`/staff/application/${id}`);
        const data = await response.json();
        
        console.log("Raw application data:", data);
        
        if (data) {
            detailsContainer.innerHTML = `
                <div class="application-details">
                    <div class="applicant-header">
                        <img src="https://mc-heads.net/avatar/${data.minecraft_username || 'steve'}" alt="${data.username}" class="mc-avatar">
                        <div class="applicant-info">
                            <h3>${data.username}</h3>
                            <span class="timestamp">Applied: ${new Date(data.created_at).toLocaleString()}</span>
                        </div>
                        <span class="status-badge ${data.status}">${data.status}</span>
                    </div>
                    
                    <div class="application-responses">
                        <div class="response-group">
                            <h4>In-Game & Discord Information</h4>
                            <p>${data.in_game_name || 'No response provided'}</p>
                        </div>

                        <div class="response-group">
                            <h4>Motivation</h4>
                            <p>${data.reason || 'No response provided'}</p>
                        </div>
                        
                        <div class="response-group">
                            <h4>Scenario Response</h4>
                            <p>${data.scenario || 'No response provided'}</p>
                        </div>
                        
                        <div class="response-group">
                            <h4>Availability</h4>
                            <p>${data.availability || 'No response provided'}</p>
                        </div>
                        
                        <div class="response-group">
                            <h4>Previous Experience</h4>
                            <p>${data.experience || 'No response provided'}</p>
                        </div>
                    </div>
                    
                    <div class="application-actions">
                        <button onclick="updateApplicationStatus(${data.id}, 'accepted')" class="accept-btn">
                            <i class="fas fa-check"></i> Accept
                        </button>
                        <button onclick="updateApplicationStatus(${data.id}, 'rejected')" class="reject-btn">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </div>
                </div>
            `;
            
            modal.style.display = 'flex';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        console.error('Error fetching application:', error);
        console.log('Full error:', error);
    }
}

function closeApplicationModal() {
    const modal = document.getElementById('applicationModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Initialize modal events
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('applicationModal');
    if (modal) {
        // Close when clicking outside the modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeApplicationModal();
            }
        });

        // Prevent modal content clicks from closing
        const modalContent = modal.querySelector('.modal');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeApplicationModal();
        }
    });
}); 
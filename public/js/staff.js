document.getElementById('applicationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        inGameName: form.querySelector('[name="inGameName"]').value.trim(),
        why: form.querySelector('[name="why"]').value.trim(),
        scenario: form.querySelector('[name="scenario"]').value.trim(),
        availability: form.querySelector('[name="availability"]').value.trim(),
        experience: form.querySelector('[name="experience"]').value.trim()
    };

    // Validate all fields are filled
    for (const [key, value] of Object.entries(formData)) {
        if (!value) {
            alert(`Please fill in all fields`);
            return;
        }
    }

    try {
        const response = await fetch('/staff/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            // Show success message with animation
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message animate-fade-in';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <p>${data.message}</p>
            `;
            form.appendChild(successMessage);

            // Disable form to prevent double submission
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            alert(data.error || 'Failed to submit application');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to submit application. Please try again.');
    }
}); 
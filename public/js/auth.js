document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.querySelector('.auth-form');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    authForm.insertBefore(errorMessage, authForm.firstChild);

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        
        const formData = new FormData(authForm);
        const username = formData.get('username');
        const password = formData.get('password');
        
        if (username.length < 3 || username.length > 16) {
            errorMessage.textContent = 'Username must be between 3 and 16 characters';
            errorMessage.style.display = 'block';
            return;
        }

        if (password.length < 3) {
            errorMessage.textContent = 'Password must be at least 3 characters';
            errorMessage.style.display = 'block';
            return;
        }

        const data = {
            username: username,
            password: password
        };

        const isLogin = !formData.has('minecraft-username');
        
        if (!isLogin) {
            const minecraftUsername = formData.get('minecraft-username');
            if (minecraftUsername && (minecraftUsername.length < 3 || minecraftUsername.length > 16)) {
                errorMessage.textContent = 'Minecraft username must be between 3 and 16 characters';
                errorMessage.style.display = 'block';
                return;
            }
            data.minecraftUsername = minecraftUsername;
        }
        
        try {
            const response = await fetch(`/api/auth/${isLogin ? 'login' : 'register'}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error);
            }

            if (isLogin) {
                window.location.href = '/';
            } else {
                window.location.href = '/login?registered=true';
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });

    // Show success message if redirected after registration
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered')) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Registration successful! Please login.';
        successMessage.style.display = 'block';
        authForm.insertBefore(successMessage, authForm.firstChild);
    }
}); 
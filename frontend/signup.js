document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            // Redirect to index.html on successful signup
            window.location.href = 'index.html';
        } else {
            alert('Error during signup');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => { // Changed to 'loginForm'
    e.preventDefault(); // Prevent default form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const result = await response.json(); // Assuming the response contains user info
            localStorage.setItem('username', result.username); // Store the username in local storage
            window.location.href = 'index.html';
        } else {
            const result = await response.json(); // Get the error message
            alert(result.message || 'Error during login');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.'); // User-friendly error message
    }
});

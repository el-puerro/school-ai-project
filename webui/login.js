// Einfaches Login-Skript
const users = {
    admin: {
        password: 'admin',
        role: 'admin'
    },
    user: {
        password: 'user',
        role: 'user'
    }
};

function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (users[username] && users[username].password === password) {
        // Login erfolgreich
        sessionStorage.setItem('user', username);
        window.location.href = 'settings.html';
    } else {
        alert('Falscher Benutzername oder Passwort!');
    }
}

document.getElementById('login-form').addEventListener('submit', login);
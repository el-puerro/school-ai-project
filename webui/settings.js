// JavaScript-Datei für die Einstellungsseite

document.addEventListener('DOMContentLoaded', function () {
    // Überprüfen, ob der Benutzer eingeloggt ist
    if (!sessionStorage.getItem('user')) {
        window.location.href = 'login.html';
    }

    // Zieltemperatur aus dem lokalen Speicher laden und im Formular anzeigen
    const storedTargetTemp = localStorage.getItem('targetTemp');
    if (storedTargetTemp) {
        document.getElementById('target-temp-input').value = storedTargetTemp;
    }

    // Event-Listener für das Temperaturformular
    document.getElementById('temp-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const newTargetTemp = document.getElementById('target-temp-input').value;
        localStorage.setItem('targetTemp', newTargetTemp);

        // Daten generieren
        fetch('https://37.120.170.56:31432/v1/gen?usertemp=' + encodeURIComponent(newTargetTemp), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors' // Stelle sicher, dass CORS-Requests erlaubt sind
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP-Status: ${response.status} (${response.statusText})`);
                }
                return response.json(); // Gehe davon aus, dass die Antwort JSON ist
            })
            .then(() => {
                // Training starten
                return fetch('https://37.120.170.56:31432/v1/train', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    mode: 'cors', // Stelle sicher, dass CORS-Requests erlaubt sind
                    body: JSON.stringify({ usertemp: newTargetTemp }) // Sende die gewünschte Temperatur im Body
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP-Status: ${response.status} (${response.statusText})`);
                }
                return response.json(); // Gehe davon aus, dass die Antwort JSON ist
            })
            .then(data => {
                alert('Training abgeschlossen. Modell aktualisiert.');
            })
            .catch(error => {
                console.error('Fehler beim Training des Modells:', error);
                alert('Fehler beim Training des Modells: ' + error.message);
            });
    });

    // Event-Listener für den Zurück-Button
    document.getElementById('back-btn').addEventListener('click', function () {
        window.location.href = 'index.html';
    });

    // Event-Listener für das Passwortänderungsformular
    document.getElementById('password-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;
        if (oldPassword === 'user' && newPassword) {
            users['user'].password = newPassword;
            alert('Passwort erfolgreich geU+00E4ndert!');
        } else {
            alert('Falsches altes Passwort oder neues Passwort nicht gesetzt!');
        }
    });
});
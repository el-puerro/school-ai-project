document.addEventListener('DOMContentLoaded', function () {

    // Event-Listener für Einstellungs-Button
    document.getElementById('settings-btn').addEventListener('click', function () {
        window.location.href = 'settings.html';
    });

    // Funktion zum Abrufen der aktuellen Zieltemperatur
    function getCurrentTargetTemp() {
        // Hier würde der Code stehen, um die aktuelle Zieltemperatur vom Server zu holen
        // Da wir noch keinen Server haben, verwenden wir einen Dummy-Wert
        const storedTargetTemp = localStorage.getItem('targetTemp') || '20'; // Dummy-Zieltemperatur oder aus dem lokalen Speicher
        return storedTargetTemp;
    }

    // Funktion zum Aktualisieren der Zieltemperaturanzeige
    function updateTargetTempDisplay() {
        document.getElementById('target-temp').textContent = getCurrentTargetTemp();
    }

    // Aktuelle Zieltemperatur beim Laden der Seite anzeigen
    updateTargetTempDisplay();
    // Dummy-Daten generieren
    const targetTemperature = parseFloat(getCurrentTargetTemp());
    const dummyData = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00 Uhr`),
        datasets: [
            {
                label: 'Aktuelle Temperatur (\u00B0C)',
                data: [],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Zieltemperatur (\u00B0C)',
                data: Array.from({ length: 24 }, () => targetTemperature),
                fill: false,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            },
            {
                label: 'Vorlauftemperatur (\u00B0C)',
                data: [],
                fill: false,
                borderColor: 'rgb(255, 205, 86)',
                tension: 0.1
            }
        ]
    };

    // Simulierte Temperaturwerte
    let currentTemperature = targetTemperature; // Startwert für die aktuelle Temperatur
    for (let i = 0; i < 24; i++) {
        let heatingTemperature;
        // Zwischen 9 und 15 Uhr fällt die Temperatur, wenn sie über 17°C liegt
        if (i >= 9 && i <= 15 && currentTemperature > 17) {
            currentTemperature -= Math.random() * 0.5; // Temperatur fällt langsam
            heatingTemperature = 30; // Minimale Vorlauftemperatur, um unter 17°C zu vermeiden
        } else {
            // Heizlogik für den Rest des Tages
            if (currentTemperature < targetTemperature) {
                currentTemperature += Math.random() * 0.5; // Temperatur steigt
                heatingTemperature = currentTemperature + Math.random() * 20 + 10; // Vorlauftemperatur ist höher
            } else {
                currentTemperature -= Math.random() * 0.3; // Temperatur fällt leicht
                heatingTemperature = 30; // Minimale Vorlauftemperatur
            }
        }
        dummyData.datasets[0].data.push(currentTemperature.toFixed(2));
        dummyData.datasets[2].data.push(heatingTemperature.toFixed(2));
    }

    // Diagramm-Größe festlegen
    const chartSize = {
        height: 900,
        width: 1800
    };

    // Diagramm erstellen
    const ctx = document.getElementById('temp-chart').getContext('2d');
    const temperatureChart = new Chart(ctx, {
        type: 'line',
        data: dummyData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: 0, // oder ein anderer Wert, der für Ihre Daten sinnvoll ist
                    // Wenn Sie einen festen Mindestwert möchten, verwenden Sie 'min' statt 'suggestedMin'
                    // min: 10
                }
            }
        }
    });


    // Setzen Sie die Größe des Canvas direkt
    //ctx.canvas.width = 1800;
    //ctx.canvas.height = 900;

    document.getElementById('temperature-chart').style.height = `${chartSize.height}px`;
    document.getElementById('temperature-chart').style.width = `${chartSize.width}px`;

    // Aktuelle Zieltemperatur anzeigen
    document.getElementById('target-temp').textContent = getCurrentTargetTemp();

    // Diagramm beim Laden der Seite aktualisieren
    tempChart.update();

    function getTemperatureDifference(currentOutsideTemp) {
        fetch(`https://37.120.170.56:31432/v1/diff?currtemp=${encodeURIComponent(currentOutsideTemp)}`, {
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
                return response.json();
            })
            .then(data => {
                console.log('Temperaturdifferenz:', data);
                // Hier würdest du die Logik einfügen, um die Daten im Diagramm zu aktualisieren
            })
            .catch(error => {
                console.error('Fehler beim Abrufen der Temperaturdifferenz:', error);
            });
    }

    // Stündliche Aktualisierung des Diagramms
    setInterval(function () {
        tempChart.data.datasets[0].data = Array.from({ length: 24 }, () => Math.random() * 5 + 15);
        tempChart.data.datasets[1].data = Array.from({ length: 24 }, () => parseFloat(getCurrentTargetTemp()));
        tempChart.data.datasets[2].data = Array.from({ length: 24 }, () => getTemperatureDifference(Math.random() * 10 + 60));
        tempChart.update();
    }, 3600000); // Jede Stunde
});
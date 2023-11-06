// Skript zur Verwaltung von Temperaturdaten
const temperatureData = [];

// Funktion zum Hinzufügen von Temperaturdaten
function addTemperatureData(currentTemp, targetTemp, preheatTemp) {
    const timestamp = new Date();
    temperatureData.push({ timestamp, currentTemp, targetTemp, preheatTemp });
    // Daten auf dem Server speichern (hier simuliert)
}

// Funktion zum Abrufen der letzten 7 Tage Temperaturdaten
function getTemperatureData() {
    // Daten vom Server abrufen (hier simuliert)
    return temperatureData.filter(data => {
        const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
        return data.timestamp >= oneWeekAgo;
    });
}

// Funktion zum Simulieren von Serverantworten
function simulateServerResponse() {
    // Simuliere das Empfangen von Daten vom KI-Server
    const simulatedData = {
        currentTemp: Math.random() * 20 + 10, // Zufällige Temperatur zwischen 10 und 30
        targetTemp: Math.random() * 20 + 10,
        preheatTemp: Math.random() * 20 + 10
    };
    addTemperatureData(simulatedData.currentTemp, simulatedData.targetTemp, simulatedData.preheatTemp);
}

// Stündliche Aktualisierung simulieren
setInterval(simulateServerResponse, 3600000); // Jede Stunde
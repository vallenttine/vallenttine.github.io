const targetDate = new Date("2025-02-14T14:00:00").getTime();

function updateTimer() {
    const now = new Date().getTime();
    const timeLeft = targetDate - now;

    if (timeLeft <= 0) {
        if (getComputedStyle(document.getElementById("timer")).display != "none"){
            document.getElementById("timer").style.display = "none"; // Сховати таймер
        }
        
        return; // Виходимо з функції, щоб нічого більше не відбувалося
    } else {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60)); // Години
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)); // Хвилини
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000); // Секунди

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        document.getElementById("timer").innerHTML = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }
}

setInterval(updateTimer, 1000);

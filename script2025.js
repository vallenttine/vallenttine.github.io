const targetDate = new Date("2025-02-14T14:00:00").getTime();

function updateTimer() {
    const now = new Date().getTime();
    const timeLeft = targetDate - now;

    if (timeLeft <= 0) {
        document.getElementById("gameBtn").style.display = "inline-block";
        document.getElementById("timer").style.display = "none";
        clearInterval(timerId);
        return;
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
const timerId = setInterval(updateTimer, 1000);
updateTimer();

document.getElementById("gameBtn").addEventListener("click", startQuiz);

var quizQuestion = 1;

function startQuiz() {
    document.getElementById("items2025").innerHTML = `
        <img class="quizGif" src="https://media1.tenor.com/m/KayBlLo95RoAAAAC/peach-cat.gif">
        <p class="text_child quizElement">✨Вікторина✨</p>
        <p class="text_child quizElement" id="question">Де і коли ми вперше зустрілися?</p>
        <div class="quizBtns">
            <button class="button-74" id="showAnswer">Відповідь</button>
            <button class="button-74" id="nextQuestion">Далі</button>
        </div>
        <div id="notification" class="notification text_child"></div>
    `;
    document.getElementById("showAnswer").addEventListener("click", showNotification);
    document.getElementById("nextQuestion").addEventListener("click", showNextQuestion)
}

function showNotification() {
    let notification = document.getElementById("notification");
    switch(quizQuestion){
        case 1:
            notification.innerText = "29 серпня на полігоні";
            break;
        case 2:
            notification.innerText = "У вежі";
            break;
        case 3:
            notification.innerText = "Прогулянка вечірнім Львовом";
            break;
        case 4:
            notification.innerText = "Рижик, який був в шоці)";
            break;
        case 5:
            notification.innerText = "Леви на джипі на поляні"
            break;
        case 6:
            notification.innerText = "Часто кидаєш нові фотки, де б ти не була"
            break;
        case 7:
            notification.innerText = "Котик, сонце";
            break;
        case 8:
            notification.innerText = "Пікнічок на поляні";
            break;
        case 9:
            notification.innerText = "В тур по Європі";
            break;
        case 10:
            notification.innerText = "Я чекаю на відповідь";
            break;
        default:
            notification.innerText = "";

    }
    notification.classList.add("show");
    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

function showNextQuestion() {
    let question = document.getElementById("question");
    switch(quizQuestion){
        case 1:
            question.innerText = "В якому місці було наше перше побачення?";
            quizQuestion++;
            break;
        case 2:
            question.innerText = "Яка наша прогулянка тобі найбільше запам'яталася?";
            quizQuestion++;
            break;
        case 3:
            question.innerText = "Що було найсмішніше, що сталося з нами на побаченні?";
            quizQuestion++;
            break;
        case 4:
            question.innerText = "Що спільно переглянуте тобі найбільше запам'яталося?";
            quizQuestion++;
            break;
        case 5:
            question.innerText = "Яка моя звичка тобі подобається?"
            quizQuestion++;
            break;
        case 6:
            question.innerText = "Які прізвиська тобі найбільше подобаються?"
            quizQuestion++;
            break;
        case 7:
            question.innerText = "Яке твоє улюблене місце для спільного відпочинку?";
            quizQuestion++;
            break;
        case 8:
            question.innerText = "Куди ти мрієш поїхати разом?"
            quizQuestion++;
            break;
        case 9:
            question.innerText = "Чи будеш ти моєю валентинкою на цей рік?";
            document.getElementById("nextQuestion").innerText = "Так";
            quizQuestion++;
            break;
        case 10:
            document.getElementById("items2025").innerHTML = `
                <img style="max-width:165px; margin:0 auto;" src="https://media.tenor.com/W2DS2FXWRKIAAAAi/goma-peach.gif">
                <h3 class="text_child" style="margin:10px auto;">Ура ура ура!</h3>
            `;
            break;
    }

}
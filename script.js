var buttonChangedTimes = 0;
var noButton = document.getElementById("noButton");
var yesButton = document.getElementById("yesButton");
var gif = document.getElementById("gif");
var textChild = document.getElementById("text");
noButton.addEventListener("click", () => {
    var screenWidth = window.innerWidth; 
    var screenHeight = window.innerHeight; 

    var randomX = Math.floor(Math.random() * (screenWidth - 150));
    var randomY = Math.floor(Math.random() * (screenHeight - 80));

    function moveButton(){
        noButton.style.position = "absolute";
        noButton.style.left = randomX + "px";
        noButton.style.top = randomY + "px";
        buttonChangedTimes++;
    }
    function changeMinWidth(){
        var minWidth = getComputedStyle(noButton).getPropertyValue('min-width').slice(0, -2);
        noButton.style.minWidth = (minWidth-20) + "px";
    }
    switch (buttonChangedTimes){
        case 0:
            moveButton()
            textChild.textContent = "Не правильна відовідь!";
            break;
        case 1:
            moveButton()
            changeMinWidth()
            noButton.style.fontSize = "16px";
            noButton.style.padding = "0 16px";
            textChild.textContent = "Неподобство!!!";
            break;
        case 2:
            moveButton()
            changeMinWidth()
            noButton.style.fontSize = "14px";
            noButton.style.lineHeight = "32px";
            noButton.style.padding = "0 14px";
            noButton.style.boxShadow = "#422800 2px 2px 0 0";
            textChild.textContent = "То що таке має бути?!";
            break;
        case 3:
            moveButton()
            changeMinWidth()
            noButton.style.fontSize = "12px";
            noButton.style.lineHeight = "24px";
            noButton.style.padding = "0 12px";
            noButton.style.boxShadow = "#422800 1px 1px 0 0";
            textChild.textContent = "Софія 😠";
            break;
        case 4:
            moveButton()
            changeMinWidth()
            noButton.style.fontSize = "10px";
            noButton.style.lineHeight = "18px";
            noButton.style.padding = "0 10px";
            noButton.style.boxShadow = "0 0 0 0";
            textChild.textContent = "Наніц припухла? 🤨";
            break;
        case 5:
            moveButton()
            changeMinWidth()
            noButton.style.fontSize = "8px";
            noButton.style.lineHeight = "12px";
            noButton.style.padding = "0 8px";
            noButton.style.boxShadow = "0 0 0 0";
            textChild.textContent = "Це обіда 🙁";
            break;
        case 6:
            noButton.style.left = screenWidth + "px";
            noButton.style.top = screenHeight + "px";
            setTimeout(function() {
                noButton.style.visibility = "hidden";
            }, 100);
            textChild.textContent = "Кнопка там 👇";
            break;
        }
})
yesButton.addEventListener("click", () => {
    gif.src = "https://media1.tenor.com/m/XAabbheOS24AAAAC/goma-happy.gif";
    textChild.textContent = "Ура ура ура!";
    document.getElementsByClassName("buttons")[0].style.display = "none";
    textChild.style.paddingTop = "8px";
    textChild.style.fontSize = "20px";
    var gifs = [
        "https://media1.tenor.com/m/jD8fmhulF4MAAAAC/clap-clap-cute-cat.gif",
        "https://media1.tenor.com/m/J9mOaXMbKygAAAAd/mochi-pet.gif",
        "https://media1.tenor.com/m/UZMDKcNeUj0AAAAC/goma-peach-kisses.gif",
        "https://media1.tenor.com/m/XAabbheOS24AAAAC/goma-happy.gif"
      ];
    
    var interval = 4300;     
    var index = 0;

    function changeGif() {
    gif.src = gifs[index];
    index = (index + 1) % gifs.length;
    }

    var intervalId = setInterval(changeGif, interval);
    gif.style.maxWidth = "20vh"
})


var buttonChangedTimes = 0;
var buttonNO = document.getElementById("Nobutton");
buttonNO.addEventListener("click", () => {
    var screenWidth = window.innerWidth; 
    var screenHeight = window.innerHeight; 

    var randomX = Math.floor(Math.random() * (screenWidth - 150));
    var randomY = Math.floor(Math.random() * (screenHeight - 80));

    function moveButton(){
        buttonNO.style.position = "absolute";
        buttonNO.style.left = randomX + "px";
        buttonNO.style.top = randomY + "px";
        buttonChangedTimes++;
    }
    function changeMinWidth(){
        var minWidth = getComputedStyle(buttonNO).getPropertyValue('min-width').slice(0, -2);
        buttonNO.style.minWidth = (minWidth-20) + "px";
    }
    switch (buttonChangedTimes){
        case 0:
            moveButton()
            break;
        case 1:
            moveButton()
            changeMinWidth()
            buttonNO.style.fontSize = "16px";
            buttonNO.style.padding = "0 16px";
            break;
        case 2:
            moveButton()
            changeMinWidth()
            buttonNO.style.fontSize = "14px";
            buttonNO.style.lineHeight = "32px";
            buttonNO.style.padding = "0 14px";
            buttonNO.style.boxShadow = "#422800 2px 2px 0 0";
            break;
        case 3:
            moveButton()
            changeMinWidth()
            buttonNO.style.fontSize = "12px";
            buttonNO.style.lineHeight = "24px";
            buttonNO.style.padding = "0 12px";
            buttonNO.style.boxShadow = "#422800 1px 1px 0 0";
            break;
        case 4:
            moveButton()
            changeMinWidth()
            buttonNO.style.fontSize = "10px";
            buttonNO.style.lineHeight = "18px";
            buttonNO.style.padding = "0 10px";
            buttonNO.style.boxShadow = "0 0 0 0";
            break;
        case 5:
            buttonNO.style.left = screenWidth + "px";
            buttonNO.style.top = screenHeight + "px";
            setTimeout(function() {
                buttonNO.style.visibility = "hidden";
            }, 100);
            break;
        }
})



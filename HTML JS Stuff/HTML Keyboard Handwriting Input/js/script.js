const radius = 15;

//
const textboxElement = document.getElementById('textbox');
textboxElement.innerText = "text";
const buttonElements = document.getElementsByClassName('button-style');
const canvasElement = document.getElementById('drawBoard');
const canvasContext = canvasElement.getContext('2d');
canvasContext.width = document.getElementById("ArrowRight").getBoundingClientRect().x - document.getElementById("Backquote").getBoundingClientRect().x;
canvasContext.height = document.getElementById("ArrowRight").getBoundingClientRect().y - document.getElementById("Backquote").getBoundingClientRect().y;
canvasElement.width = canvasContext.width;
canvasElement.height = canvasContext.height;
canvasContext.fillStyle = "red";
canvasContext.strokeStyle = "red";
const LeftX = document.getElementById("Backquote").getBoundingClientRect().x;
const TopY = document.getElementById("Backquote").getBoundingClientRect().y;

var currentX = null;
var currentY = null;


document.addEventListener('keydown', event => {
    // console.log(event.code);
    document.getElementById(event.code).style.backgroundColor = "red";
    //
    var buttonX = document.getElementById(event.code).getBoundingClientRect().x - LeftX;
    var buttonY = document.getElementById(event.code).getBoundingClientRect().y - TopY;
    // console.log(buttonX, buttonY);
    canvasContext.beginPath();
    if (currentX != null && currentY != null) {
        canvasContext.moveTo(currentX, currentY);
        canvasContext.lineTo(buttonX, buttonY);
        canvasContext.stroke();
    }
    currentX = buttonX;
    currentY = buttonY;
    // canvasContext.arc(buttonX , buttonY, radius, 0, 2 * Math.PI);
    // canvasContext.fill();
    canvasContext.closePath();

    //! OCR
    // FIXME: why doesn't this call properly?
    console.log(OCRAD(canvasElement));
    console.log(OCRAD(canvasContext));
    console.log(OCRAD(canvasContext.getImageData(0, 0, canvasContext.width, canvasContext.height)));




    //? reset
    if (event.code == "Escape") {
        canvasContext.clearRect(0, 0, canvasContext.width, canvasContext.height);
        for (var i = 0; i < buttonElements.length; i++) {
            buttonElements[i].style.backgroundColor = "";
        }
        document.getElementById("ArrowUp").style.backgroundColor = "";
        document.getElementById("ArrowDown").style.backgroundColor = "";
    }
});

// document.addEventListener('keyup', event => {
//     console.log(event.code);
//     document.getElementById(event.code).style.backgroundColor = "";
// });
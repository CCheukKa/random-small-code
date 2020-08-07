const canvas = document.getElementById("myCanvas");
const c = canvas.getContext("2d");

document.addEventListener('keydown', function (e) { keyDown(e.code) });
canvas.addEventListener('mousedown', function (e) { onClicked(e) });
setInterval(function () {
    
}, timeStepMS);


//===================================================================
function keyDown(key) {
    //console.log(key + ' pressed');
    switch (key) {
        case '':
            break;
        default:
            return;
    }
    return;
}
function getMousePos(event) {
    mX = event.clientX - canvasBound.left;
    mY = event.clientY - canvasBound.top;
   return;
}
function onClicked(event) {
   getMousePos(event);
}
function disableScroll() {
    document.body.style.overflow = 'hidden';
    document.querySelector('html').scrollTop = window.scrollY;
    return;
}
//===================================================================
function drawRect(x1, y1, dx, dy, colour) {
    c.fillStyle = colour;
    c.fillRect(x1, y1, dx, dy);
    return;
}
function drawLine(x1, y1, x2, y2, colour) {
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.lineWidth = 6;
    c.strokeStyle = colour;
    c.stroke();
    return;
}
function drawCircle(x, y, r, sA, eA, colour) {
    c.beginPath();
    c.arc(x, y, r, deg2rad(sA), deg2rad(eA));
    c.fillStyle = colour;
    c.lineTo(x, y);
    c.fill();
    return;
}
function drawText(text, x, y, alignment, colour, strokeColour) {
    c.font = '20px Arial';

    switch (alignment) {
        case 0:
            c.textAlign = 'center';
            break;
        case 1:
            c.textAlign = 'left';
            break;
        case 2:
            c.textAlign = 'right';
            break;
    
        default:
            break;
    }

    c.fillStyle = colour;
    c.fillText(text, x, y + 5);

    if (strokeColour) {
        c.font = '20px Arial';
        c.strokeStyle = strokeColour;
        c.strokeText(text, x, y + 5);
    }

    return;
}
//===================================================================
function deg2rad(deg) {
    return deg / 180 * Math.PI;
}
function rad2deg(rad) {
    return rad / Math.PI * 180;
}
function sin(angle) { return Math.sin(angle); }
function cos(angle) { return Math.cos(angle); }
function tan(angle) { return Math.tan(angle); }
function asin(angle) { return Math.asin(angle); }
function acos(angle) { return Math.acos(angle); }
function atan(angle) { return Math.atan(angle); }
function clamp(x, limit1, limit2) {
    if (limit1 > limit2) { return clamp(x, limit2, limit1); }
    if (x < limit1) { return limit1; }
    if (x > limit2) { return limit2; }
    return x;
}
function isWithinInclusiveRange(test, lower, upper) {
    if (lower > upper) { return isWithinInclusiveRange(test, upper, lower) }
    return (lower <= test && test <= upper);
}
function isWithinExclusiveRange(test, lower, upper) {
    if (lower > upper) { return isWithinExclusiveRange(test, upper, lower) }
    return (lower < test && test < upper);
}
var canvas = document.getElementById("myCanvas");
var c = canvas.getContext("2d");

const width = 525;
const height = 420;
const quarterWidth = width / 4;
const quarterHeight = height / 4;
canvas.width = width;
canvas.height = height;

const palette = [ /*canvas*/ '#1a2b47', '#25a282', '#bebe9d', '#cdab6b', '#c84c2b', '#287287', '#f0bb5e', '#a2837d', '#d26931'];
var drawScaleX = 2.5; //axis value from edge to edge L/R
//!
var centerX = -0.75;
var centerY = 0;
const maxAllowedIterations = 200; //1000?
redraw();

//#region   //? Mandelbrot functions
function isInMandelbrot(a, b) {
    let za = a,
        zb = b,
        hasVisited = [`${a}+${b}`];
    while (isFinite(za + zb)) {
        let temp = za * za - zb * zb + a;
        zb = 2 * za * zb + b;
        za = temp;
        let repeat = false;
        hasVisited.forEach(element => {
            if (element == `${za}+${zb}`) {
                repeat = true;
                return;
            }
        });
        if (repeat) { return true; }
        if (hasVisited.length >= maxAllowedIterations) { return true; }
        hasVisited.push(`${za}+${zb}`);
    }
    return false;
}

function redraw() {
    drawRect(0, 0, width, height, palette[0]);
    //
    let drawScaleY = drawScaleX / width * height,
        stepX = drawScaleX / width, // 1px per step
        stepY = drawScaleY / height,
        ssCenterY = -centerY;

    c.fillStyle = palette[1];

    if (ssCenterY >= 0) { //draw from top
        for (let y = ssCenterY + drawScaleY / 2; y >= Math.max(ssCenterY - drawScaleY / 2, -stepY); y -= stepY) {
            subDraw(y);
        }
    } else { //draw from bottom
        for (let y = ssCenterY - drawScaleY / 2; y <= Math.min(ssCenterY + drawScaleY / 2, +stepY); y += stepY) {
            subDraw(y);
        }
    }
    //
    return;

    function subDraw(y) {
        if (Math.abs(y) >= 1.05) { return; }
        for (let x = centerX - drawScaleX / 2; x < centerX + drawScaleX / 2; x += stepX) {
            if (x >= 0.5 | x <= -2.05) { continue; }
            if (isInMandelbrot(x, y)) {
                c.fillRect(
                    (x - centerX + drawScaleX / 2) / drawScaleX * width,
                    (y - ssCenterY + drawScaleY / 2) / drawScaleY * height,
                    1, 1);
                c.fillRect(
                    (x - centerX + drawScaleX / 2) / drawScaleX * width,
                    (-y - ssCenterY + drawScaleY / 2) / drawScaleY * height,
                    1, 1);
            }
        }
    }
}

//#endregion

//#region   //! Custom Functions
function drawPixel(x, y) { //Screenspace X,Y
    c.fillRect(x, y, 1, 1);
    //console.log(`Drew pixel at ${x}, ${y}`);
}

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

function deg2rad(deg) {
    return deg / 180 * Math.PI;
}

function rad2deg(rad) {
    return rad / Math.PI * 180;
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

//#endregion
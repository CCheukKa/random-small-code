const { createCanvas } = require("canvas");
const fs = require("fs");
//
const width = 32767; //max 32767
const height = 32767; //max 32767
//!
const canvas = createCanvas(width, height);
var c = canvas.getContext("2d");
//
const palette = [ /*canvas*/ '#1a2b47', '#25a282', '#bebe9d', '#cdab6b', '#c84c2b', '#287287', '#f0bb5e', '#a2837d', '#d26931'];
const drawScaleX = 0.025; //axis value from edge to edge L/R
const drawScaleY = drawScaleX / width * height;
//!
const centerX = -0.74;
const centerY = -0.20;
const maxAllowedIterations = 200; //1000?
//
const xOffset = (-centerX + drawScaleX / 2) / drawScaleX * width;
const yOffset = (centerY + drawScaleY / 2) / drawScaleY * height;
//
console.log(`${getTimeStamp()} => Attempting to draw ${drawScaleX} x ${drawScaleY} @ ${centerX}, ${centerY} in ${width}px ${height}px`)
redraw();
fs.writeFileSync(`./appdata/render/${drawScaleX} x ${drawScaleY} @ ${centerX}, ${centerY} in ${width}px ${height}px.png`, canvas.toBuffer('image/png'));
console.log(`${getTimeStamp()} => Successfully output image`)
return;

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
    let stepX = drawScaleX / width, // 1px per step
        stepY = drawScaleY / height,
        invStepX = 1 / stepX,
        invStepY = 1 / stepY,
        ssCenterY = -centerY;

    c.fillStyle = palette[1];

    if (ssCenterY >= 0) { //draw from top
        //console.log(Math.max(ssCenterY - drawScaleY / 2, -stepY));
        //console.log(-stepY);
        for (let y = ssCenterY + drawScaleY / 2; y >= Math.max(ssCenterY - drawScaleY / 2, -stepY); y -= stepY) {
            subDraw(y);
        }
    } else { //draw from bottom
        //console.log(Math.max(ssCenterY - drawScaleY / 2, +stepY));
        //console.log(stepY);
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
                    xOffset + x * invStepX,
                    yOffset + y * invStepY,
                    1, 1);
                c.fillRect(
                    xOffset + x * invStepX,
                    yOffset - y * invStepY,
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

function getTimeStamp() {
    let d = new Date();
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ', ' + d.toLocaleTimeString();
}
//#endregion
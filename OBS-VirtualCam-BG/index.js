const fs = require('fs');
const { createCanvas } = require('canvas');
const { start } = require('repl');
const canvas = createCanvas(1920, 1080);
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const timeStepMS = 10000;
const stepsTotal = 10;
var startColour = [];
var endColour = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
var stepCount = 0;

setInterval(() => {
    redraw();
}, timeStepMS);


function redraw() {
    let answer = getColourTransition();

    //canvas
    let gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.min(width, height));
    gradient.addColorStop(0, toColourHex(answer[0], answer[1], answer[2]));
    gradient.addColorStop(1, toColourHex(answer[3], answer[4], answer[5]));


    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);


    //fs
    let buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./output/image.png', buffer);
}

function getColourTransition() {
    if (stepCount == 0 | stepCount == stepsTotal) {
        stepCount = 0;
        startColour = JSON.parse(JSON.stringify(endColour));
        endColour = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
    }

    let colours = [];
    for (let i = 0; i < 6; i++) {
        colours.push(Math.round((endColour[i] - startColour[i]) / stepsTotal * stepCount) + startColour[i]);
    }

    stepCount++;
    return colours;
}

function toColourHex(r, g, b) {
    return '#' + ((r + 256).toString(16).substring(1)) + ((g + 256).toString(16).substring(1)) + ((b + 256).toString(16).substring(1));
}
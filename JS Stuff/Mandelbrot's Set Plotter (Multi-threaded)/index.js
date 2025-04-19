const { Worker, isMainThread, workerData, parentPort } = require('worker_threads');
const { createCanvas } = require("canvas");
const fs = require("fs");
const { exit } = require('process');
const userCPUCount = require('os').cpus().length;
const config = JSON.parse(fs.readFileSync('./appdata/config.json', 'utf-8'));
//
const width = config.canvas.x; //max 32767
const height = config.canvas.y; //max 32767
//!
const canvas = createCanvas(width, height);
var c = canvas.getContext("2d");
//
const palette = config.canvas.palette;
const drawScaleX = config.canvas.horizontalDrawScale; //axis value from edge to edge L/R
const drawScaleY = drawScaleX / width * height;
//!
const centerX = config.center.x;
const centerY = config.center.y;
const maxAllowedIterations = config.maxAllowedIterations; //1000?
//
const xOffset = (-centerX + drawScaleX / 2) / drawScaleX * width;
const yOffset = (centerY + drawScaleY / 2) / drawScaleY * height;
//!
const startTime = new Date();
generateLog(`Attempting to draw ${drawScaleX} x ${drawScaleY} @ ${centerX}, ${centerY} in ${width}px ${height}px with ${userCPUCount} threads`)

const workload = [];
initialise();
return;

//#region   //? Processes functions
function initialise() {
    drawRect(0, 0, width, height, palette[0]);
    //
    let stepX = drawScaleX / width, // 1px per step
        stepY = drawScaleY / height,
        invStepX = 1 / stepX,
        invStepY = 1 / stepY,
        ssCenterY = -centerY,
        startPoint, endPoint, rangeY, rowCount;

    c.fillStyle = palette[1];

    if (ssCenterY >= 0) { //draw from top
        stepY = -stepY;
        startPoint = ssCenterY + drawScaleY / 2;
        endPoint = Math.max(ssCenterY - drawScaleY / 2, stepY);
    } else { //draw from bottom
        startPoint = ssCenterY - drawScaleY / 2;
        endPoint = Math.min(ssCenterY + drawScaleY / 2, +stepY);
    }
    rangeY = endPoint - startPoint;
    rowCount = rangeY / stepY;
    //

    //! split workload
    const expectWorkerCount = Math.round(rowCount / config.rowPerWorker);
    generateLog(`Expecting ${expectWorkerCount} workers`);
    for (let i = 0; i < expectWorkerCount; i++) {
        var endY = endPoint + i * config.rowPerWorker * stepY;
        var startY = Math.min(endY + config.rowPerWorker * stepY, startPoint);
        workload.push([startY, endY]);
    }
    console.log({ workload });

    for (let i = 0; i < userCPUCount; i++) { //assign workers
        // for (let i = 0; i < 1; i++) { //assign workers
        deployWorker(i);
    }

    function deployWorker(i) {
        const work = workload.shift();
        if (!work) { return; }
        // console.log('-');
        // console.log({ work });
        // console.log({ workload });
        const worker = new Worker('./worker.js', {
            workerData: {
                i: i,
                maxAllowedIterations: maxAllowedIterations,
                stepX: stepX,
                stepY: stepY,
                centerX: centerX,
                drawScaleX: drawScaleX,
                startY: work[0],
                endY: work[1],
            }
        });
        generateLog(`Thread ${i} created: assigned ${work[0]}~${work[1]}`);
        worker.on('online', () => { generateLog(`Thread ${i} online`); });
        worker.on('error', err => {
            generateLog(`Thread ${i} gave an error:`);
            console.error(err);
            fail(i);
        });
        worker.on('exit', code => {
            generateLog(`Thread ${i} exited with code ${code}`);
            deployWorker(i);
        });
        worker.on('message', msg => {
            let xList = msg.xList, yList = msg.yList;
            length = xList.length;
            for (let i = 0; i < length; i++) {
                c.fillRect(
                    Math.round(xOffset + xList[i] * invStepX),
                    Math.round(yOffset + yList[i] * invStepY),
                    1, 1
                );
                c.fillRect(
                    Math.round(xOffset + xList[i] * invStepX),
                    Math.round(yOffset - yList[i] * invStepY),
                    1, 1
                );
            }
            generateLog(`Processed results from thread ${i}: length ${length}`);
        });
        return;
    }
}

function done() {
    fs.writeFileSync(`./appdata/render/${drawScaleX} x ${drawScaleY} @ ${centerX}, ${centerY} in ${width}px ${height}px.png`, canvas.toBuffer('image/png'));
    generateLog(`Successfully output image`);
    const endTime = new Date();
    const timeTaken = endTime - startTime;
    generateLog(`Time taken: ${msToTimeString(timeTaken)}`);
    return;
}

//#endregion

//#region   //! Custom Functions
function drawPixel(x, y) { //Screenspace X,Y
    c.fillRect(x, y, 1, 1);
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

function generateLog(content) {
    console.log(`${getTimeStamp()} => ${content}`);
    return;
}

function msToTimeString(t) {
    const d = Math.floor(t / 86400000);
    const h = Math.floor(t % 86400000 / 3600000) + 100;
    const m = Math.floor(t % 3600000 / 60000) + 100;
    const s = Math.floor(t % 60000 / 1000) + 100;
    const ms = t % 1000 + 1000;
    return `${d};${h.toString().substr(1, 2)}:${m.toString().substr(1, 2)}:${s.toString().substr(1, 2)}.${ms.toString().substr(1, 3)}`;
}
//#endregion
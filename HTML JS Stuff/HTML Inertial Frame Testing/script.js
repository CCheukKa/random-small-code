class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(vector) {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
        return this;
    }

    add(vector) {
        return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    }

    subtract(vector) {
        return new Vector3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    }

    scale(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
}

/* -------------------------------------------------------------------------- */

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const xyCanvasElement = document.getElementById('xyCanvas');
const yzCanvasElement = document.getElementById('yzCanvas');
const zxCanvasElement = document.getElementById('zxCanvas');
const xyCanvasContext = xyCanvasElement.getContext('2d');
const yzCanvasContext = yzCanvasElement.getContext('2d');
const zxCanvasContext = zxCanvasElement.getContext('2d');
xyCanvasElement.width = CANVAS_WIDTH;
xyCanvasElement.height = CANVAS_HEIGHT;
yzCanvasElement.width = CANVAS_WIDTH;
yzCanvasElement.height = CANVAS_HEIGHT;
zxCanvasElement.width = CANVAS_WIDTH;
zxCanvasElement.height = CANVAS_HEIGHT;

const setZeroButtonElement = document.getElementById('setZeroButton');
setZeroButtonElement.addEventListener('click', setZero);

const colour = {
    1: getComputedStyle(document.documentElement).getPropertyValue('--colour1'),
    2: getComputedStyle(document.documentElement).getPropertyValue('--colour2'),
    3: getComputedStyle(document.documentElement).getPropertyValue('--colour3'),
    4: getComputedStyle(document.documentElement).getPropertyValue('--colour4'),
    5: getComputedStyle(document.documentElement).getPropertyValue('--colour5'),
}

/* -------------------------------------------------------------------------- */

const SENSOR_FREQUENCY = 60;
const linAccSensor = new LinearAccelerationSensor({
    frequency: SENSOR_FREQUENCY
});
linAccSensor.addEventListener('reading', integratePosition);
linAccSensor.start();

var positionOffset = new Vector3();
var lastTimestamp = 0;
var position = new Vector3();
var lastAcceleration = new Vector3();

setZero();

initialiseCanvas(xyCanvasElement, xyCanvasContext);
initialiseCanvas(yzCanvasElement, yzCanvasContext);
initialiseCanvas(zxCanvasElement, zxCanvasContext);

/* -------------------------------------------------------------------------- */

function initialiseCanvas(canvas, context) {
    context.fillStyle = colour[2];
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawLine(context, {
        x: 0,
        y: canvas.height / 2
    }, {
        x: canvas.width,
        y: canvas.height / 2
    }, colour[3]);
    drawLine(context, {
        x: canvas.width / 2,
        y: 0
    }, {
        x: canvas.width / 2,
        y: canvas.height
    }, colour[3]);
}

function setZero() {
    positionOffset.set(position);

    initialiseCanvas(xyCanvasElement, xyCanvasContext);
    initialiseCanvas(yzCanvasElement, yzCanvasContext);
    initialiseCanvas(zxCanvasElement, zxCanvasContext);
}

function integratePosition() {
    var timestamp = linAccSensor.timestamp;

    var dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    let acceleration = new Vector3(linAccSensor.x, linAccSensor.y, linAccSensor.z);
    position = acceleration.add(lastAcceleration).scale(dt * dt / 2).add(position);

    lastAcceleration.set(acceleration);

    drawPosition();
}

function drawPosition() {
    let offsetPosition = position.subtract(positionOffset).scale(100000);

    console.log(offsetPosition);

    drawDot(xyCanvasContext, xyCanvasElement.width / 2 + offsetPosition.x, xyCanvasElement.height / 2 - offsetPosition.y, 5, colour[4]);
    drawDot(yzCanvasContext, yzCanvasElement.width / 2 + offsetPosition.y, yzCanvasElement.height / 2 - offsetPosition.z, 5, colour[4]);
    drawDot(zxCanvasContext, zxCanvasElement.width / 2 + offsetPosition.z, zxCanvasElement.height / 2 - offsetPosition.x, 5, colour[4]);
}

/* -------------------------------------------------------------------------- */

function drawDot(context, x, y, radius, colour) {
    drawCircle(context, x, y, radius, colour[5]);
    drawCircle(context, x, y, radius - 1, colour);
}

function drawCircle(context, x, y, radius, colour) {
    context.fillStyle = colour;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
    context.closePath();
}

function drawLine(context, p1, p2, colour) {
    context.strokeStyle = colour;
    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();
    context.closePath();
}
//#region   //! Initialisation
const canvas = document.getElementById("myCanvas");
const c = canvas.getContext("2d");
const scoreText = document.getElementById("scoreText");

const timeStepMS = 5;

const width = 640;
const height = 640;
canvas.width = width;
canvas.height = height;

const palette = ['#3b7182', '#4e8863', '#c8cda1', '#dea863', '#f18a70', '#e97f86', '#bc545b'];
document.body.style.backgroundColor = '#202022';
//#endregion
//#region   //? Class definitions
const defaultLength = 200;
const defaultThickness = 20;
const defaultMass = 10;
const gravity = 0.1;
const energyLossFactor = 0.001;
const pendulumList = [];
class Pendulum {
    constructor(baseX, baseY, length, mass, angle = 0, colour = palette[randomInteger(palette.length)]) {
        this.baseX = baseX;
        this.baseY = baseY;
        this.length = length;
        this.mass = mass;
        this.angle = angle;
        this.colour = colour;
        this.angularVelocity = 0;
        this.angularMoment = 0;
        this.calcEnd();
        pendulumList.push(this);
    }
    calcEnd() {
        this.endX = this.length * cos(this.angle) + this.baseX;
        this.endY = this.length * sin(this.angle) + this.baseY;
    }
}
//#endregion
//#region   //! Main loop
const basePendulum = new Pendulum(width / 2, height - 40, defaultLength, defaultMass, 0);
redraw();
setInterval(function() {
    physics();
    redraw();
}, timeStepMS);
//#endregion

//#region   //! Physics
function physics() {
    pendulumList.forEach(p => {

        p.angularMoment = 0;
        p.angularMoment += p.mass * gravity * cos(p.angle) * p.length / 2;
        p.angularVelocity += p.angularMoment / (p.length / 2) ** 2 * timeStepMS;

        // Energy loss
        p.angularVelocity *= 1 - energyLossFactor;
        //Apply velocities
        p.angle -= p.angularVelocity * timeStepMS / 1000;

        //
        p.calcEnd();
    });
}
//#endregion
//#region   //! Redraw
function redraw() {
    c.clearRect(0, 0, width, height);
    pendulumList.forEach(({ baseX, baseY, endX, endY, colour, thickness }) => {
        drawLine(baseX, height - baseY, endX, height - endY, colour, thickness);
    })
    return;
}
//#endregion
//#region   //! Custom functions
function drawRect(x1, y1, dx, dy, colour) {
    c.fillStyle = colour;
    c.fillRect(x1, y1, dx, dy);
    return;
}

function drawLine(x1, y1, x2, y2, colour, thickness = defaultThickness) {
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.lineWidth = thickness;
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

function isWithinInclusiveRange(test, lower, upper) {
    if (lower > upper) {
        let dummy = upper;
        upper = lower;
        lower = dummy;
    }
    return (lower <= test && test <= upper);
}

function isWithinExclusiveRange(test, lower, upper) {
    if (lower > upper) {
        let dummy = upper;
        upper = lower;
        lower = dummy;
    }
    return (lower < test && test < upper);
}

function randomInteger(range) {
    return Math.floor(Math.random() * range);
}

function sin(angle) { return Math.sin(angle); }

function cos(angle) { return Math.cos(angle); }

function tan(angle) { return Math.tan(angle); }
//#endregion
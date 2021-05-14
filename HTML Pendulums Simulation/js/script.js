/*
////! Add two-way coupling
////! Add better parent-children data structure
*/

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
const baseColour = '#202022';
document.body.style.backgroundColor = baseColour;
//#endregion
//#region   //* Constants
const drawScale = 0.3;
const baseHeight = 0.6;
const defaultLength = 200;
const defaultThickness = drawScale * 20;
const defaultMass = 10;
const gravity = 0.1;
const energyLossFactor = 0.0001; //0.001
//#endregion
//#region   //? Class definitions
class Pendulum {
    constructor(parent, baseX, baseY, length, mass, angle = Math.random() * Math.PI) {
        this.parent = parent;
        this.baseX = baseX;
        this.baseY = baseY;
        if (parent) {
            this.baseX = parent.endX;
            this.baseY = parent.endY;
        }
        this.length = length;
        this.mass = mass;
        this.angle = angle;
        this.colour = palette[randomInteger(palette.length)]
        this.angularVelocity = 0;
        this.angularMoment = 0;
        this.calcEnd();
    }
    calcEnd() {
        this.endX = this.length * drawScale * cos(this.angle) + this.baseX;
        this.endY = this.length * drawScale * sin(this.angle) + this.baseY;
    }
}
//#endregion
//#region   //! Main loop
const pendulumList = [
    p01 = new Pendulum(null, width / 2, height * baseHeight, defaultLength, defaultMass),
    p02 = new Pendulum(p01, null, null, defaultLength, defaultMass),
    p03 = new Pendulum(p02, null, null, defaultLength, defaultMass),
    p04 = new Pendulum(p01, null, null, defaultLength, defaultMass),
    p05 = new Pendulum(p04, null, null, defaultLength, defaultMass),
    p06 = new Pendulum(p05, null, null, defaultLength, defaultMass),
    p07 = new Pendulum(p04, null, null, defaultLength, defaultMass),
    p08 = new Pendulum(p03, null, null, defaultLength, defaultMass),
    p09 = new Pendulum(p07, null, null, defaultLength, defaultMass),
    p10 = new Pendulum(p06, null, null, defaultLength, defaultMass),
    p11 = new Pendulum(p08, null, null, defaultLength, defaultMass),
    p12 = new Pendulum(p10, null, null, defaultLength, defaultMass),
    p13 = new Pendulum(p12, null, null, defaultLength, defaultMass),
    p14 = new Pendulum(p11, null, null, defaultLength, defaultMass),
    p15 = new Pendulum(p11, null, null, defaultLength, defaultMass),
    p16 = new Pendulum(p09, null, null, defaultLength, defaultMass),
    p17 = new Pendulum(p13, null, null, defaultLength, defaultMass),
    p18 = new Pendulum(p15, null, null, defaultLength, defaultMass),
    p19 = new Pendulum(p16, null, null, defaultLength, defaultMass),
    p20 = new Pendulum(p18, null, null, defaultLength, defaultMass),
    p21 = new Pendulum(p20, null, null, defaultLength, defaultMass),

];
redraw();
setInterval(function() {
    physics();
    redraw();
}, timeStepMS);
//#endregion

//#region   //! Physics
function physics() {
    pendulumList.forEach(p => {
        if (p.parent) {
            p.baseX = p.parent.endX;
            p.baseY = p.parent.endY;
        }

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
    pendulumList.forEach(({ baseX, baseY, endX, endY, colour }) => {
        drawLine(baseX, height - baseY, endX, height - endY, colour, defaultThickness);
        drawCircle(baseX, height - baseY, baseColour, defaultThickness * 0.35);
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

function drawCircle(x, y, colour, radius) {
    drawLine(x, y, x, y, colour, radius * 2);
    return;
}

function deg2rad(angle) { return angle / 180 * Math.PI; }

function rad2deg(angle) { return angle * 180 / Math.PI; }

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
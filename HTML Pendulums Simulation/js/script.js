/*
////! Add two-way coupling
////! Add better parent-children data structure
*/

//#region   //! Initialisation
const canvas = document.getElementById("myCanvas");
const c = canvas.getContext("2d");
const canvas2 = document.getElementById("myCanvasBackground");
const c2 = canvas2.getContext("2d");

const timeStepMS = 5;

const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;
canvas2.width = width;
canvas2.height = height;

const palette = ['#3b7182', '#4e8863', '#c8cda1', '#dea863', '#f18a70', '#e97f86', '#bc545b'];
const baseColour = '#202022';
document.body.style.backgroundColor = baseColour;
//#endregion
//#region   //* Constants
const drawScale = 0.45;
const baseHeight = 0.6;
const defaultLength = 200;
const defaultThickness = drawScale * 20;
const defaultMass = 10;
const gravity = 0.1;
const energyLossFactor = 0.000; //0.001
const playSound = false;
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
        if (playSound) {
            this.audioController = document.createElement('audio');
            this.audioController.innerHTML = `<source src="/assets/tick.ogg" type="audio/ogg">\n<source src="/assets/tick.mp3" type="audio/mp3">`;
            this.direction = (this.angle >= -Math.PI / 2);
        }
    }
    calcEnd() {
        this.endX = this.length * drawScale * cos(this.angle) + this.baseX;
        this.endY = this.length * drawScale * sin(this.angle) + this.baseY;
    }
    sound() {
        if (!playSound) { return; }
        if ((this.direction != (this.angle >= -Math.PI / 2)) && !isWithinInclusiveRange(Math.abs(this.angularVelocity), 0, 0.1)) {
            this.audioController.play();
        }
        this.direction = (this.angle >= -Math.PI / 2);
        return;
    }
}
//#endregion
//#region   //! Main loop
const traceID = 3;
const pendulumList = [
    p00 = new Pendulum(null, width / 2, height * baseHeight, defaultLength, defaultMass),
    p01 = new Pendulum(p00, null, null, defaultLength, defaultMass),
    p02 = new Pendulum(p01, null, null, defaultLength, defaultMass),
    p03 = new Pendulum(p02, null, null, defaultLength, defaultMass),
    //p04 = new Pendulum(p01, null, null, defaultLength, defaultMass),
    //p05 = new Pendulum(p04, null, null, defaultLength, defaultMass),
    //p06 = new Pendulum(p05, null, null, defaultLength, defaultMass),
    //p07 = new Pendulum(p04, null, null, defaultLength, defaultMass),
    //p08 = new Pendulum(p03, null, null, defaultLength, defaultMass),
    //p09 = new Pendulum(p07, null, null, defaultLength, defaultMass),
    //p10 = new Pendulum(p06, null, null, defaultLength, defaultMass),
    //p11 = new Pendulum(p08, null, null, defaultLength, defaultMass),
    //p12 = new Pendulum(p10, null, null, defaultLength, defaultMass),
    //p13 = new Pendulum(p12, null, null, defaultLength, defaultMass),
    //p14 = new Pendulum(p11, null, null, defaultLength, defaultMass),
    //p15 = new Pendulum(p11, null, null, defaultLength, defaultMass),
    //p16 = new Pendulum(p09, null, null, defaultLength, defaultMass),
    //p17 = new Pendulum(p13, null, null, defaultLength, defaultMass),
    //p18 = new Pendulum(p15, null, null, defaultLength, defaultMass),
    //p19 = new Pendulum(p16, null, null, defaultLength, defaultMass),
    //p20 = new Pendulum(p18, null, null, defaultLength, defaultMass),
    //p21 = new Pendulum(p20, null, null, defaultLength, defaultMass),

];
//  tracer prep
const tracer = pendulumList[traceID];
const hueStep = 0.1;
const fadeAlpha = '02';
var hue = 0;
var olderX, olderY;
drawRect(c2, 0, 0, width, height, `#202022`);
//
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
        p.sound();
    });
}
//#endregion
//#region   //! Redraw
function redraw() {
    c.clearRect(0, 0, width, height);
    let oldX, oldY;
    if (traceID) {
        oldX = tracer.endX;
        oldY = tracer.endY;
    }
    pendulumList.forEach(({ baseX, baseY, endX, endY, colour }) => {
        drawLine(c, baseX, height - baseY, endX, height - endY, colour, defaultThickness);
        drawCircle(c, baseX, height - baseY, baseColour, defaultThickness * 0.35);
    })

    if (traceID) {
        drawRect(c2, 0, 0, width, height, `${baseColour}${fadeAlpha}`)
        c2.beginPath();
        c2.lineCap = "round";
        c2.lineWidth = defaultThickness / 2;
        c2.moveTo(olderX, height - olderY);
        c2.lineTo(oldX, height - oldY);
        c2.lineTo(tracer.endX, height - tracer.endY);
        c2.strokeStyle = `hsla(${hue}, 100%, 54%, 255)`; //tracer.colour
        c2.stroke();
        hue += hueStep;
        olderX = oldX;
        olderY = oldY;
    }
    return;
}
//#endregion
//#region   //! Custom functions
function drawRect(ctx, x1, y1, dx, dy, colour) {
    ctx.fillStyle = colour;
    ctx.fillRect(x1, y1, dx, dy);
    return;
}

function drawLine(ctx, x1, y1, x2, y2, colour, thickness = defaultThickness) {
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = colour;
    ctx.stroke();
    return;
}

function drawCircle(ctx, x, y, colour, radius) {
    drawLine(ctx, x, y, x, y, colour, radius * 2);
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
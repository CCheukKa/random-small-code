var canvas = document.getElementById("myCanvas");
var c = canvas.getContext("2d");
document.body.style.cursor = 'none';

const horiRes = 1920;
const vertRes = 1080;
canvas.width = horiRes;
canvas.height = vertRes;

var palette = ['#1a2b47', '#25a282', '#bebe9d', '#cdab6b', '#c84c2b', '#FCAC58', '#F44B4D', '#903A3E', '#58B1A3'];
var timeStepMS = 1;

var mouseX, mouseY;

//boid defintion
const boidSize = 20;
var boidList = [];
class Boid {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.direction = Math.random() * 2 * Math.PI;
        this.colour = palette[Math.ceil(Math.random() * (palette.length - 1) + 0.5)];
        this.xRel = 0;
        this.yRel = 0;
        boidList.push(this);
    }
}
//
document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'c':
            deleteBoid();
            break;
    }
    return;
})
document.addEventListener('mousedown', e => {
    spawnBoid();
    return;
})
document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = vertRes - e.clientY;
    return;
})


setInterval(function() {
    physics();
    redraw();
}, timeStepMS);

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
    c.closePath();
    return;
}

function drawCircle(x, y, r, sA, eA, colour) {
    c.beginPath();
    c.arc(x, y, r, deg2rad(sA), deg2rad(eA));
    c.fillStyle = colour;
    c.lineTo(x, y);
    c.fill();
    c.closePath();
    return;
}

function deg2rad(deg) {
    return deg / 180 * Math.PI;
}

function rad2deg(rad) {
    return rad / Math.PI * 180;
}

function drawText(text, x, y, alignment, colour = 'black', strokeColour, textSize = 20, textStyle) {
    c.font = `${textStyle} ${textSize}px Arial`;

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
        c.font = `${textStyle} ${textSize}px Arial`;
        c.strokeStyle = strokeColour;
        c.strokeText(text, x, y + 5);
    }

    return;
}
//===================================================================
function pythag(p1, p2) {
    return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
}

function redraw() {
    drawRect(0, 0, horiRes, vertRes, palette[0]);
    boidList.forEach(boid => {
        drawCircle(boid.x, vertRes - boid.y, boidSize, 0, 360, boid.colour);
        drawLine(boid.x, vertRes - boid.y, boid.x + boid.xRel, vertRes - (boid.y + boid.yRel), 'red');
    });
    drawCircle(mouseX, vertRes - mouseY, boidSize * 1.2, 0, 360, 'red');
    return;
}

function spawnBoid() {
    new Boid(Math.random() * (horiRes - 4 * boidSize) + 2 * boidSize, Math.random() * (vertRes - 4 * boidSize) + 2 * boidSize);
    return;
}

function physics() {
    boidList.forEach(boid => {
        boid.direction = getDirection(boid.x, boid.y, mouseX, mouseY);
        boid.xRel = boidSize * 3 * Math.cos(boid.direction);
        boid.yRel = boidSize * 3 * Math.sin(boid.direction);
        //
        boid.x += boid.xRel * timeStepMS / 100;
        boid.y += boid.yRel * timeStepMS / 100;
    })
    return;
}

function getDirection(x1, y1, x2, y2) { //relative to 1
    var atan = Math.atan((y1 - y2) / (x1 - x2));
    var asin = Math.asin((y1 - y2) / pythag([x1, y1], [x2, y2]));
    if (atan > 0 && asin < 0) { //quadrant 1
        return atan;
    }
    if (atan < 0 && asin < 0) { //quadrant 2
        return asin + Math.PI;
    }
    if (atan > 0 && asin > 0) { //quadrant 3
        return atan + Math.PI;
    }
    if (atan < 0 && asin > 0) { //quadrant 4
        return Math.PI * 2 - asin;
    }
}

function deleteBoid() {
    boidList = [];
    console.log('Deleted boids');
    return;
}
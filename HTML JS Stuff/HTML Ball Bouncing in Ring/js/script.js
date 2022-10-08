var canvas = document.getElementById("myCanvas");
var c = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 1000;

//
class Ball {
    constructor(posX, posY, velX = 0, velY = 0, radius = 100) {
        this.radius = radius;
        this.pos = new Vector(posX, posY);
        this.vel = new Vector(velX, velY);
        this.acc = new Vector(0, 0);
        ballList.push(this);
    }
}
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    magnitude() {
        return Math.hypot(this.x, this.y);
    }
}
//

const palette = [ /*canvas*/ '#1a2b47', '#25a282', '#bebe9d', '#cdab6b', '#c84c2b', '#287287', '#f0bb5e', '#a2837d', '#d26931'];
const timeStepMS = 1;
const ringRadius = 400;
const ringThickness = 20;
const ballList = [];
const g = 0.05;

//
new Ball(250, 0, 0, 0, 100);
//

setInterval(function() {
    physics();
    redraw();
}, timeStepMS);

//===================================================================

function physics() { // (0,0) is center
    ballList.forEach(ball => {
        //acceleration
        ball.acc.y = -g;

        //velocity
        ball.vel.x += ball.acc.x;
        ball.vel.y += ball.acc.y;

        //position
        ball.pos.x += ball.vel.x;
        ball.pos.y += ball.vel.y;

        //collision test
        let posMag = ball.pos.magnitude();
        if (posMag >= ringRadius - ball.radius) {
            let preVel = ball.vel;
            //pre-clip
            ball.pos = new Vector(ball.pos.x / posMag * (ringRadius - ball.radius), ball.pos.y / posMag * (ringRadius - ball.radius));

            let inAngle = Math.acos((ball.pos.x * ball.vel.x + ball.pos.y * ball.vel.y) / (ball.pos.magnitude() * ball.vel.magnitude()));
            // console.log(inAngle / Math.PI * 180);
            //! Bounce vector how

            // let coeff = cosIn * ball.pos.magnitude();
            // ball.vel = new Vector(coeff / ball.pos.x, coeff / ball.pos.y);

        }
    });
}

function redraw() {
    //canvas
    drawRect(0, 0, canvas.width, canvas.height, palette[0]);

    //ring
    drawRing(canvas.width / 2, canvas.height / 2, ringRadius + ringThickness / 2, ringThickness, palette[1]);

    //balls
    ballList.forEach(ball => {
        // console.log(ball);
        drawCircle(ball.pos.x + canvas.width / 2, -ball.pos.y + canvas.height / 2, ball.radius, palette[2]);
    });

    //
    return;
}

//#region //? custom functions

function drawRect(x1, y1, dx, dy, colour) {
    c.fillStyle = colour;
    c.fillRect(x1, y1, dx, dy);
    return;
}

function drawCircle(x, y, r, colour) {
    c.beginPath();
    c.arc(x, y, r, 0, 2 * Math.PI);
    c.fillStyle = colour;
    c.lineTo(x, y);
    c.fill();
    return;
}

function drawRing(x, y, r, thickness, colour) {
    c.beginPath();
    c.arc(x, y, r, 0, 2 * Math.PI);
    c.strokeStyle = colour;
    c.lineWidth = thickness;
    c.stroke();
    return;
}

//#endregion
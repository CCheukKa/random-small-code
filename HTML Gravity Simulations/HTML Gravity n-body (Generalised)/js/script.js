/*
LOG:
-collision behaves weirdly
    -suspect: weird angles again
*/




var canvas = document.getElementById("myCanvas");
var c = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 1000;

//
class Planet {
    constructor(isFixed, mass, posX, posY, velX = 0, velY = 0) {
        this.mass = mass;
        this.posX = posX;
        this.posY = posY;
        this.radius = drawScale * Math.pow(this.mass, 1 / 3);
        this.isFixed = isFixed;
        this.velX = velX;
        this.velY = velY;
        this.accX = 0;
        this.accY = 0;

        planetList.push(this);
    }
}
//

const palette = [/*canvas*/'#1a2b47', '#25a282', '#bebe9d', '#cdab6b', '#c84c2b', '#287287', '#f0bb5e', '#a2837d', '#d26931'];
const timeStepMS = 1;
const drawScale = 10; //AFFECTS PHYSICS!!!
const velDrawScale = 500;
const accDrawScale = 50000;
const g = 0.08;
const planetPlot = 4;
const enableCollision = true; //!!! see log
const labelText = false;
const drawVel = false;
const drawAcc = false;
var planetCount;

var planetList = [];
for (let i = 0; i < planetCount; i++) {
    new Planet(false, 20 + 180 * Math.pow(Math.random(), 2), 100 + 800 * Math.random(), 100 + 800 * Math.random(), 0.2 * Math.random() - 0.1, 0.2 * Math.random() - 0.1);
}
//custom planets:
new Planet(false, 10000, 500, 500);
new Planet(false, 100, 100, 500, 0, +Math.sqrt(2));
new Planet(false, 100, 900, 500, 0, -Math.sqrt(2));
new Planet(false, 100, 500, 900, +Math.sqrt(2), 0);
new Planet(false, 100, 500, 100, -Math.sqrt(2), 0);
//
var planetCount = planetList.length;

setInterval(function () {
    physics();
    redraw();
    console.log('');
}, timeStepMS);

//===================================================================
function physics() {
    planetList.forEach(planet => {
        planet.accX = 0;
        planet.accY = 0;
    });

    for (let i = 0; i < planetCount - 1; i++) {
        let planetHost = planetList[i];
        for (let j = i + 1; j < planetCount; j++) {
            let planetClient = planetList[j];
            physicsSub(planetHost, planetClient);
        }
    }
    //acceleration is dealt with and added to accX/Y

    planetList.forEach(planet => {
        planet.velX += planet.accX;
        planet.velY += planet.accY;
    });

    if (enableCollision) {
        for (let i = 0; i < planetCount - 1; i++) {
            let planetHost = planetList[i];
            for (let j = i + 1; j < planetCount; j++) {
                let planetClient = planetList[j];
                collision(planetHost, planetClient);
            }
        }
    }

    planetList.forEach(planet => {
        if (planet.isFixed) { return; }
        planet.posX += planet.velX;
        planet.posY += planet.velY; 
    });

    return;    
}

function physicsSub(q, r) {
    let fx = 0, fy = 0;
    let f = g * q.mass * r.mass / Math.pow(Math.hypot(q.posX - r.posX, q.posY - r.posY), 2);
    
    //perspective from q
    let theta = Math.atan((r.posY - q.posY) / (r.posX - q.posX));
    if (q.posX > r.posX) { theta -= Math.PI; }
    fx = f * Math.cos(theta);
    fy = f * Math.sin(theta);

    q.accX += fx / q.mass;
    q.accY += fy / q.mass;
    r.accX -= fx / r.mass;
    r.accY -= fy / r.mass;

    return;
}

function collision(q, r) {
    if (Math.hypot(q.posX - r.posX, q.posY - r.posY) <= q.radius + r.radius) {

        //perspective from q
        let theta = Math.atan((r.posY - q.posY) / (r.posX - q.posX));
        if (r.posX < q.posX) { theta -= Math.PI; }

        let qTheta = Math.atan(q.velY / q.velX);
        if (q.velX < 0) { qTheta -= Math.PI; }
        let qVectorisedVelX = Math.hypot(q.velX, q.velY) * Math.cos(qTheta - theta);
        let qVectorisedVelY = Math.hypot(q.velX, q.velY) * Math.sin(qTheta - theta);

        let rTheta = Math.atan(r.velY / r.velX);
        if (r.velX < 0) { rTheta -= Math.PI; }
        let rVectorisedVelX = Math.hypot(r.velX, r.velY) * Math.cos(rTheta - theta);
        let rVectorisedVelY = Math.hypot(r.velX, r.velY) * Math.sin(rTheta - theta);

        let momentum = qVectorisedVelX * q.mass + rVectorisedVelX * r.mass;

        let resultVectorisedVel = momentum / (q.mass + r.mass);

        let qResultTheta = Math.atan(qVectorisedVelY / resultVectorisedVel);
        if (qVectorisedVelX < 0) { qResultTheta -= Math.PI; }
        qResultTheta += theta;
        q.velY = Math.sin(qResultTheta) * Math.hypot(resultVectorisedVel, qVectorisedVelY);
        q.velX = Math.cos(qResultTheta) * Math.hypot(resultVectorisedVel, qVectorisedVelY);

        let rResultTheta = Math.atan(rVectorisedVelY / resultVectorisedVel);
        if (rVectorisedVelX < 0) { rResultTheta -= Math.PI; }
        rResultTheta += theta;
        r.velY = Math.sin(rResultTheta) * Math.hypot(resultVectorisedVel, rVectorisedVelY);
        r.velX = Math.cos(rResultTheta) * Math.hypot(resultVectorisedVel, rVectorisedVelY);

    }
    return;
}
//===================================================================
{//custom functions
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
    function redraw() {
        //canvas
        drawRect(0, 0, canvas.width, canvas.height, palette[0]);
    
        //planets + labels
        for (let i = 0; i < planetCount; i++) {
            let p = planetList[i];
            drawCircle(p.posX, canvas.height - p.posY, p.radius, 0, 360, palette[i + 1]);
            if (labelText) {
                drawText(i + 1, p.posX, canvas.height - p.posY + 2, 0, 'white');
            }
            if (drawVel) {
                drawLine(p.posX, canvas.height - p.posY, p.posX + p.velX * velDrawScale, canvas.height - p.posY - p.velY * velDrawScale, 'white');
            }
            if (drawAcc) {
                drawLine(p.posX, canvas.height - p.posY, p.posX + p.accX * accDrawScale, canvas.height - p.posY - p.accY * accDrawScale, 'black');
            }
        }

        //
        return;
    }
}
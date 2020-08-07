const canvas = document.getElementById("myCanvas");
const c = canvas.getContext("2d");

const aspectRatio = 16 / 9;
const horiRes = 1280;
const vertRes = horiRes / aspectRatio;
canvas.width = horiRes;
canvas.height = vertRes;

const skyColour = '#2a9fdb';
const groundColour = '#91d676';
const timeStepMS = 1;

//class initialisation
class Camera{
    constructor(x, y, z, xRot, yRot, zRot, horizontalFOV = 100) {
        this.x = x; //horizontal
        this.y = y; //fowards
        this.z = z; //vertical
        this.xRot = xRot; // +ve = down
        this.yRot = yRot; // +ve = anti-clockwise
        this.zRot = zRot; // +ve = clockwise
        this.xFOV = deg2rad(horizontalFOV) / 2;
        this.yFOV = atan(Math.tan(this.xFOV) / aspectRatio);

        console.log(this);
    }
}
class Cube{
    constructor(x, y, z, sideLength = 10, zRot = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.sideLength = sideLength;
        this.zRot = zRot;

        console.log(this);
    }
}
//

//object initialisation
var cam = new Camera(0, 0, 10, 0, 0, 0, 100);
new Cube(0, 20, 10, 20);
//

document.addEventListener('keydown', function (e) {
    keyDown(e.key);
});

setInterval(function () {
    render();
}, timeStepMS);

//===================================================================
function render() {
    drawBG();
    drawGround();
    return;
}

function drawBG() { //sky + ground
    drawRect(0, 0, horiRes, vertRes, skyColour);

    let v = cam.yFOV;
    let r = cam.xRot;

    //fill whole screen check
    if (-r >= v) { return; }
    if (r >= v) {
        drawRect(0, 0, horiRes, vertRes, groundColour);
        return;
    }
    //

    let h = cam.z;
    let tanR = tan(r);
    let k = h / tan(v + r);
    let j = tan(v - r);
    let i = 1 - j * tanR;

    // A(k, 0)
    let Bx = h * tanR + k;
    // B(Bx, h)
    let Cx = (h * tanR + k) / i;
    let Cy = (h + j * k) / i;
    // C(Cx, Cy)


    //SkyHeight = BC
    let skyHeight = Math.hypot(Bx - Cx, h - Cy);
    //GroundHeight = AB
    let groundHeight = Math.hypot(k - Bx, h);

    drawRect(0, vertRes / (skyHeight + groundHeight) * skyHeight, horiRes, vertRes, groundColour);
    return;
}







//===================================================================
function keyDown(key) {
    switch (key) {
        case 'ArrowUp': {
            cam.xRot -= deg2rad(1);
            cam.xRot = clamp(cam.xRot, -Math.PI, Math.PI);
            break;
        }
        case 'ArrowDown': {
            cam.xRot += deg2rad(1);
            cam.xRot = clamp(cam.xRot, -Math.PI, Math.PI);
            break;
        }

        default: {
            break;
        }
    }
    
    return;
}


//===================================================================
 function drawRect(x1, y1, x2, y2, colour) {
    c.fillStyle = colour;
    c.fillRect(x1, y1, x2 - x1, y2 - y1);
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
function sin(angle) { return Math.sin(angle); }
function cos(angle) { return Math.cos(angle); }
function tan(angle) { return Math.tan(angle); }
function asin(angle) { return Math.asin(angle); }
function acos(angle) { return Math.acos(angle); }
function atan(angle) { return Math.atan(angle); }
function clamp(x, limit1, limit2) {
    if (limit1 > limit2) { return clamp(x, limit2, limit1); }
    if (x < limit1) { return limit1; }
    if (x > limit2) { return limit2; }
    return x;
}

var canvas = document.getElementById("myCanvas");
var c = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 1000;

var palette = ['#1a2b47', '#25a282', '#bebe9d', '#cdab6b', '#c84c2b'];
var timeStepMS = 1;
var drawScale = 10;
const g = 0.1;

//varspace
var m1 = 100,
    p1 = [400, 500];
var m2 = 60,
    p2 = [600, 700];
var m3 = 20,
    p3 = [500, 300];

//autovar
var r1 = drawScale * Math.pow(m1, 1 / 3),
    r2 = drawScale * Math.pow(m2, 1 / 3),
    r3 = drawScale * Math.pow(m3, 1 / 3);
//physicsvar
var isColliding = false;
var v1 = [Math.random() / 10, Math.random()/10],
    v2 = [Math.random() / 10, Math.random()/10],
    v3 = [Math.random() / 10, Math.random()/10];
var a1 = [0, 0],
    a2 = [0, 0],
    a3 = [0, 0];
//



setInterval(function () {
    physics();
    redraw();
    console.log('');
}, timeStepMS);



//===================================================================
function drawRect(x1, y1, dx, dy, colour) {
        c.fillStyle = colour;
        c.fillRect(x1, y1, dx, dy);
        return;
}
function drawLine(x1, y1, x2, y2, colour) {
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
    
    //planets
    drawCircle(p1[0], canvas.height - p1[1], r1, 0, 360, palette[1]);
    drawCircle(p2[0], canvas.height - p2[1], r2, 0, 360, palette[2]);
    drawCircle(p3[0], canvas.height - p3[1], r3, 0, 360, palette[3]);
    
    //labels
    drawText("1", p1[0], canvas.height - p1[1], 0, 'white');
    drawText("2", p2[0], canvas.height - p2[1], 0, 'white');
    drawText("3", p3[0], canvas.height - p3[1], 0, 'white');
    

    //
    return;
}
//===================================================================
function pythag(p1, p2) {
    return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
}
function physics() {
    a1 = [0, 0], a2 = [0, 0], a3 = [0, 0];
    //
    var r = physicsSub(m1, m2, p1, p2);
    a1[0] += r[0];
    a1[1] += r[1];
    a2[0] += r[2];
    a2[1] += r[3];
    //
    var r = physicsSub(m1, m3, p1, p3);
    a1[0] += r[0];
    a1[1] += r[1];
    a3[0] += r[2];
    a3[1] += r[3];
    //
    var r = physicsSub(m2, m3, p2, p3);
    a2[0] += r[0];
    a2[1] += r[1];
    a3[0] += r[2];
    a3[1] += r[3];

    //
    v1[0] += a1[0];
    v1[1] += a1[1];
    v2[0] += a2[0];
    v2[1] += a2[1];
    v3[0] += a3[0];
    v3[1] += a3[1];
    //
    p1[0] += v1[0];
    p1[1] += v1[1];
    p2[0] += v2[0];
    p2[1] += v2[1];
    p3[0] += v3[0];
    p3[1] += v3[1];
    //

    {//collisionCheck
    /*
    isColliding = pythag(p1, p2) <= r1 + r2;
    if (isColliding) { //momentum
        var v12 = [0, 0];
        v12[0] = (m1 * v1[0] + m2 * v2[0]) / (m1 + m2);
        v12[1] = (m1 * v1[1] + m2 * v2[1]) / (m1 + m2);

        v1 = [v12[0], v12[1]];
        v2 = [v12[0], v12[1]];
    } else {
        v1[0] += a1[0];
        v1[1] += a1[1];
        v2[0] += a2[0];
        v2[1] += a2[1];
    }
    */
    }

    return;    
}
function physicsSub(m1, m2, p1, p2) {
    var f1 = [0, 0], f2 = [0, 0];
    var f = g * m1 * m2 / Math.pow(pythag(p1, p2), 2);

    //from 1
    var theta = Math.atan((p2[1] - p1[1]) / (p2[0] - p1[0]));

    if (p1[0] > p2[0]) {
        theta -= Math.PI;
    }

    f1 = [Math.sign(p2[0] - p1[0]) * Math.abs(f * Math.cos(theta)), Math.sign(p2[1] - p1[1]) * Math.abs(f * Math.sin(theta))];
    f2 = [-f1[0], -f1[1]];

    a1x = f1[0] / m1;
    a1y = f1[1] / m1;
    a2x = f2[0] / m2;
    a2y = f2[1] / m2;

    return [a1x, a1y, a2x, a2y];
}
const rawCanvasElement = document.getElementById('rawCanvas');
const processedCanvasElement = document.getElementById('processedCanvas');
const rawContext = rawCanvasElement.getContext('2d');
const processedContext = processedCanvasElement.getContext('2d');
rawCanvasElement.width = 700;
rawCanvasElement.height = 700;
processedCanvasElement.width = 192 * 3;
processedCanvasElement.height = 108 * 3;

const colour = {
    1: getComputedStyle(document.documentElement).getPropertyValue('--colour1'),
    2: getComputedStyle(document.documentElement).getPropertyValue('--colour2'),
    3: getComputedStyle(document.documentElement).getPropertyValue('--colour3'),
    4: getComputedStyle(document.documentElement).getPropertyValue('--colour4'),
    5: getComputedStyle(document.documentElement).getPropertyValue('--colour5'),
}
const rawMousePos = { x: 0, y: 0 };
var corners = [
    { x: 100, y: 100 },
    { x: 600, y: 100 },
    { x: 600, y: 600 },
    { x: 100, y: 600 },
]


const COOKIE_NAME = 'corners';
var cookie;
try { cookie = JSON.parse(Cookies.get(COOKIE_NAME)); } catch (e) { console.log(e); }
if (cookie) {
    console.log(cookie);
    corners = cookie;
} else {
    console.log('no cookie');
}

/* -------------------------------------------------------------------------- */
setInterval(() => {
    redrawRawCanvas();
    redrawScreen();
    redrawRawLaser();

    redrawProcessedCanvas();
    redrawProcessedLaser();
}, 1000 / 60);

rawCanvasElement.addEventListener('mousemove', (event) => {
    var bounds = rawCanvasElement.getBoundingClientRect();
    rawMousePos.x = event.clientX - bounds.left - rawCanvasElement.clientLeft;
    rawMousePos.y = event.clientY - bounds.top - rawCanvasElement.clientTop;

    // logDistance = true;
});
window.addEventListener('keypress', (event) => {
    // console.log(rawMousePos);
    switch (event.key) {
        case 'q':
            corners[0] = JSON.parse(JSON.stringify(rawMousePos));
            break;
        case 'w':
            corners[1] = JSON.parse(JSON.stringify(rawMousePos));
            break;
        case 'a':
            corners[3] = JSON.parse(JSON.stringify(rawMousePos));
            break;
        case 's':
            corners[2] = JSON.parse(JSON.stringify(rawMousePos));
            break;
        default:
            break;
    }
    // console.log(corners);
    Cookies.set(COOKIE_NAME, JSON.stringify(corners));
});

/* -------------------------------------------------------------------------- */

function redrawRawCanvas() {
    rawContext.fillStyle = colour[2];
    rawContext.fillRect(0, 0, rawCanvasElement.width, rawCanvasElement.height);
}

function redrawScreen() {
    drawCircle(rawContext, corners[0].x, corners[0].y, 2, colour[4]);
    drawCircle(rawContext, corners[1].x, corners[1].y, 2, colour[4]);
    drawCircle(rawContext, corners[2].x, corners[2].y, 2, colour[4]);
    drawCircle(rawContext, corners[3].x, corners[3].y, 2, colour[4]);
    //
    rawContext.beginPath();
    rawContext.moveTo(corners[0].x, corners[0].y);
    rawContext.lineTo(corners[1].x, corners[1].y);
    rawContext.lineTo(corners[2].x, corners[2].y);
    rawContext.lineTo(corners[3].x, corners[3].y);
    rawContext.lineTo(corners[0].x, corners[0].y);
    rawContext.fillStyle = colour[3];
    rawContext.fill();
    rawContext.strokeStyle = colour[4];
    rawContext.stroke();
    rawContext.closePath();
}

function redrawRawLaser() {
    drawCircle(rawContext, rawMousePos.x, rawMousePos.y, 4, colour[4]);
}

function redrawProcessedCanvas() {
    processedContext.fillStyle = colour[2];
    processedContext.fillRect(0, 0, processedCanvasElement.width, processedCanvasElement.height);
}

// var logDistance = false;
// var maxDistance = -Infinity;
const maxToleranceDistance = 2;
const conservator = 0.8;
function redrawProcessedLaser() {
    var normalisedMousePos = { x: 0, y: 0 };
    //TODO: find a better approach (is there a definite formula for this?)

    const stepSize = 0.001;
    const iterations = 10;
    var testPosition = { x: 0.5, y: 0.5 };
    var i = 0;

    const points = []; //TODO: remove this

    while (++i <= iterations) {
        // newton's method
        var testPoint = getWarpedPoint(testPosition);
        var distance = getDistance(testPoint, rawMousePos);

        var gradient = {
            x: (getDistance(getWarpedPoint({ x: testPosition.x + stepSize, y: testPosition.y }), rawMousePos) - distance) / stepSize,
            y: (getDistance(getWarpedPoint({ x: testPosition.x, y: testPosition.y + stepSize }), rawMousePos) - distance) / stepSize,
        }
        var gradientLength = getLength(gradient);
        var normal = {
            x: gradient.x / gradientLength,
            y: gradient.y / gradientLength,
        }
        var normalisedDistance = distance / gradientLength;

        testPosition.x -= normalisedDistance * normal.x * conservator;
        testPosition.y -= normalisedDistance * normal.y * conservator;

        points.push(JSON.parse(JSON.stringify(testPosition))); //TODO: remove this

        if (distance < maxToleranceDistance) { break; }
        // console.log(i, distance);
    }
    // if (logDistance) {
    //     maxDistance = Math.max(getDistance(testPoint, rawMousePos), maxDistance)
    //     console.log(i, maxDistance);
    // }

    normalisedMousePos = testPosition;
    // console.log(normalisedMousePos);

    //TODO: remove this
    rawContext.strokeStyle = colour[1];
    rawContext.beginPath();
    let s = getWarpedPoint({ x: 0.5, y: 0.5 });
    rawContext.moveTo(s.x, s.y);
    points.forEach(p => {
        let w = getWarpedPoint(p);
        rawContext.lineTo(w.x, w.y);
    })
    rawContext.stroke();
    rawContext.closePath();
    //

    drawCircle(rawContext, testPoint.x, testPoint.y, 4, colour[5]);
    drawCircle(processedContext, normalisedMousePos.x * processedCanvasElement.width, normalisedMousePos.y * processedCanvasElement.height, 4, colour[4]);
    drawLine(rawContext, testPoint, rawMousePos, colour[5]);
}


/* -------------------------------------------------------------------------- */

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

function lerpPoints(a, b, t) {
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
    }
}

function getWarpedPoint(normalisedPosition) {
    var left = lerpPoints(corners[0], corners[3], normalisedPosition.y);
    var right = lerpPoints(corners[1], corners[2], normalisedPosition.y);
    return lerpPoints(left, right, normalisedPosition.x);
}

function getDistance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function getLength(p) {
    return Math.sqrt(p.x * p.x + p.y * p.y);
}
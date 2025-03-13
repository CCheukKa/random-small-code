const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const log = document.getElementById('log');

const etaCountdownWidth = 0.3;
const etaCountdownHeight = 0.15;
const clockFaceRadius = 1;

canvas.addEventListener('mousemove', update);

update();
function update(event) {
    const x = event?.offsetX / canvas.width * 4 - 2;
    const y = -event?.offsetY / canvas.height * 4 + 2;
    log.innerText = `x: ${Math.round(x * 1000) / 1000}\ny: ${Math.round(y * 1000) / 1000}`;


    drawRect(0, 0, 2, 2, 'black');
    drawCircle(0, 0, clockFaceRadius, 'white');
    drawRect(x, y, 0.3, 0.15, isValidPosition(x, y) ? 'lime' : 'red');
}


function isValidPosition(x, y) {
    x = Math.abs(x);
    y = Math.abs(y);

    if (x >= etaCountdownWidth + clockFaceRadius) { return true; }
    if (y >= etaCountdownHeight + clockFaceRadius) { return true; }

    if (x < etaCountdownWidth) { return false; }
    if (y < etaCountdownHeight) { return false; }

    return (x - etaCountdownWidth) ** 2 + (y - etaCountdownHeight) ** 2 >= clockFaceRadius ** 2;
}

/* -------------------------------------------------------------------------- */
function toCanvasCoords(x, y) {
    return {
        x: x / 2 * canvas.width / 2 + canvas.width / 2,
        y: -y / 2 * canvas.height / 2 + canvas.height / 2,
    };
}
function toCanvasLength(length) {
    return length / 2 * canvas.width / 2;
}
function drawRect(x, y, width, height, color) {
    const coords = toCanvasCoords(x, y);
    width = toCanvasLength(width);
    height = toCanvasLength(height);
    ctx.fillStyle = color;
    ctx.fillRect(coords.x - width, coords.y - height, width * 2, height * 2);
}
function drawCircle(x, y, radius, color) {
    const coords = toCanvasCoords(x, y);
    radius = toCanvasLength(radius);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, radius, 0, 2 * Math.PI);
    ctx.fill();
}
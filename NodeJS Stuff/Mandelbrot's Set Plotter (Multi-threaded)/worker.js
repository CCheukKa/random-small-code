const { Worker, isMainThread, workerData, parentPort } = require('worker_threads');

var drawListX = [],
    drawListY = [];

let y = workerData.startPoint + workerData.range / workerData.userCPUCount * workerData.i;
for (let j = 0; j <= Math.ceil(workerData.steps / workerData.userCPUCount); j++) {
    subDraw(y + workerData.stepY * j);
}
parentPort.postMessage({
    xList: drawListX,
    yList: drawListY,
});
return;

function subDraw(y) {
    if (Math.abs(y) >= 1.05) { return; }
    for (let x = workerData.centerX - workerData.drawScaleX / 2; x < workerData.centerX + workerData.drawScaleX / 2; x += workerData.stepX) {
        if (x >= 0.5 | x <= -2.05) { continue; }
        if (isInMandelbrot(x, y)) {
            drawListX.push(x);
            drawListY.push(y);
        }
    }
}

function isInMandelbrot(a, b) {
    let za = a,
        zb = b,
        hasVisited = [`${a}+${b}`];
    while (isFinite(za + zb)) {
        let temp = za * za - zb * zb + a;
        zb = 2 * za * zb + b;
        za = temp;
        let repeat = false;
        hasVisited.forEach(element => {
            if (element == `${za}+${zb}`) {
                repeat = true;
                return;
            }
        });
        if (repeat) { return true; }
        if (hasVisited.length >= workerData.maxAllowedIterations) { return true; }
        hasVisited.push(`${za}+${zb}`);
    }
    return false;
}
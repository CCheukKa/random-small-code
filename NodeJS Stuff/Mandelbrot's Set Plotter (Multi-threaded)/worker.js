const { Worker, isMainThread, workerData, parentPort } = require('worker_threads');

var drawListX = [],
    drawListY = [];


for (let y = workerData.startY; y < workerData.endY; y += workerData.stepY) {
    subDrawRow(y);
}
parentPort.postMessage({
    xList: drawListX,
    yList: drawListY,
});
return;

function subDrawRow(y) {
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
    //! FIXME: stuck here???
    let za = a;
    let zb = b;
    // let hasVisited = [`${a}+${b}`];
    let visited = 0;
    while (isFinite(za + zb)) {
        let temp = za * za - zb * zb + a;
        zb = 2 * za * zb + b;
        za = temp;
        // if (hasVisited.some(element => { element == `${za}+${zb}` })) { return true; }
        // if (hasVisited.length >= workerData.maxAllowedIterations) { return true; }
        // hasVisited.push(`${za}+${zb}`);
        if (++visited >= workerData.maxAllowedIterations) { return true; }
    }
    return false;
}
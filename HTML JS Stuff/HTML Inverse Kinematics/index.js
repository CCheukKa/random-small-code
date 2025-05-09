"use strict";
const log1Element = document.getElementById("log1");
const log2Element = document.getElementById("log2");
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const arms = [
    { length: 100, width: 20, absoluteAngle: 0, colour: "blue" },
    { length: 75, width: 15, absoluteAngle: 0, colour: "green" },
    { length: 50, width: 10, absoluteAngle: 0, colour: "yellow" },
    { length: 25, width: 5, absoluteAngle: 0, colour: "orange" },
];
const armAngularSpeed = 0.0005;
let mouseX = 0;
let mouseY = 0;
window.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left - width / 2;
    mouseY = rect.top - e.clientY + height / 2;
    updateFrame();
});
requestAnimationFrame(updateTick);
/* -------------------------------------------------------------------------- */
let lastTickTime = 0;
function updateTick() {
    updateRobot();
    updateFrame();
    //
    const nowTime = performance.now();
    const deltaTime = nowTime - lastTickTime;
    lastTickTime = nowTime;
    log1Element.textContent = `TPS: ${Math.round(1000 / deltaTime)}`;
    requestAnimationFrame(updateTick);
}
function updateRobot() {
    const totalArmLength = arms.reduce((l, arm) => l + arm.length, 0);
    const md = _calculateDistance([0, 0], [mouseX, mouseY]);
    const mx = md > totalArmLength ? mouseX / md * totalArmLength : mouseX;
    const my = md > totalArmLength ? mouseY / md * totalArmLength : mouseY;
    const armAngles = arms.map(a => a.absoluteAngle);
    const d = _calculateDistance([mx, my], _calculateTipPosition(armAngles));
    const dds = [];
    const dθ = 0.01;
    for (let i = 0; i < arms.length; i++) {
        const nArmAngles = armAngles.copyWithin(0, 0);
        nArmAngles[i] += dθ;
        const nd = _calculateDistance([mx, my], _calculateTipPosition(nArmAngles));
        const dd = (d - nd) / dθ;
        dds[i] = dd;
    }
    const adjustedAngularSpeed = armAngularSpeed * d / 10;
    for (let i = 0; i < arms.length; i++) {
        arms[i].absoluteAngle += dds[i] * adjustedAngularSpeed;
    }
    /* -------------------------------------------------------------------------- */
    function _calculateDistance([x1, y1], [x2, y2]) {
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }
    function _calculateTipPosition(armAngles) {
        if (armAngles.length !== arms.length) {
            throw new Error("Arm angles length does not match arms length.");
        }
        let [tipX, tipY] = [0, 0];
        for (let i = 0; i < armAngles.length; i++) {
            const angle = armAngles[i];
            const arm = arms[i];
            tipX += Math.cos(angle) * arm.length;
            tipY += Math.sin(angle) * arm.length;
        }
        return [tipX, tipY];
    }
}
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
let lastFrameTime = 0;
function updateFrame() {
    _drawCentredRect(0, 0, width, height, "#1f2122");
    //
    drawRobot();
    //
    _drawCircle(0, 0, 2, "aqua");
    _drawCircle(mouseX, mouseY, 5, "red");
    //
    const nowTime = performance.now();
    const deltaTime = nowTime - lastFrameTime;
    lastFrameTime = nowTime;
    log2Element.textContent = `FPS: ${Math.round(1000 / deltaTime)}`;
}
function drawRobot() {
    let [tipX, tipY] = [0, 0];
    for (const arm of arms) {
        const x = tipX + Math.cos(arm.absoluteAngle) * arm.length;
        const y = tipY + Math.sin(arm.absoluteAngle) * arm.length;
        _drawCircle(tipX, tipY, arm.width / 2, arm.colour);
        _drawLine(tipX, tipY, x, y, arm.width, arm.colour);
        _drawCircle(x, y, arm.width / 2, arm.colour);
        tipX = x;
        tipY = y;
    }
}
/* -------------------------------------------------------------------------- */
function _xyToCanvasSpace(x, y) {
    return [x + width / 2, -y + height / 2];
}
function _drawCentredRect(x, y, w, h, colour) {
    ctx.fillStyle = colour;
    const [cx, cy] = _xyToCanvasSpace(x, y);
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
}
function _drawFromToRect(x1, y1, x2, y2, colour) {
    ctx.fillStyle = colour;
    const [cx1, cy1] = _xyToCanvasSpace(x1, y1);
    const [cx2, cy2] = _xyToCanvasSpace(x2, y2);
    ctx.fillRect(cx1, cy1, cx2 - cx1, cy2 - cy1);
}
function _drawCircle(x, y, r, colour) {
    ctx.fillStyle = colour;
    ctx.beginPath();
    const [cx, cy] = _xyToCanvasSpace(x, y);
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
}
function _drawLine(x1, y1, x2, y2, thickness, colour) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    const [cx1, cy1] = _xyToCanvasSpace(x1, y1);
    const [cx2, cy2] = _xyToCanvasSpace(x2, y2);
    ctx.moveTo(cx1, cy1);
    ctx.lineTo(cx2, cy2);
    ctx.stroke();
    ctx.closePath();
}
//# sourceMappingURL=index.js.map
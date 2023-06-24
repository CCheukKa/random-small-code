//#region //! constants
const renderRate = 60;
const renderDeltaTime = 1 / renderRate;
const physicsTimeScale = 0.5;
const physicsRate = 60;
const physicsDeltaTime = 1 / physicsRate;
const canvasSize = new Vector2D(1000, 700);
const palette = {
    backgroundColour: '#13253E',
    colour1: '#8BB6AA',
    colour2: '#F3AF73',
    colour3: '#F76965',
    colour4: '#b565f7',
    colour5: '#8D4546'
}
const noRefresh = false;
const noDraw = false;
//#endregion


//#region //! physics constants
const desiredSectorSize = 100;
//* staggered overlapping sectors
const sectorCount = new Vector2D(Math.ceil(canvasSize.x / desiredSectorSize) * 2 - 1, Math.ceil(canvasSize.y / desiredSectorSize) * 2 - 1);
const sectorSize = new Vector2D(canvasSize.x / Math.ceil(canvasSize.x / desiredSectorSize), canvasSize.y / Math.ceil(canvasSize.y / desiredSectorSize));
const totalSectorCount = sectorCount.x * sectorCount.y;
//#endregion


//#region //! HTML setup
const canvasElement = document.getElementById('myCanvas');
const canvasContext = canvasElement.getContext('2d');
canvasElement.width = canvasSize.x;
canvasElement.height = canvasSize.y;
//#endregion


//#region //! initialisation
const entityList = [];

const circle = new Entity({
    position: new Vector2D(canvasSize.x / 2 + 100, canvasSize.y / 2),
    renderInterface: {
        fill: true,
        renderFunctions: [
            x => { return Math.sqrt(20 ** 2 - x ** 2) },
            x => { return -Math.sqrt(20 ** 2 - x ** 2) },
        ]
    },
    physics: { collisionFunction: 'x^2 + y^2 = 20^2' }
});
// const circle2 = new Entity({
//     position: new Vector2D(canvasSize.x / 2 - 10, canvasSize.y / 2),
//     renderInterface: {
//         fill: true,
//         renderFunctions: [
//             x => { return Math.sqrt(20 ** 2 - x ** 2) },
//             x => { return -Math.sqrt(20 ** 2 - x ** 2) },
//         ]
//     },
//     physics: { collisionFunction: 'x^2 + y^2 = 20^2' }
// });
const sine = new Entity({
    position: new Vector2D(canvasSize.x / 2, 100),
    isStatic: true,
    renderInterface: {
        fill: false,
        renderFunctions: [
            x => { return Math.sin(x / 80) * 50 },
        ]
    },
    physics: { collisionFunction: 'y = sin(x / 80) * 50' }
});
// const leftWall = new Entity({
//     position: new Vector2D(0, 0),
//     isStatic: true,
//     renderInterface: {
//         fill: false,
//         renderFunctions: [
//             x => { return 1000 * x },
//         ]
//     },
//     physics: { collisionFunction: 'x = 0' }
// });
// const rightWall = new Entity({
//     position: new Vector2D(canvasSize.x, 0),
//     isStatic: true,
//     renderInterface: {
//         fill: false,
//         renderFunctions: [
//             x => { return -1000 * x },
//         ]
//     },
//     physics: { collisionFunction: 'x = 0' }
// });

var lastPhysicsFrameTime = new Date().getTime(); //* analytics
const physicsFrameTimes = []; //* analytics
setInterval(() => {
    drawRequestQueues.forEach(drawRequestQueue => drawRequestQueue.length = 0);
    physics();

    //* analytics
    const nowTime = new Date().getTime();
    const physicsFrameTime = nowTime - lastPhysicsFrameTime;
    physicsFrameTimes.push(physicsFrameTime);
    lastPhysicsFrameTime = nowTime;
    if (physicsFrameTimes.length >= physicsRate) {
        const frameTimeRunningAverage = physicsFrameTimes.reduce((sum, time) => sum + time) / physicsFrameTimes.length;
        console.log(`physics: ${(frameTimeRunningAverage).toFixed(2)}/${(physicsDeltaTime * 1000 / physicsTimeScale).toFixed(2)}ms (${(1000 / frameTimeRunningAverage).toFixed(2)}/${physicsRate * physicsTimeScale}pps)`);
        physicsFrameTimes.length = 0;
    }

}, physicsDeltaTime * 1000 / physicsTimeScale);


var lastRenderFrameTime = new Date().getTime(); //* analytics
const renderFrameTimes = []; //* analytics
if (noRefresh) { drawBackground(); }
setInterval(() => {
    if (noDraw) { return; }
    redraw();

    //* analytics
    const nowTime = new Date().getTime();
    const renderFrameTime = nowTime - lastRenderFrameTime;
    renderFrameTimes.push(renderFrameTime);
    lastRenderFrameTime = nowTime;
    if (renderFrameTimes.length >= renderRate) {
        const frameTimeRunningAverage = renderFrameTimes.reduce((sum, time) => sum + time) / renderFrameTimes.length;
        console.log(`render: ${(frameTimeRunningAverage).toFixed(2)}/${(renderDeltaTime * 1000).toFixed(2)}ms (${(1000 / frameTimeRunningAverage).toFixed(2)}/${renderRate}fps)`);
        renderFrameTimes.length = 0;
    }

}, renderDeltaTime * 1000);
//#endregion
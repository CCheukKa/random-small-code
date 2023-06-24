//#region //! render functions
const preDrawRequestQueue = [];
const mainDrawRequestQueue = [];
const postDrawRequestQueue = [];
const drawRequestQueues = [preDrawRequestQueue, mainDrawRequestQueue, postDrawRequestQueue];
/* //* format for draw request example
    drawRequestQueue.push(
        {
            //* drawCircle(entity.position, entityRadius, palette.entityColour);
            reqFunction: drawCircle,
            position: entity.position,
            radius: entityRadius,
            colour: palette.entityColour
        }
    );
*/


function redraw() {
    // background
    if (!noRefresh) { drawBackground(); }

    // queue entities
    entityList.forEach(entity => {
        // queueEntityMesh(entity);
        queueEntityFunction(entity);
    });

    // draw queues
    drawRequestQueues.forEach(drawRequestQueue => {
        drawRequestQueue.forEach(request => {
            // console.log('new');
            // console.log(request);
            const { reqFunction, ...args } = request;
            // console.log(args);
            reqFunction.apply(null, Object.values(args));
        });
    });
}

function drawBackground() {
    canvasContext.fillStyle = palette.backgroundColour;
    canvasContext.fillRect(0, 0, canvasSize.x, canvasSize.y);
}

function drawPoint(position, colour) {
    drawCircle(position, 2, colour);
}

function drawPath(points = [], width, colour, fill = true) {
    // console.log({ points, width, colour });
    if (points.length < 2) { return; } //? prevent errors from drawing a path with less than 2 points

    canvasContext.strokeStyle = colour;
    canvasContext.lineCap = 'round';
    canvasContext.lineWidth = width;
    canvasContext.beginPath();
    canvasContext.moveTo(points[0].x, canvasSize.y - points[0].y);
    for (let i = 1; i < points.length; i++) { canvasContext.lineTo(points[i].x, canvasSize.y - points[i].y); }
    canvasContext.stroke();
    if (fill) {
        canvasContext.fillStyle = colour;
        canvasContext.fill();
    }
    canvasContext.closePath();
}

function drawTriangle(points, colour) {
    canvasContext.fillStyle = colour;
    canvasContext.beginPath();
    canvasContext.moveTo(points[0].x, canvasSize.y - points[0].y);
    canvasContext.lineTo(points[1].x, canvasSize.y - points[1].y);
    canvasContext.lineTo(points[2].x, canvasSize.y - points[2].y);
    canvasContext.fill();
    canvasContext.closePath();
}

function drawCircle(position, radius, colour) {
    canvasContext.fillStyle = colour;
    canvasContext.beginPath();
    canvasContext.arc(position.x, canvasSize.y - position.y, radius, 0, 2 * Math.PI);
    canvasContext.fill();
}

//#endregion

// //#region //! mesh functions
// // var totalPoints = 0; //* analytics
// // var droppedPoints = 0; //* analytics
// // var totalSteps = 0; //* analytics
// function generateMeshPoints(entity) {
//     const pointCount = 100;
//     // const pointCount = 10;
//     const meshPoints = [];
//     const maxStepCount = 9; //? experimentally fastest
//     const zeroTolerance = 10;

//     // const testPointList = []; // TODO: remove this
//     const passPointList = []; // TODO: remove this
//     // console.log(entity);

//     for (let i = 0; i < pointCount; i++) {
//         var screenSpacePosition;
//         if (entity.isStatic) {
//             // use bounding box to generate random point for accuracy
//             // TODO: store generated mesh points?
//             screenSpacePosition = new Vector2D(
//                 Math.random() * (entity.boundingBoxCorners[1].x - entity.boundingBoxCorners[0].x),
//                 Math.random() * (entity.boundingBoxCorners[1].y - entity.boundingBoxCorners[0].y)
//             ).add(entity.boundingBoxCorners[0]).add(entity.position);
//         } else {
//             screenSpacePosition = new Vector2D(Math.random() * canvasSize.x, Math.random() * canvasSize.y);
//         }
//         var lastFrameMeshFunctionValue = null;
//         var lastScreenSpacePosition = null;
//         for (let i = 0; i < maxStepCount; i++) {
//             // totalSteps++; //* analytics
//             // testPointList.push(screenSpacePosition); //TODO: remove this

//             // gradient descent through 0
//             var entitySpacePosition = screenSpacePosition.subtract(entity.position);
//             const meshFunctionValue = entity.meshFunction.evaluate(entitySpacePosition);
//             const gradient = new Vector2D(
//                 entity.meshFunction.evaluate(entitySpacePosition.add(new Vector2D(1, 0))) - meshFunctionValue,
//                 entity.meshFunction.evaluate(entitySpacePosition.add(new Vector2D(0, 1))) - meshFunctionValue
//             );

//             // FIXME: make this work for all functions
//             // works best for circles:      stepSize = 0.1
//             // works best for parabolas:    stepSize = meshFunctionValue / gradient.magnitude
//             const stepSize = Math.random() >= 0.1 ? 0.1 : meshFunctionValue / gradient.magnitude;

//             entitySpacePosition = entitySpacePosition.subtract(gradient.scale(stepSize));
//             screenSpacePosition = entitySpacePosition.add(entity.position);

//             if (lastFrameMeshFunctionValue * meshFunctionValue < 0 || (Math.abs(meshFunctionValue) <= zeroTolerance && lastFrameMeshFunctionValue !== null)) {
//                 const candidatePoint = screenSpacePosition.add(lastScreenSpacePosition).scale(0.5);


//                 // FIXME: make this work for all functions
//                 // works best for circles:      zeroTolerance * 400
//                 // works best for parabolas:    zeroTolerance * 1.5
//                 if (Math.abs(entity.meshFunction.evaluate(candidatePoint.subtract(entity.position))) <= zeroTolerance * (entity.isStatic ? 1.5 : 400)) {
//                     if (candidatePoint.x >= 0 && candidatePoint.x <= canvasSize.x && candidatePoint.y >= 0 && candidatePoint.y <= canvasSize.y) {
//                         passPointList.push(candidatePoint); //TODO: remove this
//                         meshPoints.push(candidatePoint);
//                         break;
//                     }
//                 }
//             }
//             lastFrameMeshFunctionValue = meshFunctionValue;
//             lastScreenSpacePosition = screenSpacePosition;

//             // if (i == maxStepCount - 1) { droppedPoints++; } //* analytics
//         }
//         // totalPoints++; //* analytics
//     }


//     // TODO: remove this
//     // testPointList.forEach(pointPosition => {
//     //     preDrawRequestQueue.push({
//     //         reqFunction: drawPoint,
//     //         position: pointPosition,
//     //         colour: palette.colour1
//     //     });
//     // });
//     passPointList.forEach(pointPosition => {
//         mainDrawRequestQueue.push({
//             reqFunction: drawPoint,
//             position: pointPosition,
//             colour: palette.colour3
//         });
//     });

//     //* analytics
//     // console.log(`dropped: ${droppedPoints}/${totalPoints} (${(droppedPoints / totalPoints * 100).toFixed(2)}%); spp: ${(totalSteps / (totalPoints - droppedPoints)).toFixed(2)}`);

//     return meshPoints;
// }

// function queueEntityMesh(entity) {
//     const meshPoints = generateMeshPoints(entity);
//     if (meshPoints.length < 3) { return; } // do this until a better mesh generation algorithm is implemented

//     //TODO: remove this
//     // drawRequestQueues.forEach(drawRequestQueue => {
//     //     drawRequestQueue.forEach(request => {
//     //         // console.log('new');
//     //         // console.log(request);
//     //         const { reqFunction, ...args } = request;
//     //         // console.log(args);
//     //         reqFunction.apply(null, Object.values(args));
//     //     });
//     // });

//     // start from leftmost point
//     const leftmostPoint = meshPoints.reduce((leftmostPoint, point) => point.x < leftmostPoint.x ? point : leftmostPoint, meshPoints[0]);
//     const leftmostPointIndex = meshPoints.indexOf(leftmostPoint);
//     var startPoint = meshPoints[leftmostPointIndex];
//     meshPoints.splice(leftmostPointIndex, 1);
//     while (meshPoints.length >= 2) {
//         // console.log(meshPoints);
//         const triangle = [];
//         // find a point to the left or closest point
//         var leftPoint = meshPoints.reduce((leftPoint, point) => point.x < leftPoint.x ? point : leftPoint, meshPoints[0]);
//         var closestPoint =
//             leftPoint.x < startPoint.x
//                 ? leftPoint
//                 : meshPoints.reduce((closestPoint, point) => point.distanceTo(startPoint) < closestPoint.distanceTo(startPoint) ? point : closestPoint, meshPoints[0]);
//         var closestPointIndex = meshPoints.indexOf(closestPoint);
//         triangle.push(startPoint);
//         triangle.push(closestPoint);
//         meshPoints.splice(closestPointIndex, 1);
//         // find the closest point
//         closestPoint = meshPoints.reduce((closestPoint, point) => point.distanceTo(startPoint) < closestPoint.distanceTo(startPoint) ? point : closestPoint, meshPoints[0]);
//         closestPointIndex = meshPoints.indexOf(closestPoint);
//         triangle.push(closestPoint);
//         meshPoints.splice(closestPointIndex, 1);

//         // console.log(triangle);
//         // drawTriangle(triangle, `${palette.colour4}20`);
//         preDrawRequestQueue.push({
//             reqFunction: drawTriangle,
//             points: triangle,
//             colour: `${palette.colour4}20`
//         });

//         startPoint = closestPoint;
//     }
// }
// //#endregion

//#region //! smooth functions
const stepSize = 1;
const overDraw = 10;
function queueEntityFunction(entity) {
    entity.renderInterface.renderFunctions.forEach(renderFunction => {
        const points = getFunctionPoints(entity.position, renderFunction);
        // console.log(points);
        mainDrawRequestQueue.push({
            reqFunction: drawPath,
            points: points,
            width: entity.renderInterface.fill ? 0.01 : 10,
            colour: palette.colour3,
            fill: entity.renderInterface.fill,
        });
    });
}
//#endregion
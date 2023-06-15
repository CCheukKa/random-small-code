//#region //! class setup
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    fromDirection(direction) { return new Vector(Math.cos(direction), Math.sin(direction)); } // act as constructor

    add(...vectors) { return vectors.reduce((sum, vector) => new Vector(sum.x + vector.x, sum.y + vector.y), this); }
    subtract(...vectors) { return vectors.reduce((sum, vector) => new Vector(sum.x - vector.x, sum.y - vector.y), this); }
    dot(vector) { return this.x * vector.x + this.y * vector.y; }
    scale(scalar) { return new Vector(this.x * scalar, this.y * scalar); }
    get magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    get normalised() { return this.scale(1 / this.magnitude); }
    get direction() { return Math.atan2(this.y, this.x); }
}
class Boid {
    constructor(position = new Vector(), direction = 0) {
        this.position = position;
        this.direction = direction;
    }
    duplicate() { return new Boid(this.position, this.direction); }
}
//#endregion

//#region //! constants
const renderRate = 60;
const renderDeltaTime = 1 / renderRate;
const physicsTimeScale = 1;
const physicsRate = 200;
const physicsDeltaTime = 1 / physicsRate;
const canvasSize = new Vector(1200, 700);
const palette = {
    backgroundColour: '#13253E',
    boidColour: '#8BB6AA',
    directionColour: '#F3AF73',
    lineColour: '#F76965',
    lineColour2: '#b565f7',
    sightColour: '#8D4546'
}
const boidRadius = 5;
const boidSpeed = 60;
const boidSightRange = 200;
// const boidSightRange = 400;
// const boidSightRange = Infinity;
const boidTurnSpeed = 1; // radians per second; don't go over PI/2=1.57
const huddleTenacity = 0.2; // 0 = no huddle, 1 = full huddle
//#endregion

//#region //! canvas setup
const canvasElement = document.getElementById('canvas');
const canvasContext = canvasElement.getContext('2d');
canvasElement.width = canvasSize.x;
canvasElement.height = canvasSize.y;
//#endregion

//#region //! setup
const boids = [];
makeRandomBoids(100);

setInterval(() => {
    drawRequestQueues.forEach(drawRequestQueue => drawRequestQueue.length = 0);
    updateBoids();
}, physicsDeltaTime * 1000 / physicsTimeScale);

setInterval(() => {
    redraw();
}, renderDeltaTime * 1000);
//#endregion

//#region //! logic functions
function updateBoids() {
    const newBoids = [];
    boids.forEach(boid => {
        const newBoid = boid.duplicate();
        newBoids.push(newBoid);

        //* find nearby boids
        // const nearbyBoids = boids.filter(otherBoid => otherBoid !== newBoid && otherBoid.position.subtract(newBoid.position).magnitude < boidSightRange);
        const nearbyBoids = boids.filter(otherBoid => otherBoid !== newBoid);

        //* calculate average direction
        const averageDirection = nearbyBoids.reduce(
            (sum, otherBoid) =>
                sum.add(new Vector().fromDirection(otherBoid.direction).scale(gaussianScalar(newBoid.position.subtract(otherBoid.position).magnitude))),
            new Vector().fromDirection(newBoid.direction)
        ).direction;


        //* calculate average position
        const averagePosition = nearbyBoids.reduce((sum, otherBoid) => sum.add(otherBoid.position), newBoid.position).scale(1 / (nearbyBoids.length + 1));
        const directionToAveragePosition = averagePosition.subtract(newBoid.position).direction;
        postDrawRequestQueue.push(
            {
                //* drawLine(newBoid.position, averagePosition, boidRadius / 2, palette.lineColour);
                reqFunction: drawLine,
                start: newBoid.position,
                end: newBoid.position.add(new Vector().fromDirection(directionToAveragePosition).scale(boidRadius * 4)),
                width: boidRadius / 2,
                colour: palette.lineColour
            },
            {
                //* drawLine(newBoid.position, newBoid.position.add(new Vector().fromDirection(averageDirection).scale(boidRadius * 5)), boidRadius / 2, palette.lineColour2);
                reqFunction: drawLine,
                start: newBoid.position,
                end: newBoid.position.add(new Vector().fromDirection(averageDirection).scale(boidRadius * 4)),
                width: boidRadius / 2,
                colour: palette.lineColour2
            }
        );

        //TODO: add overcrowding deterrent

        //* calculate desired direction with weighted average
        // const desiredDirection = directionToAveragePosition * huddleTenacity + averageDirection * (1 - huddleTenacity);
        const desiredDirection = new Vector().fromDirection(directionToAveragePosition).scale(huddleTenacity).add(new Vector().fromDirection(averageDirection).scale(1 - huddleTenacity)).direction;


        //* update direction
        const oldDotProduct = new Vector().fromDirection(newBoid.direction).dot(new Vector().fromDirection(desiredDirection));
        const newDotProduct = new Vector().fromDirection(newBoid.direction + boidTurnSpeed * physicsDeltaTime).dot(new Vector().fromDirection(desiredDirection));
        newBoid.direction += boidTurnSpeed * physicsDeltaTime * Math.sign(newDotProduct - oldDotProduct);

        //* bounce off of walls
        if (newBoid.position.x < boidRadius || newBoid.position.x > canvasSize.x - boidRadius) {
            newBoid.direction = Math.PI - newBoid.direction;
        }
        if (newBoid.position.y < boidRadius || newBoid.position.y > canvasSize.y - boidRadius) {
            newBoid.direction = -newBoid.direction;
        }

        //* update position
        newBoid.position = newBoid.position.add(new Vector().fromDirection(newBoid.direction).scale(boidSpeed * physicsDeltaTime));
    });
    boids.length = 0;
    boids.push(...newBoids);
}
//#endregion

//#region //! helper functions
function makeRandomBoids(n) {
    for (let i = 0; i < n; i++) {
        boids.push(new Boid(
            new Vector(Math.random() * (canvasSize.x - boidRadius * 2) + boidRadius, Math.random() * (canvasSize.y - boidRadius * 2) + boidRadius),
            Math.random() * 2 * Math.PI
        ));
    }
}

const standardDeviation = 0.1;
const gaussianConstant = 1 / (standardDeviation * Math.sqrt(2 * Math.PI));
// const gaussianConstant = 1;
const gaussianExponentConstant = -1 / (2 * standardDeviation * standardDeviation);
function gaussianScalar(distance) {
    const scaledDistance = distance / 1000;
    const result = gaussianConstant * Math.exp(gaussianExponentConstant * scaledDistance * scaledDistance);
    // console.log(Math.round(result));
    return result;
}
//#endregion

//#region //! render functions
const preDrawRequestQueue = [];
const mainDrawRequestQueue = [];
const postDrawRequestQueue = [];
const drawRequestQueues = [preDrawRequestQueue, mainDrawRequestQueue, postDrawRequestQueue];

function redraw() {
    canvasContext.fillStyle = palette.backgroundColour;
    canvasContext.fillRect(0, 0, canvasSize.x, canvasSize.y);

    queueBoidDraw();

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

function queueBoidDraw() {
    boids.forEach(boid => {
        preDrawRequestQueue.push(
            {
                //* drawGradientCircle(boid.position, boidSightRange, palette.sightColour);
                reqFunction: drawGradientCircle,
                position: boid.position,
                radius: boidSightRange,
                colour: palette.sightColour
            }
        );

        mainDrawRequestQueue.push(
            {
                //* drawCircle(boid.position, boidRadius, palette.boidColour);
                reqFunction: drawCircle,
                position: boid.position,
                radius: boidRadius,
                colour: palette.boidColour
            }
        );

        mainDrawRequestQueue.push(
            {
                // *drawLine(boid.position, boid.position.add(new Vector().fromDirection(boid.direction).scale(lineLength)), boidRadius / 2, palette.directionColour);
                reqFunction: drawLine,
                start: boid.position,
                end: boid.position.add(new Vector().fromDirection(boid.direction).scale(boidRadius * 6)),
                width: boidRadius / 2,
                colour: palette.directionColour
            }
        );
    });
}

function drawLine(start, end, width, colour) {
    // console.log({ start, end, width, colour });
    canvasContext.strokeStyle = colour;
    canvasContext.lineWidth = width;
    canvasContext.beginPath();
    canvasContext.moveTo(start.x, start.y);
    canvasContext.lineTo(end.x, end.y);
    canvasContext.stroke();
}

function drawCircle(position, radius, colour) {
    canvasContext.fillStyle = colour;
    canvasContext.beginPath();
    canvasContext.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    canvasContext.fill();
}

function drawGradientCircle(position, radius, colour) {
    const grd = canvasContext.createRadialGradient(position.x, position.y, 0, position.x, position.y, radius);
    grd.addColorStop(0, `${colour}80`);
    grd.addColorStop(1, `${colour}00`);

    // Draw a filled Rectangle
    canvasContext.fillStyle = grd;
    canvasContext.beginPath();
    canvasContext.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    canvasContext.fill();
}
//#endregion
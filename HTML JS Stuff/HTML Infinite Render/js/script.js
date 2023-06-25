class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) { return new Vector2(this.x + vector.x, this.y + vector.y); }
    subtract(vector) { return new Vector2(this.x - vector.x, this.y - vector.y); }
    multiply(vector) { return new Vector2(this.x * vector.x, this.y * vector.y); }
    divide(vector) { return new Vector2(this.x / vector.x, this.y / vector.y); }
    scale(scalar) { return new Vector2(this.x * scalar, this.y * scalar); }
    vectorTo(vector) { return vector.subtract(this); }
    distance(vector) { return this.vectorTo(vector).magnitude; }
    get magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    get normalised() { return this.scale(1 / this.magnitude); }

    static interpolate(v1, v2, t) {
        return new Vector2(
            v1.x + (v2.x - v1.x) * t,
            v1.y + (v2.y - v1.y) * t
        );
    }

    rotateAround(point, angle) {
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        const x = this.x - point.x;
        const y = this.y - point.y;
        return new Vector2(
            x * cos - y * sin + point.x,
            x * sin + y * cos + point.y
        );
    }
    scaleAround(point, scale) {
        return new Vector2(
            (this.x - point.x) * scale + point.x,
            (this.y - point.y) * scale + point.y
        );
    }
}
// const v2 = (x = 0, y = 0) => new Vector2(x, y);

class Quad {
    constructor(topLeft = new Vector2(), topRight = new Vector2(), bottomRight = new Vector2(), bottomLeft = new Vector2()) {
        this.topLeft = topLeft;
        this.topRight = topRight;
        this.bottomRight = bottomRight;
        this.bottomLeft = bottomLeft;
    }

    multiply(vector) {
        return new Quad(
            this.topLeft.multiply(vector),
            this.topRight.multiply(vector),
            this.bottomRight.multiply(vector),
            this.bottomLeft.multiply(vector)
        );
    }
    uvMapOnto(parent) { //? child.uvMapOnto(parent)
        return new Quad(
            Vector2.interpolate(
                Vector2.interpolate(parent.topLeft, parent.topRight, this.topLeft.x),
                Vector2.interpolate(parent.bottomLeft, parent.bottomRight, this.topLeft.x),
                this.topLeft.y
            ),
            Vector2.interpolate(
                Vector2.interpolate(parent.topLeft, parent.topRight, this.topRight.x),
                Vector2.interpolate(parent.bottomLeft, parent.bottomRight, this.topRight.x),
                this.topRight.y
            ),
            Vector2.interpolate(
                Vector2.interpolate(parent.topLeft, parent.topRight, this.bottomRight.x),
                Vector2.interpolate(parent.bottomLeft, parent.bottomRight, this.bottomRight.x),
                this.bottomRight.y
            ),
            Vector2.interpolate(
                Vector2.interpolate(parent.topLeft, parent.topRight, this.bottomLeft.x),
                Vector2.interpolate(parent.bottomLeft, parent.bottomRight, this.bottomLeft.x),
                this.bottomLeft.y
            )
        );
    }

    get centre() {
        return Vector2.interpolate(
            Vector2.interpolate(this.topLeft, this.topRight, 0.5),
            Vector2.interpolate(this.bottomLeft, this.bottomRight, 0.5),
            0.5
        );
    }

    rotateAround(point, angle) {
        return new Quad(
            this.topLeft.rotateAround(point, angle),
            this.topRight.rotateAround(point, angle),
            this.bottomRight.rotateAround(point, angle),
            this.bottomLeft.rotateAround(point, angle)
        );
    }
    rotateAroundCentre(angle) { return this.rotateAround(this.centre, angle); }

    scaleAround(point, scale) {
        return new Quad(
            this.topLeft.scaleAround(point, scale),
            this.topRight.scaleAround(point, scale),
            this.bottomRight.scaleAround(point, scale),
            this.bottomLeft.scaleAround(point, scale)
        );
    }
    scaleAroundCentre(scale) { return this.scaleAround(this.centre, scale); }
}

class Rectangle extends Quad {
    constructor(topLeftPosition = new Vector2(), size = new Vector2()) {
        super(
            topLeftPosition,
            topLeftPosition.add(new Vector2(size.x, 0)),
            topLeftPosition.add(size),
            topLeftPosition.add(new Vector2(0, size.y))
        );
    }
}

//#region //! initialisation
const canvasElement = document.getElementById('main-canvas');
const canvasContext = canvasElement.getContext('2d');
canvasElement.width = 1200;
canvasElement.height = 700;
const canvasSize = new Vector2(canvasElement.width, canvasElement.height);

const palette = {
    background: '#453C67',
    colour1: '#6D67E4',
    colour2: '#46C2CB',
    colour3: '#F2F7A1',
}

const FRAMES = [
    {
        id: "f1",
        uvQuad: new Quad(
            new Vector2(0.2, 0.1),
            new Vector2(0.8, 0.2),
            new Vector2(0.9, 0.9),
            new Vector2(0.4, 0.9)
        ),
        colour: palette.colour1,
        contains: [
            {
                id: "f1",
                uvQuad: new Rectangle(
                    new Vector2(0.1, 0.1),
                    new Vector2(0.2, 0.3)
                ),
            },
            {
                id: "f2",
                uvQuad: new Quad(
                    new Vector2(0.4, 0.3),
                    new Vector2(0.9, 0.3),
                    new Vector2(0.9, 0.7),
                    new Vector2(0.3, 0.7)
                )
            }
        ]
    },
    {
        id: "f2",
        colour: palette.colour2,
        contains: [
            {
                id: "f1",
                uvQuad: new Quad(
                    new Vector2(0.4, 0.1),
                    new Vector2(0.8, 0.2),
                    new Vector2(0.9, 0.9),
                    new Vector2(0.1, 0.9)
                ).rotateAroundCentre(Math.PI / 4).scaleAroundCentre(0.5),
            }
        ]
    }
];

setTimeout(draw, 0);
//#endregion

//#region //! draw functions
const drawQueue = [];
function draw() {
    drawQueue.length = 0;
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
    FRAMES.forEach(frame => {
        if (!frame.uvQuad) { return; }

        drawQueue.push({ frame, parentQuad: new Rectangle(new Vector2(), new Vector2(1, 1)) });
    });

    //* breadth first draw; otherwise only one chain will be drawn
    let depth = 0;
    const maxDepth = 20;
    while (drawQueue.length > 0 && ++depth < maxDepth) {
        const { frame, parentQuad } = drawQueue.shift();
        drawFrame(frame, parentQuad);
    }
}

function drawFrame(frame, parentQuad) {

    const frameReference = FRAMES.find(f => f.id === frame.id);
    if (!frameReference) { return console.error(`${frame.id} not found!`); }

    const uvQuad = frame.uvQuad.uvMapOnto(parentQuad);
    // console.log({ id: frame.id, childUV: frame.uvQuad, parentQuad, uvQuad });

    //^ fill UV texture
    drawUV(pixelQuad = uvQuad.multiply(canvasSize));

    //^ border
    drawQuad(uvQuad, 3, frameReference.colour);

    //^ content
    if (!frameReference.contains) { return; }
    frameReference.contains.forEach(childFrame => {
        drawQueue.push({ frame: childFrame, parentQuad: uvQuad });
    });
}
//#endregion

//#region //! draw helpers
function drawUV(pixelQuad) {
    const stepSize = 0.1;
    const stepCount = (pixelQuad.topRight.x - pixelQuad.topLeft.x) / stepSize;
    for (let i = 0; i < stepCount; i++) {
        const start = pixelQuad.topLeft.add(pixelQuad.topRight.subtract(pixelQuad.topLeft).scale(i / stepCount));
        const end = pixelQuad.bottomLeft.add(pixelQuad.bottomRight.subtract(pixelQuad.bottomLeft).scale(i / stepCount));

        const startU = start.distance(pixelQuad.topLeft) / pixelQuad.topLeft.distance(pixelQuad.topRight);
        const endU = end.distance(pixelQuad.bottomLeft) / pixelQuad.bottomLeft.distance(pixelQuad.bottomRight);

        const startColour = `rgb(${startU * 255}, ${0}, ${0})`;
        const endColour = `rgb(${endU * 255}, ${255}, ${0})`;
        drawGradientLine(start, end, startColour, endColour);
    }
}
function drawGradientLine(start, end, startColour, endColour, width = 1) { //& canvas pixel space
    canvasContext.lineWidth = width;
    var grad = canvasContext.createLinearGradient(start.x, start.y, end.x, end.y);
    grad.addColorStop(0, startColour);
    grad.addColorStop(1, endColour);
    canvasContext.strokeStyle = grad;
    canvasContext.beginPath();
    canvasContext.moveTo(start.x, start.y);
    canvasContext.lineTo(end.x, end.y);
    canvasContext.stroke();
}

function drawLine(start, end, width) { //& canvas pixel space
    canvasContext.lineWidth = width;
    canvasContext.lineCap = 'round';
    canvasContext.beginPath();
    canvasContext.moveTo(start.x, start.y);
    canvasContext.lineTo(end.x, end.y);
    canvasContext.closePath();
    canvasContext.stroke();
}

function drawQuad(quad, width, colour) { //& canvas UV space
    canvasContext.strokeStyle = colour;
    quad = quad.multiply(canvasSize);
    drawLine(quad.topLeft, quad.topRight, width);
    drawLine(quad.topRight, quad.bottomRight, width);
    drawLine(quad.bottomRight, quad.bottomLeft, width);
    drawLine(quad.bottomLeft, quad.topLeft, width);
}
    //#endregion
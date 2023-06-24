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
}
// const v2 = (x = 0, y = 0) => new Vector2(x, y);

//!
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

const frames = [
    {
        id: "f1",
        position: new Vector2(0.1, 0.1),
        size: new Vector2(0.8, 0.8),
        colour: palette.colour1,
        contains: [
            {
                id: "f1",
                position: new Vector2(0.25, 0.25),
                size: new Vector2(0.5, 0.5),
            }
        ]
    }
];

setTimeout(draw, 0);

//!
const maxDepth = 2;
var depth = 0;
function draw() {
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
    frames.forEach(frame => {
        depth = 0;
        drawBorder(frame);
        drawContent(frame);
    });
}

function drawBorder(frame, localFramePosition = new Vector2(), localFrameSize = new Vector2(1, 1)) {
    const { position, size, colour } = frame;

    canvasContext.strokeStyle = colour;
    drawQuad(position, size, localFramePosition, localFrameSize);
}

function drawContent(frame, localFramePosition = new Vector2(), localFrameSize = new Vector2(1, 1)) {
    depth++;
    if (depth > maxDepth) return;

    const { position, size, contains } = frame;

    contains.forEach(subFrame => {
        const frame = frames.find(f => f.id === subFrame.id);
        if (!frame) return console.error(`Frame with ID ${subFrame.id} not found`);

        //FIXME: wrong???
        const newLocalFramePosition = localFramePosition.add(subFrame.position.multiply(localFrameSize));
        const newLocalFrameSize = localFrameSize.multiply(subFrame.size);
        drawBorder(frame, newLocalFramePosition, newLocalFrameSize);
        drawContent(frame, newLocalFramePosition, newLocalFrameSize);
    });
}

function drawLine(start, end, width) {
    canvasContext.lineWidth = width;
    canvasContext.beginPath();
    canvasContext.moveTo(start.x, start.y);
    canvasContext.lineTo(end.x, end.y);
    canvasContext.closePath();
    canvasContext.stroke();
}

//TODO: scaling width
const defaultBorderWidth = 5;
function drawQuad(position, size, localFramePosition, localFrameSize) {
    console.log({ position, size, localFramePosition, localFrameSize });

    //FIXME: wrong???
    const topLeft = localFramePosition.add(localFrameSize.multiply(position)).multiply(canvasSize);
    const topRight = localFramePosition.add(localFrameSize.multiply(new Vector2(position.x + size.x, position.y))).multiply(canvasSize);
    const bottomRight = localFramePosition.add(localFrameSize.multiply(new Vector2(position.x + size.x, position.y + size.y))).multiply(canvasSize);
    const bottomLeft = localFramePosition.add(localFrameSize.multiply(new Vector2(position.x, position.y + size.y))).multiply(canvasSize);

    const horizontalBorderWidth = defaultBorderWidth * localFrameSize.y / size.y;
    const verticalBorderWidth = defaultBorderWidth * localFrameSize.x / size.x;

    drawLine(topLeft, topRight, horizontalBorderWidth);
    drawLine(topRight, bottomRight, horizontalBorderWidth);
    drawLine(bottomRight, bottomLeft, verticalBorderWidth);
    drawLine(bottomLeft, topLeft, verticalBorderWidth);
}
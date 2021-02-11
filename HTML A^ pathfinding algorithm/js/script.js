//#region   //? Initialisation
const canvas = document.getElementById("myCanvas");
const c = canvas.getContext("2d");
var canvasBound = canvas.getBoundingClientRect();
//buttons
const checkboxGrid = document.getElementById("gridCheckbox");
const checkDiagonal = document.getElementById("diagonalCheckbox");
const buttonXCountPlusOne = document.getElementById("X+1");
const buttonXCountMinusOne = document.getElementById("X-1");
const buttonYCountPlusOne = document.getElementById("Y+1");
const buttonYCountMinusOne = document.getElementById("Y-1");
const buttonXCountPlusFive = document.getElementById("X+5");
const buttonXCountMinusFive = document.getElementById("X-5");
const buttonYCountPlusFive = document.getElementById("Y+5");
const buttonYCountMinusFive = document.getElementById("Y-5");
const buttonTileSizePlusTen = document.getElementById("tileSize+10");
const buttonTileSizeMinusTen = document.getElementById("tileSize-10");
const textWidth = document.getElementById("XText");
const textHeight = document.getElementById("YText");
const textTileSize = document.getElementById("tileSizeText");
buttonXCountPlusOne.addEventListener('mousedown', function(e) { buttonClicked(0) });
buttonXCountMinusOne.addEventListener('mousedown', function(e) { buttonClicked(1) });
buttonYCountPlusOne.addEventListener('mousedown', function(e) { buttonClicked(2) });
buttonYCountMinusOne.addEventListener('mousedown', function(e) { buttonClicked(3) });
buttonXCountPlusFive.addEventListener('mousedown', function(e) { buttonClicked(0.5) });
buttonXCountMinusFive.addEventListener('mousedown', function(e) { buttonClicked(1.5) });
buttonYCountPlusFive.addEventListener('mousedown', function(e) { buttonClicked(2.5) });
buttonYCountMinusFive.addEventListener('mousedown', function(e) { buttonClicked(3.5) });
buttonTileSizePlusTen.addEventListener('mousedown', function(e) { buttonClicked(4) });
buttonTileSizeMinusTen.addEventListener('mousedown', function(e) { buttonClicked(5) });

//
var xCount = 20;
var yCount = 20;
var tileSize = 30;
const palette = [
    '#637279', //Empty
    '#212b33', //Wall
    '#1f5984', //Home
    '#d66b82', //Goal
    '#c3d2cb', //Path
];
const gridlineColour = '#404040';
const triangleOffest = Math.SQRT1_2;
//
const timeStepMS = 1;
const maxOutOfRangeCycle = 400;
const mouseThreshold = 0.1;
//
var fail = false;
var homeX = 0,
    homeY = 0;
var goalX = xCount - 1,
    goalY = yCount - 1;
var modifierHeld = false;
var outOfRangeCount = 0;
var mX, mY;
var width = tileSize * xCount;
var height = tileSize * yCount;
var tileList = [
    []
];
var templateList, templateListStringified;
var held = false;
var button;
var allBreak = false;
var enableHome = true;
var enableGoal = true;
//
document.addEventListener('keydown', function(e) { keyDown(e.code) });
document.addEventListener('keyup', function(e) { keyUp(e.code) });
canvas.addEventListener('mousedown', function(e) { onMouse(e) });
canvas.addEventListener('mouseup', function(e) { onMouse(e) });
document.addEventListener('contextmenu', event => event.preventDefault());
canvas.addEventListener('mousemove', function(e) { getMousePos(e) });
//#endregion

//#region   //! Pathfinding classes
class AStarPather {
    constructor(x, y, fromX, fromY, gCost) {
        //console.log(`Constructing ${x}, ${y}`);
        if (tileList[y][x] == 1) {
            delete this;
            return;
        }
        this.x = x;
        this.y = y;
        this.fromX = fromX;
        this.fromY = fromY;
        this.hCost = Math.hypot(x - goalX, y - goalY);
        this.gCost = gCost;
        this.fCost = this.hCost + this.gCost;
        this.explored = false;

        let oldAStarPather = AStarPatherList[y][x];
        if (oldAStarPather) {
            if (oldAStarPather.fCost > this.fCost) {
                deleteOneAStarPather(oldAStarPather);
                AStarPatherList[y][x] = this;
            } else {
                delete this;
            }
        } else {
            AStarPatherList[y][x] = this;
        }
    }
}
//#endregion

//#region   //! Maze generation classes
class DFSExtender {
    constructor(x, y, parent) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.extended = [
            false, //right
            false, //down
            false, //left
            false, //up
        ];
        if (x < xCount - 3) { //right
            this.extended[0] = tileList[y][x + 2] == 0;
        }
        if (y < yCount - 3) { //down
            this.extended[1] = tileList[y + 2][x] == 0;
        }
        if (x > 2) { //left
            this.extended[2] = tileList[y][x - 2] == 0;
        }
        if (y > 2) { //up
            this.extended[3] = tileList[y - 2][x] == 0;
        }
        //this.extend();
    }

    extend() {
        while (!(this.extended[0] && this.extended[1] && this.extended[2] && this.extended[3])) {

        }
        // all extended
    }
}
//#endregion

//#region   //? Timed functions
updateCanvasParameters();
setInterval(function() {
    updateCanvasParameters();
    if (held) {
        paint(Math.floor((mX - 10) / tileSize), Math.floor((mY - 10) / tileSize));
    }
    update();
}, timeStepMS);

function update() {
    deleteOldPath();
    pathfinding(document.getElementById('pathfindingAlgorithmList').value);
    redraw();
    return;
}
//#endregion

//#region   //! Canvas handler
function updateCanvasParameters() {
    //
    xCount = clamp(xCount, 2, Infinity);
    yCount = clamp(yCount, 2, Infinity);
    tileSize = clamp(tileSize, 10, Infinity);
    //
    width = tileSize * xCount;
    height = tileSize * yCount;
    canvas.height = height;
    canvas.width = width;
    textWidth.textContent = xCount;
    textHeight.textContent = yCount;
    textTileSize.textContent = tileSize;
    //
    while (tileList.length < yCount) {
        tileList.push([]);
    }
    tileList.forEach(row => {
        while (row.length < xCount) {
            row.push(0);
        }
    });
    //
    templateList = [];
    let temp = [];
    for (let i = 0; i < xCount; i++) {
        temp.push(null);
    }
    let tempStringified = JSON.stringify(temp);
    for (let i = 0; i < yCount; i++) {
        templateList.push(JSON.parse(tempStringified));
    }
    templateListStringified = JSON.stringify(templateList);
    //
    if (homeX >= xCount | homeY >= yCount) { enableHome = false; }
    if (goalX >= xCount | goalY >= yCount) { enableGoal = false; }
    //
    update();
    return;
}

function paint(sX, sY) {
    if (!isWithinInclusiveRange(sX, 0, xCount - 1) | !isWithinInclusiveRange(sY, 0, yCount - 1)) {
        console.log('Mouse cursor out of range');
        outOfRangeCount++;
        held = !(outOfRangeCount >= maxOutOfRangeCycle);
        return;
    }
    outOfRangeCount = 0;
    if (checkboxGrid.checked && (((mX - 10) % tileSize) / tileSize > 1 - mouseThreshold | ((mX - 10) % tileSize) / tileSize < mouseThreshold | ((mY - 10) % tileSize) / tileSize > 1 - mouseThreshold | ((mY - 10) % tileSize) / tileSize < mouseThreshold)) {
        return;
    }
    switch (button) {
        case 0:
            if (modifierHeld) {
                enableHome = true;
                homeX = sX;
                homeY = sY;
            } else {
                tileList[sY][sX] = 1;
            }
            break;
        case 2:
            if (modifierHeld) {
                enableGoal = true;
                goalX = sX;
                goalY = sY;
            } else {
                tileList[sY][sX] = 0;
            }
            break;
        default:
            return;
    }
}
//#endregion

//#region   //! HTML handler
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function toggleDropdown() {
    document.getElementById("dropdownMazeGeneration").classList.toggle("show");
}


//#endregion

//#region   //! I/O handler
function buttonClicked(id) {
    switch (id) {
        case 0:
            xCount++;
            break;
        case 1:
            xCount--;
            break;
        case 2:
            yCount++;
            break;
        case 3:
            yCount--;
            break;
        case 0.5:
            xCount += 5;
            break;
        case 1.5:
            xCount -= 5;
            break;
        case 2.5:
            yCount += 5;
            break;
        case 3.5:
            yCount -= 5;
            break;
        case 4:
            tileSize += 10;
            break;
        case 5:
            tileSize -= 10;
            break;
        case 6:
            generateMaze();
            break;
        default:
            return;
    }
    return;
}

function keyDown(key) {
    //console.log(key + ' pressed');
    switch (key) {
        //case 'ControlLeft':
        case 'ShiftLeft':
            modifierHeld = true;
            break;
        case 'Space':
            invertTiles();
            break;
        case 'KeyC':
        case 'Delete':
            enableHome = false;
            enableGoal = false;
            fillBoard(0);
            break;
        default:
            return;
    }
    return;
}

function keyUp(key) {
    //console.log(key + ' released');
    switch (key) {
        case 'ShiftLeft':
        case 'ControlLeft':
            modifierHeld = false;
            break;
        default:
            return;
    }
    return;
}

function getMousePos(event) {
    canvasBound = canvas.getBoundingClientRect();
    mX = event.clientX - canvasBound.left;
    mY = event.clientY - canvasBound.top;
    return;
}

function onMouse(event) {
    getMousePos(event);
    button = event.button;
    held = (event.type == 'mousedown') && (event.type != 'mouseup');
    outOfRangeCount = 0;
    return;
}

function disableScroll() {
    document.body.style.overflow = 'hidden';
    document.querySelector('html').scrollTop = window.scrollY;
    return;
}
//#endregion

//#region   //! Redraw functions
function deleteOldPath() {
    for (let y = 0; y < yCount; y++) {
        for (let x = 0; x < xCount; x++) {
            if (tileList[y][x] == 4) {
                tileList[y][x] = 0;
            }
        }
    }
    return;
}

function invertTiles() {
    for (let x = 0; x < xCount; x++) {
        for (let y = 0; y < yCount; y++) {
            switch (tileList[y][x]) {
                case 1:
                    tileList[y][x] = 0;
                    break;
                case 0:
                case 2:
                case 3:
                case 4:
                    tileList[y][x] = 1;
                    break;
                default:
                    break;
            }
        }
    }
}

function fillBoard(tileType) {
    tileList = [];
    let temp = [];
    for (let i = 0; i < xCount; i++) {
        temp.push(tileType);
    }
    let tempStringified = JSON.stringify(temp);
    for (let i = 0; i < yCount; i++) {
        tileList.push(JSON.parse(tempStringified));
    }
    return;
}

function redraw() {
    drawTiles();
    drawGrid();
    return;
}

function drawTiles() {
    for (let y = 0; y < yCount; y++) {
        for (let x = 0; x < xCount; x++) {
            drawRect(x * tileSize, y * tileSize, tileSize, tileSize, palette[tileList[y][x]]);
        }
    }
    if (checkDiagonal.checked) { //anti-alising for corner tiles
        wallCorners(); //shave corners + connect
        pathCorners(true); //shave corners + connect
    } else {
        pathCorners(false); //shave corners
    }
    if (enableHome) {
        if (tileList[homeY][homeX] == 0) {
            drawCircle((homeX + 0.5) * tileSize, (homeY + 0.5) * tileSize, tileSize * 0.46, 0, 360, palette[4]);
        } else {
            drawCircle((homeX + 0.5) * tileSize, (homeY + 0.5) * tileSize, tileSize * 0.46, 0, 360, palette[0]);
        }
        drawCircle((homeX + 0.5) * tileSize, (homeY + 0.5) * tileSize, tileSize * 0.4, 0, 360, palette[2]);
    }
    if (enableGoal) {
        if (tileList[goalY][goalX] == 0) {
            drawCircle((goalX + 0.5) * tileSize, (goalY + 0.5) * tileSize, tileSize * 0.46, 0, 360, palette[4]);
        } else {
            drawCircle((goalX + 0.5) * tileSize, (goalY + 0.5) * tileSize, tileSize * 0.46, 0, 360, palette[0]);
        }
        drawCircle((goalX + 0.5) * tileSize, (goalY + 0.5) * tileSize, tileSize * 0.4, 0, 360, palette[3]);
    }
    return;
}

function drawGrid() {
    if (!checkboxGrid.checked) {
        return;
    }
    for (let i = 1; i < yCount; i++) {
        drawLine(0, i * tileSize, width, i * tileSize, gridlineColour);
    }
    for (let i = 1; i < xCount; i++) {
        drawLine(i * tileSize, 0, i * tileSize, height, gridlineColour);
    }
    return;
}

function wallCorners() { //shave corners + connect
    for (let y = 0; y < yCount; y++) {
        for (let x = 0; x < xCount; x++) {
            if (tileList[y][x] == 1) {
                //
                if (x != 0 && y != 0) { //! TOP-LEFT
                    if (tileList[y][x - 1] != 1 && tileList[y - 1][x] != 1) {
                        subfunctionTopLeft(x, y, palette[0]);
                    }
                }
                //
                if (x != xCount - 1 && y != 0) { //! TOP-RIGHT
                    if (tileList[y][x + 1] != 1 && tileList[y - 1][x] != 1) {
                        subfunctionTopRight(x, y, palette[0]);
                    }
                }
                //
                if (x != 0 && y != yCount - 1) { //! BOTTOM-LEFT
                    if (tileList[y][x - 1] != 1 && tileList[y + 1][x] != 1) {
                        subfunctionBottomLeft(x, y, palette[0]);
                    }
                    if (tileList[y + 1][x - 1] == 1 && (tileList[y + 1][x] == 1 | tileList[y][x - 1] == 1)) {
                        subfunctionBottomRight(x - 1, y, palette[1]);
                        subfunctionTopLeft(x, y + 1, palette[1]);
                    }
                }
                //
                if (x != xCount - 1 && y != yCount - 1) { //! BOTTOM-RIGHT
                    if (tileList[y + 1][x] != 1 && tileList[y][x + 1] != 1) {
                        subfunctionBottomRight(x, y, palette[0]);
                    }
                    if (tileList[y + 1][x + 1] == 1 && (tileList[y + 1][x] == 1 | tileList[y][x + 1] == 1)) {
                        subfunctionBottomLeft(x + 1, y, palette[1]);
                        subfunctionTopRight(x, y + 1, palette[1]);
                    }
                }
                //
            }
        }
    }
    return;
}

function pathCorners(connectDiagonals) { //shave corners + connect
    for (let y = 0; y < yCount; y++) {
        for (let x = 0; x < xCount; x++) {
            if (tileList[y][x] == 4) {
                //
                if (x != 0 && y != 0) { //! TOP-LEFT
                    if (tileList[y][x - 1] != 4 && tileList[y - 1][x] != 4 && tileList[y - 1][x - 1] != 4) {
                        subfunctionTopLeft(x, y, palette[(tileList[y][x - 1] == 1 && tileList[y - 1][x] == 1) + 0]);
                    }
                }
                //
                if (x != xCount - 1 && y != 0) { //! TOP-RIGHT
                    if (tileList[y][x + 1] != 4 && tileList[y - 1][x] != 4 && tileList[y - 1][x + 1] != 4) {
                        subfunctionTopRight(x, y, palette[(tileList[y][x + 1] == 1 && tileList[y - 1][x] == 1) + 0]);
                    }
                }
                //
                if (x != 0 && y != yCount - 1) { //! BOTTOM-LEFT
                    if (tileList[y][x - 1] != 4 && tileList[y + 1][x] != 4 && tileList[y + 1][x - 1] != 4) {
                        subfunctionBottomLeft(x, y, palette[(tileList[y][x - 1] == 1 && tileList[y + 1][x] == 1) + 0]);
                    }
                    if (connectDiagonals) {
                        if (tileList[y + 1][x - 1] == 4) {
                            subfunctionBottomRight(x - 1, y, palette[4]);
                            subfunctionTopLeft(x, y + 1, palette[4]);
                        }
                    }
                }
                //
                if (x != xCount - 1 && y != yCount - 1) { //! BOTTOM-RIGHT
                    if (tileList[y + 1][x] != 4 && tileList[y][x + 1] != 4 && tileList[y + 1][x + 1] != 4) {
                        subfunctionBottomRight(x, y, palette[(tileList[y + 1][x] == 1 && tileList[y][x + 1] == 1) + 0]);
                    }
                    if (connectDiagonals) {
                        if (tileList[y + 1][x + 1] == 4) {
                            subfunctionBottomLeft(x + 1, y, palette[4]);
                            subfunctionTopRight(x, y + 1, palette[4]);
                        }
                    }
                }
                //
                if (x == 0 && y == 0) { subfunctionTopLeft(0, 0); }
                if (x == xCount - 1 && y == 0) { subfunctionTopRight(xCount - 1, 0); }
                if (x == 0 && y == yCount - 1) { subfunctionBottomLeft(0, yCount - 1); }
                if (x == xCount - 1 && y == yCount - 1) { subfunctionBottomRight(xCount - 1, yCount - 1); }
                //
                if (x != xCount - 1) {
                    if (y == 0 && tileList[y][x + 1] != 4) { subfunctionTopRight(x, y); }
                    if (y == yCount - 1 && tileList[y][x + 1] != 4) { subfunctionBottomRight(x, y); }
                }
                if (x != 0) {
                    if (y == 0 && tileList[y][x - 1] != 4) { subfunctionTopLeft(x, y); }
                    if (y == yCount - 1 && tileList[y][x - 1] != 4) { subfunctionBottomLeft(x, y); }
                }
                if (y != yCount - 1) {
                    if (x == 0 && tileList[y + 1][x] != 4) { subfunctionBottomLeft(x, y); }
                    if (x == xCount - 1 && tileList[y + 1][x] != 4) { subfunctionBottomRight(x, y); }
                }
                if (y != 0) {
                    if (x == 0 && tileList[y - 1][x] != 4) { subfunctionTopLeft(x, y); }
                    if (x == xCount - 1 && tileList[y - 1][x] != 4) { subfunctionTopRight(x, y); }
                }
                //
            }
        }
    }
    return;
}

//#region //! Subfunctions
function subfunctionBottomLeft(x, y, colour) {
    let px = x,
        py = y + 1;
    drawTileSizeTriangle(px, py, px, py - 1 + triangleOffest, px + 1 - triangleOffest, py, colour);
    return;
}

function subfunctionBottomRight(x, y, colour) {
    let px = x + 1,
        py = y + 1;
    drawTileSizeTriangle(px, py, px, py - 1 + triangleOffest, px - 1 + triangleOffest, py, colour);
    return;
}

function subfunctionTopLeft(x, y, colour) {
    let px = x,
        py = y;
    drawTileSizeTriangle(px, py, px + 1 - triangleOffest, py, px, py + 1 - triangleOffest, colour);
    return;
}

function subfunctionTopRight(x, y, colour) {
    let px = x + 1,
        py = y;
    drawTileSizeTriangle(px, py, px - 1 + triangleOffest, py, px, py + 1 - triangleOffest, colour);
    return;
}
//#endregion
//#endregion

//#region   //! Custom draw functions
function drawRect(x1, y1, dx, dy, colour) {
    c.fillStyle = colour;
    c.fillRect(x1, y1, dx, dy);
    return;
}

function drawLine(x1, y1, x2, y2, colour) {
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.lineWidth = clamp(tileSize / 15, 1, 20);
    c.strokeStyle = colour;
    c.stroke();
    return;
}

function drawCircle(x, y, r, sA, eA, colour) {
    c.beginPath();
    c.arc(x, y, r, deg2rad(sA), deg2rad(eA));
    c.fillStyle = colour;
    c.lineTo(x, y);
    c.fill();
    return;
}

function drawText(text, x, y, alignment, colour, strokeColour) {
    c.font = '20px Arial';

    switch (alignment) {
        case 0:
            c.textAlign = 'center';
            break;
        case 1:
            c.textAlign = 'left';
            break;
        case 2:
            c.textAlign = 'right';
            break;

        default:
            break;
    }

    c.fillStyle = colour;
    c.fillText(text, x, y + 5);

    if (strokeColour) {
        c.font = '20px Arial';
        c.strokeStyle = strokeColour;
        c.strokeText(text, x, y + 5);
    }

    return;
}

function drawTriangle(x1, y1, x2, y2, x3, y3, colour) {
    c.fillStyle = colour;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.lineTo(x3, y3);
    c.closePath();
    c.fill();
    return;
}

function drawTileSizeTriangle(x1, y1, x2, y2, x3, y3, colour = palette[0]) {
    drawTriangle(x1 * tileSize, y1 * tileSize, x2 * tileSize, y2 * tileSize, x3 * tileSize, y3 * tileSize, colour)
    return;
}
//#endregion

//#region   //! Custom math functions
function clamp(x, limit1, limit2) {
    if (limit1 > limit2) { return clamp(x, limit2, limit1); }
    if (x < limit1) { return limit1; }
    if (x > limit2) { return limit2; }
    return x;
}

function isWithinInclusiveRange(test, lower, upper) {
    if (lower > upper) { return isWithinInclusiveRange(test, upper, lower) }
    return (lower <= test && test <= upper);
}

function isWithinExclusiveRange(test, lower, upper) {
    if (lower > upper) { return isWithinExclusiveRange(test, upper, lower) }
    return (lower < test && test < upper);
}

function deg2rad(n) {
    return n / 180 * Math.PI;
}
//#endregion

//#region   //! Maze generation
function generateMaze(type) {
    let mazeGenSuccess;
    switch (type) {
        case 0: //Binary tree
            mazeGenSuccess = mazegenBinaryTree();
            break;
        case 1: //DFS
            mazeGenSuccess = mazegenDepthFirstSearch();
            break;
        default:
            alert('Unknown/Unimplemented maze type: ' + type);
            break;
    }
    if (mazeGenSuccess == undefined) {
        alert('Unexpected error!');
        return;
    }
    if (!mazeGenSuccess) { return; }
    enableHome = false;
    enableGoal = false;
    return;
}

//#region //? Binary tree
function mazegenBinaryTree() {
    if (xCount % 2 == 1 | yCount % 2 == 1) {
        alert('This maze generation algorithm requires an [even x even] number of tiles');
        return false;
    }
    fillBoard(0);
    for (let i = 0; i < xCount; i++) {
        tileList[0][i] = 1;
    }
    for (let i = 0; i < yCount; i++) {
        tileList[i][0] = 1;
    }
    for (let y = 2; y < yCount; y += 2) {
        for (let x = 2; x < xCount; x += 2) {
            tileList[y][x] = 1;
            if (Math.random() >= 0.5) {
                tileList[y][x - 1] = 1;
            } else {
                tileList[y - 1][x] = 1;
            }

        }
    }
    return true;
}
//#endregion

//#region //? Depth first search

function mazegenDepthFirstSearch() {
    if (xCount * yCount % 2 == 0) {
        alert('This maze generation algorithm requires an [odd x odd] number of tiles');
        return false;
    }
    fillBoard(1);

    let sX = Math.floor(Math.random() * (xCount - 1) / 2) * 2 + 1,
        sY = Math.floor(Math.random() * (yCount - 1) / 2) * 2 + 1;
    tileList[sY][sX] = 0;
    new DFSExtender(sX, sY, null);

}
//#endregion

//#endregion

//#region   //! Pathfinding functions

function pathfinding(algorithmType) {
    switch (algorithmType) {
        case '0':
            pathfindAStar();
            break;
        case '1':
            pathfindDijkstar();
            break;
        case '2':
            pathfindDepthFirstSearch();
            break;
        case '3':
            pathfindBreadthFirstSearch();
            break;
        default:
            console.log(`Unknown/Unimplemented pathfinding algorithm: ${algorithmType}`);
            break;
    }
    return;
}

//#region   //? A*

var AStarPatherList = [];

function pathfindAStar() {
    if (!enableHome | !enableGoal) { return; }
    deleteAllAStarPathers();
    AStarPatherList = JSON.parse(templateListStringified);
    new AStarPather(homeX, homeY, null, null, 0);
    while (true) {
        let p = cheapestAStarPather();
        if (p == null) { return; }

        if (p.x == goalX && p.y == goalY) {
            tracePath(p);
            return;
        }
        // extend AStarPather
        //console.log(`Extend ${p.x}, ${p.y}`);
        new AStarPather(clamp(p.x + 1, 0, xCount - 1), clamp(p.y, 0, yCount - 1), p.x, p.y, p.gCost + 1);
        new AStarPather(clamp(p.x - 1, 0, xCount - 1), clamp(p.y, 0, yCount - 1), p.x, p.y, p.gCost + 1);
        new AStarPather(clamp(p.x, 0, xCount - 1), clamp(p.y + 1, 0, yCount - 1), p.x, p.y, p.gCost + 1);
        new AStarPather(clamp(p.x, 0, xCount - 1), clamp(p.y - 1, 0, yCount - 1), p.x, p.y, p.gCost + 1);
        if (checkDiagonal.checked) {
            new AStarPather(clamp(p.x + 1, 0, xCount - 1), clamp(p.y + 1, 0, yCount - 1), p.x, p.y, p.gCost + Math.SQRT2);
            new AStarPather(clamp(p.x + 1, 0, xCount - 1), clamp(p.y - 1, 0, yCount - 1), p.x, p.y, p.gCost + Math.SQRT2);
            new AStarPather(clamp(p.x - 1, 0, xCount - 1), clamp(p.y + 1, 0, yCount - 1), p.x, p.y, p.gCost + Math.SQRT2);
            new AStarPather(clamp(p.x - 1, 0, xCount - 1), clamp(p.y - 1, 0, yCount - 1), p.x, p.y, p.gCost + Math.SQRT2);
        }
        p.explored = true;

    }
    return;
}

function tracePath(AStarPather) {
    let p = AStarPather;
    while (true) {
        tileList[p.y][p.x] = 4;
        if (p.x == homeX && p.y == homeY) { return; }
        p = AStarPatherList[p.fromY][p.fromX];
    }
    return;
}

function deleteAllAStarPathers() {
    if (!AStarPatherList) { return; }
    AStarPatherList.forEach(row => {
        row.forEach(element => {
            if (!element) { delete element; }
        });
    });
    return;
}

function cheapestAStarPather() {
    let lowestFCost = Infinity;
    let lowestHCost = Infinity;
    let lowX, lowY;
    let stuck = true;
    for (let y = 0; y < yCount; y++) {
        for (let x = 0; x < xCount; x++) {
            let element = AStarPatherList[y][x];
            if (!element) { continue; }
            if (element.explored) { continue; }
            stuck = false;
            if (element.fCost < lowestFCost) {
                lowX = element.x;
                lowY = element.y;
                lowestFCost = element.fCost;
                lowestHCost = element.hCost;
            }
            if (element.fCost == lowestFCost) {
                if (element.hCost < lowestHCost) {
                    lowX = element.x;
                    lowY = element.y;
                    lowestFCost = element.fCost;
                    lowestHCost = element.hCost;
                }
            }
        }
    }
    if (!stuck) {
        return AStarPatherList[lowY][lowX];
    } else {
        return null;
    }
}

function deleteOneAStarPather(p) {
    delete p;
    return;
}
//#endregion

//#endregion
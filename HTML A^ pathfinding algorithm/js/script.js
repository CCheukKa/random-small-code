const canvas = document.getElementById("myCanvas");
const c = canvas.getContext("2d");
var canvasBound = canvas.getBoundingClientRect();
//buttons
    const checkboxGrid = document.getElementById("gridCheckbox");
    const checkDiagonal = document.getElementById("diagonalCheckbox");
    const buttonXCountPlus = document.getElementById("X+");
    const buttonXCountMinus = document.getElementById("X-");
    const buttonYCountPlus = document.getElementById("Y+");
    const buttonYCountMinus = document.getElementById("Y-");
    const buttonTileSizePlus = document.getElementById("tileSize+");
    const buttonTileSizeMinus = document.getElementById("tileSize-");
    const textWidth = document.getElementById("XText");
    const textHeight = document.getElementById("YText");
    const textTileSize = document.getElementById("tileSizeText");
    buttonXCountPlus.addEventListener('mousedown', function (e) { buttonClicked(0) });
    buttonXCountMinus.addEventListener('mousedown', function (e) { buttonClicked(1) });
    buttonYCountPlus.addEventListener('mousedown', function (e) { buttonClicked(2) });
    buttonYCountMinus.addEventListener('mousedown', function (e) { buttonClicked(3) });
    buttonTileSizePlus.addEventListener('mousedown', function (e) { buttonClicked(4) });
    buttonTileSizeMinus.addEventListener('mousedown', function (e) { buttonClicked(5) });

//
var xCount = 20;
var yCount = 20;
var tileSize = 30;
const palette = ['#d0d0d0', '#606060', '#BD5647', '#647996', '#B59E7E'];
const gridlineColour = '#404040';
const timeStepMS = 1;
const maxOutOfRangeCycle = 400;
const mouseThreshold = 0.1;
//
var fail = false;
var homeX = 0, homeY = 0;
var goalX = xCount - 1, goalY = yCount - 1;
var modifierHeld = false;
var outOfRangeCount = 0;
var mX, mY;
var width = tileSize * xCount;
var height = tileSize * yCount;
var tile = [[]];
var held = false;
var button;
var breakAll = false;
//
var boardUninitialised = true;
var patherList = [[]];
class Pather{
    constructor(x, y, fromX, fromY, gCost) {
        if (!(isWithinInclusiveRange(x, 0, xCount - 1) && isWithinInclusiveRange(y, 0, yCount - 1))) {
            delete this;
            return null;
        }
        if (tile[y][x] == 1) {
            delete this;
            return null;
        }
        if (tile[y][x] == 2) { breakAll = true; }
        this.explored = false;
        this.x = x;
        this.y = y;
        this.fromX = fromX;
        this.fromY = fromY;
        this.gCost = gCost;
        this.fromGoal = Math.hypot(goalX - x, goalY - y);
        this.fCost = this.fromGoal + gCost;
        if (patherList[y][x]) {
            if (patherList[y][x].fCost > this.fCost) {
                patherList[y][x] = this;
            }
        } else {
            patherList[y][x] = this;
        }
    }
}
//
document.addEventListener('keydown', function (e) { keyDown(e.code) });
document.addEventListener('keyup', function (e) { keyUp(e.code) });
canvas.addEventListener('mousedown', function (e) { onMouse(e) });
canvas.addEventListener('mouseup', function (e) { onMouse(e) });
document.addEventListener('contextmenu', event => event.preventDefault());
canvas.addEventListener('mousemove', function (e) { getMousePos(e) });
updateCanvasParameters();
setInterval(function () {
    if (held) {
        paint(Math.floor((mX - 10) / tileSize), Math.floor((mY - 10) / tileSize));
    }
    update();
}, timeStepMS);

//===================================================================
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
        case 4:
            tileSize += 10;
            break;
        case 5:
            tileSize -= 10;
            break;
        default:
            return;
    }
    updateCanvasParameters();
    return;
}
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
    while (tile.length < yCount) {
        tile.push([]);
    }
    tile.forEach(row => {
        while (row.length < xCount) {
            row.push(0);
        }
    });
    if (boardUninitialised) {
        tile[0][0] = 3;
        tile[yCount - 1][xCount - 1] = 2;
        boardUninitialised = false;
    }
    //
    update();
    return;
}
function update() {
    algorithm();

    redraw();
    return;
}
function paint(sX, sY) {
    if (!isWithinInclusiveRange(sX, 0, xCount - 1) | !isWithinInclusiveRange(sY, 0, yCount - 1)) {
        console.log('Out of range');
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
                tile[homeY][homeX] = 0;
                homeX = sX;
                homeY = sY;
            }
            tile[sY][sX] = 1 + modifierHeld * 2;
            break;
        case 2:
            if (modifierHeld) {
                tile[goalY][goalX] = 0;
                goalX = sX;
                goalY = sY;
            }
            tile[sY][sX] = 0 + modifierHeld * 2;
            break;
        default:
            return;
    }
}
function algorithm() {
    breakAll = false;
    fail = false;
    patherList = [[]];
    for (let y = 0; y < yCount; y++) {
        patherList.push([]);
        for (let x = 0; x < xCount; x++) {
            patherList[y].push(null);
        }
    }
    expand(new Pather(homeX, homeY, homeX, homeY, 0));
    tracePath();
    return;
}
function expand(pather) {
    pather.explored = true;
    new Pather(pather.x - 0, pather.y + 1, pather.x, pather.y, pather.gCost + 1);
    new Pather(pather.x - 1, pather.y - 0, pather.x, pather.y, pather.gCost + 1);
    new Pather(pather.x + 0, pather.y - 1, pather.x, pather.y, pather.gCost + 1);
    new Pather(pather.x + 1, pather.y + 0, pather.x, pather.y, pather.gCost + 1);
    if (checkDiagonal.checked) {
        new Pather(pather.x - 1, pather.y + 1, pather.x, pather.y, pather.gCost + Math.SQRT2);
        new Pather(pather.x - 1, pather.y - 1, pather.x, pather.y, pather.gCost + Math.SQRT2);
        new Pather(pather.x + 1, pather.y - 1, pather.x, pather.y, pather.gCost + Math.SQRT2);
        new Pather(pather.x + 1, pather.y + 1, pather.x, pather.y, pather.gCost + Math.SQRT2);
    }
    if (breakAll) {
        return;
    }
    lowestFCost();
    return;
}
function lowestFCost() {
    let lowestFCost = Infinity;
    let lowest;
    for (let x = 0; x < xCount; x++) {
        for (let y = 0; y < yCount; y++) {
            let pather = patherList[y][x];
            if (!pather) { continue;}
            if (pather.explored) { continue; }
            if (pather.fCost < lowestFCost) {
                lowestFCost = pather.fCost;
                lowest = pather;
            }
            if (pather.fCost == lowestFCost) {
                if (pather.fromGoal < lowest.fromGoal) {
                    lowest = pather;
                }
            }
        }
    }
    if (lowestFCost == Infinity) {
        breakAll = true;
        fail = true;
        return;
    }
    expand(lowest);
    return;
}
function tracePath() {
    for (let y = 0; y < yCount; y++) {
        for (let x = 0; x < xCount; x++) {
            if (tile[y][x] == 4) {
                tile[y][x] = 0;
            }
        }
    }
    if (fail) {
        console.log('Fail');
        return;
    }
    let nowX = goalX, nowY = goalY;
    while (nowX != homeX | nowY != homeY) {
        dummyX = patherList[nowY][nowX].fromX;
        nowY = patherList[nowY][nowX].fromY;
        nowX = dummyX;
        tile[nowY][nowX] = 4 * (tile[nowY][nowX] != 3);
    }
    tile[homeY][homeX] = 3;
    return;
}
//===================================================================
function keyDown(key) {
    //console.log(key + ' pressed');
    switch (key) {
        case 'ShiftLeft':
        case 'ControlLeft':
            modifierHeld = true;
            break;
        default:
            return;
    }
    return;
}
function keyUp(key) {
    //console.log(key + ' pressed');
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
    held = event.type == 'mousedown' && event.type != 'mouseup';
    outOfRangeCount = 0;
    return;
}
function disableScroll() {
    document.body.style.overflow = 'hidden';
    document.querySelector('html').scrollTop = window.scrollY;
    return;
}
//===================================================================
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
function redraw() {
    drawBoard();
    drawGrid();
    return;
}
function drawBoard() {
    for (let y = 0; y < yCount; y++) {
        for (let x = 0; x < xCount; x++) {
                drawRect(x * tileSize, y * tileSize, tileSize, tileSize, palette[tile[y][x]]);
        }
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
//===================================================================
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
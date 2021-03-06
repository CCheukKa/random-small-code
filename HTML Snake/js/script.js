const canvas = document.getElementById("myCanvas");
const c = canvas.getContext("2d");
const scoreText = document.getElementById("scoreText");

const tileSize = 30;
const xCount = 20;
const yCount = 20;
const timeStepMS = 200;

const width = tileSize * xCount;
const height = tileSize * yCount;
canvas.width = width;
canvas.height = height;

const palette = ['#202022', '#2f2f31', '#3b7182', '#f18a70', '#fae393'];
//              [gridlines,     board,     snake,     apple,       idk]
const startLength = 3;
const segmentedSnake = false;
//
var alreadyTurnedThisFrame = false;
var isGrowingThisFrame = false;
var xApple, yApple;
var halt = false;
var length = startLength;
var direction = 4; // U1 D2 L3 R4
var board = [];
var row = [];
for (let i = 0; i < yCount; i++) {
    board[i] = [];
    for (let j = 0; j < xCount; j++) {
        board[i].push(0);
    }
}
for (let i = 0; i < startLength; i++) {
    board[Math.round(yCount / 2 - 0.5)][i] = i + 1;
}
var xHead = startLength - 1;
var yHead = Math.round(yCount / 2 - 0.5);

//===================================
generateApple();
document.body.style.backgroundColor = palette[0];
//
redraw();
disableScroll();
document.addEventListener('keydown', function(e) {
    keyDown(e.code);
});
//
setInterval(function() {
    move();
    redraw();
    alreadyTurnedThisFrame = false;
    scoreText.textContent = 'Score: ' + (length - startLength);
}, timeStepMS);


//===================================================================
function move() {
    if (halt) { return; }
    isGrowingThisFrame = false;
    switch (direction) {
        case 1:
            yHead--;
            break;
        case 2:
            yHead++;
            break;
        case 3:
            xHead--;
            break;
        case 4:
            xHead++;
            break;
        default:
            console.log('Unknown direction: ' + direction);
            break;
    }
    if (isWithinInclusiveRange(xHead, 0, xCount - 1) && isWithinInclusiveRange(yHead, 0, yCount - 1)) {
        if (board[yHead][xHead] > 1) {
            console.log('Hit head on tail');
            halt = true;
            return;
        }
    } else {
        console.log('Hit head on edge of board');
        halt = true;
        return;
    }
    if (board[yHead][xHead] < 0) {
        length++;
        isGrowingThisFrame = true;
    }
    if (!isGrowingThisFrame) {
        for (let y = 0; y < yCount; y++) {
            for (let x = 0; x < xCount; x++) {
                if (board[y][x] != 0) {
                    board[y][x]--;
                }
            }
        }
    }
    board[yHead][xHead] = length;

    if (isGrowingThisFrame) {
        generateApple();
        return;
    }
    return;
}

function generateApple() {
    while (true) {
        xApple = Math.floor(Math.random() * xCount);
        yApple = Math.floor(Math.random() * yCount);
        if (board[yApple][xApple] == 0) {
            break;
        }
    }
    board[yApple][xApple] = -1;
    return;
}
//===================================================================
function keyDown(key) {
    //console.log(key + ' pressed');
    if (alreadyTurnedThisFrame) {
        return;
    }
    switch (key) {
        case 'ArrowUp':
        case 'KeyW':
            if (direction == 2) { break; }
            direction = 1;
            break;
        case 'ArrowDown':
        case 'KeyS':
            if (direction == 1) { break; }
            direction = 2
            break;
        case 'ArrowLeft':
        case 'A':
            if (direction == 4) { break; }
            direction = 3;
            break;
        case 'ArrowRight':
        case 'D':
            if (direction == 3) { break; }
            direction = 4;
            break;
        default:
            return;
    }
    alreadyTurnedThisFrame = true;
    return;
}

function disableScroll() {
    document.body.style.overflow = 'hidden';
    document.querySelector('html').scrollTop = window.scrollY;
    return;
}

function isWithinInclusiveRange(test, lower, upper) {
    if (lower > upper) {
        let dummy = upper;
        upper = lower;
        lower = dummy;
    }
    return (lower <= test && test <= upper);
}

function isWithinExclusiveRange(test, lower, upper) {
    if (lower > upper) {
        let dummy = upper;
        upper = lower;
        lower = dummy;
    }
    return (lower < test && test < upper);
}
//===================================================================
function redraw() {
    if (halt) { return; }
    drawBoard();
    drawApple();
    drawSnake();
    drawGrid();
    drawSnakeAdj();
    return;
}

function drawGrid() {
    for (let x = 1; x < xCount; x++) {
        drawLine(x * tileSize, 0, x * tileSize, height, palette[0]);
    }
    for (let y = 1; y < yCount; y++) {
        drawLine(0, y * tileSize, width, y * tileSize, palette[0]);
    }
    return;
}

function drawBoard() {
    drawRect(0, 0, width, height, palette[1]);
    return;
}

function drawApple() {
    drawRect(xApple * tileSize, yApple * tileSize, tileSize, tileSize, palette[3]);
    return;
}

function drawSnake() {
    for (let x = 0; x < xCount; x++) {
        for (let y = 0; y < yCount; y++) {
            if (board[y][x] > 0) {
                drawRect(x * tileSize, y * tileSize, tileSize, tileSize, palette[2]);
            }
        }
    }
    return;
}

function drawSnakeAdj() {
    for (let x = 0; x < xCount; x++) {
        for (let y = 0; y < yCount; y++) {
            if (Math.abs(board[y][x] - board[y][x + 1]) == 1 && board[y][x] > 0 && board[y][x + 1] > 0) {
                if (segmentedSnake) {
                    drawLine((x + 0.5) * tileSize, (y + 0.5) * tileSize, (x + 1.5) * tileSize, (y + 0.5) * tileSize, palette[2]);
                } else {
                    drawRect(x * tileSize + 3, y * tileSize + 3, 2 * tileSize - 6, tileSize - 6, palette[2]);
                }
            }
            if (y != yCount - 1) {
                if (Math.abs(board[y][x] - board[y + 1][x]) == 1 && board[y][x] > 0 && board[y + 1][x] > 0) {
                    if (segmentedSnake) {
                        drawLine((x + 0.5) * tileSize, (y + 0.5) * tileSize, (x + 0.5) * tileSize, (y + 1.5) * tileSize, palette[2]);
                    } else {
                        drawRect(x * tileSize + 3, y * tileSize + 3, tileSize - 6, 2 * tileSize - 6, palette[2]);
                    }
                }
            }
        }
    }
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
    c.lineWidth = 6;
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
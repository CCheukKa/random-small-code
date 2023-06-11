//
var Move = /** @class */ (function () {
    function Move(position, number) {
        this.position = position;
        this.number = number;
    }
    return Move;
}());
function clone(object) {
    return JSON.parse(JSON.stringify(object));
}
function tree(board, nums, isPlayer1Turn) {
    var r0 = "".concat(board[0][0]).concat(board[0][1]).concat(board[0][2]);
    var r1 = "".concat(board[1][0]).concat(board[1][1]).concat(board[1][2]);
    var r2 = "".concat(board[2][0]).concat(board[2][1]).concat(board[2][2]);
    var boardIndex = "".concat(r0).concat(r1).concat(r2);
    if (score[boardIndex]) {
        return score[boardIndex];
    }
    var finalScore; //? 0 1 -1
    if (hasWinner(board)) {
        finalScore = 1 - 2 * +isPlayer1Turn;
        // console.log({ board, finalScore });
    }
    else if (isFull(board)) {
        finalScore = 0;
    }
    else {
        var moves = enumMoves(board, nums, isPlayer1Turn);
        var moveScores_1 = [];
        moves.forEach(function (move) {
            var newBoard = clone(board);
            var newNums = clone(nums);
            var newIsPlayer1Turn = !isPlayer1Turn;
            newBoard[Math.floor(move.position / 3)][move.position % 3] = move.number;
            var numsArr = newNums[1 - +isPlayer1Turn];
            // console.log(numsArr, move.number);
            var numIndex = numsArr.findIndex(function (num) { return num == move.number; }); // find index of used number
            numsArr.splice(numIndex, 1); // remove used number from numbers
            newNums[1 - +isPlayer1Turn] = numsArr;
            // console.log(numsArr);
            //
            var treeScore = tree(newBoard, newNums, newIsPlayer1Turn);
            moveScores_1.push(treeScore);
            // LINK: debug output
            searched++;
            if (!(searched % 100000)) {
                console.log("Searched: ".concat(searched, "/1045094400 (").concat((searched / 10450944).toFixed(4), "%)"));
            }
        });
        // let min = Math.min(...moveScores);
        // let max = Math.max(...moveScores);
        // console.log({ moveScores, max, min });
        finalScore = isPlayer1Turn ? Math.max.apply(Math, moveScores_1) : Math.min.apply(Math, moveScores_1);
    }
    //
    var s0 = "".concat(board[2][0]).concat(board[1][0]).concat(board[0][0]);
    var s1 = "".concat(board[2][1]).concat(board[1][1]).concat(board[0][1]);
    var s2 = "".concat(board[2][2]).concat(board[1][2]).concat(board[0][2]);
    //
    var t0 = "".concat(board[2][2]).concat(board[2][1]).concat(board[2][0]);
    var t1 = "".concat(board[1][2]).concat(board[1][1]).concat(board[1][0]);
    var t2 = "".concat(board[0][2]).concat(board[0][1]).concat(board[0][0]);
    //
    var u0 = "".concat(board[0][2]).concat(board[1][2]).concat(board[2][2]);
    var u1 = "".concat(board[0][1]).concat(board[1][1]).concat(board[2][1]);
    var u2 = "".concat(board[0][0]).concat(board[1][0]).concat(board[2][0]);
    //
    var boardIndices = ["".concat(r0).concat(r1).concat(r2), "".concat(r2).concat(r1).concat(r0), "".concat(s0).concat(s1).concat(s2), "".concat(s2).concat(s1).concat(s0), "".concat(t0).concat(t1).concat(t2), "".concat(t2).concat(t1).concat(t0), "".concat(u0).concat(u1).concat(u2), "".concat(u2).concat(u1).concat(u0)];
    boardIndices.forEach(function (index) { score[index] = finalScore; });
    return finalScore;
}
// var debugCount = 50;
function enumMoves(board, nums, isPlayer1Turn) {
    var moves = [];
    var _loop_1 = function (pos) {
        if (board[Math.floor(pos / 3)][pos % 3]) {
            return "continue";
        }
        nums[1 - +isPlayer1Turn].forEach(function (num) { moves.push(new Move(pos, num)); });
    };
    for (var pos = 0; pos < 9; pos++) {
        _loop_1(pos);
    }
    console.log({ board: board, nums: nums, isPlayer1Turn: isPlayer1Turn, moves: moves });
    return moves;
}
function hasWinner(board) {
    for (var i = 0; i < 3; i++) {
        if (board[i][0] + board[i][1] + board[i][2] == 15 && board[0][i] != 0 && board[1][i] != 0 && board[2][i] != 0) {
            return true;
        }
        if (board[0][i] + board[1][i] + board[2][i] == 15 && board[i][0] != 0 && board[i][1] != 0 && board[i][2] != 0) {
            return true;
        }
    }
    if (board[0][0] + board[1][1] + board[2][2] == 15 && board[0][0] != 0 && board[1][1] != 0 && board[2][2] != 0) {
        return true;
    }
    if (board[0][2] + board[1][1] + board[2][0] == 15 && board[0][2] != 0 && board[1][1] != 0 && board[2][0] != 0) {
        return true;
    }
    return false;
}
function isFull(board) {
    for (var i = 0; i < 9; i++) {
        if (!board[Math.floor(i / 3)][i % 3]) {
            return false;
        }
    }
    return true;
}
//! main
var score = [];
// score.length = Math.pow(10, 9);
var board = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0], // 6 7 8
];
var nums = [
    [1, 3, 5, 7, 9],
    [2, 4, 6, 8]
];
var isPlayer1Turn = true;
var searched = 0;
tree(board, nums, isPlayer1Turn);
//
console.log(score);

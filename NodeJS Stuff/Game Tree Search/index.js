class Move {
    constructor(position, number) {
        this.position = position;
        this.number = number;
    }
}

function tree(board, nums, isPlayer1Turn) {

    const moves = enumMoves(board, nums, isPlayer1Turn);

}

function enumMoves(board, nums, isPlayer1Turn) {


    return new Move(0, 0);
}

//








const fs = require('fs-extra');

//
var score = [];
score.length = Math.pow(10, 9);
var board = [
    [0, 0, 0], // 0 1 2
    [0, 0, 0], // 3 4 5
    [0, 0, 0], // 6 7 8
];
var nums = [
    [1, 3, 5, 7, 9],
    [2, 4, 6, 8]
];
var isPlayer1Turn = true;


tree(board, nums, isPlayer1Turn);
fs.writeJSON('./output.json', score,
    err => {
        if (err) { console.error(err); }
        console.log('Done.');
    });

//
//

class Move {
    position: number;
    number: number;

    constructor(position: number, number: number) {
        this.position = position;
        this.number = number;
    }
}

function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

function tree(board: number[][], nums: number[][], isPlayer1Turn: boolean): number {
    let r0 = `${board[0][0]}${board[0][1]}${board[0][2]}`;
    let r1 = `${board[1][0]}${board[1][1]}${board[1][2]}`;
    let r2 = `${board[2][0]}${board[2][1]}${board[2][2]}`;
    let boardIndex = `${r0}${r1}${r2}`;
    if (score[boardIndex]) { return score[boardIndex]; }

    let finalScore: number; //? 0 1 -1
    if (hasWinner(board)) {
        finalScore = 1 - 2 * +isPlayer1Turn;
        // console.log({ board, finalScore });
    } else if (isFull(board)) {
        finalScore = 0;

    } else {
        const moves = enumMoves(board, nums, isPlayer1Turn);
        let moveScores: number[] = [];
        moves.forEach(move => {
            let newBoard = clone(board);
            let newNums = clone(nums);
            let newIsPlayer1Turn = !isPlayer1Turn;
            newBoard[Math.floor(move.position / 3)][move.position % 3] = move.number;
            let numsArr = newNums[1 - +isPlayer1Turn];
            // console.log(numsArr, move.number);
            let numIndex = numsArr.findIndex(num => { return num == move.number; }); // find index of used number
            numsArr.splice(numIndex, 1); // remove used number from numbers
            newNums[1 - +isPlayer1Turn] = numsArr;
            // console.log(numsArr);
            //
            let treeScore = tree(newBoard, newNums, newIsPlayer1Turn);
            moveScores.push(treeScore);

            // LINK: debug output
            searched++;
            if (!(searched % 100000)) {
                console.log(`Searched: ${searched}/1045094400 (${(searched / 10450944).toFixed(4)}%)`);
            }
        });
        // let min = Math.min(...moveScores);
        // let max = Math.max(...moveScores);
        // console.log({ moveScores, max, min });
        finalScore = isPlayer1Turn ? Math.max(...moveScores) : Math.min(...moveScores);
    }

    //
    let s0 = `${board[2][0]}${board[1][0]}${board[0][0]}`;
    let s1 = `${board[2][1]}${board[1][1]}${board[0][1]}`;
    let s2 = `${board[2][2]}${board[1][2]}${board[0][2]}`;
    //
    let t0 = `${board[2][2]}${board[2][1]}${board[2][0]}`;
    let t1 = `${board[1][2]}${board[1][1]}${board[1][0]}`;
    let t2 = `${board[0][2]}${board[0][1]}${board[0][0]}`;
    //
    let u0 = `${board[0][2]}${board[1][2]}${board[2][2]}`;
    let u1 = `${board[0][1]}${board[1][1]}${board[2][1]}`;
    let u2 = `${board[0][0]}${board[1][0]}${board[2][0]}`;
    //
    let boardIndices = [`${r0}${r1}${r2}`, `${r2}${r1}${r0}`, `${s0}${s1}${s2}`, `${s2}${s1}${s0}`, `${t0}${t1}${t2}`, `${t2}${t1}${t0}`, `${u0}${u1}${u2}`, `${u2}${u1}${u0}`];
    boardIndices.forEach(index => { score[index] = finalScore; });
    return finalScore;

}


// var debugCount = 50;
function enumMoves(board: number[][], nums: number[][], isPlayer1Turn: boolean): Move[] {
    let moves: Move[] = [];

    for (let pos = 0; pos < 9; pos++) {
        if (board[Math.floor(pos / 3)][pos % 3]) { continue; }

        nums[1 - +isPlayer1Turn].forEach(num => { moves.push(new Move(pos, num)); });
    }

    console.log({ board, nums, isPlayer1Turn, moves });

    return moves;
}

function hasWinner(board: number[][]): boolean {
    for (let i = 0; i < 3; i++) {
        if (board[i][0] + board[i][1] + board[i][2] == 15 && board[0][i] != 0 && board[1][i] != 0 && board[2][i] != 0) { return true; }
        if (board[0][i] + board[1][i] + board[2][i] == 15 && board[i][0] != 0 && board[i][1] != 0 && board[i][2] != 0) { return true; }
    }
    if (board[0][0] + board[1][1] + board[2][2] == 15 && board[0][0] != 0 && board[1][1] != 0 && board[2][2] != 0) { return true; }
    if (board[0][2] + board[1][1] + board[2][0] == 15 && board[0][2] != 0 && board[1][1] != 0 && board[2][0] != 0) { return true; }
    return false;
}

function isFull(board: number[][]): boolean {
    for (let i = 0; i < 9; i++) {
        if (!board[Math.floor(i / 3)][i % 3]) { return false; }
    }
    return true;
}




//! main
var score: number[] = [];
// score.length = Math.pow(10, 9);
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

var searched = 0;

tree(board, nums, isPlayer1Turn);


//
console.log(score);
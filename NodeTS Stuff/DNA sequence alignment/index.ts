enum ACID {
    _,
    A,
    C,
    G,
    T,
};
function getPairScore(a: ACID, b: ACID): number {
    const set = new Set<ACID>([a, b]);
    if (set.has(ACID._)) { return -10; }
    if (a === b) { return 2; }
    switch (true) {
        case set.has(ACID.A) && set.has(ACID.G):
        case set.has(ACID.C) && set.has(ACID.T):
            return -5;
        default:
            return -7;
    }
}
type sequence = ACID[];
function stringToSequence(s: string): sequence {
    return s.split('').map((c) => {
        switch (c.toUpperCase()) {
            case 'A': return ACID.A;
            case 'C': return ACID.C;
            case 'G': return ACID.G;
            case 'T': return ACID.T;
            default: throw new Error(`Invalid character: ${c}`);
        }
    });
}
function logSequence(seq: sequence): void {
    console.log(
        seq.map((acid) => {
            switch (acid) {
                case ACID.A: return 'A';
                case ACID.C: return 'C';
                case ACID.G: return 'G';
                case ACID.T: return 'T';
                default: return '_';
            }
        }).join('')
    );
}

const seq1 = stringToSequence('ACCG');
const seq2 = stringToSequence('CCT');
logSequence(seq1);
logSequence(seq2);
align(seq1, seq2);

function align(seq1: sequence, seq2: sequence): void {
    const matrix = Array.from({ length: seq1.length + 1 }, () => Array<number>(seq2.length + 1).fill(0));
    for (let i = 1; i < matrix.length; i++) {
        matrix[i][0] = matrix[i - 1][0] + getPairScore(seq1[i - 1], ACID._);
    }
    for (let j = 1; j < matrix[0].length; j++) {
        matrix[0][j] = matrix[0][j - 1] + getPairScore(ACID._, seq2[j - 1]);
    }
    for (let i = 1; i < matrix.length; i++) {
        for (let j = 1; j < matrix[i].length; j++) {
            matrix[i][j] = Math.max(
                matrix[i - 1][j - 1] + getPairScore(seq1[i - 1], seq2[j - 1]),
                matrix[i - 1][j] + getPairScore(seq1[i - 1], ACID._),
                matrix[i][j - 1] + getPairScore(ACID._, seq2[j - 1])
            );
        }
    }
    const transposeMatrix = (matrix: number[][]): number[][] => {
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    };
    console.table(transposeMatrix(matrix));
    let i = seq1.length;
    let j = seq2.length;
    const aligned1: sequence = [];
    const aligned2: sequence = [];
    while (i > 0 || j > 0) {
        if (i > 0 && matrix[i][j] === matrix[i - 1][j] + getPairScore(seq1[i - 1], ACID._)) {
            aligned1.unshift(seq1[i - 1]);
            aligned2.unshift(ACID._);
            i--;
        } else if (j > 0 && matrix[i][j] === matrix[i][j - 1] + getPairScore(ACID._, seq2[j - 1])) {
            aligned1.unshift(ACID._);
            aligned2.unshift(seq2[j - 1]);
            j--;
        } else {
            aligned1.unshift(seq1[i - 1]);
            aligned2.unshift(seq2[j - 1]);
            i--;
            j--;
        }
    }
    logSequence(aligned1);
    logSequence(aligned2);
}
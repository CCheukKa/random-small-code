const process = require('process');
const fs = require('fs');
function getChar() {
    let buffer = Buffer.alloc(1)
    fs.readSync(0, buffer, 0, 1)
    return buffer.toString('utf8')
}

const tape = [];
const maxCellSize = 256;
var pointerLocation = 0;

const program = `
>>>+[,>+++++++[<------>-]<[->+>+<<]>>[-<<+>>]<->+<[>-<[-]]>[-<<[-]++++
+>>>>>]<<[->+>+<<]>>[-<<+>>]<-->+<[>-<[-]]>[-<<[-]++++++++>>>>>]<<[->+
>+<<]>>[-<<+>>]<--->+<[>-<[-]]>[-<<[-]++++++>>>>>]<<[->+>+<<]>>[-<<+>>
]<---->+<[>-<[-]]>[-<<[-]+++++++>>>>>]<<[->+>+<<]>>[-<<+>>]++++++[<---
>-]+<[>-<[-]]>[-<<[-]++++>>>>>]<<[->+>+<<]>>[-<<+>>]+++++[<---->-]+<[>
-<[-]]>[-<<[-]+++>>>>>]<<[->+>+<<]>>[-<<+>>]+++++++[<------->-]+<[>-<[
-]]>[-<<[-]+>>>>>]<<[->+>+<<]>>[-<<+>>]+++++++[<------->-]<-->+<[>-<[-
]]>[-<<[-]++>>>>>]<++++[<---->-]<]<<<[<<<]>>>
[-->+<[>-]>[>]<<++>[-<<<<
<+[>-->+<[>-]>[-<<+>>>]<<+>+<[>-]>[-<<->>>]<<+<[-<<<+>>>]<<<]>>>>>]<->
+<[>-]>[>]<<+>[-<->>>[>>>]>[->+>>+<<<]>[-<+>]>>[-[->>+<<]+>>]+>[->+<]>
[-<+>>>[-]+<<]+>>[-<<->>]<<<<[->>[-<<+>>]<<<<]>>[-<<<<<+>>>>>]<<<<<<<[
>>[-<<<+>>>]<<<<<]+>>[>-->+<[>-]>[-<<->>>]<<+>+<[>-]>[-<<+>>>]<<+<[->>
>+<<<]>>>]<]<--->+<[>-]>[->>[>>>]>+<<<<[<<<]>>]<<->+<[>-]>[->>[>>>]>-<
<<<[<<<]>>]<<->+<[>-]>[->>[>>>]>[->+>>+<<<]>[-<+>]>>[-[->>+<<]+>>]+>+<
[-<<]<<<<<[<<<]>>]<<->+<[>-]>[->>[>>>]>[->+>>+<<<]>[-<+>]>>[-[->>+<<]+
>>]+>-<[-<<]<<<<<[<<<]>>]<<->+<[>-]>[->>[>>>]>[->+>>+<<<]>[-<+>]>>[-[-
>>+<<]+>>]+>.<[-<<]<<<<<[<<<]>>]<<->+<[>-]>[->>[>>>]>[->+>>+<<<]>[-<+>
]>>[-[->>+<<]+>>]+>,<[-<<]<<<<<[<<<]>>]<<++++++++>>>]
`;

for (let i = 0; i < program.length;) {
    tape[pointerLocation] = tape[pointerLocation] || 0;
    // console.log(i, tape[pointerLocation]);

    const programChar = program[i];
    switch (programChar) {
        case '+':
            tape[pointerLocation] = (tape[pointerLocation] + 1) % maxCellSize;
            break;
        case '-':
            tape[pointerLocation] = (tape[pointerLocation] - 1 + maxCellSize) % maxCellSize;
            break;
        case '>':
            pointerLocation++;
            break;
        case '<':
            pointerLocation--;
            break;
        case '.':
            process.stdout.write(String.fromCharCode(tape[pointerLocation]));
            break;
        case ',':
            tape[pointerLocation] = getChar().charCodeAt(0);
            break;
        case '[':
            if (tape[pointerLocation] === 0) {
                // jump past the matching ]
                let bracketCount = 1;
                while (bracketCount !== 0) {
                    i++;
                    if (!program[i]) { throw new Error('Unmatched brackets'); }
                    if (program[i] === '[') { bracketCount++; }
                    if (program[i] === ']') { bracketCount--; }
                }
            }
            break;
        case ']':
            if (tape[pointerLocation] !== 0) {
                // jump back to the matching [
                let bracketCount = 1;
                while (bracketCount !== 0) {
                    i--;
                    if (!program[i]) { throw new Error('Unmatched brackets'); }
                    if (program[i] === '[') { bracketCount--; }
                    if (program[i] === ']') { bracketCount++; }
                }
            }
        default:
            break;
    }
    i++;
}
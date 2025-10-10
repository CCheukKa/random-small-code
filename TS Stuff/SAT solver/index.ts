import { lex, parse } from "./parser";

/*
    !: not
    &: and
    |: or
    ^: xor
    
    (: (
    ): )
    
    1: true
    0: false

    [A-Z]: input
*/
const expression = '1!';

const tokens = lex(expression);
console.log({ tokens });

const ast = parse(tokens);
console.log({ ast });
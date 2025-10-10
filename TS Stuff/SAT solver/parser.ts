import { NodeType, OperatorType, SatNode } from "./declaration";

type Token = string | Token[];
function lex(expression: string): Token[] {
    const tokens = expression.replaceAll(/\s/g, '').replace(/!{1,}/g, match => match.length % 2 === 0 ? "" : "!").split('');
    if (tokens.length === 0) { return []; }

    let grouped: boolean = false;
    let groupedTokens: Token[] | undefined = undefined;
    do {
        ({ grouped, groupedTokens } = group(groupedTokens ?? tokens));
    } while (grouped);
    if (groupedTokens.length === 1) {
        return [...groupedTokens.flat()];
    }

    return groupedTokens;
}
function group(tokens: Token[]): { grouped: boolean, groupedTokens: Token[] } {
    const groupedTokens: Token[] = [];

    let openIndex = NaN;
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token === '(') { openIndex = i; }
        if (token === ')') {
            if (isNaN(openIndex)) { throw new Error('Unmatched closing parenthesis'); }

            if (openIndex === 0 && i === tokens.length - 1) {
                return { grouped: true, groupedTokens: tokens.slice(1, -1) };
            }

            groupedTokens.push(...tokens.slice(0, openIndex));
            const group = tokens.slice(openIndex + 1, i);
            if (group.length === 0) { throw new Error('Empty parentheses'); }
            if (group.length === 1) {
                groupedTokens.push(...group);
            } else {
                groupedTokens.push(group);
            }
            groupedTokens.push(...tokens.slice(i + 1));
            return { grouped: true, groupedTokens };
        }
    }

    if (!isNaN(openIndex)) { throw new Error('Unmatched opening parenthesis'); }
    return { grouped: false, groupedTokens: tokens };
}


const bindingPower: Record<OperatorType, number> = {
    [OperatorType.NOT]: 3,
    [OperatorType.AND]: 2,
    [OperatorType.OR]: 1,
    [OperatorType.XOR]: 1,
} as const;
function bind(tokens: Token[]): SatNode {
    console.log(`parsing ${JSON.stringify(tokens)}`);

    const stack: SatNode[] = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        console.log(`token: ${token}`);

        switch (token) {
            case OperatorType.NOT: {
                stack.push({
                    nodeType: NodeType.OPERATOR,
                    operatorType: OperatorType.NOT,
                    input: bind([tokens[i + 1]]),
                });
                i++;
                break;
            }
            default: {
                if (Array.isArray(token)) {
                    const group = bind(token);
                    stack.push(group);
                } else {
                    stack.push({
                        nodeType: NodeType.INPUT,
                        key: token,
                    });
                }
                break;
            }
        }
    }
    if (stack.length === 1) { return stack[0]; }
    throw new Error('Invalid expression');
}

console.log(bind(lex('!!!A')));
// console.log(lex('((((A & (B | C)))))'));
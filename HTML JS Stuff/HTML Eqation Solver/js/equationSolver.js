const VARIABLES = ['x', 'y'];
const TOKENS = Object.freeze({
    INTERMEDIATE: {
        forInternalUseOnly: true,
        type: 'INTERMEDIATE',
        operationType: undefined,
        arguments: []
    }, NEGATIVE: {
        forInternalUseOnly: true,
        type: 'NEGATIVE',
        argument: undefined,
    }, SUM: {
        forInternalUseOnly: true,
        type: 'SUM',
        arguments: []
    }, variable: {
        type: 'variable',
        regex: new RegExp(`[${VARIABLES.join('')}]`)
    }, number: {
        type: 'number',
        regex: new RegExp(`[0-9]+`),
    }, parenthesis_open: {
        type: 'parenthesis_open',
        regex: new RegExp(`[(]`),
    }, parenthesis_close: {
        type: 'parenthesis_close',
        regex: new RegExp(`[)]`),
    }, op_add: {
        type: 'op_add',
        regex: new RegExp(`[+]`),
    }, op_subtract: {
        type: 'op_subtract',
        regex: new RegExp(`[-]`),
    }, op_multiply: {
        type: 'op_multiply',
        regex: new RegExp(`[*]`),
    }, op_divide: {
        type: 'op_divide',
        regex: new RegExp(`[/]`),
    }, op_exponent: {
        type: 'op_exponent',
        regex: new RegExp(`[\\^]`),
    }
});

function parseEquation(equation = '') {
    console.log({ equation });
    equation = equation.replace(/\s/g, '');
    equation = condenseOperators(equation);
    var degreeOfFreedom = 0;
    { //! check for = signs
        const equalSigns = equation.match(/=/g);
        if (!equalSigns) { throw new Error('Equation must contain "="'); }
        if (equalSigns.length !== 1) { throw new Error('Equation cannot contain more than one "="'); }
    }
    { //! check for variables
        const variableExists = new Array(VARIABLES.length).fill(false).map((_, i) => equation.includes(VARIABLES[i]));
        if (!variableExists.some((variableExists) => variableExists)) { throw new Error('Equation must contain at least one variable'); }
        degreeOfFreedom = variableExists.filter(v => v).length;
    }

    const equationSides = equation.split('=');
    const leftTokenised = tokeniseSide(equationSides[0]);
    const rightTokenised = tokeniseSide(equationSides[1]);
    const leftParsed = parse(leftTokenised);
    const rightParsed = parse(rightTokenised);
    const parsedEquation = {
        degreeOfFreedom: degreeOfFreedom,
        left: leftParsed,
        right: rightParsed,
    };

    console.log({ parsedEquation });
    console.log(JSON.stringify(parsedEquation));
    return parsedEquation;
}

function condenseOperators(equation = '') {
    equation = equation.replace(/\*\*/g, '^');
    equation = equation.replace(/[+-]+/g, pm => pm.match(/-/g) ? (pm.match(/-/g).length % 2 ? '-' : '+') : '+');
    // console.log({ equation });
    return equation;

}

function tokeniseSide(side = '') {
    const tokens = [];
    while (side.length > 0) {
        var tokenFound = false;
        for (const TOKEN_NAME in TOKENS) {
            const TOKEN = TOKENS[TOKEN_NAME];
            if (TOKEN.forInternalUseOnly) { continue; }
            const match = side.match(TOKEN.regex);
            if (match === null) { continue; }
            if (match.index !== 0) { continue; }
            tokens.push({ type: TOKEN.type, value: match[0] });
            side = side.slice(match[0].length);
            tokenFound = true;
            break;
        }
        if (!tokenFound) { throw new Error(`Invalid token found in equation side: ${side}`); }
    }
    // console.log({ tokens });
    return tokens;
}

function parse(tokens = []) {
    console.log({ parsing: tokens });
    console.log(JSON.stringify(tokens));
    if (tokens.length === 1) {
        const token = tokens[0];
        if (token.type === TOKENS.variable.type || token.type === TOKENS.number.type) {
            return { type: token.type, value: token.value };
        }
        if (token.type == TOKENS.NEGATIVE.type) {
            if (token.argument.type === TOKENS.number.type) {
                return { type: TOKENS.number.type, value: -token.argument.value };
            } else {
                return {
                    type: TOKENS.INTERMEDIATE.type,
                    operationType: TOKENS.op_multiply.type,
                    arguments: [
                        { type: TOKENS.number.type, value: -1 },
                        token.argument,
                    ]
                };
            }
        }

        //!
        throw new Error(`Invalid token found in equation side: ${token.value}`);
    }


    // // TODO: add support for omitting multiplication sign between number and intermediate
    // // done?


    { //* process parentheses
        var parenthesesDepth = 0;
        var openParenthesisCount = 0;
        var closeParenthesisCount = 0;
        var openParenthesisIndices = [];
        tokens.forEach((token, index) => {
            if (token.type !== TOKENS.parenthesis_open.type && token.type !== TOKENS.parenthesis_close.type) { return; }

            if (token.type === TOKENS.parenthesis_open.type) {
                openParenthesisCount++;
                parenthesesDepth++;
                openParenthesisIndices.push(index);
            }
            if (token.type === TOKENS.parenthesis_close.type) {
                closeParenthesisCount++;
                parenthesesDepth--;
            }

            // check parentheses parity
            if (parenthesesDepth < 0) { throw new Error('Parentheses are not balanced'); }

            if (token.type === TOKENS.parenthesis_close.type) {
                // remove all token inside the parentheses & insert parsed tokens
                const openParenthesisIndex = openParenthesisIndices.pop();
                const tokensToRemove = tokens.slice(openParenthesisIndex, index + 1);
                const parsedTokens = parse(tokensToRemove.slice(1, -1));
                tokens.splice(openParenthesisIndex, tokensToRemove.length, parsedTokens);
            }

        });
        if (parenthesesDepth !== 0) { throw new Error('Parentheses are not balanced'); }
    }

    { //* process negative numbers
        tokens.forEach((token, index) => {
            if (token.type !== TOKENS.op_subtract.type) { return; }

            const leftToken = tokens[index - 1];
            const rightToken = tokens[index + 1];
            const leftTokenAllowedList = [
                TOKENS.op_multiply.type,
                TOKENS.op_divide.type,
                TOKENS.op_exponent.type,
            ];
            const rightTokenAllowedList = [
                TOKENS.number.type,
                TOKENS.variable.type,
                TOKENS.INTERMEDIATE.type,
            ];
            if (leftToken !== undefined && !leftTokenAllowedList.includes(leftToken.type)) { return; }
            if (rightToken === undefined || !rightTokenAllowedList.includes(rightToken.type)) { return; }
            // is negative number:

            var newToken = Object.assign({}, TOKENS.NEGATIVE);
            newToken.argument = rightToken;
            tokens.splice(index, 2, parse([newToken]));
        });
    }

    { //* process exponents
        tokens.forEach((token, index) => {
            if (token.type !== TOKENS.op_exponent.type) { return; }

            const leftToken = tokens[index - 1];
            const rightToken = tokens[index + 1];
            const leftTokenAllowedList = [
                TOKENS.INTERMEDIATE.type,
                TOKENS.number.type,
                TOKENS.variable.type,
            ];
            const rightTokenAllowedList = [
                TOKENS.INTERMEDIATE.type,
                TOKENS.NEGATIVE.type,
                TOKENS.number.type,
                TOKENS.variable.type,
            ];
            if (leftToken === undefined || !leftTokenAllowedList.includes(leftToken.type)) { return; }
            if (rightToken === undefined || !rightTokenAllowedList.includes(rightToken.type)) { return; }
            // is exponent:

            var newToken = Object.assign({}, TOKENS.INTERMEDIATE);
            newToken.operationType = TOKENS.op_exponent.type;
            newToken.arguments = [leftToken, rightToken];
            tokens.splice(index - 1, 3, newToken);
        });
    }

    // TODO: add this
    // { //* process multiplication & division
    // }

    // TODO: add this
    // { //* process addition & subtraction
    //     var additionSubtractionIndices = [];
    //     tokens.forEach((token, index) => {
    //         if (token.type !== TOKENS.op_add.type && token.type !== TOKENS.op_subtract.type) { return; }
    //         additionSubtractionIndices.push(index);
    //     });
    // }

    // console.log(tokens[0]);
    if (tokens.length !== 1) { throw new Error('Parse failed'); }
    if (!tokens[0].forInternalUseOnly && ![TOKENS.number.type, TOKENS.variable.type].includes(tokens[0].type)) { throw new Error('Parse failed'); }
    return tokens[0];
}

function solveEquation(parsedEquation = {}) {
    // console.log(parsedEquation);
}

function evaluate(parsedEquation = {}, variableValues = []) {
    var equationString = toEquationString(parsedEquation);
    VARIABLES.forEach((variable, index) => { equationString = equationString.replace(new RegExp(variable, 'g'), variableValues[index]); });
    return eval(equationString);
}

function toEquationString(parsedEquation = {}) {
    const SYMBOLS = {
        [TOKENS.op_add.type]: '+',
        [TOKENS.op_subtract.type]: '-',
        [TOKENS.op_multiply.type]: '*',
        [TOKENS.op_divide.type]: '/',
        [TOKENS.op_exponent.type]: '**',
    };

    if (parsedEquation.type === TOKENS.INTERMEDIATE.type) {
        return `(${toEquationString(parsedEquation.arguments[0])}${SYMBOLS[parsedEquation.operationType]}${toEquationString(parsedEquation.arguments[1])})`;
    }
    if (parsedEquation.type === TOKENS.NEGATIVE.type) {
        return `-${toEquationString(parsedEquation.argument)}`;
    }
    if (parsedEquation.type === TOKENS.number.type || parsedEquation.type === TOKENS.variable.type) {
        return parsedEquation.value;
    }
    throw new Error(`Invalid token found in equation side: ${parsedEquation.value}`);
}
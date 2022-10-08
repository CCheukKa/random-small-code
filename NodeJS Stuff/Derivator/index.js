const prompt = require('prompt-sync')();

const rawExpression = prompt('Expression: ');

const expression = parse(rawExpression);

console.log(expression);

function parse(rawExpression) {
    return rawExpression.replace(/\s+/g, '');
}
const equationElement = document.getElementById("equation");
const solveButtonElement = document.getElementById("solve-button");
solveButtonElement.addEventListener("click", solve);
const resultElement = document.getElementById("result");

function solve() {
    const equation = equationElement.value;
    const parsedEquation = parseEquation(equation);
    const result = solveEquation(parsedEquation);
    resultElement.innerHTML = result;

    console.log(`${toEquationString(parsedEquation.left)}=${toEquationString(parsedEquation.right)}`);
}

// equationElement.value = "x^-(x^2) = 13";
equationElement.value = "x + 1 - x + 3 = 13";
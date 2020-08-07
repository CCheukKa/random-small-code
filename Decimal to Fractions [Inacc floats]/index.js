const x = -1.33;


var constant, decimal, abs;

var lowerNom = 0;
var lowerDen = 1;
var newNom, newDen;
var upperNom = 1;
var upperDen = 1;

abs = Math.abs(x);
constant = Math.floor(abs);
decimal = abs - constant;

if (decimal == 0) {
    console.log(x + ' = ' + x);
    return;
}

while (true) {
    newNom = lowerNom + upperNom;
    newDen = lowerDen + upperDen;
    let newDec = newNom / newDen;

    if (newDec == decimal) {
        break;
    }
    if (newDec > decimal) {
        upperNom = newNom;
        upperDen = newDen;
        continue;
    }
    if (newDec < decimal) {
        lowerNom = newNom;
        lowerDen = newDen;
        continue;
    }
}

console.log(x + ' = ' + Math.sign(x) * (constant * newDen + newNom) + '/' + newDen);
return;
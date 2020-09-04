let d = new Date();
console.log(d.getFullYear() + '-' + (d.getMonth() + 101).toString().substring(1) + '-' + (d.getDate() + 100).toString().substring(1) + ' ' + d.toLocaleTimeString().replace(":", "-").replace(":", "-"));





//================================================================
function simultaneousEquation(a, b, c, d, e, f) {
    // aX + bY + c = 0      dX + eY + f = 0
    let x = -(b * -f + c * e) / (a * e - b * d);
    let y = -(c - a * -x) / b;
    return [x, y];
}

function isPowerOfFour(num) {
    return (Math.log(num) / Math.log(4) % 1 == 0) * (num > 0);
}

function findDuplicates(nums) {
    let count = [];
    let duppedList = [];
    nums.forEach(element => {
        if (!count[element]) {
            count[element] = 0;
        }
        if (count[element] > 0) {
            duppedList.push(element);
        }
        count[element]++;
    });
    return duppedList;
}

function reverse(x) {
    const sign = Math.sign(x);
    x = Math.abs(x);
    var array = x.toString().split('');
    var reversed = '';
    for (let i = array.length - 1; i >= 0; i--) {
        reversed += array[i];
    }
    return reversed * sign * !(reversed * sign < -Math.pow(2, 31)) * !(reversed * sign > Math.pow(2, 31) - 1);
}

function arrayPairSum(nums) {
    let sorted = nums.sort((a, b) => a - b);
    var sum = 0;
    for (let i = 0; i < sorted.length / 2; i++) {
        sum += Math.min(sorted[2 * i], sorted[2 * i + 1]);
    }
    return sum;
}

function isLongPressedName(name, typed) {
    nameChunk = arrayIntoChunks(name.split(''));
    typedChunk = arrayIntoChunks(typed.split(''));

    if (nameChunk[0].length != typedChunk[0].length) { return false; }

    for (let i = 0; i < nameChunk[0].length; i++) {
        if (nameChunk[0][i] != typedChunk[0][i]) {
            return false;
        }
    }

    for (let i = 0; i < nameChunk[1].length; i++) {
        if (nameChunk[1][i] > typedChunk[1][i]) {
            return false;
        }
    }
    return true;
}

function arrayIntoChunks(array) {

    var chunks = [];
    var length = 1;
    var lengths = [];

    for (let i = 0; i < array.length; i++) {
        if (array[i] != array[i - 1]) {
            chunks.push(array[i]);
            lengths.push(length);
            length = 1;
        } else {
            length++;
        }
    }
    lengths.push(length);

    return [chunks, lengths];
}

function heightChecker(heights) {
    var unsorted = heights;
    var sorted = [];
    for (let i = 0; i < unsorted.length; i++) {
        sorted.push(unsorted[i]);
    }
    sorted = sortAscending(sorted);

    var move = 0;

    for (let i = 0; i < unsorted.length; i++) {
        if (unsorted[i] != sorted[i]) { move++; }
    }
    return move;
}

function sortAscending(array) {
    let sorted = [];
    const length = array.length;
    while (sorted.length != length) {
        let smallest = Infinity;
        array.forEach(element => {
            if (element < smallest) { smallest = element };
        });
        for (let i = 0; i < length; i++) {
            if (array[i] == smallest) {
                sorted.push(smallest);
                array.splice(i, 1, Infinity);
            }
        }
    }
    return sorted;
}

function isSortedAscending(array) {
    for (let i = 0; i < array.length - 1; i++) {
        if (array[i] > array[i + 1]) { return false };
    }
    return true;
}

function addStrings(num1, num2) {
    var dummy;
    if (num2.length > num1.length) {
        dummy = num1;
        num1 = num2;
        num2 = dummy;
    }

    // num1 > num2
    var num1Rev = reverseArray(num1.split(''));
    var num2Rev = reverseArray(num2.split(''));

    var length = num1.length; //6

    for (let i = num2.length; i < length; i++) {
        num2Rev.push('0');
    }


    var sum = [];
    var carryOver = false;
    for (let i = 0; i < length; i++) {
        var halfSum = parseInt(num1Rev[i]) + parseInt(num2Rev[i]) + carryOver;

        if (halfSum >= 10) {
            halfSum -= 10;
            carryOver = true;
        } else {
            carryOver = false;
        }
        sum.push(halfSum);
    }
    if (carryOver) { sum.push(1) };
    sum = reverseArray(sum);

    var outputString = '';
    for (let i = 0; i < sum.length; i++) {
        outputString += sum[i];
    }
    return outputString;
}

function reverseArray(x) {
    var result = [];
    for (let i = x.length - 1; i >= 0; i--) {
        result.push(x[i]);
    }
    return result;
}

function isPalindrome(x) {
    if (x < 0) { return false; }
    if (x == 0) { return true; }


    var digitCount = Math.round(Math.log10(x) + 0.5);

    var fromFront = [];
    var fromBack = [];
    var processedSum = 0;

    for (let i = 1; i <= digitCount; i++) {
        fromFront.push(Math.floor((x - processedSum) / Math.pow(10, digitCount - i)));
        processedSum += fromFront[i - 1] * Math.pow(10, digitCount - i);
    }

    for (let i = digitCount - 1; i >= 0; i--) {
        fromBack.push(fromFront[i]);
    }

    for (let i = 0; i < digitCount; i++) {
        if (fromFront[i] != fromBack[i]) { return false; }
    }
    return true;
}
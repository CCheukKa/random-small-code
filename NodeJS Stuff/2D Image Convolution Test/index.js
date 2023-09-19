import Jimp from 'jimp';

//#region //! Classes
class Pixel {
    constructor(r = 0, g = 0, b = 0, isSigned = false) {
        this.r = r;
        this.g = g;
        this.b = b;

        if (isSigned) {
            this.r = this.r;
            this.g = this.g;
            this.b = this.b;
        }
    }

    set colour([r, g, b]) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    get colour() {
        return [this.r, this.g, this.b];
    }

    get normalised() {
        return new Pixel(this.r / 255, this.g / 255, this.b / 255);
    }

    get denormalised() {
        return new Pixel(this.r * 255, this.g * 255, this.b * 255);
    }

    get signed() {
        return new Pixel(this.r * 2 - 1, this.g * 2 - 1, this.b * 2 - 1);
    }

    add(other) {
        return new Pixel(this.r + other.r, this.g + other.g, this.b + other.b);
    }
    subtract(other) {
        return new Pixel(this.r - other.r, this.g - other.g, this.b - other.b);
    }
    multiply(other) {
        return new Pixel(this.r * other.r, this.g * other.g, this.b * other.b);
    }
    divide(other) {
        return new Pixel(this.r / other.r, this.g / other.g, this.b / other.b);
    }
    scale(factor = 1) {
        return new Pixel(this.r * factor, this.g * factor, this.b * factor);
    }
    invert() {
        return new Pixel(1 - this.r, 1 - this.g, 1 - this.b);
    }

    linearScale(min, max) {
        return new Pixel(
            (this.r - min) / (max - min),
            (this.g - min) / (max - min),
            (this.b - min) / (max - min)
        );
    }
    get sigmoid() {
        return new Pixel(
            1 / (1 + Math.exp(-this.r)),
            1 / (1 + Math.exp(-this.g)),
            1 / (1 + Math.exp(-this.b))
        );
    }
    get collapsed() {
        let average = (this.r + this.g + this.b) / 3;
        return new Pixel(average, average, average);
    }
}
//#endregion

//#region //! Functions
function fullHexToRGB(hex) {
    return [hex >> 24 & 0xFF, hex >> 16 & 0xFF, hex >> 8 & 0xFF];
}

function bufferToArray(imageBuffer, isSigned = false) {
    let array = [];
    for (let x = 0; x < imageBuffer.getWidth(); x++) {
        array[x] = [];
        for (let y = 0; y < imageBuffer.getHeight(); y++) {
            array[x][y] = new Pixel(...fullHexToRGB(imageBuffer.getPixelColour(x, y))).normalised;
            // console.log(array[x][y]);
            if (isSigned) { array[x][y] = array[x][y].signed; }
            // console.log(array[x][y]);
        }
    }
    return array;
}

function convolve(baseArray, filterArray) {
    const filterOffsetX = Math.floor(filterArray.length / 2);
    const filterOffsetY = Math.floor(filterArray[0].length / 2);

    let convolvedArray = [];
    for (let x = 0; x < baseArray.length; x++) {
        convolvedArray[x] = [];
        for (let y = 0; y < baseArray[x].length; y++) {
            let pixel = new Pixel();
            for (let i = 0; i < filterArray.length; i++) {
                for (let j = 0; j < filterArray[i].length; j++) {
                    let basePixel;
                    try {
                        basePixel = baseArray[x + i - filterOffsetX][y + j - filterOffsetY];
                    } catch {
                        basePixel = undefined;
                    }

                    if (basePixel === undefined) { basePixel = new Pixel(); }
                    let filterPixel = filterArray[i][j];
                    pixel = pixel.add(basePixel.multiply(filterPixel));
                }
            }
            convolvedArray[x][y] = pixel.scale(1 / (filterArray.length * filterArray[0].length));
        }
    }
    // console.log(convolvedArray);
    return convolvedArray;
}
//#endregion


const baseImagePath = './images/base.png';
const filterImagePath = './images/filter.png';
const outputImagePath = './images/output.png';

var baseImage = await Jimp.read(baseImagePath);
var filterImage = await Jimp.read(filterImagePath);

var baseArray = bufferToArray(baseImage);
var filterArray = bufferToArray(filterImage, true);

var convolvedArray = convolve(baseArray, filterArray);

var convolvedLinearImage = new Jimp(baseImage.getWidth(), baseImage.getHeight());
var convolvedSigmoidImage = new Jimp(baseImage.getWidth(), baseImage.getHeight());
var convolvedCollapsedLinearImage = new Jimp(baseImage.getWidth(), baseImage.getHeight());
var convolvedCollapsedSigmoidImage = new Jimp(baseImage.getWidth(), baseImage.getHeight());

// get min and max convolved values
let min = Infinity;
let max = -Infinity;

for (let x = 0; x < convolvedArray.length; x++) {
    for (let y = 0; y < convolvedArray[x].length; y++) {
        min = Math.min(min, ...convolvedArray[x][y].colour);
        max = Math.max(max, ...convolvedArray[x][y].colour);
    }
}

for (let x = 0; x < convolvedArray.length; x++) {
    for (let y = 0; y < convolvedArray[x].length; y++) {
        // console.log(...convolvedArray[x][y].colour);
        convolvedLinearImage.setPixelColour(Jimp.rgbaToInt(...convolvedArray[x][y].linearScale(min, max).denormalised.colour, 255), x, y);
        convolvedSigmoidImage.setPixelColour(Jimp.rgbaToInt(...convolvedArray[x][y].sigmoid.denormalised.colour, 255), x, y);
        convolvedCollapsedLinearImage.setPixelColour(Jimp.rgbaToInt(...convolvedArray[x][y].collapsed.linearScale(min, max).denormalised.colour, 255), x, y);
        convolvedCollapsedSigmoidImage.setPixelColour(Jimp.rgbaToInt(...convolvedArray[x][y].collapsed.sigmoid.denormalised.colour, 255), x, y);
    }
}

convolvedLinearImage.write('./images/convolvedLinear.png');
convolvedSigmoidImage.write('./images/convolvedSigmoid.png');
convolvedCollapsedLinearImage.write('./images/convolvedCollapsedLinear.png');
convolvedCollapsedSigmoidImage.write('./images/convolvedCollapsedSigmoid.png');
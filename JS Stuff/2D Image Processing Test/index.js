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

    set value(value) {
        this.r = value;
        this.g = value;
        this.b = value;
    }

    get value() {
        return (this.r + this.g + this.b) / 3;
    }

    scale(factor = 1) {
        return new Pixel(this.r * factor, this.g * factor, this.b * factor);
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

function bufferToArray(imageBuffer) {
    let array = [];
    for (let x = 0; x < imageBuffer.getWidth(); x++) {
        array[x] = [];
        for (let y = 0; y < imageBuffer.getHeight(); y++) {
            array[x][y] = new Pixel(...fullHexToRGB(imageBuffer.getPixelColour(x, y)));
        }
    }
    return array;
}

function highlightPercentage(imageArray) {
    const HIGHLIGHT_PERCENTAGE = 10;
    const HIGHLIGHT_COUNT = imageArray.length * imageArray[0].length * HIGHLIGHT_PERCENTAGE / 100;

    // calculate red percentage
    let redPercentageArray = [];
    for (let x = 0; x < imageArray.length; x++) {
        redPercentageArray[x] = [];
        for (let y = 0; y < imageArray[x].length; y++) {
            let pixel = imageArray[x][y];
            let redPercentage = pixel.r / (pixel.r + pixel.g + pixel.b);
            redPercentageArray[x][y] = redPercentage;
        }
    }

    // sort pixels by red percentage
    let sortedPixels = [];
    for (let x = 0; x < redPercentageArray.length; x++) {
        for (let y = 0; y < redPercentageArray[x].length; y++) {
            sortedPixels.push({ x, y, redPercentage: redPercentageArray[x][y] });
        }
    }
    sortedPixels.sort((a, b) => b.redPercentage - a.redPercentage);

    // highlight pixels
    let highlightedPixels = [];
    for (let i = 0; i < HIGHLIGHT_COUNT; i++) {
        let pixel = sortedPixels[i];
        highlightedPixels.push({ x: pixel.x, y: pixel.y, colour: [255, 0, 0] });
    }

    // add highlights to image
    for (let i = 0; i < highlightedPixels.length; i++) {
        let pixel = highlightedPixels[i];
        imageArray[pixel.x][pixel.y].value = (HIGHLIGHT_COUNT - i) / HIGHLIGHT_COUNT * 255;
    }

    return imageArray;
}

function highlightAbsolute(imageArray) {
    const HIGHLIGHT_PERCENTAGE = 10;
    const HIGHLIGHT_COUNT = imageArray.length * imageArray[0].length * HIGHLIGHT_PERCENTAGE / 100;

    let sortedPixels = [];
    for (let x = 0; x < imageArray.length; x++) {
        for (let y = 0; y < imageArray[x].length; y++) {
            sortedPixels.push({ x, y, r: imageArray[x][y].r });
        }
    }
    sortedPixels.sort((a, b) => b.r - a.r);

    // highlight pixels
    let highlightedPixels = [];
    for (let i = 0; i < HIGHLIGHT_COUNT; i++) {
        let pixel = sortedPixels[i];
        highlightedPixels.push({ x: pixel.x, y: pixel.y, colour: [255, 0, 0] });
    }

    // add highlights to image
    for (let i = 0; i < highlightedPixels.length; i++) {
        let pixel = highlightedPixels[i];
        imageArray[pixel.x][pixel.y].value = (HIGHLIGHT_COUNT - i) / HIGHLIGHT_COUNT * 255;
    }

    return imageArray;
}

function highlightCombined(imageArray) {
    /* //!-------------------------------------------------------------------------- */
    /* //!                                   MAIN                                    */
    /* //!-------------------------------------------------------------------------- */
    const HIGHLIGHT_PERCENTAGE = 0.2;
    const HIGHLIGHT_COUNT = imageArray.length * imageArray[0].length * HIGHLIGHT_PERCENTAGE / 100;

    // calculate red percentage
    let redPercentageArray = [];
    for (let x = 0; x < imageArray.length; x++) {
        redPercentageArray[x] = [];
        for (let y = 0; y < imageArray[x].length; y++) {
            let pixel = imageArray[x][y];
            let redPercentage = pixel.r / (pixel.r + pixel.g + pixel.b);
            redPercentageArray[x][y] = redPercentage;
        }
    }

    // sort pixels
    // //$
    // let sortedAbsolutePixels = [];
    // for (let x = 0; x < imageArray.length; x++) {
    //     for (let y = 0; y < imageArray[x].length; y++) {
    //         sortedAbsolutePixels.push({ x, y, r: imageArray[x][y].r });
    //     }
    // }
    // sortedAbsolutePixels.sort((a, b) => a.r - b.r);
    //$
    let sortedPixels = [];
    // const IMAGE_PIXEL_COUNT = imageArray.length * imageArray[0].length;

    for (let x = 0; x < imageArray.length; x++) {
        for (let y = 0; y < imageArray[x].length; y++) {
            let redPercentage = redPercentageArray[x][y];
            let value = imageArray[x][y].value / 255;
            // sortedPixels.push({ x: pixel.x, y: pixel.y, score: redPercentage * (imageArray[pixel.x][pixel.y].value / 255) * index / IMAGE_PIXEL_COUNT });
            sortedPixels.push({ x, y, score: redPercentage * value });
        }
    }
    sortedPixels.sort((a, b) => b.score - a.score);
    //$

    // highlight pixels
    let highlightedPixels = [];
    for (let i = 0; i < HIGHLIGHT_COUNT; i++) {
        let pixel = sortedPixels[i];
        highlightedPixels.push({ x: pixel.x, y: pixel.y });
    }

    /* //!-------------------------------------------------------------------------- */


    // add highlights to image
    let outputArray = imageArray;
    for (let x = 0; x < outputArray.length; x++) {
        for (let y = 0; y < outputArray[x].length; y++) {
            outputArray[x][y] = outputArray[x][y].scale(0.2);
        }
    }

    for (let i = 0; i < highlightedPixels.length; i++) {
        let pixel = highlightedPixels[i];
        // imageArray[pixel.x][pixel.y].value = (HIGHLIGHT_COUNT - i) / HIGHLIGHT_COUNT * 255;
        outputArray[pixel.x][pixel.y].value = (HIGHLIGHT_COUNT - i) / HIGHLIGHT_COUNT * 255;
    }

    return outputArray;
}
//#endregion

//#region //~ Main
const baseImagePath = './images/base.png';
const outputImagePath = './images/output.png';

var baseImage = await Jimp.read(baseImagePath);
var baseArray = bufferToArray(baseImage);
// var outputArray = highlightPercentage(baseArray);
// var outputArray = highlightAbsolute(baseArray);
var outputArray = highlightCombined(baseArray);
var outputImage = new Jimp(baseImage.getWidth(), baseImage.getHeight());

for (let x = 0; x < outputArray.length; x++) {
    for (let y = 0; y < outputArray[x].length; y++) {
        // console.log(outputArray[x][y].value);
        outputImage.setPixelColour(Jimp.rgbaToInt(...outputArray[x][y].colour, 255), x, y);
    }
}

outputImage.write(outputImagePath);
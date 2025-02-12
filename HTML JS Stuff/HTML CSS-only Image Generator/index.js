const fs = require("fs-extra");
const Jimp = require("jimp");

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

Jimp.read(config.filePath, function (err, image) {
    if (err) { throw err }

    let pixelSize = config.pixelSize;
    if (!config.useAbsolutePixelSize) {
        pixelSize = config.imageWidth / image.bitmap.width;
    }

    compile(image, pixelSize);
});

function compile(image, pixelSize) {
    debugDump(image);
    let stylesheetString = '';
    for (let y = 1; y <= image.bitmap.height; y++) {
        for (let x = 1; x <= image.bitmap.width; x++) {
            let pixel = Jimp.intToRGBA(image.getPixelColour(x - 1, y - 1));
            stylesheetString += `${x * pixelSize}px ${y * pixelSize}px 0px 0px rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a}),`;
        }
    }
    stylesheetString = stylesheetString.substring(0, stylesheetString.length - 1);

    debugDump(stylesheetString);
    stylesheetString = `
.gen-pic{
    width: ${pixelSize}px;
    height: ${pixelSize}px;
    box-shadow: ${stylesheetString}\n
}`;
    fs.writeFileSync('./stylesheet.css', stylesheetString);
    fs.writeFileSync('./integrated.html', `
<!DOCTYPE html>
<html>

<style>
${stylesheetString}
</style>

<body style="background-color: #222426;">
    <div class="gen-pic" style="outline: #d3cfca 1px solid;"></div>
</body>

</html>
    `);
}

function debugDump(data) {
    if (config.consoleDebugDump) {
        console.log(data);
    }
}
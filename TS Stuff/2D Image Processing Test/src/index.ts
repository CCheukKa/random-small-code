import { Jimp } from "jimp";

Jimp.read("./images/base.png")
    .then(image => {

    })
    .catch(err => {
        console.error("Error reading the image:", err);
    });
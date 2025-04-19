"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pixel = void 0;
class Pixel {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    setColour(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    set value(v) {
        this.r = v;
        this.g = v;
        this.b = v;
    }
}
exports.Pixel = Pixel;

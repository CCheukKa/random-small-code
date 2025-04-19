class Pixel {
    r: number;
    g: number;
    b: number;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    set colour([r, g, b]: [number, number, number]) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    get colour(): [number, number, number] {
        return [this.r, this.g, this.b];
    }

    add(other: Pixel): Pixel {
        return new Pixel(this.r + other.r, this.g + other.g, this.b + other.b);
    }
    subtract(other: Pixel): Pixel {
        return new Pixel(this.r - other.r, this.g - other.g, this.b - other.b);
    }
    multiply(other: Pixel): Pixel {
        return new Pixel(this.r * other.r, this.g * other.g, this.b * other.b);
    }
    divide(other: Pixel): Pixel {
        return new Pixel(this.r / other.r, this.g / other.g, this.b / other.b);
    }
    scale(factor: number): Pixel {
        return new Pixel(this.r * factor, this.g * factor, this.b * factor);
    }
    invert(): Pixel {
        return new Pixel(1 - this.r, 1 - this.g, 1 - this.b);
    }
}

export default Pixel;
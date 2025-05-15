//! This doesn't work for some reason lmao

interface Colour {
    r: number;
    g: number;
    b: number;
}

interface RGBAColour extends Colour {
    a: number;
}

function blend(source: RGBAColour, dest: Colour): Colour {
    const a = source.a;
    const r = Math.round((source.r * a) + (dest.r * (1 - a)));
    const g = Math.round((source.g * a) + (dest.g * (1 - a)));
    const b = Math.round((source.b * a) + (dest.b * (1 - a)));
    return { r, g, b };
}

function hexToRgb(hex: string): Colour {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : (() => { throw new Error("Invalid hex colour format") })();
}

function colourDistance(colour1: Colour, colour2: Colour): number {
    const rDiff = colour1.r - colour2.r;
    const gDiff = colour1.g - colour2.g;
    const bDiff = colour1.b - colour2.b;
    return rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;
}

const baseColour = hexToRgb("#a4d2f4");
const baseMixTarget = hexToRgb("#5283ac");
const selfMixTarget = hexToRgb("#295c88");
function calculateError(testColour: Colour): number {
    const baseBlendedColour = blend({ ...baseColour, a: 0.5 }, testColour);
    const selfBlendedColour = blend({ ...baseColour, a: 0.5 }, baseBlendedColour);

    const baseError = colourDistance(baseBlendedColour, baseMixTarget);
    const selfError = colourDistance(selfBlendedColour, selfMixTarget);

    return baseError + selfError;
}

let bestCandidate = { r: 0, g: 0, b: 0 };
let bestError = Infinity;

performance.measure("loop");
for (let r = 0; r < 256; r++) {
    for (let g = 0; g < 256; g++) {
        for (let b = 0; b < 256; b++) {
            for (let a = 0; a < 256; a++) {
                const testColour = { r, g, b, a: a / 256 };
                const error = calculateError(testColour);
                if (error < bestError) {
                    bestError = error;
                    bestCandidate = testColour;
                    console.log(`New best candidate: ${JSON.stringify(bestCandidate)} with error: ${bestError}`);
                }
            }
        }
    }
    console.log(`Progress: ${Math.round((r / 255) * 100)}%`);
}
performance.measure("loop");
console.log(performance.getEntriesByName("loop")[0].duration);
console.log("Best candidate colour:", bestCandidate);
console.log("Best error:", bestError);
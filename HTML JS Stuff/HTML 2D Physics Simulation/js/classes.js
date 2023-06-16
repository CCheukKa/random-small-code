class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    fromDirection(direction) { return new Vector2D(Math.cos(direction), Math.sin(direction)); } // act as constructor

    add(...vectors) { return vectors.reduce((sum, vector) => new Vector2D(sum.x + vector.x, sum.y + vector.y), this); }
    subtract(...vectors) { return vectors.reduce((sum, vector) => new Vector2D(sum.x - vector.x, sum.y - vector.y), this); }
    dot(vector) { return this.x * vector.x + this.y * vector.y; }
    scale(scalar) { return new Vector2D(this.x * scalar, this.y * scalar); }
    distanceTo(vector) { return this.subtract(vector).magnitude; }
    get magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    get normalised() { return this.scale(1 / this.magnitude); }
    get direction() { return Math.atan2(this.y, this.x); }

    reflect(normal) {
        const normalised = normal.normalised; // don't trust the input
        const dot = this.dot(normalised);
        // if (dot >= 0) { return this; } // no reflect
        // if (dot >= 0) { return this.add(normalised); } // speed up
        const reflection = this.subtract(normalised.scale(2 * dot));
        // console.log({ this: this, normal, normalised, dot, reflection });
        return reflection;
    }
}

// class MeshFunction {
//     constructor(equation = '') {
//         if (equation === '') {
//             throw new Error('Mesh function must have an equation');
//             // return null;
//         }
//         this.equation = equation.replace(/\^/g, '**');
//         console.log({ equation: this.equation });
//         this.evaluate = ({ x, y }) => {
//             // console.log({ x, y, result: eval(this.equation) });
//             return eval(this.equation);
//         }
//     }
// }

class Entity {
    constructor({
        position = new Vector2D(), // position of (0, 0) for the mesh function
        velocity = new Vector2D(),
        // colour = '#000000',
        // mass = 1,
        isStatic = false,
        // boundingBoxCorners = undefined, // array of entity space Vector2D opposite corners (bottom left, top right)
        // meshFunction,
        renderInterface = {
            fill: true,
        },
        smoothFunctions, // array of functions that return y = f(x) as a strict continuous math function
    } = {}) {
        // if (meshFunction === undefined) { //? default mesh function: circle of radius 100
        //     // if (!meshFunction) { throw new Error('Entity must have a mesh function') }
        //     const defaultEquation = 'x^2 + y^2 - 100^2';
        //     console.warn(`Entity has no mesh function. Default function will be used.\nDefault function: ${defaultEquation}`);
        //     meshFunction = new MeshFunction(defaultEquation);
        // }
        // //* test mesh function
        // try {
        //     meshFunction.evaluate(new Vector2D());
        // } catch (error) {
        //     console.warn(`Mesh function failed initialisation test.\nMesh function: ${meshFunction.equation}\nError: ${error}`);
        //     throw error;
        // }

        // if (isStatic && boundingBoxCorners === undefined) { throw new Error('Static entity must have a bounding box'); }

        this.position = position;
        this.velocity = velocity;
        // this.colour = colour;
        // this.mass = mass;
        this.isStatic = isStatic;
        // this.boundingBoxCorners = boundingBoxCorners;
        // this.meshFunction = meshFunction;
        this.renderInterface = renderInterface;
        this.smoothFunctions = smoothFunctions;
        this.physics = {
            points: [], // dynamically refreshed for non-static entities
            sectors: [], // dynamically refreshed for non-static entities
            sectorPoints: [], // dynamically refreshed for non-static entities
            collisionCooldown: [], // dynamically refreshed for non-static entities
        }
        //*
        entityList.push(this);
    }
}
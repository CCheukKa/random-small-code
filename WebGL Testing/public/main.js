import { mat4 } from "gl-matrix";

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error('WebGL not supported!');
}

//=========================================================
const matrix = mat4.create();
mat4.translate(matrix, matrix, [2, 5, 1]);
mat4.translate(matrix, matrix, [2, 5, 1]);
console.log(matrix);

const vertexData = [
    0, 1, 0,
    1, -1, 0,
    -1, -1, 0,
];

const colourData = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
];


//=========================================================
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const colourBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colourData), gl.STATIC_DRAW);

//
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
    precision mediump float;

    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColour;

    void main() {
        vColour = color;
        gl_Position = vec4(position, 1);
    }
`);
gl.compileShader(vertexShader);
console.log(gl.getShaderInfoLog(vertexShader));

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
    precision mediump float;

    varying vec3 vColour;
    void main() {
        gl_FragColor = vec4(vColour, 1);
    }
`);
gl.compileShader(fragmentShader);
console.log(gl.getShaderInfoLog(fragmentShader));

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
console.log(gl.getProgramInfoLog(program));

const positionPointer = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionPointer);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionPointer, 3, gl.FLOAT, false, 0, 0);

const colourPointer = gl.getAttribLocation(program, `color`);
gl.enableVertexAttribArray(colourPointer);
gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
gl.vertexAttribPointer(colourPointer, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3);
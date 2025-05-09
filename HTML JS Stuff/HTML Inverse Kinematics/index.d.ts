declare const log1Element: HTMLDivElement;
declare const log2Element: HTMLDivElement;
declare const canvas: HTMLCanvasElement;
declare const ctx: CanvasRenderingContext2D;
declare const width: number;
declare const height: number;
type Arm = {
    length: number;
    width: number;
    absoluteAngle: number;
    relativeAngle?: number;
    colour: string;
};
declare const arms: Arm[];
declare const armAngularSpeed = 0.0005;
declare let mouseX: number;
declare let mouseY: number;
declare let lastTickTime: number;
declare function updateTick(): void;
declare function updateRobot(): void;
declare let lastFrameTime: number;
declare function updateFrame(): void;
declare function drawRobot(): void;
declare function _xyToCanvasSpace(x: number, y: number): [number, number];
declare function _drawCentredRect(x: number, y: number, w: number, h: number, colour: string): void;
declare function _drawFromToRect(x1: number, y1: number, x2: number, y2: number, colour: string): void;
declare function _drawCircle(x: number, y: number, r: number, colour: string): void;
declare function _drawLine(x1: number, y1: number, x2: number, y2: number, thickness: number, colour: string): void;
//# sourceMappingURL=index.d.ts.map
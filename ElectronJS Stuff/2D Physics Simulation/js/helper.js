function getFunctionPoints(entityPosition, smoothFunction) {
    const ssPoints = [];
    for (let x = -overDraw; x <= canvasSize.x + overDraw; x += stepSize) {
        const y = smoothFunction(x - entityPosition.x);
        // other methods can handle NaN, Infinity, undefined, but null is treated as 0
        if (y === null) { continue; }

        ssPoints.push(new Vector2D(x, y + entityPosition.y));
    }
    return ssPoints;
}
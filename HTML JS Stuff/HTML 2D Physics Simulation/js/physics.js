//#region //! constants
const gravitationalForce = -981;
//#endregion

function initialiseStaticEntities() {
    entityList.forEach(entity => {
        if (entity.isStatic) {
            entity.physics.points = grabPoints(entity);
            entity.physics.sectors = grabSectors(entity.physics.points);
        }
    });
}

function physics() {
    // recalculate points and sectors for non-static entities
    entityList.forEach(entity => {
        if (entity.isStatic) { return; }
        entity.physics.points = grabPoints(entity);
        entity.physics.sectors = grabSectors(entity.physics.points);
    });

    // apply physics to non-static entities
    entityList.forEach(entity => {
        if (entity.isStatic) { return; }

        gravity(entity);
        collide(entity);
        updateVectors(entity);
        // console.log(entity);
    });
}

function gravity(entity) {
    entity.velocity.y += gravitationalForce * physicsDeltaTime;
}

function updateVectors(entity) {
    entity.position = entity.position.add(entity.velocity.scale(physicsDeltaTime));
}

function grabPoints(entity) {
    var ssPoints = [];
    entity.smoothFunctions.forEach(smoothFunction => { ssPoints = ssPoints.concat(getFunctionPoints(entity.position, smoothFunction)) });
    return ssPoints;
}

function grabSectors(ssPoints) {
    var sectors = [];
    // var sectors = new Array(totalSectorCount).fill(false);
    for (let y = 0; y < sectorCount.y; y++) {
        for (let x = 0; x < sectorCount.x; x++) {
            // sector x ∈ [x * sectorSize.x / 2, (x + 1) * sectorSize.x / 2]
            // sector y ∈ [y * sectorSize.y / 2, (y + 1) * sectorSize.y / 2]
            sectors[y * sectorCount.y + x] = ssPoints.some(ssPoint => pointIsInSector(ssPoint, x, y));
        }
    }
    return sectors;
}

function pointIsInSector(ssPoint, sectorX, sectorY) {
    return ssPoint.x >= sectorX * sectorSize.x / 2 && ssPoint.x <= (sectorX + 1) * sectorSize.x / 2 && ssPoint.y >= sectorY * sectorSize.y / 2 && ssPoint.y <= (sectorY + 1) * sectorSize.y / 2;

}

function collide(entity) {
    entityList.forEach(otherEntity => {
        if (otherEntity === entity) { return; }

        // TODO:
        // occupy same sector?
        // iterate through points in the sectors
        // check for collision (threshold distance)
        //? is it faster to isolated only points in the same sector before checking collision?
        // if collision, get average position of collision points
        // get normal of collision points
        // save into collidedThisFrame array
    });
}
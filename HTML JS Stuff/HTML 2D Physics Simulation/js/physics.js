//#region //! constants
const gravitationalForce = -981;
//#endregion

function initialiseStaticEntities() {
    entityList.forEach(entity => {
        if (!entity.isStatic) { return; }
        entity.physics.points = grabPoints(entity);
        [entity.physics.sectors, entity.physics.sectorPoints] = computeSectors(entity.physics.points);
    });
}

function physics() {
    // recalculate points and sectors for non-static entities
    entityList.forEach(entity => {
        if (entity.isStatic) { return; }
        entity.physics.points = grabPoints(entity);
        [entity.physics.sectors, entity.physics.sectorPoints] = computeSectors(entity.physics.points);
    });

    // apply physics to non-static entities
    entityList.forEach(entity => {
        if (entity.isStatic) { return; }
        countdownCooldown(entity);

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

function computeSectors(ssPoints) {
    var sectors = [];
    var sectorPoints = [];
    // var sectors = new Array(totalSectorCount).fill(false);
    // var sectorPoints = new Array(totalSectorCount).fill([]);
    for (let y = 0; y < sectorCount.y; y++) {
        for (let x = 0; x < sectorCount.x; x++) {
            // sector x ∈ [x * sectorSize.x / 2, (x + 1) * sectorSize.x / 2]
            // sector y ∈ [y * sectorSize.y / 2, (y + 1) * sectorSize.y / 2]
            // sectors[y * sectorCount.y + x] = ssPoints.some(ssPoint => pointIsInSector(ssPoint, x, y));
            ssPoints.forEach(ssPoint => {
                if (pointIsInSector(ssPoint, x, y)) {
                    sectors[y * sectorCount.y + x] = true;
                    if (!sectorPoints[y * sectorCount.y + x]) { sectorPoints[y * sectorCount.y + x] = []; }
                    sectorPoints[y * sectorCount.y + x].push(ssPoint);
                }
            });
        }
    }
    return [sectors, sectorPoints];
}

function pointIsInSector(ssPoint, sectorX, sectorY) {
    return ssPoint.x >= sectorX * sectorSize.x / 2 && ssPoint.x <= (sectorX + 1) * sectorSize.x / 2 && ssPoint.y >= sectorY * sectorSize.y / 2 && ssPoint.y <= (sectorY + 1) * sectorSize.y / 2;

}

const collisionDistanceThreshold = 2;
const minimumCollisionPoints = 5;

// FIXME: make collision check better so this isnot necessary
// double collisions are common, so cooldown is needed?
const collisionCooldownFrames = 1;

function collide(entity) {
    //* overview:
    // occupy same sector?
    // iterate through points in the sectors
    // check for collision (threshold distance)
    //? is it faster to isolated only points in the same sector before checking collision?
    // if collision, get average position of collision points
    // get normal of collision points
    // save into collidedThisFrame array

    entityList.forEach(otherEntity => {
        if (otherEntity === entity) { return; }
        if (entity.physics.collisionCooldown.some(cooldown => cooldown.entity === otherEntity)) { return; }

        const shareSector = new Array(totalSectorCount).fill().map((_, i) => entity.physics.sectors[i] && otherEntity.physics.sectors[i]);
        if (!shareSector.some(x => x)) { return; } //? no common sectors

        const myCollisionPoints = [];
        const otherCollisionPoints = [];
        shareSector.forEach((sector, i) => {
            if (!sector) { return; } //? not in common sector

            const entitySectorPoints = entity.physics.sectorPoints[i];
            const otherEntitySectorPoints = otherEntity.physics.sectorPoints[i];

            entitySectorPoints.forEach(entitySectorPoint => {
                otherEntitySectorPoints.forEach(otherEntitySectorPoint => {
                    const distance = entitySectorPoint.distanceTo(otherEntitySectorPoint);
                    if (distance < collisionDistanceThreshold) {
                        myCollisionPoints.push(entitySectorPoint);
                        otherCollisionPoints.push(otherEntitySectorPoint);
                    }
                });
            });
        });

        if (myCollisionPoints.length < minimumCollisionPoints) { return; }
        // console.log(myCollisionPoints);
        // console.log(otherCollisionPoints);

        // remove duplicates
        const myCollisionPointsSet = new Set(myCollisionPoints);
        const otherCollisionPointsSet = new Set(otherCollisionPoints);
        const myCollisionPointsUnique = [...myCollisionPointsSet];
        const otherCollisionPointsUnique = [...otherCollisionPointsSet];

        // get average position of collision points
        const myCollisionPointsAverage = myCollisionPointsUnique.reduce((sum, vector) => sum.add(vector), new Vector2D(0, 0)).scale(1 / myCollisionPointsUnique.length);
        const otherCollisionPointsAverage = otherCollisionPointsUnique.reduce((sum, vector) => sum.add(vector), new Vector2D(0, 0)).scale(1 / otherCollisionPointsUnique.length);

        const forceNormal = myCollisionPointsAverage.subtract(otherCollisionPointsAverage).normalised;
        // console.log({ myCollisionPointsUnique, otherCollisionPointsUnique });
        // console.log({ myCollisionPointsAverage, otherCollisionPointsAverage, forceNormal });

        // reflect velocity
        entity.velocity = entity.velocity.reflect(forceNormal);

        entity.physics.collisionCooldown.push({ countdown: collisionCooldownFrames, entity: otherEntity });
    });
}

function countdownCooldown(entity) {
    entity.physics.collisionCooldown.forEach(cooldown => {
        cooldown.countdown--;
        if (cooldown.countdown <= 0) {
            entity.physics.collisionCooldown.splice(entity.physics.collisionCooldown.indexOf(cooldown), 1);
        }
    });
}
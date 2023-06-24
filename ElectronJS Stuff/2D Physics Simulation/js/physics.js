//#region //! constants
const gravitationalForce = -981;
//#endregion

function physics() {
    // apply physics to non-static entities
    entityList.forEach(entity => {
        if (entity.isStatic) { return; }

        gravity(entity);
        collide(entity);
        updatePhysicsVectors(entity);
        // console.log(entity);
    });
}

function gravity(entity) {
    entity.velocity.y += gravitationalForce * physicsDeltaTime;
}

function updatePhysicsVectors(entity) {
    entity.position = entity.position.add(entity.velocity.scale(physicsDeltaTime));
}

function collide(entity) {
    entityList.forEach(otherEntity => {
        if (otherEntity === entity) { return; }

        const cf1 = entity.physics.collisionFunction.replace('x', `(x-${entity.position.x})`).replace('y', `(y-${entity.position.y})`);
        const cf2 = otherEntity.physics.collisionFunction.replace('x', `(x-${otherEntity.position.x})`).replace('y', `(y-${otherEntity.position.y})`);
        // const solution = nerdamer.solveEquations([cf1, cf2]);
        // find tangent
        // find force normal
        // apply force 
    });
}

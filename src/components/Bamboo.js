export function createBambooSegment(scene, index, branchHeight, bambooGroup, stickTextures) {
    const y = index * branchHeight;
    const texture = stickTextures[index % stickTextures.length];
    bambooGroup.create(window.innerWidth / 2, y, texture);
}

export function createBranches(scene, branchQueue, branchHeight, branchGroup) {
    const visibleBranches = Math.floor(window.innerHeight / branchHeight) - 2;
    for (let i = 0; i < visibleBranches; i++) {
        const branchSide = Math.random() < 0.5 ? 0 : 1;
        branchQueue.push(branchSide);
        drawBranch(scene, i, branchSide, branchHeight, branchGroup);
    }
}

function drawBranch(scene, index, branchSide, branchHeight, branchGroup) {
    const y = index * branchHeight + branchHeight + 27;
    const branchSprite = branchSide === 0 ? 'branchLeft' : 'branchRight';
    const offsetX = branchSide === 0 ? -43 : 43;
    const branch = scene.add.image(window.innerWidth / 2 + offsetX, y, branchSprite).setDepth(0);
    branchGroup.add(branch);
}
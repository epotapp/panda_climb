export function handleKeyPress(event, scene, branchQueue, panda) {
    if (!scene.isAnimating && !scene.isGameOver && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        const playerMove = event.key === 'ArrowLeft' ? 0 : 1;
        handleMove(scene, playerMove, branchQueue, panda);
    }
}

export function handleMove(scene, playerMove, branchQueue, panda) {
    // Add logic to handle the move here.
    // You can update scene.isAnimating and scene.isGameOver based on the game state.

    // Example: Start animation
    scene.isAnimating = true;

    // After completing the movement/animation, reset the flag
    scene.time.delayedCall(500, () => {
        scene.isAnimating = false;
    });
}

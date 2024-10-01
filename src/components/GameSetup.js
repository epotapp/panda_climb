import { calculateVisibleBranches, setupText } from '../utils/helpers'; // To calculate the visible branches
import { handleKeyPress, handleMove } from '../utils/inputHandlers'; // To handle input events

export function createGameScene(scene, assets) {
    scene.isGameOver = false;
    scene.isAnimating = false;
    scene.add.image(window.innerWidth / 2, window.innerHeight / 2, assets.background);

    const bambooGroup = scene.add.group();
    const branchGroup = scene.add.group();
    const branchQueue = [];
    const stickTextures = ['stick_1', 'stick_2', 'stick_3'];
    const branchHeight = 64;

    calculateVisibleBranches(scene, bambooGroup, stickTextures, branchHeight, branchQueue, branchGroup);

    const panda = scene.add.sprite(window.innerWidth / 2, window.innerHeight - 100, 'pandaBase').setDepth(1);

    setupText(scene);

    scene.input.keyboard.on('keydown', (event) => handleKeyPress(event, scene, branchQueue, panda));
    scene.input.on('pointerdown', (pointer) => {
        if (!scene.isGameOver) {
            const playerMove = pointer.x < window.innerWidth / 2 ? 0 : 1;
            handleMove(scene, playerMove, branchQueue, panda);
        }
    });
}

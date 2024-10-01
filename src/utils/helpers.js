import { createBambooSegment, createBranches} from '../components/Bamboo';

export function calculateVisibleBranches(scene, bambooGroup, stickTextures, branchHeight, branchQueue, branchGroup) {
    const visibleBranches = Math.floor(window.innerHeight / 64); // Assuming branch height is 64
    for (let i = 0; i < visibleBranches + 4; i++) {
        createBambooSegment(scene, i, branchHeight, bambooGroup, stickTextures);
    }
    createBranches(scene, branchQueue, branchHeight, branchGroup);
}

export function setupText(scene) {
    const fontSize = window.innerHeight < 800 ? '24px' : '32px';
    scene.scoreText = scene.add.text(window.innerWidth - 40, 20, `Score: ${scene.score}`, {
        fontSize,
        fill: '#EE3C00',
        stroke: '#FFFFFF',
        strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(10);

    scene.gameOverText = scene.add.text(window.innerWidth / 2, window.innerHeight / 2, 'GAME OVER', {
        fontSize: '64px',
        fill: '#EE3C00',
        stroke: '#FFFFFF',
        strokeThickness: 2,
    }).setOrigin(0.5, 0.5).setDepth(10).setVisible(false);

    scene.finalScoreText = scene.add.text(window.innerWidth / 2, window.innerHeight / 2 + 100, '', {
        fontSize,
        fill: '#EE3C00',
        stroke: '#FFFFFF',
        strokeThickness: 2,
    }).setOrigin(0.5, 0.5).setDepth(10).setVisible(false);
}

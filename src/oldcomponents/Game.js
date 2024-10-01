import React, { useEffect } from 'react';
import Phaser from 'phaser';

function Game() {
    useEffect(() => {
        let game;
        let bambooGroup;
        let branchGroup;
        let panda;
        let score = 0;
        let isGameOver = false;
        let isAnimating = false;
        let scoreText;
        let gameOverText;
        let finalScoreText;
        let fallenPandaImage;
        const branchQueue = [];
        const stickTextures = ['stick_1', 'stick_2', 'stick_3'];
        const branchHeight = 64;

        const config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            scene: {
                preload: preload,
                create: create,
                update: update,
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
        };

        game = new Phaser.Game(config);

        // function preload() {
        //     this.load.image('stick_1', './assets/stick_1_128.png');
        //     this.load.image('stick_2', './assets/stick_2_128.png');
        //     this.load.image('stick_3', './assets/stick_3_128.png');
        //     this.load.image('branchLeft', './assets/branch_left_128.png');
        //     this.load.image('branchRight', './assets/branch_right_128.png');
        //     this.load.image('pandaBase', './assets/panda_base_128.png');
        //     this.load.image('pandaLeft', './assets/panda_left_128.png');
        //     this.load.image('pandaRight', './assets/panda_right_128.png');
        //     this.load.image('fallenPanda', './assets/fallen_panda.png');
        //     this.load.image('background', selectBackgroundImage());
        // }

        // function selectBackgroundImage() {
        //     const ratio = window.innerWidth / window.innerHeight;
        //     if (ratio > 2 / 3) {
        //         return './assets/background_wide.png';
        //     } else if (ratio < 3 / 2) {
        //         return './assets/background_square.png';
        //     } else {
        //         return './assets/background.png';
        //     }
        // }

        function create() {
            this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background');

            bambooGroup = this.add.group();
            branchGroup = this.add.group();

            calculateVisibleBranches(this);

            panda = this.add.sprite(window.innerWidth / 2, window.innerHeight - 100, 'pandaBase').setDepth(1);

            setupText(this);

            this.input.keyboard.on('keydown', handleKeyPress, this);

            this.input.on('pointerdown', (pointer) => {
                if (!isGameOver) {
                    const playerMove = pointer.x < window.innerWidth / 2 ? 0 : 1;
                    handleMove(this, playerMove);
                }
            });
        }

        function update() {}

        function calculateVisibleBranches(scene) {
            const visibleBranches = Math.floor(window.innerHeight / branchHeight);
            for (let i = 0; i < visibleBranches + 4; i++) {
                createBambooSegment(scene, i);
            }
            createBranches(scene);
        }

        // function createBambooSegment(scene, index) {
        //     const y = index * branchHeight;
        //     const texture = stickTextures[index % stickTextures.length];
        //     bambooGroup.create(window.innerWidth / 2, y, texture);
        // }
        //
        // function createBranches(scene) {
        //     const visibleBranches = Math.floor(window.innerHeight / branchHeight) - 2;
        //     for (let i = 0; i < visibleBranches; i++) {
        //         const branchSide = Math.random() < 0.5 ? 0 : 1;
        //         branchQueue.push(branchSide);
        //         drawBranch(scene, i, branchSide);
        //     }
        // }
        //
        // function drawBranch(scene, index, branchSide) {
        //     const y = index * branchHeight + branchHeight + 27;
        //     const branchSprite = branchSide === 0 ? 'branchLeft' : 'branchRight';
        //     const offsetX = branchSide === 0 ? -43 : 43;
        //     const branch = scene.add.image(window.innerWidth / 2 + offsetX, y, branchSprite).setDepth(0);
        //     branchGroup.add(branch);
        // }

        function setupText(scene) {
            const fontSize = window.innerHeight < 800 ? '24px' : '32px';
            scoreText = scene.add.text(window.innerWidth - 40, 20, `Score: ${score}`, { fontSize, fill: '#EE3C00', stroke: '#FFFFFF', strokeThickness: 2 }).setOrigin(1, 0).setDepth(10);
            gameOverText = scene.add.text(window.innerWidth / 2, window.innerHeight / 2, 'GAME OVER', { fontSize: '64px', fill: '#EE3C00', stroke: '#FFFFFF', strokeThickness: 2 }).setOrigin(0.5, 0.5).setDepth(10);
            gameOverText.setVisible(false);
            finalScoreText = scene.add.text(window.innerWidth / 2, window.innerHeight / 2 + 100, '', { fontSize, fill: '#EE3C00', stroke: '#FFFFFF', strokeThickness: 2 }).setOrigin(0.5, 0.5).setDepth(10);
            finalScoreText.setVisible(false);
            fallenPandaImage = scene.add.image(window.innerWidth / 2, window.innerHeight / 2 + 200, 'fallenPanda').setDepth(10).setVisible(false);
        }

        function handleKeyPress(event) {
            if (!isAnimating && !isGameOver && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
                const playerMove = event.key === 'ArrowLeft' ? 0 : 1;
                handleMove(this, playerMove);
            }
        }

        function handleMove(scene, playerMove) {
            if (isAnimating || isGameOver) return;

            // Check the branch at the panda's current level (without modifying the queue)
            const currentBranch = branchQueue[branchQueue.length - 1]; // Last branch

            if (playerMove === currentBranch) {
                // Correct move: update score, animate panda, remove branch, shift everything
                isAnimating = true;
                score += 1;
                scoreText.setText(`Score: ${score}`);

                // Show correct panda animation
                panda.setTexture(playerMove === 0 ? 'pandaLeft' : 'pandaRight');

                // Immediately remove the branch the panda grabs
                removeBranchAtPandaLevel(scene);

                // Delay for animation before shifting and adding new branch
                scene.time.delayedCall(100, () => {
                    panda.setTexture('pandaBase');
                    shiftBranches(scene);
                    addNewBranch(scene);
                    branchQueue.pop(); // Finally remove the branch from the queue
                    isAnimating = false;
                });
            } else {
                // Incorrect move: trigger game over
                handleGameOver(scene);
            }
        }


        function removeBranchAtPandaLevel(scene) {
            branchGroup.children.iterate((branch) => {
                if (branch.y > panda.y) {
                    branch.destroy();
                }
            });
        }

        function shiftBranches(scene) {
            branchGroup.children.iterate((branch) => {
                branch.y += branchHeight;
            });
        }

        function addNewBranch(scene) {
            const newBranchSide = Math.random() < 0.5 ? 0 : 1;
            branchQueue.unshift(newBranchSide);
            drawBranch(scene, 0, newBranchSide);
        }

        function handleGameOver(scene) {
            isGameOver = true;
            gameOverText.setVisible(true);
            fallenPandaImage.setVisible(true);
            finalScoreText.setText(`Final Score: ${score}`).setVisible(true);
        }

        return () => {
            game.destroy(true);
        };
    }, []);

    return <div id="game-container"></div>;
}

export default Game;

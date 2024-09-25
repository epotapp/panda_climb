import { createTextStyles } from './textstyles.js';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth, // Responsive width
    height: window.innerHeight, // Responsive height
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

let bambooGroup;
let branchGroup;
let branchQueue = []; // Array for branches (0 = left, 1 = right)
let panda;
let isAnimating = false;
let score = 0;
let scoreText;
let gameOverText;
let finalScoreText;
let gameOver = false;
let fallenPandaImage;
let isGameOverScreen = false;
let bestScoreText;
let bestScoreDisplayed = false;

const stickTextures = ['stick_1', 'stick_2', 'stick_3']; // Sticks cycle
let visibleBranches = 6; // Default number of visible branches, adjusted for each screen size

// Panda and branch layout
let pandaYPosition;
let branchHeight = 64; // Height of each bamboo segment and branch

function preload() {
    this.load.image('stick_1', './assets/stick_1_128.png');
    this.load.image('stick_2', './assets/stick_2_128.png');
    this.load.image('stick_3', './assets/stick_3_128.png');
    this.load.image('branchLeft', './assets/branch_left_128.png');
    this.load.image('branchRight', './assets/branch_right_128.png');
    this.load.image('pandaBase', './assets/panda_base_128.png');
    this.load.image('pandaLeft', './assets/panda_left_128.png');
    this.load.image('pandaRight', './assets/panda_right_128.png');
    this.load.image('fallenPanda', './assets/fallen_panda.png'); // Fallen panda image for game over

    // Backgrounds
    this.load.image('background', './assets/background.png');
    this.load.image('background_square', './assets/background_square.png');
    this.load.image('background_wide', './assets/background_wide.png');
    this.load.image('fall_background', './assets/fall_background.png');
    this.load.image('fall_background_square', './assets/fall_background_square.png');
    this.load.image('fall_background_wide', './assets/fall_background_wide.png');
}

function create() {
    setupBackground(this);

    bambooGroup = this.add.group();
    branchGroup = this.add.group();

    calculateVisibleBranches();

    for (let i = 0; i < visibleBranches + 4; i++) {
        createBambooSegment(this, i);
    }

    createBranches(this);

    panda = this.add.sprite(window.innerWidth / 2, pandaYPosition, 'pandaBase').setDepth(1);
    console.log('Panda added at:', panda.x, panda.y);

    const fontSize = window.innerHeight < 800 ? '24px' : '32px';
    const scoreGap = 20;

    // Score text is in the top-right corner with gap
    scoreText = this.add.text(window.innerWidth - scoreGap, scoreGap, `Score: 0`, {
        fontSize: fontSize,
        fill: '#EE3C00',
        stroke: '#FFFFFF',
        strokeThickness: 2
    }).setOrigin(1, 0).setDepth(10);

    // Game Over text should be centered on screen
    gameOverText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'GAME OVER', {
        fontSize: fontSize === '24px' ? '48px' : '64px',
        fill: '#EE3C00',
        stroke: '#FFFFFF',
        strokeThickness: 2
    }).setOrigin(0.5, 0.5).setDepth(10);
    gameOverText.setVisible(false);

    // Final score text (hidden initially)
    finalScoreText = this.add.text(window.innerWidth / 2, window.innerHeight / 2 + 100, '', {
        fontSize: fontSize,
        fill: '#EE3C00',
        stroke: '#FFFFFF',
        strokeThickness: 2
    }).setOrigin(0.5, 0.5).setDepth(10);
    finalScoreText.setVisible(false);

    // Best score text (hidden initially)
    bestScoreText = this.add.text(window.innerWidth / 2, window.innerHeight / 2 + 200, '', {
        fontSize: fontSize,
        fill: '#EE3C00',
        stroke: '#FFFFFF',
        strokeThickness: 2
    }).setOrigin(0.5, 0.5).setDepth(10);
    bestScoreText.setVisible(false);

    // Fallen panda image for game over (hidden initially)
    fallenPandaImage = this.add.image(window.innerWidth / 2, window.innerHeight / 2 + 200, 'fallenPanda')
        .setDepth(10)
        .setVisible(false);

    // Input handling for left and right (keyboard and touch events)
    this.input.keyboard.on('keydown', (event) => {
        if (isGameOverScreen) {
            handleGameOverKeyPress(this);
        } else if (!isAnimating && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            let playerMove = (event.key === 'ArrowLeft') ? 0 : 1;
            console.log('Player pressed:', playerMove === 0 ? 'Left' : 'Right');
            handleMove(this, playerMove);
        }
    });

    // Touch event handling for mobile devices
    this.input.on('pointerdown', (pointer) => {
        if (isGameOverScreen) {
            handleGameOverKeyPress(this);
        } else if (!isAnimating) {
            let playerMove = pointer.x < window.innerWidth / 2 ? 0 : 1;
            console.log('Player tapped:', playerMove === 0 ? 'Left' : 'Right');
            handleMove(this, playerMove);
        }
    });
}

function handleGameOverKeyPress(scene) {
    // If the best score hasn't been displayed yet, show it
    if (!bestScoreDisplayed) {
        // Hide Game Over and Final Score text
        gameOverText.setVisible(false);
        finalScoreText.setVisible(false);
        scoreText.setVisible(false);  // Hide Score Text too

        // Display BEST score in place of Game Over
        const bestScore = getBestScore();
        bestScoreText.setText(`BEST: ${bestScore}`);
        bestScoreText.setFontSize(gameOverText.style.fontSize); // Match Game Over font size
        bestScoreText.setPosition(gameOverText.x, gameOverText.y); // Match Game Over position
        bestScoreText.setVisible(true);

        bestScoreDisplayed = true;
    } else {
        // If the best score was already displayed, reset the game
        reloadGame(scene);
    }
}



// Function to set and get cookie
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';').map(c => c.trim());
    for (const cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) {
            return value;
        }
    }
    return null;
}

// Store the best score if it is the highest
function updateBestScore(currentScore) {
    let bestScore = getCookie('bestScore');
    if (!bestScore || currentScore > bestScore) {
        setCookie('bestScore', currentScore, 365); // Store for 1 year
        bestScore = currentScore;
    }
    return bestScore;
}

// Retrieve best score from cookie
function getBestScore() {
    let bestScore = getCookie('bestScore');
    return bestScore ? parseInt(bestScore, 10) : 0;
}


// When game over, save score and prepare screen for restart
function triggerGameOver(scene) {
    console.log('Game Over triggered');
    gameOver = true;
    isAnimating = false;
    isGameOverScreen = true;

    // Hide the in-game background and elements
    background.setVisible(false);
    bambooGroup.setVisible(false);
    branchGroup.setVisible(false);
    panda.setVisible(false);

    // Load and display the fall background
    setupFallBackground(scene);  // Make sure this function is correct

    // Show Game Over, Final Score, and Fallen Panda image
    gameOverText.setVisible(true).setDepth(10); // Make sure Game Over is visible and on top
    finalScoreText.setText(`Final Score: ${score}`).setVisible(true).setDepth(10); // Show Final Score
    fallenPandaImage.setVisible(true).setDepth(10); // Show Fallen Panda

    // Save the best score if the current score is higher
    const bestScore = getBestScore();
    if (score > bestScore) {
        Cookies.set('bestScore', score, { expires: 365 });
    }

    // Wait for key press to handle the next step (show best score or restart)
    this.input.keyboard.on('keydown', () => handleGameOverKeyPress(scene));
}

function setupFallBackground(scene) {
    const aspectRatio = window.innerWidth / window.innerHeight;

    // Choose the appropriate fall background based on the aspect ratio
    let fallBackgroundKey = 'fall_background'; // Default for vertical screens
    if (aspectRatio > 1.5) {
        fallBackgroundKey = 'fall_background_wide';
    } else if (aspectRatio > 1.2) {
        fallBackgroundKey = 'fall_background_square';
    }

    // Create and display the fall background
    const fallBackground = scene.add.image(window.innerWidth / 2, window.innerHeight / 2, fallBackgroundKey)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(window.innerWidth, window.innerHeight)
        .setDepth(0);  // Make sure background is behind all other elements
}


// Reload the game after the game over screen
function reloadGame(scene) {
    console.log('Game reloaded');
    gameOver = false;
    score = 0;
    scoreText.setText('Score: 0');
    gameOverText.setVisible(false);
    finalScoreText.setVisible(false);
    fallenPandaImage.setVisible(false);
    bestScoreText.setVisible(false);
    isGameOverScreen = false;
    bestScoreDisplayed = false; // Reset this flag

    // Clear and reinitialize branches
    branchQueue = [];
    branchGroup.clear(true, true); // Clear all branches
    createBranches(scene); // Recreate the initial branches

    // Reset bamboo position (clear and recreate bamboo)
    bambooGroup.clear(true, true);
    for (let i = 0; i < visibleBranches + 4; i++) {
        createBambooSegment(scene, i);
    }

    // Reset the panda position
    panda.setTexture('pandaBase');
    panda.setPosition(window.innerWidth / 2, pandaYPosition);
}



function update() {}

function setupBackground(scene) {
    const screenRatio = window.innerWidth / window.innerHeight;
    let selectedBackground;

    if (screenRatio >= 2 / 3) {
        selectedBackground = 'background_wide';
    } else if (screenRatio >= 0.67 && screenRatio < 2 / 3) {
        selectedBackground = 'background_square';
    } else {
        selectedBackground = 'background';
    }

    // Add the background image based on screen type
    scene.backgroundImage = scene.add.image(window.innerWidth / 2, window.innerHeight / 2, selectedBackground)
        .setDisplaySize(window.innerWidth, window.innerHeight)
        .setDepth(0);
}

function setupGameOverBackground(scene) {
    const screenRatio = window.innerWidth / window.innerHeight;
    let selectedGameOverBackground;

    if (screenRatio >= 2 / 3) {
        selectedGameOverBackground = 'fall_background_wide';
    } else if (screenRatio >= 0.67 && screenRatio < 2 / 3) {
        selectedGameOverBackground = 'fall_background_square';
    } else {
        selectedGameOverBackground = 'fall_background';
    }

    // Change the background to the game over background
    scene.backgroundImage.setTexture(selectedGameOverBackground)
        .setDisplaySize(window.innerWidth, window.innerHeight);
}

// Calculate the number of visible branches and set panda's fixed position
function calculateVisibleBranches() {
    let availableHeight = window.innerHeight - 150; // Total space for branches and bamboo
    visibleBranches = Math.floor(availableHeight / branchHeight); // Calculate the number of branches that fit
    pandaYPosition = window.innerHeight - 100; // Fix panda's position at the bottom, above UI
    console.log('Visible branches:', visibleBranches, 'Panda position:', pandaYPosition);
}

// Create a bamboo segment, cycling through stick textures
function createBambooSegment(scene, index) {
    let y = index * branchHeight;
    let texture = stickTextures[index % stickTextures.length];
    bambooGroup.create(window.innerWidth / 2, y, texture); // Only draw the stick once
    console.log('Created bamboo segment at y:', y);
}

// Draw a branch at the specified index
function drawBranch(scene, index, branchSide) {
    let y = index * branchHeight + branchHeight; // Adjust y to fit with sticks
    let branchSprite = branchSide === 0 ? 'branchLeft' : 'branchRight';
    let offsetX = branchSide === 0 ? -43 : 43;
    let branch = scene.add.image(window.innerWidth / 2 + offsetX, y, branchSprite).setDepth(0);
    branchGroup.add(branch);
    console.log(`Draw branch at y: ${y}, side: ${branchSide === 0 ? 'Left' : 'Right'}`);
}

// Initialize branches at the start of the game
function createBranches(scene) {
    for (let i = 0; i < visibleBranches; i++) {
        let branchSide = Math.random() < 0.5 ? 0 : 1;
        branchQueue.push(branchSide);
        drawBranch(scene, i, branchSide); // Draw each branch in its position
    }
    console.log('Initial branch queue:', branchQueue);
}

// Handle player's move (0 = left, 1 = right)
function handleMove(scene, playerMove) {
    isAnimating = true;
    console.log('Processing move...');

    // Check if the move matches the lowest branch (6th branch, the key)
    let lowestBranch = branchQueue.pop(); // Get the lowest branch (6th)
    console.log('KeyPress:', playerMove, 'BranchDirection:', lowestBranch);

    if (playerMove === lowestBranch) {
        // Correct move: play animation, remove the branch, and update score
        panda.setTexture(playerMove === 0 ? 'pandaLeft' : 'pandaRight');

        // Immediately remove the branch the panda grabs
        removeBranchAtPandaLevel();

        // Update the score
        updateScore(1);

        // Wait for the animation to finish
        scene.time.delayedCall(100, () => {
            // Shift branches and generate a new one
            shiftBranches(scene);
            addNewBranch(scene);

            // Reset panda to base texture and allow the next move
            panda.setTexture('pandaBase');
            console.log('Reset panda to base texture');
            isAnimating = false;  // Re-enable movement
        });
    } else {
        // Incorrect move: Game Over
        triggerGameOver(scene);
    }
}

// Shift all branches down
function shiftBranches(scene) {
    branchGroup.children.iterate((branch) => {
        branch.y += branchHeight; // Move each branch down
        console.log('Shifted branch down, new y:', branch.y);
    });

    // Remove any branches below the 6th position
    removeExtraBranches();
}

// Add a new branch at the top of the screen
function addNewBranch(scene) {
    let newBranchSide = Math.random() < 0.5 ? 0 : 1;
    branchQueue.unshift(newBranchSide); // Add the new branch to the queue
    console.log('Added new branch, updated queue:', branchQueue);
    drawBranch(scene, 0, newBranchSide);
}

// Remove any branches below the panda's level (6th branch)
function removeExtraBranches() {
    branchGroup.children.iterate((branch) => {
        if (branch && branch.y > pandaYPosition) { // If the branch exists and is below the panda
            console.log('Removing branch at y:', branch.y);
            branch.destroy(); // Remove it from the screen
        }
    });
}

// Remove the branch at panda level
function removeBranchAtPandaLevel() {
    branchGroup.children.iterate((branch) => {
        if (branch.y === pandaYPosition) {
            console.log('Removing branch at panda level, y:', branch.y);
            branch.destroy(); // Remove the branch immediately when panda collects it
        }
    });
}

// Update the score
function updateScore(amount) {
    score += amount;
    scoreText.setText(`Score: ${score}`);
    console.log('Updated score:', score);
}

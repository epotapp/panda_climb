const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
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
let gameOver = false;

const stickTextures = ['stick_1', 'stick_2', 'stick_3']; // Sticks cycle
const visibleBranches = 7; // Keep 6 branches visible

function preload() {
    this.load.image('stick_1', './assets/stick_1_128.png');
    this.load.image('stick_2', './assets/stick_2_128.png');
    this.load.image('stick_3', './assets/stick_3_128.png');
    this.load.image('branchLeft', './assets/branch_left_128.png');
    this.load.image('branchRight', './assets/branch_right_128.png');
    this.load.image('pandaBase', './assets/panda_base_128.png');
    this.load.image('pandaLeft', './assets/panda_left_128.png');
    this.load.image('pandaRight', './assets/panda_right_128.png');
}

function create() {
    bambooGroup = this.add.group();
    branchGroup = this.add.group();

    // Pre-fill the screen with bamboo segments (static column)
    for (let i = 0; i < 10; i++) {
        createBambooSegment(this, i);
    }

    // Initialize branch queue with 6 random branches (0 = left, 1 = right)
    createBranches(this);

    // Add panda sprite at the bottom
    panda = this.add.sprite(400, 500, 'pandaBase').setDepth(1); // Ensure panda is over bamboo
    console.log('Panda added at:', panda.x, panda.y);

    // Score text
    scoreText = this.add.text(570, 20, `Score: 0`, { fontSize: '32px', fill: '#22b0ef' });

    // Game Over text (hidden at start)
    gameOverText = this.add.text(228, 300, 'GAME OVER', { fontSize: '64px', fill: '#22b0ef' });
    gameOverText.setVisible(false);

    // Input handling for left and right
    this.input.keyboard.on('keydown', (event) => {
        if (gameOver) {
            console.log('Restarting game...');
            reloadGame(this); // Reload and reinitialize the game on any key press
        } else if (!isAnimating && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            let playerMove = (event.key === 'ArrowLeft') ? 0 : 1;
            console.log('Player pressed:', playerMove === 0 ? 'Left' : 'Right');
            handleMove(this, playerMove);
        }
    });
}

function update() {}

// Function to create a bamboo segment, cycling through stick textures
function createBambooSegment(scene, index) {
    let y = index * 64;
    let texture = stickTextures[index % stickTextures.length];
    bambooGroup.create(400, y, texture); // Only draw the stick once
    console.log('Created bamboo segment at y:', y);
}

// Function to draw a branch at the specified index
function drawBranch(scene, index, branchSide) {
    let y = index * 64 + 64; // Adjust y to fit with sticks
    let branchSprite = branchSide === 0 ? 'branchLeft' : 'branchRight';
    let offsetX = branchSide === 0 ? -43 : 43;
    let branch = scene.add.image(400 + offsetX, y, branchSprite).setDepth(0);
    branchGroup.add(branch);
    console.log(`Draw branch at y: ${y}, side: ${branchSide === 0 ? 'Left' : 'Right'}`);
}

// Initialize 6 branches at the start of the game
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
        branch.y += 64; // Move each branch down
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
        if (branch && branch.y > 500) { // If the branch exists and is below the 6th level
            console.log('Removing branch at y:', branch.y);
            branch.destroy(); // Remove it from the screen
        }
    });
}


// Remove the branch at panda level
function removeBranchAtPandaLevel() {
    branchGroup.children.iterate((branch) => {
        if (branch.y === 500) {
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

// Trigger Game Over
function triggerGameOver(scene) {
    console.log('Game Over triggered');
    gameOver = true;
    gameOverText.setVisible(true);
    isAnimating = false;
}

// Reload and reinitialize the game after Game Over
function reloadGame(scene) {
    console.log('Game reloaded');
    gameOver = false;
    score = 0;
    scoreText.setText('Score: 0');
    gameOverText.setVisible(false);
    isAnimating = false;

    // Clear and reinitialize branches
    branchQueue = [];
    branchGroup.clear(true, true); // Clear all branches
    createBranches(scene); // Recreate the initial 6 branches

    // Reset bamboo position (clear and recreate bamboo)
    bambooGroup.clear(true, true);
    for (let i = 0; i < 10; i++) {
        createBambooSegment(scene, i);
    }
}

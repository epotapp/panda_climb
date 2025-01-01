// tbd: background music, time close to running out whistle, database for records

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
let gameOver = false;
let timerText; 
let lifeBar; 
let lifeBarWidth = 300;
let initialTime = 30; 
let initialDelay = 500;
let startScore = -1;

const stickTextures = ['stick_1', 'stick_2', 'stick_3']; // Sticks cycle
let visibleBranches = 6; // Default number of visible branches, adjusted for each screen size

// Panda and branch layout
let pandaYPosition;
let branchHeight = 64; // Height of each bamboo segment and branch

function preload() {
    this.load.image('stick_1', 'assets/stick_1_128.png');
    this.load.image('stick_2', 'assets/stick_2_128.png');
    this.load.image('stick_3', 'assets/stick_3_128.png');
    this.load.image('branchLeft', 'assets/branch_left_128.png');
    this.load.image('branchRight', 'assets/branch_right_128.png');
    this.load.image('pandaBase', 'assets/panda_base_128.png');
    this.load.image('pandaLeft', 'assets/panda_left_128.png');
    this.load.image('pandaRight', 'assets/panda_right_128.png');

    this.load.image('narrowBackground', 'assets/narrow.png');
    this.load.image('squareBackground', 'assets/square.png');
    this.load.image('wideBackground', 'assets/wide.png');

    this.load.audio('branchSound', 'assets/branch.mp3');
    this.load.audio('lossSound', 'assets/ouch.mp3');

    this.load.on('complete', function () { 
        console.log('All assets loaded successfully'); 
    });
}

function create() {

    // Set background depending on aspect ratio
    let aspectRatio = window.innerWidth / window.innerHeight; 
    let backgroundKey;

    if (aspectRatio < 0.75) { 
        backgroundKey = 'narrowBackground'; 
    } else if (aspectRatio > 1.5) { 
        backgroundKey = 'wideBackground'; 
    } else { 
        backgroundKey = 'squareBackground';
    }

    
    this.add.image(window.innerWidth / 2, window.innerHeight / 2, backgroundKey)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(window.innerWidth, window.innerHeight);

    
    // Create start button
    let graphics = this.add.graphics(); 
    graphics.fillStyle(0x000000,1);
    graphics.fillRect(this.cameras.main.width / 2 - 65, this.cameras.main.height/2 - 25,130,50);
    graphics.setDepth(2)
    graphics.fillStyle(0xffffff, 1); 
    graphics.fillRect(this.cameras.main.width / 2 - 60, this.cameras.main.height/2 - 20,120,40);
    graphics.setDepth(2)
    
    let buttonText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'START', { 
        fontSize: '32px', 
        fill: '#000000', 
        fontFamily: 'Source Han Serif CN' 
    }).setOrigin(0.5, 0.5).setDepth(2);
    buttonText.setInteractive();

    buttonText.on('pointerover', () => buttonText.setStyle({ fill: '#808080' })); 
    buttonText.on('pointerout', () => buttonText.setStyle({ fill: '#000000' }));

    // On click, begin game, start sounds
    buttonText.on('pointerdown', () => {
        this.lossSound = this.sound.add('lossSound');
        this.branchSound = this.sound.add('branchSound');
        this.branchSound.play();

        buttonText.destroy();
        graphics.destroy();
        startScore = 0;
    });


    bambooGroup = this.add.group();
    branchGroup = this.add.group();

    // Calculate the number of visible branches dynamically based on screen height
    calculateVisibleBranches();

    // Pre-fill the screen with bamboo segments (static column)
    for (let i = 0; i < visibleBranches + 4; i++) {
        createBambooSegment(this, i);
    }


    // Initialize branch queue with dynamically calculated branches
    createBranches(this);

    // Add panda sprite at a fixed position relative to screen height
    panda = this.add.sprite(window.innerWidth / 2, pandaYPosition, 'pandaBase').setDepth(1); // Panda over bamboo
    console.log('Panda added at:', panda.x, panda.y);

    // Score text
    scoreText = this.add.text(0, 20, `0`, { 
        fontSize: '72px', 
        fill: '#ffffff',
        fontFamily: 'Source Han Serif CN' 
    });
    scoreText.setX(window.innerWidth * (.6));
    scoreText.setY(window.innerHeight * .4);
    scoreText.setVisible(false);

    // Timer text -- for debugging/dev work
   // timerText = this.add.text(20, 20, `Time: ${initialTime}`, { fontSize: '32px', fill: '#22b0ef' });

    // Lifebar
    lifeBar = this.add.graphics(); 
    drawLifeBar();
    lifeBar.setVisible(false);

    // Game Over text (hidden at start)
    gameOverText = this.add.text(0,0, 'GAME OVER', { 
        fontSize: '80px', 
        fill: '#ffffff',
        fontFamily: 'Source Han Serif CN' 
    });
    
    gameOverText.setX((window.innerWidth - gameOverText.width) / 2 - 10); 
    gameOverText.setY((window.innerHeight - gameOverText.height) * .25 );

    gameOverText.setDepth(2);
    gameOverText.setVisible(false);

    // Input handling for left and right (keyboard and touch events)
    this.input.keyboard.on('keydown', (event) => {
        if (startScore > 0) {
            if (gameOver) {
                reloadGame(this); // Restart game if it's game over
            } else if (!isAnimating && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
                let playerMove = (event.key === 'ArrowLeft') ? 0 : 1;
                console.log('Player pressed:', playerMove === 0 ? 'Left' : 'Right');
                handleMove(this, playerMove);
                if (!gameOver){this.branchSound.play()}
                else{this.lossSound.play();}
                
            } 
        }
        if (startScore === 0){
            startScore += 1;
            // Timer event
            timerEvent = createTimerEvent(this, initialDelay);
            scoreText.setVisible(true);
            lifeBar.setVisible(true);
        }
    });

    // Touch event handling for mobile devices
    this.input.on('pointerdown', (pointer) => {
        if (startScore > 0) {
            if (gameOver) {
                reloadGame(this); // Restart game if it's game over
            } else if (!isAnimating) {
                let playerMove = pointer.x < window.innerWidth / 2 ? 0 : 1; // Left or right half of screen
                console.log('Player tapped:', playerMove === 0 ? 'Left' : 'Right');
                handleMove(this, playerMove);
                if (!gameOver){this.branchSound.play()}
                else {this.lossSound.play();}
            }
        } 
        if (startScore === 0){
            startScore += 1;
            // Timer event
            timerEvent = createTimerEvent(this, initialDelay);
            scoreText.setVisible(true);
            lifeBar.setVisible(true);
        }
    });

}

function update() {}

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
        if (branch) {
            console.log('Checking branch at y:', branch.y, 'against pandaYPosition:', pandaYPosition);
            if (pandaYPosition - branch.y < 100) {
                
                console.log('Removing branch at panda level, y:', branch.y);
                branch.destroy(); // Remove the branch immediately when panda collects it
            }
        }
    });
}


// Update the score and timer, timer delay
function updateScore(amount) {
    score += amount;
   
    scoreText.setText(`${score}`);
    console.log('Updated score:', score);

    if (initialTime < 30) {
        initialTime += 1; 
    }
    drawLifeBar();
  //  timerText.setText(`Time: ${initialTime}`);
    console.log('Updated timer:', initialTime);

    if (score % 50 === 0){
        updateTimer();
    }

}

// Update timer
function updateTimer() { 
    if (!gameOver) { 
        initialTime -= 1; 
        drawLifeBar();
      //  timerText.setText(`Time: ${initialTime}`); 
        if (initialTime <= 0) { 
            triggerGameOver(this.scene); 
        } else { 
            let newDelay = Math.max(initialDelay - (Math.floor(score / 50) * 100), 200); 
            timerEvent.delay = newDelay;
            console.log('Updated timer delay:', newDelay); 
        }
    } 
    
}

// Draw timer lifebar
function drawLifeBar() { 
    lifeBar.clear(); 
    lifeBar.fillStyle(0xffffff, 1); 
    barWidth = (initialTime / 30) * lifeBarWidth; 
    let centerX = (window.innerWidth - barWidth) / 2;
    lifeBar.setDepth(2);
    lifeBar.fillRect(centerX, 120, barWidth, 20);
}

// Create timer event
function createTimerEvent(scene, delay) { 
    console.log(`New delay: ${delay}`)
    return scene.time.addEvent({ 
        delay: delay, 
        callback: updateTimer, 
        callbackScope: scene, 
        loop: true 
    }); 
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
    initialTime = 30;
    scoreText.setText('0');
 //   timerText.setText(`Time: ${initialTime}`);
    gameOverText.setVisible(false);
    drawLifeBar();
    
    isAnimating = false;

    // Clear and reinitialize branches
    branchQueue = [];
    branchGroup.clear(true, true); // Clear all branches
    createBranches(scene); // Recreate the initial branches

    
    // Reset bamboo position (clear and recreate bamboo)
    bambooGroup.clear(true, true);
    for (let i = 0; i < visibleBranches + 4; i++) {
        createBambooSegment(scene, i);
    }
}

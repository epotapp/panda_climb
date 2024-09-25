// textstyles.js

export function createTextStyles(scene) {
    // Set up score text with massive font
    scene.scoreText = scene.add.text(window.innerWidth - 40, 20, `Score: 0`, {
        fontSize: '48px',           // Bigger font size
        fontWeight: 'bold',         // Bold font
        fill: '#ff8c00',            // Dark orange color
        stroke: '#000',             // Add black stroke around the text
        strokeThickness: 6,         // Make the stroke thicker
    });
    scene.scoreText.setOrigin(1, 0);      // Align text to the right-top corner with a gap

    // Set up Game Over text with massive font
    scene.gameOverText = scene.add.text(window.innerWidth / 2, window.innerHeight / 2, 'GAME OVER', {
        fontSize: '96px',           // Even bigger font size for Game Over
        fontWeight: 'bold',         // Bold font
        fill: '#ff8c00',            // Dark orange color
        stroke: '#000',             // Add black stroke around the text
        strokeThickness: 8,         // Make the stroke thicker for more impact
    });
    scene.gameOverText.setOrigin(0.5);    // Center the text horizontally and vertically
    scene.gameOverText.setVisible(false); // Hide it initially

    // Set up Final Score text for the Game Over screen
    scene.finalScoreText = scene.add.text(window.innerWidth / 2, window.innerHeight / 2 + 100, 'Final Score: 0', {
        fontSize: '72px',           // Large font size for final score
        fontWeight: 'bold',         // Bold font
        fill: '#ff8c00',            // Dark orange color
        stroke: '#000',             // Add black stroke around the text
        strokeThickness: 6,         // Make the stroke thicker
    });
    scene.finalScoreText.setOrigin(0.5);  // Center the final score text
    scene.finalScoreText.setVisible(false); // Hide it initially
}

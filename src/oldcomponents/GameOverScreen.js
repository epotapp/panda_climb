import React, { useEffect } from 'react';

const GameOverScreen = ({ gameScene, score }) => {
    useEffect(() => {
        if (gameScene && gameScene.isGameOver) {
            displayGameOver(gameScene, score);
        }
    }, [gameScene, score]);

    const displayGameOver = (scene, score) => {
        // Display Game Over text and final score
        scene.gameOverText.setVisible(true);
        scene.finalScoreText.setText(`Final Score: ${score}`).setVisible(true);
        scene.fallenPandaImage.setVisible(true);
    };

    return null;
};

export default GameOverScreen;

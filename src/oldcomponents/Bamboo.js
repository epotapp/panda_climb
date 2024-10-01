import React, { useEffect } from 'react';

const Bamboo = ({ gameScene }) => {
    useEffect(() => {
        if (gameScene) {
            // Create the bamboo segments dynamically
            gameScene.bambooGroup = gameScene.add.group();
            for (let i = 0; i < gameScene.visibleBranches + 4; i++) {
                createBambooSegment(gameScene, i);
            }
        }

        return () => {
            if (gameScene.bambooGroup) {
                gameScene.bambooGroup.clear(true, true);
            }
        };
    }, [gameScene]);

    const createBambooSegment = (scene, index) => {
        const y = index * scene.branchHeight;
        const texture = scene.stickTextures[index % scene.stickTextures.length];
        scene.bambooGroup.create(window.innerWidth / 2, y, texture);
    };

    return null;
};

export default Bamboo;

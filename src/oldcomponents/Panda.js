import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const Panda = ({ gameScene }) => {
    const pandaRef = useRef(null);

    useEffect(() => {
        if (gameScene) {
            pandaRef.current = gameScene.add.sprite(window.innerWidth / 2, gameScene.pandaYPosition, 'pandaBase').setDepth(1);
        }

        return () => {
            if (pandaRef.current) {
                pandaRef.current.destroy();
            }
        };
    }, [gameScene]);

    return null;
};

export default Panda;

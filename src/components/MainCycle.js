import React, { useEffect, useState } from "react";
import Phaser from "phaser";
import usePreloadAssets from "./Preload"
import { createGameScene } from './GameSetup';

export default function MainCycle() {
    const { assets, windowDimensions } = usePreloadAssets();
    const [game, setGame] = useState(null);

    useEffect(() => {
        if (!assets) return; // Wait for assets to load;

        const config = {
            type: Phaser.AUTO,
            width: windowDimensions.innerWidth,
            height: windowDimensions.innerHeight,
            scene: {
                preload: preload,
                create: function () {
                    createGameScene(this, assets);
                },
                update: update,
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
        };

        const newGame = new Phaser.Game(config);
        setGame(newGame);

        return () => {
            if (newGame) newGame.destroy(true);
        };
    }, [assets, windowDimensions]);

    function preload() {
        // No-op, assets are already preloaded via React state.
    }

    function update() {
        // No-op, updating is functionality of that module as is
    }

    return <div id="game-container"></div>
}
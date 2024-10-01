import { useState, useEffect } from 'react';
import Phaser from 'phaser';

export default function usePreloadAssets() {
    const [assets, setAssets] = useState({});
    const [windowDimensions, setWindowDimensions] = useState({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
    });

    useEffect(() => {
        // Handle window resizing
        function handleResize(){
            setWindowDimensions({
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
            });
        }

        window.addEventListener('resize', handleResize);
        // Clean up on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        // Preload all assets
        const assets = {
            stick_1: '/assets/stick_1_128.png',
            stick_2: '/assets/stick_2_128.png',
            stick_3: '/assets/stick_3_128.png',
            branchLeft: '/assets/branch_left_128.png',
            branchRight: '/assets/branch_right_128.png',
            pandaBase: '/assets/panda_base_128.png',
            pandaLeft: '/assets/panda_left_128.png',
            pandaRight: '/assets/panda_right_128.png',
            fallenPanda: '/assets/fallen_panda.png',
            background: selectBackgroundImage()
        };
        setAssets(assets);
    }, [windowDimensions]);

    const selectBackgroundImage = () => {
        const ratio = windowDimensions.innerWidth / windowDimensions.innerHeight;
        if (ratio > 2 / 3) {
            return './assets/background_wide.png';
        } else if (ratio < 3 / 2) {
            return './assets/background_square.png';
        } else {
            return './assets/background.png';
        }
    }

    return { assets, windowDimensions };
}

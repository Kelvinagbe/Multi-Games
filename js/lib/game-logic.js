// Define all available games and their properties
const gameLibrary = {
    'truth': {
        title: 'Truth or Dare',
        url: '../gsmes/truth.html',
        description: 'Control a snake to eat food and grow longer without hitting walls or yourself.',
        instructions: 'Use arrow keys to move the snake. Collect food to grow longer.',
        thumbnail: '../assets/images/truth.jpg',
        category: 'arcade'
    },
    'pixel-shooter': {
        title: 'Tetris',
        url: '../games/iframe-pixel.html',
        description: 'The classic block stacking game.',
        instructions: 'Use arrow keys to move and rotate falling blocks. Complete lines to clear them.',
        thumbnail: 'images/thumbnails/tetris.jpg',
        category: 'puzzle'
    },
    'flappy': {
        title: 'Flappy Bird',
        url: '../games/flappy.html',
        description: 'Navigate a bird through pipes without touching them.',
        instructions: 'Click or press spacebar to make the bird flap its wings and gain height.',
        thumbnail: 'images/thumbnails/flappy.jpg',
        category: 'arcade'
    },
    'subway': {
        title: 'Minesweeper',
        url: '../games/iframe-subway.html',
        description: 'Clear the minefield without triggering any mines.',
        instructions: 'Left-click to reveal a cell, right-click to flag a suspected mine.',
        thumbnail: 'images/thumbnails/minesweeper.jpg',
        category: 'puzzle'
    },
    'racing': {
        title: 'Racing Game',
        url: 'games/racing.html',
        description: 'Drive a car and avoid obstacles to reach the finish line.',
        instructions: 'Use arrow keys to steer and control speed.',
        thumbnail: 'images/thumbnails/racing.jpg',
        category: 'racing'
    },
    'space-shooter': {
        title: 'Space Shooter',
        url: 'games/space-shooter.html',
        description: 'Shoot enemies and avoid their attacks in space.',
        instructions: 'Use arrow keys to move and spacebar to shoot.',
        thumbnail: 'images/space-shooter.jpg',
        category: 'arcade'
    },
    'escape-runner': {
        title: 'Escape Runner',
        url: 'games/escape-runner.html',
        description: 'Run as far as you can while avoiding obstacles.',
        instructions: 'Use arrow keys or swipe to jump, slide, and move.',
        thumbnail: 'images/escape-runner.jpg',
        category: 'arcade'
    }
};

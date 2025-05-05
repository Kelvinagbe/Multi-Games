// Add the error styles directly to the document head
function addErrorStyles() {
  // Check if styles are already added
  if (document.getElementById('game-error-styles')) return;
  
  const styleElement = document.createElement('style');
  styleElement.id = 'game-error-styles';
  styleElement.textContent = `
    /* Game Error Styles */
    .game-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 2rem;
      background-color: #f8f9fa;
      color: #343a40;
    }
    
    .error-icon {
      font-size: 5rem;
      margin-bottom: 1.5rem;
      color: #dc3545;
    }
    
    .game-not-found .error-icon {
      font-weight: bold;
      font-family: Arial, sans-serif;
    }
    
    .network-error .error-icon {
      font-size: 4rem;
    }
    
    .game-error h3 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
    }
    
    .game-error p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      color: #6c757d;
    }
    
    .error-btn {
      padding: 0.75rem 1.5rem;
      margin: 0.5rem;
      border: none;
      border-radius: 4px;
      background-color: #007bff;
      color: white;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .error-btn:hover {
      background-color: #0069d9;
    }
    
    .retry-btn {
      background-color: #28a745;
    }
    
    .retry-btn:hover {
      background-color: #218838;
    }
  `;
  document.head.appendChild(styleElement);
}

// Define all available games and their properties
const gameLibrary = {
    'truth': {
        title: 'Truth or Dare',
        url: '../games/truth.html',
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

// Function to render game cards on index page
function renderGames() {
  const container = document.getElementById("gamesContainer");
  if (!container) return;

  games.forEach(game => {
    const gameCard = document.createElement("div");
    gameCard.className = "game-card";

    gameCard.innerHTML = `
      <div style="position: relative;">
        <img src="${game.image}" alt="${game.title}">
        ${game.new ? '<div class="new-ribbon">NEW</div>' : ''}
      </div>
      <div class="game-info">
        <p>${game.title}</p>
        <div class="game-meta">
          <i class="fas fa-star"></i> ${game.rating}
          <span style="margin-left: 10px;"><i class="fas fa-user"></i> ${game.players}</span>
        </div>
        <button class="play-btn" data-game-id="${game.id}">Play Now</button>
      </div>
    `;

    container.appendChild(gameCard);
  });

  // Add event listeners to play buttons
  const playButtons = document.querySelectorAll(".play-btn");
  playButtons.forEach(button => {
    button.addEventListener("click", function() {
      const gameId = this.getAttribute("data-game-id");
      openGameModal(gameId);
    });
  });
}

// Function to show 404 error in the game modal
function showGameNotFound() {
  console.log("Showing game not found error");
  
  // Ensure error styles are added
  addErrorStyles();
  
  const gameContent = document.getElementById("modal-game-content");
  const loadingScreen = document.getElementById("modal-loading-screen");
  
  // Hide loading screen
  if (loadingScreen) loadingScreen.style.display = "none";
  
  // Show 404 error
  if (gameContent) {
    // Create error container div
    const errorDiv = document.createElement("div");
    errorDiv.className = "game-error game-not-found";
    errorDiv.innerHTML = `
      <div class="error-icon">404</div>
      <h3>Game Not Found</h3>
      <p>Sorry, the game you requested doesn't exist in our library.</p>
      <button class="error-btn" onclick="closeGameModal()">Return to Homepage</button>
    `;
    
    // Clear and append
    gameContent.innerHTML = '';
    gameContent.appendChild(errorDiv);
  }
  
  // Update modal title and info
  const gameTitle = document.getElementById("modal-game-title");
  const gameDescription = document.getElementById("modal-game-description");
  const gameInstructions = document.getElementById("modal-game-instructions");
  
  if (gameTitle) gameTitle.textContent = "Game Not Found";
  if (gameDescription) gameDescription.textContent = "The requested game could not be found.";
  if (gameInstructions) gameInstructions.textContent = "Please try another game from our collection.";
}

// Function to show network error in the game modal
function showNetworkError() {
  console.log("Showing network error");
  
  // Ensure error styles are added
  addErrorStyles();
  
  const gameContent = document.getElementById("modal-game-content");
  const loadingScreen = document.getElementById("modal-loading-screen");
  
  // Hide loading screen
  if (loadingScreen) loadingScreen.style.display = "none";
  
  // Show network error
  if (gameContent) {
    // Create error container div
    const errorDiv = document.createElement("div");
    errorDiv.className = "game-error network-error";
    
    errorDiv.innerHTML = `
      <div class="error-icon"><i class="fas fa-wifi-slash"></i></div>
      <h3>Connection Error</h3>
      <p>We couldn't load the game due to network issues.</p>
      <button class="error-btn retry-btn">Try Again</button>
      <button class="error-btn" onclick="closeGameModal()">Return to Homepage</button>
    `;
    
    // Clear and append
    gameContent.innerHTML = '';
    gameContent.appendChild(errorDiv);
    
    // Add event listener to retry button
    const retryBtn = errorDiv.querySelector('.retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', function() {
        // Get current game ID from data attribute
        const gameId = gameContent.getAttribute('data-current-game');
        if (gameId) {
          openGameModal(gameId);
        }
      });
    }
  }
  
  // Update modal info if needed
  const gameTitle = document.getElementById("modal-game-title");
  if (gameTitle) gameTitle.textContent = "Connection Error";
}

// Function to open the game modal
function openGameModal(gameId) {
  console.log("Opening game modal for:", gameId);
  
  // Ensure error styles are added at initialization
  addErrorStyles();
  
  const modal = document.getElementById("gameModal");
  const gameContent = document.getElementById("modal-game-content");
  const loadingScreen = document.getElementById("modal-loading-screen");
  
  // Show modal first
  if (modal) {
    modal.classList.add("open");
    document.body.classList.add("modal-open");
  } else {
    console.error("Game modal element not found");
    return;
  }
  
  // Check if the game exists in our library
  if (gameId && gameLibrary[gameId]) {
    const game = gameLibrary[gameId];
    const gameTitle = document.getElementById("modal-game-title");
    const gameDescription = document.getElementById("modal-game-description");
    const gameInstructions = document.getElementById("modal-game-instructions");
    
    // Update game title
    if (gameTitle) gameTitle.textContent = game.title;
    
    // Update game description and instructions
    if (gameDescription) gameDescription.textContent = game.description;
    if (gameInstructions) gameInstructions.textContent = game.instructions;
    
    // Clear any previous game content
    if (gameContent) {
      gameContent.innerHTML = '';
      // Store current game ID for retry functionality
      gameContent.setAttribute('data-current-game', gameId);
    } else {
      console.error("Game content element not found");
      return;
    }
    
    // Show loading screen
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
    } else {
      console.warn("Loading screen element not found");
    }
    
    // Create and load game iframe
    const iframe = document.createElement("iframe");
    iframe.src = game.url;
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;
    iframe.title = game.title;
    
    // Set up timeout for network error detection
    let iframeLoaded = false;
    const loadTimeout = setTimeout(function() {
      if (!iframeLoaded) {
        console.log("Iframe load timeout reached");
        showNetworkError();
      }
    }, 15000); // 15 seconds timeout
    
    // Handle iframe load event
    iframe.onload = function() {
      console.log("Iframe loaded successfully");
      iframeLoaded = true;
      clearTimeout(loadTimeout);
      
      // Hide loading screen after a delay
      if (loadingScreen) {
        setTimeout(function() {
          loadingScreen.style.display = "none";
        }, 300);
      }
    };
    
    // Handle iframe error
    iframe.onerror = function(e) {
      console.error("Iframe load error:", e);
      iframeLoaded = true;
      clearTimeout(loadTimeout);
      showNetworkError();
    };
    
    // Add iframe to game content
    gameContent.appendChild(iframe);
    
    // Fallback check in case onerror doesn't fire
    const checkIframeContent = setInterval(function() {
      try {
        // Try to access iframe content if same origin
        const iframeDoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
        
        // If we got here with no error, iframe has loaded something 
        if (iframeDoc && iframeDoc.body && iframeDoc.body.innerHTML.includes('404')) {
          console.log("Detected 404 in iframe content");
          showNetworkError();
          clearInterval(checkIframeContent);
        }
      } catch (e) {
        // Cross-origin: can't check content, assume it loaded correctly
        clearInterval(checkIframeContent);
      }
    }, 1000); // Check every second
    
    // Clean up interval after 5 seconds
    setTimeout(() => clearInterval(checkIframeContent), 5000);
  } else {
    // Game not found - show 404 error
    console.log("Game not found in library:", gameId);
    showGameNotFound();
  }
}

// Function to close the game modal
function closeGameModal() {
  const modal = document.getElementById("gameModal");
  if (modal) {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
  }
  
  // Clear the iframe to stop any game processes
  const gameContent = document.getElementById("modal-game-content");
  if (gameContent) gameContent.innerHTML = '';
}

// Initialize modal controls
function initModalControls() {
  // Game info panel toggle
  const infoButton = document.getElementById('modal-info-button');
  if (infoButton) {
    infoButton.addEventListener('click', function() {
      const infoPanel = document.getElementById('modal-info-panel');
      if (infoPanel) {
        infoPanel.classList.toggle('visible');
      }
    });
  }
  
  // Close info panel when clicking elsewhere
  document.addEventListener('click', function(event) {
    const infoButton = document.getElementById('modal-info-button');
    const infoPanel = document.getElementById('modal-info-panel');
    
    if (infoButton && infoPanel && !infoButton.contains(event.target) && !infoPanel.contains(event.target)) {
      infoPanel.classList.remove('visible');
    }
  });
  
  // Exit dialog functionality
  const powerButton = document.getElementById('modal-power-button');
  const exitDialog = document.getElementById('modal-exit-dialog');
  const blurOverlay = document.getElementById('modal-blur-overlay');
  const stayButton = document.getElementById('modal-stay-button');
  const exitButton = document.getElementById('modal-exit-button');
  
  // Draggable power button functionality
  let isDragging = false;
  let startX, startY;
  let initialTouchX, initialTouchY;
  let offsetX, offsetY;
  let dragThreshold = 5; // Pixels of movement before considering it a drag

  if (powerButton) {
    // Mouse events
    powerButton.addEventListener('mousedown', function(e) {
      e.preventDefault(); // Prevent text selection during drag
      
      // Record initial position
      startX = e.clientX;
      startY = e.clientY;
      
      // Get button position relative to cursor
      const rect = powerButton.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      
      // Listen for mouse movement and release
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      
      // Start in non-dragging state
      isDragging = false;
    });
    
    // Touch events
    powerButton.addEventListener('touchstart', function(e) {
      e.preventDefault(); // Prevent scrolling during drag
      
      const touch = e.touches[0];
      
      // Record initial position
      startX = touch.clientX;
      startY = touch.clientY;
      initialTouchX = touch.clientX;
      initialTouchY = touch.clientY;
      
      // Get button position relative to touch
      const rect = powerButton.getBoundingClientRect();
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
      
      // Listen for touch movement and end
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
      
      // Start in non-dragging state
      isDragging = false;
    });
  }
  
  // Mouse move handler
  function onMouseMove(e) {
    // Calculate distance moved
    const deltaX = Math.abs(e.clientX - startX);
    const deltaY = Math.abs(e.clientY - startY);
    
    // If moved beyond threshold, consider it a drag
    if (!isDragging && (deltaX > dragThreshold || deltaY > dragThreshold)) {
      isDragging = true;
      powerButton.classList.add('dragging');
    }
    
    // If dragging, move the button
    if (isDragging) {
      moveButton(e.clientX, e.clientY);
    }
  }
  
  // Touch move handler
  function onTouchMove(e) {
    e.preventDefault(); // Prevent scrolling during drag
    
    const touch = e.touches[0];
    
    // Calculate distance moved
    const deltaX = Math.abs(touch.clientX - initialTouchX);
    const deltaY = Math.abs(touch.clientY - initialTouchY);
    
    // If moved beyond threshold, consider it a drag
    if (!isDragging && (deltaX > dragThreshold || deltaY > dragThreshold)) {
      isDragging = true;
      powerButton.classList.add('dragging');
    }
    
    // If dragging, move the button
    if (isDragging) {
      moveButton(touch.clientX, touch.clientY);
    }
  }
  
  // Function to move the button
  function moveButton(clientX, clientY) {
    // Calculate new position
    const newLeft = clientX - offsetX;
    const newTop = clientY - offsetY;
    
    // Get button dimensions
    const buttonWidth = powerButton.offsetWidth;
    const buttonHeight = powerButton.offsetHeight;
    
    // Calculate viewport constraints
    const maxLeft = window.innerWidth - buttonWidth;
    const maxTop = window.innerHeight - buttonHeight;
    
    // Apply position with constraints to keep button fully visible
    powerButton.style.left = Math.max(0, Math.min(maxLeft, newLeft)) + 'px';
    powerButton.style.top = Math.max(0, Math.min(maxTop, newTop)) + 'px';
  }
  
  // Mouse up handler
  function onMouseUp(e) {
    // Remove event listeners
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    
    // If not dragging, treat as a click
    if (!isDragging) {
      showExitDialog();
    }
    
    // Reset state
    powerButton.classList.remove('dragging');
    isDragging = false;
  }
  
  // Touch end handler
  function onTouchEnd(e) {
    // Remove event listeners
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    
    // If not dragging, treat as a tap
    if (!isDragging) {
      showExitDialog();
    }
    
    // Reset state
    powerButton.classList.remove('dragging');
    isDragging = false;
  }
  
  // Show exit dialog
  function showExitDialog() {
    if (exitDialog && blurOverlay) {
      exitDialog.classList.add('show');
      blurOverlay.classList.add('show');
    }
  }
  
  // Stay in game
  if (stayButton) {
    stayButton.addEventListener('click', function() {
      exitDialog.classList.remove('show');
      blurOverlay.classList.remove('show');
    });
  }
  
  // Exit game
  if (exitButton) {
    exitButton.addEventListener('click', function() {
      closeGameModal();
      exitDialog.classList.remove('show');
      blurOverlay.classList.remove('show');
    });
  }
  
  // Close dialog when clicking overlay
  if (blurOverlay) {
    blurOverlay.addEventListener('click', function() {
      exitDialog.classList.remove('show');
      blurOverlay.classList.remove('show');
    });
  }
}

// Function to test a non-existent game (for testing 404 functionality)
function testGameNotFound() {
  openGameModal('non-existent-game');
}

// Function to test network error (for testing network error functionality)
function testNetworkError() {
  // Create a temporary game with invalid URL
  gameLibrary['test-network-error'] = {
    title: 'Test Network Error',
    url: 'non-existent-url.html',
    description: 'Test description',
    instructions: 'Test instructions'
  };
  
  openGameModal('test-network-error');
}

// Initialize everything when the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  // Add CSS styles first
  addErrorStyles();
  
  // Render game cards
  renderGames();
  
  // Initialize modal controls
  initModalControls();
  
  // For testing purposes, you can uncomment these:
  // setTimeout(() => testGameNotFound(), 1000); // Test 404 page
  // setTimeout(() => testNetworkError(), 1000); // Test network error page
});
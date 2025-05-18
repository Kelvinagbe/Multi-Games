// Define function to add error styles that was missing in the original code
function addErrorStyles() {
  // Check if styles already exist
  if (document.getElementById('game-error-styles')) return;

  // Create style element
  const style = document.createElement('style');
  style.id = 'game-error-styles';
  style.textContent = `
    .game-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    
    .error-icon {
      font-size: 48px;
      margin-bottom: 20px;
      color: #dc3545;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: rgba(220, 53, 69, 0.1);
    }
    
    .game-error h3 {
      font-size: 24px;
      margin-bottom: 10px;
      color: #343a40;
    }
    
    .game-error p {
      color: #6c757d;
      margin-bottom: 20px;
      max-width: 80%;
    }
    
    .error-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      background-color: #007bff;
      color: white;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s;
      margin: 5px;
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

  // Add style to document head
  document.head.appendChild(style);
}

// Define all available games and their properties
const gameLibrary = {
    '01': {
        title: 'Truth or Dare',
        url: '../games/truth.html',
        thumbnail: '../assets/image/01.png',
        category: 'multiplayer'
    },
    '02': {
        title: 'Memory Card',
        url: '../games/memory.html',
        thumbnail: '../assets/image/02.png',
        category: 'puzzle'
    },
    '03': {
        title: 'Whack Mole',
        url: '../games/whack.html',
        thumbnail: '../assets/image/03.png',
        category: 'arcade'
    },
    '04': {
        title: 'Tic Tac Toe',
        url: '../games/ticgame.html',
        thumbnail: '../assets/image/04.png',
        category: 'puzzle'
    },
    '05': {
        title: 'Bubble Shoot',
        url: '../games/iframe-bubble.html',
        thumbnail: '../assets/image/05.png',
        category: 'arcade'
    },
    '06': {
        title: 'Macthman Warrior',
        url: '../games/iframe-warrior.html',
        thumbnail: '../assets/image/06.png',
        category: 'action'
    },
    '07': {
        title: 'Moto X3M Christmas',
        url: '../games/iframe-moto-X3M.html',
        thumbnail: '../assets/image/07.png',
        category: 'action'
    },
    '08': {
        title: 'Ludo Legend',
        url: '../games/iframe-ludo-legend.html',
        thumbnail: '../assets/image/08.png',
        category: 'card games'
    },
    '09': {
        title: 'Bike Rush 3D',
        url: '../games/iframe-bike-rush.html',
        thumbnail: '../assets/image/09.png',
        category: 'action'
    },
    '10': {
        title: 'Boat Race',
        url: '../games/iframe-boat-race.html',
        thumbnail: '../assets/image/10.png',
        category: 'sports'
    },
    '11': {
        title: 'Subway Surfers Halloween',
        url: '../games/iframe-subway.html',
        thumbnail: '../assets/image/11.png',
        category: 'action'
    },
    '12': {
        title: 'Pubg Mobile',
        url: '../games/iframe-pubg.html',
        thumbnail: '../assets/image/12.png',
        category: 'action'
    },
    '13': {
        title: 'Pixel Shooter',
        url: '../games/iframe-pixel.html',
        thumbnail: '../assets/image/13.png',
        category: 'action'
    },
    '14': {
        title: 'Relic Run Away',
        url: '../games/iframe-runaway.html',
        thumbnail: '../assets/image/14.png',
        category: 'action'
    },
    '15': {
        title: 'Hunter Assassin',
        url: '../games/iframe-hunter.html',
        thumbnail: '../assets/image/15.png',
        category: 'action'
    },
    '16': {
        title: 'Squid Survival',
        url: '../games/iframe-squidsurvival.html',
        thumbnail: '../assets/image/16.png',
        category: 'action'
    },
    '17': {
        title: 'Piano Music Tiles',
        url: '../games/iframe-pianotiles.html',
        thumbnail: '../assets/image/17.png',
        category: 'arcade'
    },
    '18': {
        title: 'Sniper Simulator',
        url: '../games/iframe-snipersimulator.html',
        thumbnail: '../assets/image/18.png',
        category: 'action'
    },
    '19': {
        title: 'Wild Hunt Hunting',
        url: '../games/iframe-wildhunt.html',
        thumbnail: '../assets/image/19.png',
        category: 'action'
    },
    '20': {
        title: 'Egg Super Adventure',
        url: '../games/iframe-eggadventure.html',
        thumbnail: '../assets/image/20.png',
        category: 'action'
    },
    '21': {
        title: 'Rac Simulator 1',
        url: '../games/iframe-racesimulator-1.html',
        thumbnail: '../assets/image/21.png',
        category: 'sports'
    },
    '22': {
        title: 'Smash Colors Music Ball',
        url: '../games/iframe-musicball.html',
        thumbnail: '../assets/image/22.png',
        category: 'arcade'
    },
    '23': {
        title: 'Subway Surfers Holiday',
        url: '../games/iframe-subway-surfers-holiday.html',
        thumbnail: '../assets/image/23.png',
        category: 'action'
    },
    '24': {
        title: 'ORV Racing',
        url: '../games/iframe-ORV-Racing.html',
        thumbnail: '../assets/image/24.png',
        category: 'sports'
    }
};

// Games for index page

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

// NEW FUNCTION: Get game ID from URL parameters or hash
function getGameIdFromUrl() {
  // Check for query parameter ?game=XX
  const urlParams = new URLSearchParams(window.location.search);
  const gameParam = urlParams.get('game');
  
  if (gameParam && gameLibrary[gameParam]) {
    return gameParam;
  }
  
  // Check for hash fragment #XX
  const hash = window.location.hash.substring(1);
  if (hash && gameLibrary[hash]) {
    return hash;
  }
  
  return null;
}

// NEW FUNCTION: Update URL with game ID without reloading the page
function updateUrlWithGameId(gameId) {
  if (!gameId) return;
  
  // Change URL without reloading the page
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set('game', gameId);
  window.history.pushState({}, '', newUrl);
}

// Initialize everything when the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  // Add CSS styles first
  addErrorStyles();

  // Render game cards
  renderGames();

  // Initialize modal controls
  initModalControls();
  
  // NEW CODE: Check for game ID in URL and auto-open if found
  const gameIdFromUrl = getGameIdFromUrl();
  if (gameIdFromUrl) {
    console.log("Auto-opening game from URL parameter:", gameIdFromUrl);
    setTimeout(() => openGameModal(gameIdFromUrl), 500); // Small delay to ensure everything is loaded
  }
  
  // NEW CODE: Modify openGameModal call in play button event listeners to update URL
  const playButtons = document.querySelectorAll(".play-btn");
  playButtons.forEach(button => {
    button.addEventListener("click", function() {
      const gameId = this.getAttribute("data-game-id");
      updateUrlWithGameId(gameId); // Update URL with game ID
      openGameModal(gameId);
    });
  });

  // For testing purposes, you can uncomment these:
  // setTimeout(() => testGameNotFound(), 1000); // Test 404 page
  // setTimeout(() => testNetworkError(), 1000); // Test network error page
});

// Listen for popstate events (when user uses browser back/forward buttons)
window.addEventListener('popstate', function(event) {
  // Close any open modal
  closeGameModal();
  
  // Check if there's a game ID in the new URL
  const gameIdFromUrl = getGameIdFromUrl();
  if (gameIdFromUrl) {
    // Re-open the game modal with the new game ID
    setTimeout(() => openGameModal(gameIdFromUrl), 200);
  }
});
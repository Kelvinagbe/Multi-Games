// Game Search Functionality with Category Integration
document.addEventListener('DOMContentLoaded', function() {
  // Get search elements
  const searchInput = document.querySelector('.search-input');
  const searchButton = document.querySelector('.search-button');

  // Create search results container
  const searchResultsContainer = document.createElement('div');
  searchResultsContainer.className = 'search-results-container';
  searchResultsContainer.style.display = 'none';
  document.querySelector('.search-box').appendChild(searchResultsContainer);

  // Create search overlay for full-screen results
  const searchOverlay = document.createElement('div');
  searchOverlay.className = 'search-overlay';
  searchOverlay.style.display = 'none';
  document.body.appendChild(searchOverlay);

  // Add styles for search functionality
  addSearchStyles();

  // Initialize search event listeners
  initSearch();

  // Add event listener for messages from category iframe
  initCategoryIntegration();

  // Function to add search styles
  function addSearchStyles() {
    // Check if styles already exist
    if (document.getElementById('search-styles')) return;

    // Create style element
    const style = document.createElement('style');
    style.id = 'search-styles';
    style.textContent = `
      .search-box {
  position: relative;
}

.search-results-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  margin-top: 5px;
  padding: 10px;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f0fff5; /* Light green hover instead of light blue */
}

.search-result-item img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 10px;
}

.search-result-info {
  flex: 1;
}

.search-result-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.search-result-category {
  font-size: 0.8rem;
  color: #666;
}

.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.search-overlay-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-overlay-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
}

.search-overlay-input:focus {
  border-color: #116530; /* Dark green instead of blue */
  box-shadow: 0 0 0 2px rgba(17, 101, 48, 0.25); /* Dark green with transparency */
}

.search-overlay-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  margin-left: 15px;
  color: #666;
}

.search-overlay-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 10px;
}

.search-overlay-item {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.search-overlay-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.search-overlay-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.search-overlay-info {
  padding: 12px;
}

.search-overlay-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.search-overlay-category {
  font-size: 0.8rem;
  color: #666;
}

.search-no-results {
  text-align: center;
  padding: 30px;
  color: #666;
}

.search-overlay-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  padding: 0 15px;
}

.search-filter-button {
  background: #f0f0f0;
  border: none;
  border-radius: 20px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-filter-button.active {
  background: #116530; /* Dark green instead of blue */
  color: white;
}

@media (max-width: 768px) {
  .search-overlay-results {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .search-overlay-image {
    height: 100px;
  }
  
  .search-overlay-info {
    padding: 8px;
  }
}
    `;

    // Add style to document head
    document.head.appendChild(style);
  }

  // Initialize search functionality
  function initSearch() {
    // Add event listeners
    searchInput.addEventListener('input', handleSearchInput);
    searchButton.addEventListener('click', openFullSearch);
    searchInput.addEventListener('focus', handleSearchFocus);

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchResultsContainer.contains(e.target)) {
        searchResultsContainer.style.display = 'none';
      }
    });

    // Handle Enter key in search input
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        openFullSearch();
      }
    });
  }

  // Initialize message handling for category iframe integration
  function initCategoryIntegration() {
    window.addEventListener('message', function(event) {
      // Check if the message is coming with an action
      if (event.data && event.data.action) {
        
        // Handle category search request
        if (event.data.action === 'triggerCategorySearch') {
          const category = event.data.category;
          
          // Clear search input
          searchInput.value = '';
          
          // Open the full search overlay
          openFullSearch();
          
          // After a small delay to ensure the overlay is open
          setTimeout(() => {
            // Find the category button in the search overlay and click it
            const filterButtons = document.querySelectorAll('.search-filter-button');
            filterButtons.forEach(button => {
              if (button.dataset.category === category) {
                button.click();
              }
            });
          }, 200);
        }
        
        // Handle full search request (view all games)
        else if (event.data.action === 'triggerFullSearch') {
          // Clear search input
          searchInput.value = '';
          
          // Open the full search overlay
          openFullSearch();
        }
      }
    });
  }

  // Handle search input changes
  function handleSearchInput() {
    const query = searchInput.value.trim().toLowerCase();

    if (query.length < 2) {
      searchResultsContainer.style.display = 'none';
      return;
    }

    const results = searchGames(query, 5); // Limit to 5 results for dropdown

    if (results.length > 0) {
      renderSearchResults(results, searchResultsContainer);
      searchResultsContainer.style.display = 'block';
    } else {
      searchResultsContainer.style.display = 'none';
    }
  }

  // Handle input focus
  function handleSearchFocus() {
    const query = searchInput.value.trim().toLowerCase();

    if (query.length >= 2) {
      const results = searchGames(query, 5);

      if (results.length > 0) {
        renderSearchResults(results, searchResultsContainer);
        searchResultsContainer.style.display = 'block';
      }
    }
  }

  // Search games function
  function searchGames(query, limit = Infinity) {
    const results = [];

    // Search through gameLibrary
    for (const [id, game] of Object.entries(gameLibrary)) {
      const titleMatch = game.title.toLowerCase().includes(query);
      const categoryMatch = game.category.toLowerCase().includes(query);

      if (titleMatch || categoryMatch) {
        results.push({
          id: id,
          ...game
        });

        if (results.length >= limit) break;
      }
    }

    return results;
  }

  // Render search results in dropdown
  function renderSearchResults(results, container) {
    container.innerHTML = '';

    results.forEach(game => {
      const resultItem = document.createElement('div');
      resultItem.className = 'search-result-item';
      resultItem.innerHTML = `
        <img src="${game.thumbnail}" alt="${game.title}">
        <div class="search-result-info">
          <div class="search-result-title">${game.title}</div>
          <div class="search-result-category">${capitalizeFirstLetter(game.category)}</div>
        </div>
      `;

      resultItem.addEventListener('click', function() {
        openGameModal(game.id);
        searchResultsContainer.style.display = 'none';
      });

      container.appendChild(resultItem);
    });
  }

  // Open full-screen search overlay
  function openFullSearch() {
    const query = searchInput.value.trim();

    // Create the search overlay content
    searchOverlay.innerHTML = `
      <div class="search-overlay-header">
        <input type="text" class="search-overlay-input" placeholder="Search games..." value="${query}">
        <button class="search-overlay-close">&times;</button>
      </div>
      <div class="search-overlay-filters">
        <button class="search-filter-button active" data-category="all">All Games</button>
        <button class="search-filter-button" data-category="action">Action</button>
        <button class="search-filter-button" data-category="arcade">Arcade</button>
        <button class="search-filter-button" data-category="puzzle">Puzzle</button>
        <button class="search-filter-button" data-category="sports">Sports</button>
        <button class="search-filter-button" data-category="multiplayer">Multiplayer</button>
        <button class="search-filter-button" data-category="card games">Card Games</button>
      </div>
      <div class="search-overlay-results"></div>
    `;

    // Show the overlay
    searchOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind overlay

    // Get elements
    const overlayInput = searchOverlay.querySelector('.search-overlay-input');
    const overlayClose = searchOverlay.querySelector('.search-overlay-close');
    const overlayResults = searchOverlay.querySelector('.search-overlay-results');
    const filterButtons = searchOverlay.querySelectorAll('.search-filter-button');

    // Focus on the input
    overlayInput.focus();

    // Set up event listeners
    overlayClose.addEventListener('click', closeFullSearch);

    overlayInput.addEventListener('input', function() {
      const activeFilter = searchOverlay.querySelector('.search-filter-button.active');
      const category = activeFilter ? activeFilter.dataset.category : 'all';
      performFullSearch(overlayInput.value, category);
    });

    // Add filter button listeners
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        this.classList.add('active');

        // Perform search with selected category
        performFullSearch(overlayInput.value, this.dataset.category);
      });
    });

    // Perform initial search
    performFullSearch(query, 'all');

    // Listen for Escape key
    document.addEventListener('keydown', handleEscapeKey);
  }

  // Close full-screen search
  function closeFullSearch() {
    searchOverlay.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
    document.removeEventListener('keydown', handleEscapeKey);
  }

  // Handle Escape key for search overlay
  function handleEscapeKey(e) {
    if (e.key === 'Escape') {
      closeFullSearch();
    }
  }

  // Perform search for full-screen results
  function performFullSearch(query, category) {
    const overlayResults = searchOverlay.querySelector('.search-overlay-results');
    query = query.trim().toLowerCase();

    let results = [];

    // If query is empty but category is selected, show all games in that category
    if (query.length < 2 && category !== 'all') {
      results = Object.entries(gameLibrary)
        .filter(([_, game]) => category === 'all' || game.category === category)
        .map(([id, game]) => ({ id, ...game }));
    } 
    // If query has content, filter by query and possibly category
    else if (query.length >= 2) {
      for (const [id, game] of Object.entries(gameLibrary)) {
        const titleMatch = game.title.toLowerCase().includes(query);
        const categoryMatch = game.category.toLowerCase().includes(query);

        if ((titleMatch || categoryMatch) && 
            (category === 'all' || game.category === category)) {
          results.push({
            id: id,
            ...game
          });
        }
      }
    } 
    // If query is empty and category is all, show all games
    else if (category === 'all') {
      results = Object.entries(gameLibrary)
        .map(([id, game]) => ({ id, ...game }));
    }

    // Sort results alphabetically
    results.sort((a, b) => a.title.localeCompare(b.title));

    // Render the results
    renderFullSearchResults(results, overlayResults);
  }

  // Render results in full-screen overlay
  function renderFullSearchResults(results, container) {
    if (results.length > 0) {
      container.innerHTML = results.map(game => `
        <div class="search-overlay-item" data-game-id="${game.id}">
          <img src="${game.thumbnail}" alt="${game.title}" class="search-overlay-image">
          <div class="search-overlay-info">
            <div class="search-overlay-title">${game.title}</div>
            <div class="search-overlay-category">${capitalizeFirstLetter(game.category)}</div>
          </div>
        </div>
      `).join('');

      // Add click event listeners to game items
      const gameItems = container.querySelectorAll('.search-overlay-item');
      gameItems.forEach(item => {
        item.addEventListener('click', function() {
          const gameId = this.getAttribute('data-game-id');
          openGameModal(gameId);
          closeFullSearch();
        });
      });
    } else {
      container.innerHTML = `
        <div class="search-no-results">
          <svg width="64" height="64" fill="#ccc" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <h3>No games found</h3>
          <p>Try a different search term or category</p>
        </div>
      `;
    }
  }

  // Helper function to capitalize first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});
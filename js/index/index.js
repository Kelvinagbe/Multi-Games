// Initialize Global Variables
let gamesData = [];
let searchTimeout;
const loaderDelay = 1500; // Loader delay in ms
let deferredPrompt;

// Set "visited before" flag 
localStorage.setItem("visitedBefore", "true");

// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", function() {
    // Hide loader after delay
    setTimeout(() => {
        document.getElementById('loader').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
        }, 500);
    }, loaderDelay);

    // Add CSS for iframe loaders
    addIframeLoaderStyles();

    // Initialize search functionality
    initSearch();

    // Initialize navigation
    initNavigation();

    // Initialize dark mode
    initDarkMode();

    // Initialize real ad block detection
    detectAdBlockReal();

    // Show welcome popup for new users
    checkForFirstVisit();

    // Lazy load images
    lazyLoadImages();

    // Initialize install button if it exists
    initPWAInstall();
});


// Initialize Search Functionality
function initSearch() {
    const searchInput = document.getElementById('floating-search-input');
    const suggestionsContainer = document.getElementById('floating-suggestions');

    // Fetch games data (mocked here, should be replaced with actual data)
    fetchGamesData();

    searchInput.addEventListener('focus', function() {
        document.getElementById('floating-search').style.width = '95%';
    });

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query.length > 0) {
            searchTimeout = setTimeout(() => {
                searchGames(query);
            }, 300);
        } else {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('show');
        }
    });

    // Close search when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.floating-search')) {
            suggestionsContainer.classList.remove('show');
        }
    });
}

// Fetch Games Data
function fetchGamesData() {
    // This would normally be an API call - for now we'll use data from the HTML
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        const img = card.querySelector('img');
        const title = card.querySelector('.game-info p').textContent;
        const rating = card.querySelector('.game-meta i').nextSibling.textContent.trim();
        const link = card.querySelector('.play-btn').getAttribute('href');

        gamesData.push({
            title: title,
            image: img.src,
            rating: rating,
            link: link
        });
    });
}

// Search Games
function searchGames(query) {
    const suggestionsContainer = document.getElementById('floating-suggestions');
    suggestionsContainer.innerHTML = '';

    const filteredGames = gamesData.filter(game => 
        game.title.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredGames.length > 0) {
        filteredGames.forEach(game => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.innerHTML = `
                <img src="${game.image}" alt="${game.title}">
                <div class="suggestion-text">
                    <div class="suggestion-title">${game.title}</div>
                    <div class="suggestion-meta">Rating: ${game.rating}</div>
                </div>
            `;

            suggestionItem.addEventListener('click', () => {
                window.location.href = game.link;
            });

            suggestionsContainer.appendChild(suggestionItem);
        });

        suggestionsContainer.classList.add('show');
    } else {
        const noResults = document.createElement('div');
        noResults.className = 'suggestion-item';
        noResults.innerHTML = `
            <div class="suggestion-text">
                <div class="suggestion-title">No games found</div>
            </div>
        `;
        suggestionsContainer.appendChild(noResults);
        suggestionsContainer.classList.add('show');
    }
}

// Initialize Navigation
function initNavigation() {
    // Home Navigation
    document.getElementById('home-nav').addEventListener('click', function(e) {
        e.preventDefault();
        showMainContent();
    });

    // Categories Navigation
    document.getElementById('categories-nav').addEventListener('click', function(e) {
        e.preventDefault();
        const categoriesContent = document.getElementById('categories-content');
        categoriesContent.style.display = 'flex';

        // Show iframe loader
        showIframeLoader(categoriesContent);

        const categoriesIframe = document.getElementById('categories-iframe');
        categoriesIframe.style.opacity = '0'; // Hide iframe initially
        categoriesIframe.src = 'nav/categories/categories.html';

        // Handle iframe load completion
        categoriesIframe.onload = function() {
            hideIframeLoader(categoriesContent);
            categoriesIframe.style.opacity = '1'; // Show iframe with fade effect

            // Apply slide-in animation
            categoriesIframe.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                categoriesIframe.style.transition = 'transform 0.5s ease-out';
                categoriesIframe.style.transform = 'translateX(0)';
            }, 50);
        };

        // Keep navigation bar visible
        document.querySelector('.bottom-nav').style.display = 'flex';
        updateActiveNav('categories-nav');
    });

    document.getElementById('categories-back').addEventListener('click', function() {
        const iframe = document.getElementById('categories-iframe');
        // Slide out animation
        iframe.style.transition = 'transform 0.5s ease-in';
        iframe.style.transform = 'translateX(100%)';

        setTimeout(() => {
            document.getElementById('categories-content').style.display = 'none';
            showMainContent(); // Reset to main content when back button is pressed
        }, 500);
    });

    // View All Categories
    document.getElementById('view-all-categories').addEventListener('click', function(e) {
        e.preventDefault();
        const categoriesContent = document.getElementById('categories-content');
        categoriesContent.style.display = 'flex';

        // Show iframe loader
        showIframeLoader(categoriesContent);

        const categoriesIframe = document.getElementById('categories-iframe');
        categoriesIframe.style.opacity = '0'; // Hide iframe initially
        categoriesIframe.src = 'nav/categories/categories.html';

        // Handle iframe load completion
        categoriesIframe.onload = function() {
            hideIframeLoader(categoriesContent);
            categoriesIframe.style.opacity = '1'; // Show iframe with fade effect

            // Apply slide-in animation
            categoriesIframe.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                categoriesIframe.style.transition = 'transform 0.5s ease-out';
                categoriesIframe.style.transform = 'translateX(0)';
            }, 50);
        };

        // Keep navigation bar visible
        document.querySelector('.bottom-nav').style.display = 'flex';
        updateActiveNav('categories-nav');
    });

    // Game Feed Navigation (formerly Trending)
    document.getElementById('trending-nav').addEventListener('click', function(e) {
        e.preventDefault();
        const feedContent = document.getElementById('feed-content');
        feedContent.style.display = 'flex';

        // Show iframe loader
        showIframeLoader(feedContent);

        const feedIframe = document.getElementById('feed-iframe');
        feedIframe.style.opacity = '0'; // Hide iframe initially
        feedIframe.src = 'nav/feed.html'; // You'll need to create this HTML file

        // Handle iframe load completion
        feedIframe.onload = function() {
            hideIframeLoader(feedContent);
            feedIframe.style.opacity = '1'; // Show iframe with fade effect

            // Apply slide-in animation
            feedIframe.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                feedIframe.style.transition = 'transform 0.5s ease-out';
                feedIframe.style.transform = 'translateX(0)';
            }, 50);
        };

        // Ensure navigation bar is visible
        document.querySelector('.bottom-nav').style.display = 'flex';
        updateActiveNav('trending-nav');
    });

    // Game Feed back button
    document.getElementById('feed-back').addEventListener('click', function() {
        const iframe = document.getElementById('feed-iframe');
        // Slide out animation
        iframe.style.transition = 'transform 0.5s ease-in';
        iframe.style.transform = 'translateX(100%)';

        setTimeout(() => {
            document.getElementById('feed-content').style.display = 'none';
            showMainContent(); // Reset to main content when back button is pressed
        }, 500);
    });

    // Earn Navigation
    document.getElementById('earn-nav').addEventListener('click', function(e) {
        e.preventDefault();
        const earnContent = document.getElementById('earn-content');
        earnContent.style.display = 'flex';

        // Show iframe loader
        showIframeLoader(earnContent);

        const earnIframe = document.getElementById('earn-iframe');
        earnIframe.style.opacity = '0'; // Hide iframe initially
        earnIframe.src = 'nav/earn.html';

        // Handle iframe load completion
        earnIframe.onload = function() {
            hideIframeLoader(earnContent);
            earnIframe.style.opacity = '1'; // Show iframe with fade effect

            // Apply slide-in animation
            earnIframe.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                earnIframe.style.transition = 'transform 0.5s ease-out';
                earnIframe.style.transform = 'translateX(0)';
            }, 50);
        };

        // Ensure navigation bar is visible
        document.querySelector('.bottom-nav').style.display = 'flex';
        updateActiveNav('earn-nav');
    });

    document.getElementById('earn-back').addEventListener('click', function() {
        if (this.parentElement) {
            const iframe = document.getElementById('earn-iframe');
            // Slide out animation
            iframe.style.transition = 'transform 0.5s ease-in';
            iframe.style.transform = 'translateX(100%)';

            setTimeout(() => {
                document.getElementById('earn-content').style.display = 'none';
                showMainContent(); // Reset to main content when back button is pressed
            }, 500);
        }
    });

    // Profile Navigation
    document.getElementById('profile-nav').addEventListener('click', function(e) {
        e.preventDefault();
        // Hide all containers first
        document.querySelectorAll('.container').forEach(container => {
            container.style.display = 'none';
        });

        const profileContent = document.getElementById('profile-content');
        profileContent.style.display = 'flex';

        // Show iframe loader
        showIframeLoader(profileContent);

        const profileIframe = document.getElementById('profile-iframe');
        profileIframe.style.opacity = '0'; // Hide iframe initially
        profileIframe.src = 'nav/profile.html';

        // Handle iframe load completion
        profileIframe.onload = function() {
            hideIframeLoader(profileContent);
            profileIframe.style.opacity = '1'; // Show iframe with fade effect

            // Apply slide-in animation
            profileIframe.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                profileIframe.style.transition = 'transform 0.5s ease-out';
                profileIframe.style.transform = 'translateX(0)';
            }, 50);
        };

        // Keep navigation bar visible
        document.querySelector('.bottom-nav').style.display = 'flex';
        updateActiveNav('profile-nav');
    });

    document.getElementById('profile-back').addEventListener('click', function() {
        const iframe = document.getElementById('profile-iframe');
        // Slide out animation
        iframe.style.transition = 'transform 0.5s ease-in';
        iframe.style.transform = 'translateX(100%)';

        setTimeout(() => {
            document.getElementById('profile-content').style.display = 'none';
            showMainContent(); // Reset to main content when back button is pressed
        }, 500);
    });
}

// Show Main Content
function showMainContent() {
    document.querySelectorAll('.container').forEach(container => {
        container.style.display = 'none';
    });
    document.getElementById('main-content').style.display = 'block';
    // Ensure navigation bar is visible
    document.querySelector('.bottom-nav').style.display = 'flex';
    updateActiveNav('home-nav');
}

// Update Active Navigation
function updateActiveNav(activeId) {
    document.querySelectorAll('.bottom-nav a').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(activeId).classList.add('active');
}

// Initialize Dark Mode
function initDarkMode() {
    // Create dark mode toggle button
    const darkModeToggle = document.createElement('div');
    darkModeToggle.className = 'dark-mode-toggle';

    document.body.appendChild(darkModeToggle);

    // Check for saved theme preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    // Apply saved preference
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    // Toggle dark mode on click
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
    });
}

// Real Ad Blocker Detection
function detectAdBlockReal() {
    // Create a test ad element
    const testAd = document.createElement('div');
    testAd.className = 'ads ad adsbox doubleclick ad-placement carbon-ads';
    testAd.innerHTML = '&nbsp;';
    testAd.style.position = 'absolute';
    testAd.style.top = '-999px';
    testAd.style.left = '-999px';
    testAd.style.height = '1px';
    testAd.style.width = '1px';

    document.body.appendChild(testAd);

    // Check if the ad element is hidden (ad blocker active)
    setTimeout(() => {
        // If the element's height is 0, ad blocker is active
        const isAdBlocked = testAd.offsetHeight === 0 || 
                           window.getComputedStyle(testAd).display === 'none' || 
                           !document.body.contains(testAd);

        if (isAdBlocked) {
            // Show ad block message
            document.getElementById('adblockMessage').style.display = 'block';
            console.log('Ad blocker detected');
        } else {
            console.log('No ad blocker detected');
        }

        // Remove the test element
        if (document.body.contains(testAd)) {
            document.body.removeChild(testAd);
        }
    }, 100);

    // Alternative method using a fake ad request
    const testScript = document.createElement('script');
    testScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    testScript.onerror = function() {
        // Show ad block message if script failed to load
        document.getElementById('adblockMessage').style.display = 'block';
        console.log('Ad blocker detected (script method)');
    };
    document.body.appendChild(testScript);
}

// Close Ad Block Message
function closeAdBlockMessage() {
    document.getElementById('adblockMessage').style.display = 'none';
}

// Check for First Visit
function checkForFirstVisit() {
    const isFirstVisit = localStorage.getItem('firstVisit') !== 'false';

    if (isFirstVisit) {
        showWelcomePopup();
        localStorage.setItem('firstVisit', 'false');
    }
}

// Show Welcome Popup
function showWelcomePopup() {
    const popupContainer = document.getElementById('popupContainer');

    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <div class="popup-close">&times;</div>
        <h3 class="popup-title">Welcome to Multi Games!</h3>
        <div class="popup-content">
            <p>Thanks for downloading our app! Get ready to play the best mobile games for free.</p>
            <p>Explore our categories, play trending games, and have fun!</p>
        </div>
        <button class="popup-button">Start Playing</button>
    `;

    popupContainer.appendChild(popup);
    popupContainer.style.visibility = 'visible';
    popupContainer.style.opacity = '1';

    // Close popup on close button click
    popup.querySelector('.popup-close').addEventListener('click', () => {
        popupContainer.style.opacity = '0';
        setTimeout(() => {
            popupContainer.style.visibility = 'hidden';
            popupContainer.innerHTML = '';
        }, 300);
    });

    // Close popup on button click
    popup.querySelector('.popup-button').addEventListener('click', () => {
        popupContainer.style.opacity = '0';
        setTimeout(() => {
            popupContainer.style.visibility = 'hidden';
            popupContainer.innerHTML = '';
        }, 300);
    });
}


// Lazy Load Images
function lazyLoadImages() {
    const gameImages = document.querySelectorAll('.game-card img');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src; // Keep the original src
                    imageObserver.unobserve(img);
                }
            });
        });

        gameImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Register service worker with scope parameter to work on localhost
        navigator.serviceWorker.register('./service-worker.js', { scope: './' })
            .then(function(registration) {

                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Prevent default behavior for all game links to enable analytics tracking
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('game-link') || e.target.parentElement.classList.contains('game-link')) {
        const link = e.target.classList.contains('game-link') ? e.target : e.target.parentElement;
        const href = link.getAttribute('href');
        const gameName = link.closest('.game-card').querySelector('.game-info p').textContent;

        // Track analytics (placeholder for actual analytics code)
        console.log(`Game clicked: ${gameName}`);

        // Allow default behavior to continue
    }
});

// Function to handle category clicks
function handleCategoryClick(category) {
    // This would filter games by category
    console.log(`Category clicked: ${category}`);
}

// Add click listeners to categories
document.querySelectorAll('.category').forEach(categoryElement => {
    categoryElement.addEventListener('click', function() {
        const categoryName = this.querySelector('p').textContent;
        handleCategoryClick(categoryName);
    });
});

// Create and add iframe loader styles
function addIframeLoaderStyles() {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        .iframe-loader-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: rgba(255, 255, 255, 0.8);
            z-index: 10;
        }
        
        .dark-mode .iframe-loader-container {
            background-color: rgba(30, 30, 30, 0.8);
        }
        
        .flashing-m {
            font-size: 4rem;
            font-weight: bold;
            font-family: 'Arial', sans-serif;
            animation: flashM 1.2s infinite;
            color: #006600; /* Dark green color */
        }
        
        @keyframes flashM {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
        }
        
        .iframe-container iframe {
            transition: opacity 0.3s ease, transform 0.5s ease-out;
        }
    `;
    document.head.appendChild(styleEl);
}

// Show iframe loader
function showIframeLoader(container) {
    // Create loader if it doesn't exist
    let loader = container.querySelector('.iframe-loader-container');
    if (!loader) {
        loader = document.createElement('div');
        loader.className = 'iframe-loader-container';
        loader.innerHTML = '<div class="flashing-m">M</div>';
        container.appendChild(loader);
    } else {
        loader.style.display = 'flex';
    }
}

// Hide iframe loader
function hideIframeLoader(container) {
    const loader = container.querySelector('.iframe-loader-container');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }
}

// Initialize PWA Install functionality
function initPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        
        // Show install button if it exists
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.style.display = 'block';
            
            installButton.addEventListener('click', () => {
                // Show the install prompt
                deferredPrompt.prompt();
                
                // Wait for the user to respond to the prompt
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                        // Hide the button after installation
                        installButton.style.display = 'none';
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    // Clear the saved prompt since it can't be used again
                    deferredPrompt = null;
                });
            });
        }
    });
    
    // Handle installed event
    window.addEventListener('appinstalled', (evt) => {
        console.log('App was installed');
        // Hide install button if it exists
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    });
}
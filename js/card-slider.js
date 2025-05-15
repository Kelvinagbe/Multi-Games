// Infinite Looping Card Slider Script
// This script creates a smooth, infinitely looping horizontal card slider

// Array of card data
const cardData = [
  {
    id: "01",
    image: "../assets/image/01.png",
    title: "Truth or Dare",
    description: "Challenge your friends with the ultimate party game!"
  },
  {
    id: "18",
    image: "../assets/image/18.png",
    title: "Sniper Simulator",
    description: "Test your skills in precision shooting!"
  },
  {
    id: "13",
    image: "../assets/image/13.png",
    title: "Pixel Shooter",
    description: "Shoot your way through pixelated enemies!"
  }
];

// First, add necessary CSS to the document head
const sliderCSS = document.createElement('style');
sliderCSS.textContent = `
  /* Create a container for the slider */
  .card-slider-container {
    position: relative;
    width: 100%;
    overflow: hidden; /* Critical for hiding sliding content */
  }

  /* Style for the card track */
  .card-slider-track {
    display: flex;
    transition: transform 0.6s ease-in-out;
    width: 100%;
  }
  
  /* No transition during reset */
  .card-slider-track.no-transition {
    transition: none;
  }

  /* Style for individual card items */
  .card-slider-item {
    flex: 0 0 100%;
    width: 100%;
  }

  /* Navigation dots */
  .slider-dots {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
  
  .dot {
    width: 10px;
    height: 10px;
    background-color: #ccc;
    border-radius: 50%;
    margin: 0 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .dot.active {
    background-color: var(--primary-color, #ff5722);
  }

  /* Navigation arrows */
  .slider-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    font-size: 20px;
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }
  
  .slider-arrow:hover {
    opacity: 1;
  }
  
  .slider-arrow-prev {
    left: 10px;
  }
  
  .slider-arrow-next {
    right: 10px;
  }
  
  /* Cookie Consent Banner Styles */
  .cookie-consent {
    display: none; /* Initially hidden, will be shown by JavaScript */
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 420px;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-radius: 24px;
    padding: 20px;
    z-index: 999;
    border: 1px solid rgba(14, 173, 105, 0.3);
    font-family: Arial, sans-serif;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translate(-50%, 100px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }

  .cookie-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  .cookie-icon {
    margin-right: 10px;
    color: #0ead69;
  }

  .cookie-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin: 0;
  }

  .cookie-text {
    font-size: 14px;
    line-height: 1.5;
    color: #555;
    margin-bottom: 15px;
  }

  .cookie-buttons {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    margin-top: 15px;
  }

  .cookie-button {
    flex: 1;
    padding: 12px 15px;
    border-radius: 24px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s ease;
    text-align: center;
  }

  .accept-button {
    background-color: #0ead69;
    color: white;
    border: none;
  }

  .accept-button:hover {
    background-color: #0c9a5c;
  }

  .decline-button {
    background-color: transparent;
    color: #555;
    border: 1px solid #ccc;
  }

  .decline-button:hover {
    background-color: #f5f5f5;
  }

  .cookie-settings-link {
    display: block;
    text-align: center;
    margin-top: 10px;
    font-size: 12px;
    color: #666;
    text-decoration: underline;
    cursor: pointer;
  }

  .cookie-settings-link:hover {
    color: #0ead69;
  }
`;
document.head.appendChild(sliderCSS);

// Get the original featured card
const originalFeatured = document.querySelector('.featured');
if (!originalFeatured) {
  console.error('Could not find featured card element');
  throw new Error('Featured card element not found');
}

// Get parent of the featured card
const parentElement = originalFeatured.parentElement;

// Create the new slider structure
const sliderContainer = document.createElement('div');
sliderContainer.className = 'card-slider-container';

const sliderTrack = document.createElement('div');
sliderTrack.className = 'card-slider-track';

// For infinite loop effect, we'll clone cards to create a circular effect
// We'll create this structure: [last card clone, all original cards, first card clone]

// Function to create a card item from data
function createCardItem(cardData, className = '') {
  const cardItem = originalFeatured.cloneNode(true);
  cardItem.className = 'card-slider-item ' + originalFeatured.className + ' ' + className;

  // Update card content
  const img = cardItem.querySelector('img');
  const title = cardItem.querySelector('h3');
  const desc = cardItem.querySelector('p');
  const link = cardItem.querySelector('a.featured-btn');

  if (img) img.src = cardData.image;
  if (title) title.textContent = cardData.title;
  if (desc) desc.textContent = cardData.description;
  if (link) {
  link.href = "javascript:void(0);";
  link.addEventListener("click", () => {
    openGameModal(cardData.id); // This triggers your modal system
  });
}

  return cardItem;
}

// Add clone of last card at the beginning (for smooth looping backward)
const lastCardClone = createCardItem(cardData[cardData.length - 1], 'clone');
sliderTrack.appendChild(lastCardClone);

// Add all original cards
cardData.forEach((card) => {
  const cardItem = createCardItem(card);
  sliderTrack.appendChild(cardItem);
});

// Add clone of first card at the end (for smooth looping forward)
const firstCardClone = createCardItem(cardData[0], 'clone');
sliderTrack.appendChild(firstCardClone);

// Add track to container
sliderContainer.appendChild(sliderTrack);

// Add navigation arrows
const createArrow = (direction) => {
  const arrow = document.createElement('div');
  arrow.className = `slider-arrow slider-arrow-${direction}`;
  arrow.innerHTML = direction === 'prev' ? '&#10094;' : '&#10095;';
  arrow.addEventListener('click', () => {
    if (direction === 'prev') {
      prevSlide();
    } else {
      nextSlide();
    }
  });
  sliderContainer.appendChild(arrow);
};

createArrow('prev');
createArrow('next');

// Replace original featured card with new slider
parentElement.replaceChild(sliderContainer, originalFeatured);

// Add navigation dots beneath the slider
const dotsContainer = document.createElement('div');
dotsContainer.className = 'slider-dots';
sliderContainer.parentNode.insertBefore(dotsContainer, sliderContainer.nextSibling);

// Create navigation dots
cardData.forEach((_, index) => {
  const dot = document.createElement('span');
  dot.className = index === 0 ? 'dot active' : 'dot';
  dot.addEventListener('click', () => goToSlide(index + 1)); // +1 because of the first clone
  dotsContainer.appendChild(dot);
});

// Current slide index (start at 1, which is the first real slide after the clone)
let currentSlide = 1;
let isSliding = false;

// Function to update slide position
function goToSlide(index) {
  if (isSliding) return;
  isSliding = true;

  currentSlide = index;

  // Move track to show the current slide
  sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

  // Update active dot (adjust for clones)
  const realIndex = currentSlide - 1;
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.className = i === realIndex ? 'dot active' : 'dot';
  });

  // Check if we're at a clone and need to reset
  sliderTrack.addEventListener('transitionend', handleTransitionEnd, { once: true });

  // Reset sliding flag after animation completes
  setTimeout(() => {
    isSliding = false;
  }, 600);
}

// Handle the end of a transition
function handleTransitionEnd() {
  // If we're at the last clone, reset to the first real slide
  if (currentSlide === 0) {
    resetToRealSlide(cardData.length); // Go to last real slide
  } 
  // If we're at the first clone, reset to the last real slide
  else if (currentSlide === cardData.length + 1) {
    resetToRealSlide(1); // Go to first real slide
  }
}

// Reset to a real slide without animation
function resetToRealSlide(index) {
  // Remove transition temporarily
  sliderTrack.classList.add('no-transition');
  currentSlide = index;
  sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

  // Force reflow
  sliderTrack.offsetHeight;

  // Re-enable transitions
  sliderTrack.classList.remove('no-transition');
}

// Next slide function
function nextSlide() {
  goToSlide(currentSlide + 1);
}

// Previous slide function
function prevSlide() {
  goToSlide(currentSlide - 1);
}

// Auto-rotate slides every 4 seconds
const autoRotate = setInterval(() => {
  nextSlide();
}, 4000);

// Initialize the first slide
goToSlide(1); // Start at the first real slide (after clone)

//=====================================================================
// COOKIE CONSENT FUNCTIONALITY - ADDED BELOW THE SLIDER CODE
//=====================================================================

// Create the cookie consent HTML
function createCookieConsentBanner() {
  const cookieConsent = document.createElement('div');
  cookieConsent.className = 'cookie-consent';
  cookieConsent.id = 'cookieConsent';
  
  cookieConsent.innerHTML = `
    <div class="cookie-header">
      <div class="cookie-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
          <path d="M8.5 8.5v.01"></path>
          <path d="M16 15.5v.01"></path>
          <path d="M12 12v.01"></path>
          <path d="M11 17v.01"></path>
          <path d="M7 14v.01"></path>
        </svg>
      </div>
      <h3 class="cookie-title">Cookie Notice</h3>
    </div>
    <p class="cookie-text">This website uses cookies to improve your experience. We use essential cookies to ensure the site works correctly, and analytics cookies to understand how you interact with our content.</p>
    <div class="cookie-buttons">
      <button class="cookie-button decline-button" id="declineButton">Decline</button>
      <button class="cookie-button accept-button" id="acceptButton">Accept All Cookies</button>
    </div>
    <a class="cookie-settings-link" id="cookieSettingsLink">Manage cookie preferences</a>
  `;
  
  document.body.appendChild(cookieConsent);
  return cookieConsent;
}

// Initialize the cookie consent system
function initCookieConsent() {
  // First, check if cookie banner already exists, if not create it
  let cookieConsent = document.getElementById('cookieConsent');
  if (!cookieConsent) {
    cookieConsent = createCookieConsentBanner();
  }
  
  const acceptButton = document.getElementById('acceptButton');
  const declineButton = document.getElementById('declineButton');
  const cookieSettingsLink = document.getElementById('cookieSettingsLink');

  // Function to set cookies with proper attributes
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax; Secure";
  }

  // Function to get cookie value
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Check if cookie consent is already set
  function checkConsent() {
    if (getCookie('cookieConsent') === 'accepted' || getCookie('cookieConsent') === 'declined') {
      cookieConsent.style.display = 'none';
    } else {
      cookieConsent.style.display = 'block';
    }
  }

  // Set up actual analytics cookies if consent is given
  function setupAnalyticsCookies() {
    // This would be where you initialize your analytics tools
    console.log('Analytics cookies activated.');
    
    // Example Google Analytics initialization (commented out)
    /*
    if (typeof ga === 'function') {
      ga('create', 'UA-XXXXXXXX-X', 'auto');
      ga('send', 'pageview');
    }
    */
  }
  
  // Accept cookies
  acceptButton.addEventListener('click', function() {
    setCookie('cookieConsent', 'accepted', 365); // Valid for 1 year
    setCookie('essential', 'true', 365);
    setCookie('analytics', 'true', 365);
    cookieConsent.style.display = 'none';
    setupAnalyticsCookies();
  });
  
  // Decline cookies
  declineButton.addEventListener('click', function() {
    setCookie('cookieConsent', 'declined', 365); // Valid for 1 year
    setCookie('essential', 'true', 365); // Essential cookies still needed
    setCookie('analytics', 'false', 365);
    cookieConsent.style.display = 'none';
  });
  
  // Open privacy settings
  cookieSettingsLink.addEventListener('click', function() {
    // Try to open your privacy policy page
    window.open('https://multi-games-fawn.vercel.app/page/privacy&policy', '_blank');
  });
  
  // Check consent status on page load
  checkConsent();
}

// Initialize the cookie consent system when the page is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Wait a moment before showing the cookie banner to avoid interrupting the loading process
  setTimeout(initCookieConsent, 1000);
});
// Infinite Looping Card Slider Script
// This script creates a smooth, infinitely looping horizontal card slider

// Array of card data
const cardData = [
  {
    image: "../assets/image/01.png",
    title: "Truth or Dare",
    description: "Challenge your friends with the ultimate party game!",
    link: "games.html?=01"
  },
  {
    image: "../assets/image/18.png",
    title: "Sniper Simulator",
    description: "Test your knowledge across various categories!",
    link: "quiz.html"
  },
  {
    image: "13.png",
    title: "Pixel Shooter",
    description: "Expand your vocabulary with our word puzzles!",
    link: "word.html"
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
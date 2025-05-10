// Flicker-Free Card Slider Script
// This script creates a smooth horizontal card slider

// Array of card data
const cardData = [
  {
    image: "https://i.postimg.cc/zfv3jnNr/truth.jpg",
    title: "Truth or Dare",
    description: "Challenge your friends with the ultimate party game!",
    link: "truth.html"
  },
  {
    image: "https://i.postimg.cc/PfQVzVnH/quiz.jpg",
    title: "Quiz Master",
    description: "Test your knowledge across various categories!",
    link: "quiz.html"
  },
  {
    image: "https://i.postimg.cc/L6wFhG4k/word.jpg",
    title: "Word Challenge",
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

// Clone the original card for each item in cardData
cardData.forEach((card, index) => {
  // Create a new card item
  const cardItem = originalFeatured.cloneNode(true);
  cardItem.className = 'card-slider-item ' + originalFeatured.className;

  // Update card content
  const img = cardItem.querySelector('img');
  const title = cardItem.querySelector('h3');
  const desc = cardItem.querySelector('p');
  const link = cardItem.querySelector('a.featured-btn');

  if (img) img.src = card.image;
  if (title) title.textContent = card.title;
  if (desc) desc.textContent = card.description;
  if (link) link.href = card.link;

  // Add card to track
  sliderTrack.appendChild(cardItem);
});

// Add track to container
sliderContainer.appendChild(sliderTrack);

// Add navigation arrows
const createArrow = (direction) => {
  const arrow = document.createElement('div');
  arrow.className = `slider-arrow slider-arrow-${direction}`;
  arrow.innerHTML = direction === 'prev' ? '&#10094;' : '&#10095;';
  arrow.addEventListener('click', () => {
    if (direction === 'prev') {
      goToSlide(currentSlide > 0 ? currentSlide - 1 : cardData.length - 1);
    } else {
      goToSlide(currentSlide < cardData.length - 1 ? currentSlide + 1 : 0);
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
  dot.addEventListener('click', () => goToSlide(index));
  dotsContainer.appendChild(dot);
});

// Current slide index
let currentSlide = 0;

// Function to update slide position
function goToSlide(index) {
  currentSlide = index;
  
  // Move track to show the current slide
  sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  
  // Update active dot
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.className = i === currentSlide ? 'dot active' : 'dot';
  });
}

// Auto-rotate slides every 4 seconds
const autoRotate = setInterval(() => {
  currentSlide = (currentSlide < cardData.length - 1) ? currentSlide + 1 : 0;
  goToSlide(currentSlide);
}, 4000);

// Initialize the first slide
goToSlide(0);
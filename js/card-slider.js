// Simple Card Slider Script
// This script converts your existing featured card into a slider
// Just add this script to your page and it will handle everything

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

// Current card index
let currentCard = 0;

// Get reference to the featured card
const featuredCard = document.querySelector('.featured');
const featuredImg = featuredCard.querySelector('img');
const featuredTitle = featuredCard.querySelector('h3');
const featuredDesc = featuredCard.querySelector('p');
const featuredLink = featuredCard.querySelector('a.featured-btn');

// Add a container around the featured card for slide animation
const sliderContainer = document.createElement('div');
sliderContainer.className = 'slider-container';
featuredCard.parentNode.insertBefore(sliderContainer, featuredCard);
sliderContainer.appendChild(featuredCard);

// Create a clone for the next card that will slide in
const nextCardClone = featuredCard.cloneNode(true);
nextCardClone.className = 'featured next-card';
sliderContainer.appendChild(nextCardClone);

// Update references for the next card
const nextCardImg = nextCardClone.querySelector('img');
const nextCardTitle = nextCardClone.querySelector('h3');
const nextCardDesc = nextCardClone.querySelector('p');
const nextCardLink = nextCardClone.querySelector('a.featured-btn');

// Create dots
cardData.forEach((_, index) => {
  const dot = document.createElement('span');
  dot.className = index === 0 ? 'dot active' : 'dot';
  dot.addEventListener('click', () => {
    currentCard = index;
    updateCard();
  });
  dotsContainer.appendChild(dot);
});

// Add navigation dots
const dotsContainer = document.createElement('div');
dotsContainer.className = 'slider-dots';
sliderContainer.parentNode.insertBefore(dotsContainer, sliderContainer.nextSibling);

// Add navigation arrows
const createArrow = (direction) => {
  const arrow = document.createElement('div');
  arrow.className = `slider-arrow slider-arrow-${direction}`;
  arrow.innerHTML = direction === 'prev' ? '&#10094;' : '&#10095;';
  arrow.addEventListener('click', () => {
    if (direction === 'prev') {
      currentCard = (currentCard > 0) ? currentCard - 1 : cardData.length - 1;
    } else {
      currentCard = (currentCard < cardData.length - 1) ? currentCard + 1 : 0;
    }
    updateCard();
  });
  sliderContainer.appendChild(arrow);
};

// Function to update card content with smooth sliding transition
function updateCard() {
  // Start slide transition
  featuredCard.classList.add('sliding');
  
  setTimeout(() => {
    // Update content
    featuredImg.src = cardData[currentCard].image;
    featuredTitle.textContent = cardData[currentCard].title;
    featuredDesc.textContent = cardData[currentCard].description;
    featuredLink.href = cardData[currentCard].link;
    
    // Update dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
      dot.className = index === currentCard ? 'dot active' : 'dot';
    });
    
    // Complete slide transition
    featuredCard.classList.remove('sliding');
  }, 300);
}

// Auto-rotate cards every 4 seconds
setInterval(() => {
  currentCard = (currentCard < cardData.length - 1) ? currentCard + 1 : 0;
  updateCard();
}, 4000);

// Add CSS for navigation elements and slide animation
const style = document.createElement('style');
style.textContent = `
  .slider-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    border-radius: var(--border-radius-lg, 10px);
  }
  
  .slider-container.sliding {
    pointer-events: none;
  }
  
  .featured {
    transition: transform 0.6s ease;
    margin: 0; /* Reset margin */
  }
  
  .next-card {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    transform: translateX(100%);
    z-index: 1;
  }
  
  .slider-container.slide-active .featured {
    transform: translateX(-100%);
  }
  
  .slider-container.slide-active .next-card {
    transform: translateX(0);
  }
  
  .slider-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.6);
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
    transition: opacity 0.3s ease, background 0.3s ease;
  }
  
  .slider-arrow:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.8);
  }
  
  .slider-arrow-prev {
    left: 15px;
  }
  
  .slider-arrow-next {
    right: 15px;
  }
  
  .slider-dots {
    display: flex;
    justify-content: center;
    margin-top: 15px;
  }
  
  .dot {
    width: 10px;
    height: 10px;
    background-color: #ccc;
    border-radius: 50%;
    margin: 0 5px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
  }
  
  .dot:hover {
    transform: scale(1.2);
  }
  
  .dot.active {
    background-color: var(--primary-color, #ff5722);
    transform: scale(1.2);
  }
`;
document.head.appendChild(style);
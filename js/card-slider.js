// Vertical Card Slider Script
// This script converts your existing featured card into a vertical slider
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

// Add navigation dots
const dotsContainer = document.createElement('div');
dotsContainer.className = 'slider-dots';
featuredCard.parentNode.insertBefore(dotsContainer, featuredCard.nextSibling);

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
  featuredCard.appendChild(arrow);
};

createArrow('prev');
createArrow('next');

// Function to update card content with smooth vertical sliding transition
function updateCard() {
  // Start slide transition
  featuredCard.classList.add('sliding-out');
  
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
    
    // Change to sliding in
    featuredCard.classList.remove('sliding-out');
    featuredCard.classList.add('sliding-in');
    
    // Remove sliding-in class after animation completes
    setTimeout(() => {
      featuredCard.classList.remove('sliding-in');
    }, 500);
    
  }, 500); // Wait for slide-out animation to finish
}

// Auto-rotate cards every 4 seconds
setInterval(() => {
  currentCard = (currentCard < cardData.length - 1) ? currentCard + 1 : 0;
  updateCard();
}, 4000);

// Add CSS for navigation elements and vertical slide animation
const style = document.createElement('style');
style.textContent = `
  .featured {
    transition: all 0.5s ease;
    position: relative;
    overflow: hidden;
  }
  
  .featured.sliding-out {
    transform: translateY(30px);
    opacity: 0;
  }
  
  .featured.sliding-in {
    transform: translateY(0);
    opacity: 1;
    animation: slideInFromTop 0.5s ease forwards;
  }
  
  @keyframes slideInFromTop {
    0% {
      transform: translateY(-30px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
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
`;
document.head.appendChild(style);
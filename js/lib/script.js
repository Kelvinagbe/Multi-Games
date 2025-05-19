// Add this as a separate script to your main page

// Self-executing function to avoid global scope pollution
(function() {
  // This function will run once when the page loads
  function initUrlProfileHandler() {
    const urlParams = new URLSearchParams(window.location.search);
    const showProfile = urlParams.get('profile');
    const showLogin = urlParams.get('login');
    
    // Only proceed if the profile parameter exists
    if (showProfile === 'true') {
      // Get references to your existing elements
      // Replace these with your actual element IDs
      const profileModal = document.getElementById('profileModal'); // Your modal container
      const profileIframe = document.getElementById('profileIframe'); // Your iframe
      
      // If elements exist, proceed
      if (profileModal && profileIframe) {
        // Set iframe source if needed and show modal using your existing classes/styles
        // Modify these lines to match how you currently show the modal
        profileIframe.src = 'profile.html';
        
        // Show modal - use the approach that matches your current code
        // Option 1: Using style.display
        profileModal.style.display = 'block';
        // Option 2: Using classList
        // profileModal.classList.add('show');
        // Option 3: Using a custom class
        // profileModal.classList.add('your-active-modal-class');
        
        // Handle login parameter if present
        if (showLogin === 'true') {
          // Set up onload handler for iframe to trigger login modal
          profileIframe.onload = function() {
            // Send message to iframe once it's loaded
            profileIframe.contentWindow.postMessage({
              action: 'openLoginModal'
            }, window.location.origin); // Using your own origin for security
          };
        }
      }
    }
  }

  // Run initialization when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUrlProfileHandler);
  } else {
    // DOM already loaded, run now
    initUrlProfileHandler();
  }
})(); // Execute immediately
// Diagnostic and Fixed Implementation for Main Page

// First, let's add some console logging to understand what's happening
(function() {
  console.log("URL Profile Handler script loaded");
  
  function initUrlProfileHandler() {
    console.log("Checking URL parameters...");
    const urlParams = new URLSearchParams(window.location.search);
    const showProfile = urlParams.get('profile');
    const showLogin = urlParams.get('login');
    
    console.log("URL Parameters:", {
      profile: showProfile,
      login: showLogin
    });
    
    // Only proceed if the profile parameter exists
    if (showProfile === 'true') {
      console.log("Profile parameter detected, attempting to show profile");
      
      // OPTION 1: If you're using a function to open the profile
      // Find your button that opens the profile and simulate a click
      // Uncomment and adapt the next line for your site:
      // document.querySelector('#yourProfileButton').click();
      
      // OPTION 2: If you have a modal with an iframe
      // Get references to your modal and iframe elements
      // These need to match YOUR actual element IDs:
      const profileModal = document.querySelector('#profileModal, .profile-modal'); // Try both ID and class
      const profileIframe = document.querySelector('#profileIframe, iframe[src*="profile"]'); // Try both ID and iframe with profile in src
      
      console.log("Profile elements found:", {
        modal: profileModal,
        iframe: profileIframe
      });
      
      // If both elements exist, show the modal and set up iframe
      if (profileModal && profileIframe) {
        // Set iframe source if needed
        if (!profileIframe.src || profileIframe.src === 'about:blank') {
          profileIframe.src = 'profile.html';
        }
        
        // Show modal - trying multiple approaches for compatibility
        profileModal.style.display = 'block';
        profileModal.style.visibility = 'visible';
        profileModal.style.opacity = '1';
        
        // Add any classes that might be used to show the modal
        profileModal.classList.add('show', 'active', 'visible', 'open');
        
        console.log("Profile modal should now be visible");
        
        // Handle login parameter
        if (showLogin === 'true') {
          console.log("Login parameter detected, setting up iframe onload handler");
          
          // Function to send message to iframe
          const sendLoginMessage = function() {
            console.log("Sending login message to iframe");
            try {
              profileIframe.contentWindow.postMessage({
                action: 'openLoginModal'
              }, '*'); // Using wildcard for testing
            } catch (e) {
              console.error("Error sending message to iframe:", e);
            }
          };
          
          // If iframe is already loaded, send message now
          if (profileIframe.contentDocument && 
              profileIframe.contentDocument.readyState === 'complete') {
            console.log("Iframe already loaded, sending message now");
            sendLoginMessage();
          } else {
            // Otherwise wait for iframe to load
            console.log("Setting up iframe onload handler");
            profileIframe.onload = sendLoginMessage;
          }
        }
      } else {
        console.error("Could not find profile modal or iframe elements");
      }
    }
  }

  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUrlProfileHandler);
  } else {
    // DOM already loaded, run now
    initUrlProfileHandler();
  }
  
  // Also try running after a short delay to make sure everything is loaded
  setTimeout(initUrlProfileHandler, 1000);
})();
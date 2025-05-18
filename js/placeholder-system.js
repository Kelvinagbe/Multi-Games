/**
 * Simple iFrame Loading System
 * Ensures consistent skeleton loading screens for specific pages
 */

// Global state to track active iframes
const iframeTracker = {
  loadingTimers: new Map(),
  initialized: false
};

// Initialize the loading system
function initIframeLoadingSystem() {
  if (iframeTracker.initialized) return;
  
  // Add required styles for placeholders
  addPlaceholderStyles();
  
  // Set up navigation listeners
  setupNavigationListeners();
  
  // Process existing iframes
  processExistingIframes();
  
  iframeTracker.initialized = true;
  console.log('iFrame loading system initialized');
}

// Process any existing iframes on the page
function processExistingIframes() {
  document.querySelectorAll('iframe').forEach(iframe => {
    setupFrameLoader(iframe);
  });
}

// Set up listeners for navigation and iframe creation
function setupNavigationListeners() {
  // Watch for new iframes being added to the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          // Handle direct iframe additions
          if (node.nodeName === 'IFRAME') {
            setupFrameLoader(node);
          }
          // Check for iframes inside added elements
          if (node.querySelectorAll) {
            node.querySelectorAll('iframe').forEach(iframe => {
              setupFrameLoader(iframe);
            });
          }
        });
      }
    });
  });
  
  // Start observing the entire document
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Listen for navigation events that might trigger iframe content changes
  window.addEventListener('popstate', () => triggerIframeRefresh());
  
  // For single-page applications with custom routing
  document.addEventListener('click', (e) => {
    // Check if clicking on navigation elements
    const navLink = e.target.closest('a[href], [data-nav], .nav-item, [role="tab"]');
    if (navLink) {
      // Give time for the SPA to update, then refresh iframes
      setTimeout(triggerIframeRefresh, 50);
    }
  });
}

// Trigger refresh of all iframes
function triggerIframeRefresh() {
  document.querySelectorAll('iframe').forEach(iframe => {
    // For any iframe with a src, ensure it shows loading state
    if (iframe.src && iframe.src !== 'about:blank') {
      setupFrameLoader(iframe, true);
    }
  });
}

// Set up loading system for an individual iframe
function setupFrameLoader(iframe, forceRefresh = false) {
  // Skip very small iframes that are likely not content iframes
  if (iframe.width < 50 || iframe.height < 50) return;
  
  // Get or create wrapper for proper positioning
  const wrapper = getOrCreateWrapper(iframe);
  
  // Determine what type of content this iframe contains
  const contentType = determineContentType(iframe);
  
  // Force refresh if requested
  if (forceRefresh) {
    // Remove any existing placeholders
    const existingPlaceholders = wrapper.querySelectorAll('.iframe-placeholder');
    existingPlaceholders.forEach(p => p.remove());
    
    // Clear any existing timers
    if (iframeTracker.loadingTimers.has(iframe)) {
      clearTimeout(iframeTracker.loadingTimers.get(iframe));
      iframeTracker.loadingTimers.delete(iframe);
    }
  }
  
  // Show appropriate placeholder
  showLoadingPlaceholder(wrapper, iframe, contentType);
}

// Get or create a wrapper around an iframe
function getOrCreateWrapper(iframe) {
  let wrapper = iframe.parentElement;
  
  // Create wrapper if it doesn't exist or isn't properly styled
  if (!wrapper || !wrapper.classList.contains('iframe-wrapper')) {
    wrapper = document.createElement('div');
    wrapper.classList.add('iframe-wrapper');
    wrapper.style.position = 'relative';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    
    // Place wrapper around iframe
    if (iframe.parentElement) {
      iframe.parentElement.insertBefore(wrapper, iframe);
    }
    wrapper.appendChild(iframe);
  }
  
  return wrapper;
}

// Determine content type based on iframe src or other attributes
function determineContentType(iframe) {
  const src = iframe.src || '';
  
  if (src.includes('/nav/profile')) return 'profile';
  if (src.includes('/nav/earn')) return 'earn';
  if (src.includes('/nav/categories')) return 'categories';
  
  // Check parent elements for clues if src is empty
  const parentClasses = iframe.parentElement ? iframe.parentElement.className : '';
  
  if (parentClasses.includes('profile')) return 'profile';
  if (parentClasses.includes('earn')) return 'earn';
  if (parentClasses.includes('categories')) return 'categories';
  
  return 'default';
}

// Show a loading placeholder while iframe content loads
function showLoadingPlaceholder(wrapper, iframe, contentType) {
  // Check if a placeholder already exists
  let placeholder = wrapper.querySelector('.iframe-placeholder');
  
  // Create new placeholder if needed
  if (!placeholder) {
    placeholder = document.createElement('div');
    placeholder.classList.add('iframe-placeholder');
    
    // Create content based on the type
    let placeholderContent = '';
    switch (contentType) {
      case 'profile':
        placeholderContent = createProfilePlaceholder();
        break;
      case 'earn':
        placeholderContent = createEarnPlaceholder();
        break;
      case 'categories':
        placeholderContent = createCategoriesPlaceholder();
        break;
      default:
        placeholderContent = createDefaultPlaceholder();
    }
    
    placeholder.innerHTML = placeholderContent;
    wrapper.insertBefore(placeholder, iframe);
  }
  
  // Ensure the placeholder is visible
  placeholder.style.opacity = '1';
  placeholder.style.display = 'block';
  
  // Hide the iframe until content loads
  iframe.style.opacity = '0';
  
  // Setup load event to hide placeholder when content loads
  const hideLoader = () => {
    // Fade out placeholder
    placeholder.style.opacity = '0';
    
    // Show iframe
    iframe.style.opacity = '1';
    
    // Remove placeholder after animation completes
    setTimeout(() => {
      if (placeholder.parentElement) {
        placeholder.style.display = 'none';
      }
    }, 300);
  };
  
  // Clear any existing load handlers
  iframe.onload = null;
  
  // Add new load handler
  iframe.addEventListener('load', hideLoader, { once: true });
  
  // Set a backup timer in case load event never fires
  const timerId = setTimeout(() => {
    hideLoader();
    iframeTracker.loadingTimers.delete(iframe);
  }, 5000);
  
  // Track the timer so we can cancel it if needed
  iframeTracker.loadingTimers.set(iframe, timerId);
}

// Create placeholder for categories page
function createCategoriesPlaceholder() {
  return `
    <div class="placeholder-content">
      <div class="placeholder-header"></div>
      <div class="placeholder-grid">
        ${Array(8).fill().map(() => `
          <div class="placeholder-card">
            <div class="placeholder-image"></div>
            <div class="placeholder-text"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Create placeholder for earn page
function createEarnPlaceholder() {
  return `
    <div class="placeholder-content">
      <div class="placeholder-header large"></div>
      <div class="placeholder-text long"></div>
      <div class="placeholder-text medium"></div>
      <div class="placeholder-image full"></div>
      <div class="placeholder-text long"></div>
      <div class="placeholder-text medium"></div>
    </div>
  `;
}

// Create placeholder for profile page
function createProfilePlaceholder() {
  return `
    <div class="placeholder-content">
      <div class="placeholder-profile-header">
        <div class="placeholder-avatar"></div>
        <div class="placeholder-profile-info">
          <div class="placeholder-text medium"></div>
          <div class="placeholder-text short"></div>
        </div>
      </div>
      <div class="placeholder-divider"></div>
      <div class="placeholder-list">
        ${Array(5).fill().map(() => `
          <div class="placeholder-list-item">
            <div class="placeholder-icon"></div>
            <div class="placeholder-text medium"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Create default placeholder
function createDefaultPlaceholder() {
  return `
    <div class="placeholder-content">
      <div class="placeholder-spinner">
        <div class="spinner"></div>
      </div>
      <div class="placeholder-text medium center">Loading...</div>
    </div>
  `;
}

// Add placeholder styles to the document
function addPlaceholderStyles() {
  // Check if styles already exist
  if (document.getElementById('iframe-placeholder-styles')) return;
  
  const styleEl = document.createElement('style');
  styleEl.id = 'iframe-placeholder-styles';
  styleEl.textContent = `
    .iframe-wrapper {
      position: relative;
    }
    
    .iframe-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #f8f9fa;
      z-index: 10;
      transition: opacity 0.3s ease;
      padding: 20px;
      box-sizing: border-box;
      overflow-y: auto;
    }
    
    .dark-mode .iframe-placeholder,
    body.dark-theme .iframe-placeholder {
      background-color: #121212;
    }
    
    .placeholder-content {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .placeholder-header {
      height: 30px;
      background-color: #e0e0e0;
      border-radius: 4px;
      margin-bottom: 20px;
      animation: pulse 1.5s infinite;
    }
    
    .dark-mode .placeholder-header,
    body.dark-theme .placeholder-header {
      background-color: #2a2a2a;
    }
    
    .placeholder-header.large {
      height: 40px;
    }
    
    .placeholder-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 15px;
    }
    
    .placeholder-card {
      border-radius: 8px;
      overflow: hidden;
    }
    
    .placeholder-image {
      height: 120px;
      background-color: #e0e0e0;
      margin-bottom: 10px;
      animation: pulse 1.5s infinite;
    }
    
    .dark-mode .placeholder-image,
    body.dark-theme .placeholder-image {
      background-color: #2a2a2a;
    }
    
    .placeholder-image.full {
      height: 200px;
      margin: 20px 0;
    }
    
    .placeholder-text {
      height: 15px;
      background-color: #e0e0e0;
      border-radius: 4px;
      margin-bottom: 10px;
      animation: pulse 1.5s infinite;
    }
    
    .dark-mode .placeholder-text,
    body.dark-theme .placeholder-text {
      background-color: #2a2a2a;
    }
    
    .placeholder-text.short {
      width: 30%;
    }
    
    .placeholder-text.medium {
      width: 60%;
    }
    
    .placeholder-text.long {
      width: 90%;
    }
    
    .placeholder-text.center {
      margin-left: auto;
      margin-right: auto;
      text-align: center;
    }
    
    .placeholder-profile-header {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .placeholder-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #e0e0e0;
      margin-right: 20px;
      animation: pulse 1.5s infinite;
    }
    
    .dark-mode .placeholder-avatar,
    body.dark-theme .placeholder-avatar {
      background-color: #2a2a2a;
    }
    
    .placeholder-profile-info {
      flex: 1;
    }
    
    .placeholder-divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 20px 0;
    }
    
    .dark-mode .placeholder-divider,
    body.dark-theme .placeholder-divider {
      background-color: #2a2a2a;
    }
    
    .placeholder-list {
      margin-top: 20px;
    }
    
    .placeholder-list-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .dark-mode .placeholder-list-item,
    body.dark-theme .placeholder-list-item {
      border-bottom-color: #2a2a2a;
    }
    
    .placeholder-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: #e0e0e0;
      margin-right: 15px;
      animation: pulse 1.5s infinite;
    }
    
    .dark-mode .placeholder-icon,
    body.dark-theme .placeholder-icon {
      background-color: #2a2a2a;
    }
    
    .placeholder-spinner {
      display: flex;
      justify-content: center;
      margin: 40px 0;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #007bff;
      animation: spin 1s linear infinite;
    }
    
    .dark-mode .spinner,
    body.dark-theme .spinner {
      border-color: rgba(255, 255, 255, 0.1);
      border-top-color: #4da3ff;
    }
    
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.8; }
      100% { opacity: 0.6; }
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  document.head.appendChild(styleEl);
}

// Initialize when the document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIframeLoadingSystem);
} else {
  initIframeLoadingSystem();
}

// Handle iframe navigation through URL changes
window.addEventListener('hashchange', triggerIframeRefresh);

// Force refresh on page load
window.addEventListener('load', function() {
  // Small delay to ensure everything is ready
  setTimeout(triggerIframeRefresh, 100);
});

// Expose API for manual triggering if needed
window.refreshIframeLoaders = triggerIframeRefresh;
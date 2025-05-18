/**
 * iFrame Loading System with HTML Skeletons
 * Provides content skeleton screens for specific pages
 */

// Store references to active loaders
const activeLoaders = new Map();

// Create loading placeholders for iframe content
function showIframePlaceholder(contentElement, iframe, type) {
    // Create placeholder if it doesn't exist
    let placeholder = contentElement.querySelector('.iframe-placeholder');

    if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.classList.add('iframe-placeholder');

        // Create placeholder content based on type
        let placeholderContent = '';

        switch (type) {
            case 'categories':
                placeholderContent = createCategoriesPlaceholder();
                break;
            case 'earn':
                placeholderContent = createEarnPlaceholder();
                break;
            case 'profile':
                placeholderContent = createProfilePlaceholder();
                break;
            default:
                placeholderContent = createDefaultPlaceholder();
        }

        placeholder.innerHTML = placeholderContent;
        contentElement.insertBefore(placeholder, iframe);
    }

    // Show placeholder
    placeholder.style.display = 'block';
    placeholder.style.opacity = '1';

    // Setup iframe load event to hide placeholder
    const removeLoader = () => {
        // Fade out placeholder
        placeholder.style.opacity = '0';

        // Show iframe
        iframe.style.opacity = '1';

        // Remove placeholder after animation
        setTimeout(() => {
            if (placeholder && placeholder.parentNode) {
                placeholder.style.display = 'none';
            }
        }, 300);
        
        // Remove from active loaders
        activeLoaders.delete(iframe);
    };

    // Reset iframe opacity
    iframe.style.opacity = '0';

    // Remove any existing handlers
    iframe.onload = null;

    // Handle iframe load event
    iframe.onload = removeLoader;

    // Set a timeout to remove the placeholder even if the iframe doesn't load
    const timeoutId = setTimeout(() => {
        if (placeholder && placeholder.style.display !== 'none') {
            removeLoader();
        }
    }, 5000); // 5 second timeout

    // Store reference to active loader
    activeLoaders.set(iframe, timeoutId);

    // Return cleanup function
    return () => {
        clearTimeout(timeoutId);
        iframe.onload = null;
    };
}

// Create skeleton placeholders for different content types
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

function createDefaultPlaceholder() {
    return `
        <div class="placeholder-content">
            <div class="placeholder-header"></div>
            <div class="placeholder-text long"></div>
            <div class="placeholder-text medium"></div>
            <div class="placeholder-text short"></div>
        </div>
    `;
}

// Add placeholder styles to the document
function addPlaceholderStyles() {
    if (document.getElementById('iframe-placeholder-styles')) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'iframe-placeholder-styles';
    styleEl.textContent = `
        .iframe-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #f8f9fa;
            z-index: 1;
            transition: opacity 0.3s ease;
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
        }
        
        .dark-mode .iframe-placeholder {
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
        
        .dark-mode .placeholder-header {
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
        
        .dark-mode .placeholder-image {
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
        
        .dark-mode .placeholder-text {
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
        
        .dark-mode .placeholder-avatar {
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
        
        .dark-mode .placeholder-divider {
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
        
        .dark-mode .placeholder-list-item {
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
        
        .dark-mode .placeholder-icon {
            background-color: #2a2a2a;
        }
        
        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 0.8; }
            100% { opacity: 0.6; }
        }
    `;

    document.head.appendChild(styleEl);
}

// Map our target paths to content types
const pathTypeMap = {
    'nav/profile': 'profile',
    'nav/earn': 'earn',
    'nav/categories': 'categories'
};

// Function to handle iframe loading for specific paths
function handleIframeLoading() {
    // Find the main content iframe
    const contentIframe = document.querySelector('iframe#content-frame, iframe.main-content, iframe.content-iframe');
    if (!contentIframe) return;
    
    // Check current URL to determine which type of content is loading
    const currentPath = window.location.pathname;
    let contentType = 'default';
    
    // Determine content type from path
    for (const [path, type] of Object.entries(pathTypeMap)) {
        if (currentPath.includes(path)) {
            contentType = type;
            break;
        }
    }
    
    // Ensure iframe has a positioned parent
    ensureIframeWrapper(contentIframe);
    
    // Show the placeholder
    showIframePlaceholder(contentIframe.parentElement, contentIframe, contentType);
}

// Make sure iframe has a proper wrapper for positioning
function ensureIframeWrapper(iframe) {
    if (!iframe) return;
    
    // If parent doesn't have position:relative, add it
    let parent = iframe.parentElement;
    if (parent && getComputedStyle(parent).position !== 'relative') {
        parent.style.position = 'relative';
    }
}

// Set up specific URL monitoring
function setupUrlMonitoring() {
    // Track our target links
    const targetPaths = Object.keys(pathTypeMap);
    
    // Find links that match our target paths and add click handlers
    document.querySelectorAll('a').forEach(link => {
        if (!link.hasAttribute('data-skeleton-handler')) {
            const href = link.getAttribute('href') || '';
            
            // Only process links to our target paths
            if (targetPaths.some(path => href.includes(path))) {
                link.setAttribute('data-skeleton-handler', 'true');
                
                link.addEventListener('click', function(e) {
                    // Find the main content iframe
                    const contentIframe = document.querySelector('iframe#content-frame, iframe.main-content, iframe.content-iframe');
                    if (!contentIframe) return;
                    
                    // Determine content type based on href
                    let contentType = 'default';
                    for (const [path, type] of Object.entries(pathTypeMap)) {
                        if (href.includes(path)) {
                            contentType = type;
                            break;
                        }
                    }
                    
                    // Clean up existing loader if any
                    if (activeLoaders.has(contentIframe)) {
                        clearTimeout(activeLoaders.get(contentIframe));
                    }
                    
                    // Ensure iframe has proper positioning
                    ensureIframeWrapper(contentIframe);
                    
                    // Show placeholder
                    showIframePlaceholder(contentIframe.parentElement, contentIframe, contentType);
                });
            }
        }
    });
}

// Initialize the system
function initSkeletonSystem() {
    // Add styles first
    addPlaceholderStyles();
    
    // Setup navigation tracking
    let lastHref = window.location.href;
    
    // Check URL changes
    setInterval(() => {
        if (window.location.href !== lastHref) {
            lastHref = window.location.href;
            
            // For specific paths, handle iframe loading
            for (const path of Object.keys(pathTypeMap)) {
                if (window.location.pathname.includes(path)) {
                    // Small delay to let DOM update
                    setTimeout(handleIframeLoading, 50);
                    break;
                }
            }
        }
    }, 300);
    
    // Process existing links
    setupUrlMonitoring();
    
    // Monitor for dynamically added links
    const observer = new MutationObserver(() => {
        setupUrlMonitoring();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Handle direct navigation events
    window.addEventListener('hashchange', () => {
        for (const path of Object.keys(pathTypeMap)) {
            if (window.location.pathname.includes(path)) {
                setTimeout(handleIframeLoading, 50);
                break;
            }
        }
    });
    
    // Expose global handler for manual triggering
    window.showIframeSkeleton = function(iframeSelector, type) {
        const iframe = document.querySelector(iframeSelector || 'iframe#content-frame, iframe.main-content');
        if (iframe) {
            ensureIframeWrapper(iframe);
            showIframePlaceholder(iframe.parentElement, iframe, type || 'default');
        }
    };
    
    // Check if we're already on a target path
    for (const path of Object.keys(pathTypeMap)) {
        if (window.location.pathname.includes(path)) {
            // Small delay to let DOM update
            setTimeout(handleIframeLoading, 100);
            break;
        }
    }
}

// Run the initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSkeletonSystem);
} else {
    initSkeletonSystem();
}
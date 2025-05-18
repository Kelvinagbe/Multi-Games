/**
 * iFrame Loading System with Modern HTML Skeletons
 * Provides content skeleton screens for specific pages with enhanced profile view
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
                placeholderContent = createModernProfilePlaceholder();
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

function createModernProfilePlaceholder() {
    return `
        <div class="placeholder-content profile-placeholder">
            <!-- Cover photo area -->
            <div class="placeholder-cover-photo"></div>
            
            <!-- Profile header with avatar overlay -->
            <div class="placeholder-profile-modern">
                <div class="placeholder-avatar-container">
                    <div class="placeholder-avatar-modern"></div>
                </div>
                <div class="placeholder-profile-info-modern">
                    <div class="placeholder-text large"></div>
                    <div class="placeholder-text medium"></div>
                    <div class="placeholder-stats">
                        <div class="placeholder-stat-item">
                            <div class="placeholder-stat-value"></div>
                            <div class="placeholder-stat-label"></div>
                        </div>
                        <div class="placeholder-stat-item">
                            <div class="placeholder-stat-value"></div>
                            <div class="placeholder-stat-label"></div>
                        </div>
                        <div class="placeholder-stat-item">
                            <div class="placeholder-stat-value"></div>
                            <div class="placeholder-stat-label"></div>
                        </div>
                    </div>
                </div>
                <div class="placeholder-profile-actions">
                    <div class="placeholder-button primary"></div>
                    <div class="placeholder-button"></div>
                </div>
            </div>
            
            <!-- Profile tabs navigation -->
            <div class="placeholder-tabs">
                <div class="placeholder-tab active"></div>
                <div class="placeholder-tab"></div>
                <div class="placeholder-tab"></div>
                <div class="placeholder-tab"></div>
            </div>
            
            <!-- Content section -->
            <div class="placeholder-section">
                <div class="placeholder-section-header"></div>
                <div class="placeholder-cards">
                    ${Array(3).fill().map(() => `
                        <div class="placeholder-content-card">
                            <div class="placeholder-card-image"></div>
                            <div class="placeholder-card-body">
                                <div class="placeholder-text medium"></div>
                                <div class="placeholder-text short"></div>
                                <div class="placeholder-card-meta">
                                    <div class="placeholder-meta-item"></div>
                                    <div class="placeholder-meta-item"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Sidebar widgets -->
            <div class="placeholder-sidebar">
                <div class="placeholder-widget">
                    <div class="placeholder-widget-header"></div>
                    <div class="placeholder-list">
                        ${Array(3).fill().map(() => `
                            <div class="placeholder-list-item modern">
                                <div class="placeholder-item-icon"></div>
                                <div class="placeholder-item-content">
                                    <div class="placeholder-text short"></div>
                                    <div class="placeholder-text mini"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="placeholder-widget">
                    <div class="placeholder-widget-header"></div>
                    <div class="placeholder-text medium"></div>
                    <div class="placeholder-progress"></div>
                    <div class="placeholder-text short"></div>
                </div>
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
            padding: 0;
            box-sizing: border-box;
            overflow-y: auto;
        }
        
        .dark-mode .iframe-placeholder {
            background-color: #121212;
        }
        
        .placeholder-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .placeholder-header {
            height: 30px;
            background-color: #e0e0e0;
            border-radius: 8px;
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
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
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
        
        .placeholder-text.mini {
            height: 10px;
            width: 40%;
        }
        
        .placeholder-text.large {
            height: 24px;
            width: 70%;
            margin-bottom: 15px;
        }
        
        /* Profile modern styling */
        .profile-placeholder {
            padding: 0;
        }
        
        .placeholder-cover-photo {
            height: 200px;
            background-color: #e0e0e0;
            animation: pulse 1.5s infinite;
            width: 100%;
            margin-bottom: 0;
        }
        
        .dark-mode .placeholder-cover-photo {
            background-color: #2a2a2a;
        }
        
        .placeholder-profile-modern {
            position: relative;
            padding: 20px;
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 20px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .dark-mode .placeholder-profile-modern {
            border-bottom-color: #2a2a2a;
        }
        
        .placeholder-avatar-container {
            margin-top: -50px;
            margin-right: 20px;
        }
        
        .placeholder-avatar-modern {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background-color: #e0e0e0;
            border: 4px solid #fff;
            animation: pulse 1.5s infinite;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .dark-mode .placeholder-avatar-modern {
            background-color: #2a2a2a;
            border-color: #121212;
        }
        
        .placeholder-profile-info-modern {
            flex: 1;
            padding-top: 10px;
        }
        
        .placeholder-stats {
            display: flex;
            gap: 20px;
            margin-top: 15px;
        }
        
        .placeholder-stat-item {
            flex: 1;
            max-width: 80px;
        }
        
        .placeholder-stat-value {
            height: 20px;
            width: 40px;
            background-color: #e0e0e0;
            border-radius: 4px;
            margin-bottom: 5px;
            animation: pulse 1.5s infinite;
        }
        
        .dark-mode .placeholder-stat-value {
            background-color: #2a2a2a;
        }
        
        .placeholder-stat-label {
            height: 10px;
            width: 100%;
            background-color: #e0e0e0;
            border-radius: 4px;
            animation: pulse 1.5s infinite;
        }
        
        .dark-mode .placeholder-stat-label {
            background-color: #2a2a2a;
        }
        
        .placeholder-profile-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
            align-self: flex-end;
        }
        
        .placeholder-button {
            height: 36px;
            width: 100px;
            border-radius: 18px;
            background-color: #e0e0e0;
            animation: pulse 1.5s infinite;
        }
        
        .dark-mode .placeholder-button {
            background-color: #2a2a2a;
        }
        
        .placeholder-button.primary {
            background-color: #d0d0d0;
        }
        
        .dark-mode .placeholder-button.primary {
            background-color: #3a3a3a;
        }
        
        .placeholder-tabs {
            display: flex;
            border-bottom: 1px solid #e0e0e0;
            padding: 0 20px;
            margin-bottom: 20px;
        }
        
        .dark-mode .placeholder-tabs {
            border-bottom-color: #2a2a2a;
        }
        
        .placeholder-tab {
            height: 15px;
            width: 80px;
            margin-right: 20px;
            margin-bottom: 15px;
            background-color: #e0e0e0;
            border-radius: 4px;
            animation: pulse 1.5s infinite;
        }
        
        .dark-mode .placeholder-tab {
            background-color: #2a2a2a;
        }
        
        .placeholder-tab.active {
            background-color: #d0d0d0;
        }
        
        .dark-mode .placeholder-tab.active {
            background-color: #3a3a3a;
        }
        
        .placeholder-section {
            padding: 0 20px;
            margin-bottom: 30px;
        }
        
        .placeholder-section-header {
            height: 20px;
            width: 150px;
            background-color: #e0e0e0;
            border-radius: 4px;
            margin-bottom: 20px;
            animation: pulse 1.5s infinite;
        }
        
        .dark-mode .placeholder-section-header {
            background-color: #2a2a2a;
        }
        
        .placeholder-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
        }
        
        .placeholder-content-card {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            background-color: #fff;
        }
        
        .dark-mode .placeholder-content-card {
            background-color: #1e1e1e;
            box-shadow: 0 4px 12px rgba(0,0,0,0.16);
        }
        
        .placeholder-card-image {
            height: 160px;
            background-color: #e0e0e0;
            animation: pulse 1.5s infinite;
        }
        
        .dark-mode .placeholder-card-image {
            background-color: #2a2a2a;
        }
        
        .placeholder-card-body {
            padding: 15px;
        }
        
        .placeholder-card-meta {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
        }
        
        .placeholder-meta-item {
            height: 12px;
            width: 60px;
            background-color: #e0e0e0;
            border-radius: 6px;
            animation: pulse 1.5s infinite;
        }
        
        .dark-mode .placeholder-meta-item {
            background-color: #2a2a2a;
        }
        
        .placeholder-sidebar {
            padding: 0 20px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .placeholder-widget {
            background-color: #fff;
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            margin-bottom: 20px;
        }
        
        .dark-mode .placeholder-widget {
            background-color: #1e1e1e;
            box-shadow: 0 4px 12px rgba(0,0,0,0.16);
        }
        
        .placeholder-widget-header {
            height: 18px;
            width: 120px;
            background-color: #e0e0e0;
            border-radius: 4px;
            margin-bottom: 15px;
            animation: pulse 1.5s infinite;
        }
        
        .dark-mode .placeholder-widget-header {
            background-color: #2a2a2a;
        }
        
        .placeholder-list {
            margin-top: 15px;
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
        
        .placeholder-list-item.modern {
            border-bottom: 1px solid #f0f0f0;
            padding: 10px 0;
        }
        
        .dark-mode .placeholder-list-item.modern {
            border-bottom-color: #252525;
        }
        
        .placeholder-item-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background-color: #e0e0e0;
            margin-right: 15px;
            animation: pulse 1.5s infinite;
        }
        
        .dark-mode .placeholder-item-icon {
            background-color: #2a2a2a;
        }
        
        .placeholder-item-content {
            flex: 1;
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
        
        .placeholder-progress {
            height: 8px;
            width: 100%;
            background-color: #f0f0f0;
            border-radius: 4px;
            margin: 15px 0;
            position: relative;
            overflow: hidden;
        }
        
        .dark-mode .placeholder-progress {
            background-color: #252525;
        }
        
        .placeholder-progress:before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 60%;
            background-color: #e0e0e0;
            border-radius: 4px;
            animation: pulse 1.5s infinite;
        }
        
        .dark-mode .placeholder-progress:before {
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
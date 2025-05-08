/**
 * Placeholder System for iFrame Loading
 * This script manages loading states for iframes in the application.
 */

// Creates and manages loading placeholders for iframe content
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
    
    // Setup iframe load event to hide placeholder
    const removeLoader = () => {
        // Fade out placeholder
        placeholder.style.opacity = '0';
        
        // Show iframe
        iframe.style.opacity = '1';
        
        // Remove placeholder after animation
        setTimeout(() => {
            placeholder.style.display = 'none';
        }, 300);
    };
    
    // Reset iframe opacity
    iframe.style.opacity = '0';
    
    // Handle iframe load event
    if (iframe.src && iframe.src !== 'about:blank') {
        // If iframe already has content, set up the load handler
        iframe.onload = removeLoader;
    } else {
        // If iframe src is being set for the first time
        iframe.onload = removeLoader;
    }
    
    // Set a timeout to remove the placeholder even if the iframe doesn't load
    // This prevents the placeholder from showing indefinitely on errors
    const timeoutId = setTimeout(() => {
        if (placeholder.style.display !== 'none') {
            removeLoader();
        }
    }, 5000); // 5 second timeout
    
    // Return cleanup function
    return () => {
        clearTimeout(timeoutId);
        iframe.onload = null;
    };
}

// Create placeholders for different content types
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
            <div class="placeholder-spinner">
                <div class="spinner"></div>
            </div>
            <div class="placeholder-text medium center">Loading...</div>
        </div>
    `;
}

// Add placeholder styles to the document
function addPlaceholderStyles() {
    const styleEl = document.createElement('style');
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
        
        .dark-mode .spinner {
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

// Initialize placeholder system when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    addPlaceholderStyles();
});
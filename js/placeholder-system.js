/**
 * Enhanced Placeholder System for iFrame Loading
 * Provides realistic, animated loading placeholders for earn, categories, profile sections
 * and advertisements while iframe content loads.
 */

// Creates and manages loading placeholders for iframe content
function showIframePlaceholder(contentElement, iframe, type) {
    // Create placeholder if it doesn't exist
    let placeholder = contentElement.querySelector('.content-placeholder');
    
    if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.classList.add('content-placeholder');
        
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
            case 'ad':
                placeholderContent = createAdPlaceholder();
                break;
            default:
                placeholderContent = createDefaultPlaceholder();
        }
        
        placeholder.innerHTML = placeholderContent;
        contentElement.insertBefore(placeholder, iframe);
    }
    
    // Show placeholder with animation
    placeholder.style.display = 'block';
    
    // Setup iframe load event to hide placeholder
    const removeLoader = () => {
        // Animate transition
        placeholder.classList.add('fade-out');
        iframe.classList.add('fade-in');
        
        // Remove placeholder after animation completes
        setTimeout(() => {
            placeholder.style.display = 'none';
            placeholder.classList.remove('fade-out');
        }, 400);
    };
    
    // Reset iframe opacity
    iframe.classList.remove('fade-in');
    
    // Handle iframe load event
    if (iframe.src && iframe.src !== 'about:blank') {
        // If iframe already has content, set up the load handler
        iframe.onload = removeLoader;
    } else {
        // If iframe src is being set for the first time
        iframe.onload = removeLoader;
    }
    
    // Set a timeout to remove the placeholder even if the iframe doesn't load
    const timeoutId = setTimeout(() => {
        if (placeholder.style.display !== 'none') {
            console.log('Iframe load timeout triggered, removing placeholder');
            removeLoader();
        }
    }, 6000); // 6 second timeout
    
    // Return cleanup function
    return () => {
        clearTimeout(timeoutId);
        iframe.onload = null;
    };
}

// Create an enhanced categories placeholder
function createCategoriesPlaceholder() {
    return `
        <div class="placeholder-wrapper categories-placeholder">
            <div class="placeholder-section">
                <div class="placeholder-header">
                    <div class="placeholder-title shimmer"></div>
                    <div class="placeholder-subtitle shimmer"></div>
                </div>
                
                <div class="placeholder-filters">
                    ${Array(4).fill().map(() => `
                        <div class="placeholder-filter-pill shimmer"></div>
                    `).join('')}
                </div>
                
                <div class="placeholder-grid">
                    ${Array(8).fill().map(() => `
                        <div class="placeholder-card">
                            <div class="placeholder-image shimmer"></div>
                            <div class="placeholder-card-content">
                                <div class="placeholder-card-title shimmer"></div>
                                <div class="placeholder-card-subtitle shimmer"></div>
                                <div class="placeholder-card-meta shimmer"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="placeholder-pagination">
                    <div class="placeholder-page-item shimmer"></div>
                    <div class="placeholder-page-item shimmer"></div>
                    <div class="placeholder-page-item shimmer"></div>
                    <div class="placeholder-page-item shimmer"></div>
                </div>
            </div>
        </div>
    `;
}

// Create an enhanced earn placeholder
function createEarnPlaceholder() {
    return `
        <div class="placeholder-wrapper earn-placeholder">
            <div class="placeholder-section">
                <div class="placeholder-header">
                    <div class="placeholder-title large shimmer"></div>
                    <div class="placeholder-subtitle shimmer"></div>
                </div>
                
                <div class="placeholder-stats">
                    ${Array(3).fill().map(() => `
                        <div class="placeholder-stat-card">
                            <div class="placeholder-stat-value shimmer"></div>
                            <div class="placeholder-stat-label shimmer"></div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="placeholder-earn-options">
                    ${Array(3).fill().map(() => `
                        <div class="placeholder-earn-card">
                            <div class="placeholder-earn-icon shimmer"></div>
                            <div class="placeholder-earn-content">
                                <div class="placeholder-earn-title shimmer"></div>
                                <div class="placeholder-earn-description shimmer"></div>
                                <div class="placeholder-earn-meta shimmer"></div>
                            </div>
                            <div class="placeholder-earn-reward shimmer"></div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="placeholder-graph">
                    <div class="placeholder-graph-header shimmer"></div>
                    <div class="placeholder-graph-content">
                        <div class="placeholder-graph-bars">
                            ${Array(7).fill().map((_, i) => `
                                <div class="placeholder-bar-container">
                                    <div class="placeholder-bar shimmer" style="height: ${Math.floor(30 + Math.random() * 70)}%"></div>
                                    <div class="placeholder-bar-label shimmer"></div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="placeholder-graph-legend shimmer"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Create an enhanced profile placeholder
function createProfilePlaceholder() {
    return `
        <div class="placeholder-wrapper profile-placeholder">
            <div class="placeholder-section">
                <div class="placeholder-profile-header">
                    <div class="placeholder-avatar shimmer"></div>
                    <div class="placeholder-profile-info">
                        <div class="placeholder-name shimmer"></div>
                        <div class="placeholder-username shimmer"></div>
                        <div class="placeholder-bio shimmer"></div>
                    </div>
                </div>
                
                <div class="placeholder-stats-row">
                    ${Array(4).fill().map(() => `
                        <div class="placeholder-stat">
                            <div class="placeholder-stat-value shimmer"></div>
                            <div class="placeholder-stat-label shimmer"></div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="placeholder-tabs">
                    ${Array(4).fill().map(() => `
                        <div class="placeholder-tab shimmer"></div>
                    `).join('')}
                </div>
                
                <div class="placeholder-content-section">
                    ${Array(3).fill().map(() => `
                        <div class="placeholder-profile-item">
                            <div class="placeholder-item-image shimmer"></div>
                            <div class="placeholder-item-content">
                                <div class="placeholder-item-title shimmer"></div>
                                <div class="placeholder-item-subtitle shimmer"></div>
                                <div class="placeholder-item-meta shimmer"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Create a new ad placeholder
function createAdPlaceholder() {
    return `
        <div class="placeholder-wrapper ad-placeholder">
            <div class="placeholder-ad">
                <div class="placeholder-ad-label shimmer"></div>
                <div class="placeholder-ad-content">
                    <div class="placeholder-ad-image shimmer"></div>
                    <div class="placeholder-ad-text">
                        <div class="placeholder-ad-title shimmer"></div>
                        <div class="placeholder-ad-description shimmer"></div>
                        <div class="placeholder-ad-cta shimmer"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Default placeholder for other content types
function createDefaultPlaceholder() {
    return `
        <div class="placeholder-wrapper default-placeholder">
            <div class="placeholder-spinner">
                <svg class="spinner-svg" viewBox="0 0 50 50">
                    <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
            </div>
            <div class="placeholder-loading-text shimmer">Loading content...</div>
        </div>
    `;
}

// Add enhanced placeholder styles to the document
function addPlaceholderStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        /* Base placeholder styles */
        .content-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--placeholder-bg, #f8f9fa);
            z-index: 10;
            padding: 16px;
            box-sizing: border-box;
            overflow-y: auto;
            opacity: 1;
            transition: opacity 0.4s ease-out;
        }
        
        .dark-mode .content-placeholder {
            --placeholder-bg: #121212;
            --placeholder-element-bg: #2a2a2a;
            --placeholder-highlight: #3a3a3a;
            --placeholder-text: #666;
        }
        
        /* Animation for fade transitions */
        .fade-out {
            opacity: 0;
        }
        
        .fade-in {
            opacity: 1 !important;
            transition: opacity 0.4s ease-in;
        }
        
        /* Placeholder wrapper */
        .placeholder-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Shimmer animation */
        .shimmer {
            background: linear-gradient(
                90deg, 
                var(--placeholder-element-bg, #e0e0e0) 0%, 
                var(--placeholder-highlight, #f0f0f0) 50%, 
                var(--placeholder-element-bg, #e0e0e0) 100%
            );
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
            border-radius: 4px;
        }
        
        @keyframes shimmer {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
        }
        
        /* Generic elements */
        .placeholder-section {
            margin-bottom: 24px;
        }
        
        .placeholder-header {
            margin-bottom: 24px;
        }
        
        .placeholder-title {
            height: 32px;
            width: 60%;
            margin-bottom: 12px;
        }
        
        .placeholder-title.large {
            height: 42px;
        }
        
        .placeholder-subtitle {
            height: 18px;
            width: 40%;
        }
        
        /* Categories placeholder specific */
        .placeholder-filters {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
            overflow-x: auto;
            padding-bottom: 8px;
        }
        
        .placeholder-filter-pill {
            height: 30px;
            width: 100px;
            flex-shrink: 0;
            border-radius: 15px;
        }
        
        .placeholder-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        
        .placeholder-card {
            border-radius: 8px;
            overflow: hidden;
            background-color: var(--placeholder-bg, #f8f9fa);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .placeholder-image {
            height: 140px;
            margin-bottom: 12px;
        }
        
        .placeholder-card-content {
            padding: 12px;
        }
        
        .placeholder-card-title {
            height: 20px;
            width: 80%;
            margin-bottom: 8px;
        }
        
        .placeholder-card-subtitle {
            height: 16px;
            width: 60%;
            margin-bottom: 8px;
        }
        
        .placeholder-card-meta {
            height: 14px;
            width: 40%;
        }
        
        .placeholder-pagination {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 24px;
        }
        
        .placeholder-page-item {
            width: 36px;
            height: 36px;
            border-radius: 4px;
        }
        
        /* Earn placeholder specific */
        .placeholder-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }
        
        .placeholder-stat-card {
            padding: 16px;
            border-radius: 8px;
            background-color: var(--placeholder-bg, #f8f9fa);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .placeholder-stat-value {
            height: 32px;
            width: 60%;
            margin-bottom: 8px;
        }
        
        .placeholder-stat-label {
            height: 16px;
            width: 80%;
        }
        
        .placeholder-earn-options {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 32px;
        }
        
        .placeholder-earn-card {
            display: flex;
            padding: 16px;
            border-radius: 8px;
            background-color: var(--placeholder-bg, #f8f9fa);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .placeholder-earn-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            margin-right: 16px;
            flex-shrink: 0;
        }
        
        .placeholder-earn-content {
            flex: 1;
        }
        
        .placeholder-earn-title {
            height: 20px;
            width: 70%;
            margin-bottom: 8px;
        }
        
        .placeholder-earn-description {
            height: 16px;
            width: 90%;
            margin-bottom: 8px;
        }
        
        .placeholder-earn-meta {
            height: 14px;
            width: 40%;
        }
        
        .placeholder-earn-reward {
            width: 80px;
            height: 30px;
            border-radius: 15px;
            align-self: center;
            flex-shrink: 0;
        }
        
        .placeholder-graph {
            padding: 16px;
            border-radius: 8px;
            background-color: var(--placeholder-bg, #f8f9fa);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .placeholder-graph-header {
            height: 24px;
            width: 50%;
            margin-bottom: 24px;
        }
        
        .placeholder-graph-content {
            height: 200px;
            position: relative;
        }
        
        .placeholder-graph-bars {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            height: 170px;
        }
        
        .placeholder-bar-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100%;
        }
        
        .placeholder-bar {
            width: 80%;
            border-radius: 4px 4px 0 0;
        }
        
        .placeholder-bar-label {
            width: 100%;
            height: 12px;
            margin-top: 8px;
        }
        
        .placeholder-graph-legend {
            height: 16px;
            width: 70%;
            margin-top: 16px;
        }
        
        /* Profile placeholder specific */
        .placeholder-profile-header {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
        }
        
        .placeholder-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin-right: 24px;
            flex-shrink: 0;
        }
        
        .placeholder-profile-info {
            flex: 1;
        }
        
        .placeholder-name {
            height: 28px;
            width: 40%;
            margin-bottom: 8px;
        }
        
        .placeholder-username {
            height: 20px;
            width: 30%;
            margin-bottom: 12px;
        }
        
        .placeholder-bio {
            height: 18px;
            width: 80%;
        }
        
        .placeholder-stats-row {
            display: flex;
            justify-content: space-around;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }
        
        .placeholder-stat {
            text-align: center;
            padding: 8px 16px;
        }
        
        .placeholder-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            overflow-x: auto;
            padding-bottom: 8px;
        }
        
        .placeholder-tab {
            height: 36px;
            width: 100px;
            flex-shrink: 0;
            border-radius: 4px;
        }
        
        .placeholder-content-section {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        .placeholder-profile-item {
            display: flex;
            padding: 16px;
            border-radius: 8px;
            background-color: var(--placeholder-bg, #f8f9fa);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .placeholder-item-image {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            margin-right: 16px;
            flex-shrink: 0;
        }
        
        .placeholder-item-content {
            flex: 1;
        }
        
        .placeholder-item-title {
            height: 20px;
            width: 70%;
            margin-bottom: 8px;
        }
        
        .placeholder-item-subtitle {
            height: 16px;
            width: 90%;
            margin-bottom: 8px;
        }
        
        .placeholder-item-meta {
            height: 14px;
            width: 40%;
        }
        
        /* Ad placeholder specific */
        .placeholder-ad {
            padding: 16px;
            border-radius: 8px;
            background-color: var(--placeholder-bg, #f8f9fa);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            position: relative;
        }
        
        .placeholder-ad-label {
            position: absolute;
            top: 8px;
            right: 8px;
            height: 18px;
            width: 50px;
            border-radius: 4px;
        }
        
        .placeholder-ad-content {
            display: flex;
            align-items: center;
        }
        
        .placeholder-ad-image {
            width: 120px;
            height: 120px;
            border-radius: 8px;
            margin-right: 16px;
            flex-shrink: 0;
        }
        
        .placeholder-ad-text {
            flex: 1;
        }
        
        .placeholder-ad-title {
            height: 24px;
            width: 80%;
            margin-bottom: 12px;
        }
        
        .placeholder-ad-description {
            height: 16px;
            width: 100%;
            margin-bottom: 8px;
        }
        
        .placeholder-ad-description:last-of-type {
            width: 90%;
            margin-bottom: 16px;
        }
        
        .placeholder-ad-cta {
            height: 36px;
            width: 120px;
            border-radius: 18px;
        }
        
        /* Default placeholder */
        .default-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
        }
        
        .placeholder-spinner {
            width: 50px;
            height: 50px;
            margin-bottom: 16px;
        }
        
        .spinner-svg {
            animation: spinner-rotate 2s linear infinite;
            width: 100%;
            height: 100%;
        }
        
        .spinner-path {
            stroke: var(--placeholder-text, #666);
            stroke-linecap: round;
            animation: spinner-dash 1.5s ease-in-out infinite;
        }
        
        @keyframes spinner-rotate {
            100% {
                transform: rotate(360deg);
            }
        }
        
        @keyframes spinner-dash {
            0% {
                stroke-dasharray: 1, 150;
                stroke-dashoffset: 0;
            }
            50% {
                stroke-dasharray: 90, 150;
                stroke-dashoffset: -35;
            }
            100% {
                stroke-dasharray: 90, 150;
                stroke-dashoffset: -124;
            }
        }
        
        .placeholder-loading-text {
            height: 20px;
            width: 150px;
            text-align: center;
            color: var(--placeholder-text, #666);
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .placeholder-grid {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            }
            
            .placeholder-stats {
                grid-template-columns: 1fr;
            }
            
            .placeholder-avatar {
                width: 80px;
                height: 80px;
            }
            
            .placeholder-ad-content {
                flex-direction: column;
            }
            
            .placeholder-ad-image {
                width: 100%;
                height: 160px;
                margin-right: 0;
                margin-bottom: 16px;
            }
        }
    `;
    
    document.head.appendChild(styleEl);
}

// Initialize placeholder system when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    addPlaceholderStyles();
});

// Export functions for use in other modules
export {
    showIframePlaceholder,
    addPlaceholderStyles
};
        // Updated function to check for real ad content with specified IDs
        function checkForRealAdContent(adContainerId, placeholderId) {
            const adContainer = document.getElementById(adContainerId);
            const placeholder = document.getElementById(placeholderId);
            const adElement = adContainer.querySelector('.adsbygoogle');
            
            // Check if ad has real content
            if (adElement && 
                ((adElement.offsetHeight > 10 && adElement.offsetWidth > 10) || 
                 adElement.childNodes.length > 1 ||
                 adElement.innerHTML.length > 10 ||
                 window.getComputedStyle(adElement).backgroundImage !== 'none')) {
                
                // Real ad content detected - show it and hide placeholder
                placeholder.style.display = 'none';
                adContainer.style.visibility = 'visible';
                return true;
            }
            
            // No real ad content detected yet
            return false;
        }
        
        // Set up continuous checking for ad content for a single ad unit
        function setupAdContentCheck(adContainerId, placeholderId) {
            const adContainer = document.getElementById(adContainerId);
            const adElement = adContainer.querySelector('.adsbygoogle');
            
            // Check for ad content every second
            const checkInterval = setInterval(function() {
                if (checkForRealAdContent(adContainerId, placeholderId)) {
                    // If real ad content found, stop checking
                    clearInterval(checkInterval);
                }
            }, 1000);
            
            // Set up mutation observer for more immediate detection
            if (adElement) {
                const observer = new MutationObserver(function(mutations) {
                    if (checkForRealAdContent(adContainerId, placeholderId)) {
                        observer.disconnect();
                    }
                });
                
                observer.observe(adElement, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            }
        }
        
        // Wait for page load, then start checking all ad units
        window.addEventListener('load', function() {
            // Set up checking for each ad unit
            setupAdContentCheck('adContainer1', 'adPlaceholder1');
            setupAdContentCheck('adContainer2', 'adPlaceholder2');
            setupAdContentCheck('adContainer3', 'adPlaceholder3');
            
            // Also listen for ad messages (global handler for all ads)
            window.addEventListener('message', function(e) {
                if (e.data && typeof e.data === 'string' && 
                   (e.data.indexOf('adsbygoogle') > -1 || e.data.indexOf('google_ads') > -1)) {
                    // AdSense may have sent a message - check all ad containers
                    setTimeout(function() {
                        checkForRealAdContent('adContainer1', 'adPlaceholder1');
                        checkForRealAdContent('adContainer2', 'adPlaceholder2');
                        checkForRealAdContent('adContainer3', 'adPlaceholder3');
                    }, 100);
                }
            });
        });
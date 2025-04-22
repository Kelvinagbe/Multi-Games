document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Function to sync the UI with localStorage
    function syncDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
        
        // Update the body class
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Update the toggle if it exists
        if (darkModeToggle) {
            darkModeToggle.checked = isDarkMode;
        }
    }

    // Apply saved mode initially
    syncDarkMode();

    // Toggle dark mode when checkbox changes
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            localStorage.setItem('darkMode', darkModeToggle.checked ? 'enabled' : 'disabled');
            syncDarkMode();
        });
    }
    
    // Auto sync every 3 seconds
    setInterval(syncDarkMode, 300);
});
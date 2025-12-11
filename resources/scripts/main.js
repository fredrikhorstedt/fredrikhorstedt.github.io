// Main JavaScript file for Fredrik Horstedt's website

// Initialize the website when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully');
    initializeWebsite();
});

/**
 * Initialize website functionality
 */
function initializeWebsite() {
    // Add any initialization code here
    setupNavigation();
}

/**
 * Setup navigation functionality
 */
function setupNavigation() {
    // Navigation setup code can be added here
    const nav = document.querySelector('nav');
    if (nav) {
        console.log('Navigation initialized');
    }
}

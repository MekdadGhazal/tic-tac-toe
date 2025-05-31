// Global DOM elements for js.js (primarily for index.html)
let body;
let themeToggleButton;
let playToWinButton;
let playToLoseButton;
let playRandomButton; // Added for the third mode
let channelButton;
let currentYearSpan;

// --- SVG Icons for Theme Toggle ---
const moonIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon" viewBox="0 0 16 16" role="img" aria-label="Switch to Dark Mode">  <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/></svg>`;
const sunIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brightness-high" viewBox="0 0 16 16" role="img" aria-label="Switch to Light Mode">  <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/></svg>`;

// --- Theme Management ---
function applyTheme(theme) {
    if (!body || !themeToggleButton) {
        // console.warn("Theme elements not found on this page.");
        return;
    }
    if (theme === 'dark') {
        body.classList.remove('theme-light');
        body.classList.add('dark', 'theme-dark');
        localStorage.setItem('theme', 'dark');
        themeToggleButton.innerHTML = sunIconSVG;
    } else {
        body.classList.remove('dark', 'theme-dark');
        body.classList.add('theme-light');
        localStorage.setItem('theme', 'light');
        themeToggleButton.innerHTML = moonIconSVG;
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme === 'light' ? 'dark' : 'light');
}

// --- Navigation Actions ---
function goToGamePageWithMode(mode) {
    window.location.href = `game.html?mode=${mode}`;
}

function goToChannel() {
    window.open('https://t.me/imekdad', '_blank');
}

// --- Footer Year ---
function setFooterYear() {
    if (!currentYearSpan) return;
    currentYearSpan.textContent = new Date().getFullYear();
}

// --- Event Listeners and Initializations ---
document.addEventListener('DOMContentLoaded', function() {
    body = document.body;
    themeToggleButton = document.getElementById('themeToggleButton');
    playToWinButton = document.getElementById('playToWinButton');
    playToLoseButton = document.getElementById('playToLoseButton');
    playRandomButton = document.getElementById('playRandomButton');
    channelButton = document.getElementById('channelButton');
    currentYearSpan = document.getElementById('currentYear');

    setFooterYear();

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }

    if (playToWinButton) {
        playToWinButton.addEventListener('click', () => goToGamePageWithMode('win'));
    }

    if (playToLoseButton) {
        playToLoseButton.addEventListener('click', () => goToGamePageWithMode('lose'));
    }
    
    if (playRandomButton) {
        playRandomButton.addEventListener('click', () => goToGamePageWithMode('random'));
    }

    if (channelButton) {
        channelButton.addEventListener('click', goToChannel);
    }
});

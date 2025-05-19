// Firebase Configuration and User Profile Management
const firebaseConfig = {
    apiKey: "AIzaSyBw1uA-kNKOZEufWKZ9AMBxvRGHNGF1lkA",
    authDomain: "multi-games-a2561.firebaseapp.com",
    projectId: "multi-games-a2561",
    databaseURL: "https://multi-games-a2561-default-rtdb.firebaseio.com",
    storageBucket: "multi-games-a2561.appspot.com",
    messagingSenderId: "565601932548",
    appId: "1:565601932548:web:a56d9608dd9c3af32e9751"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to auth and database
const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();

// DOM Elements
const universalModal = document.getElementById('universal-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const modalIframe = document.getElementById('modal-iframe');
const modalLoader = document.getElementById('modal-loader');
const modalClose = document.getElementById('modal-close');

// DOM Elements - User Interface
const userInitials = document.getElementById('user-initials');
const fullName = document.getElementById('full-name');
const username = document.getElementById('username');
const walletBalance = document.getElementById('wallet-balance');
const airtimeBalance = document.getElementById('airtime-balance');
const referralCode = document.getElementById('referral-code');
const referralCount = document.getElementById('referral-count');
const gamesContainer = document.getElementById('games-container');

// Button Elements
const logoutBtn = document.getElementById('logout-btn');
const settingsBtn = document.getElementById('settings-btn');
const editProfileBtn = document.getElementById('edit-profile-btn');
const shareBtn = document.getElementById('share-btn');
const withdrawBtn = document.getElementById('withdraw-btn');
const historyBtn = document.getElementById('history-btn');
const shareReferralBtn = document.getElementById('share-referral-btn');

// Global variables
let currentUser = null;
let userProfile = null;
let isAuthCheckComplete = false;

// Check authentication state when the page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
    
    // Add event listeners to buttons
    setupEventListeners();
});

// Helper function to prevent default and open a modal
function preventDefaultAndOpenModal(element, title, contentUrl) {
    if (!element) return; // Safety check
    
    element.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openModal(title, contentUrl);
    });
}

// Setup event listeners for all interactive elements
function setupEventListeners() {
    // Use utility function for all modal buttons
    preventDefaultAndOpenModal(settingsBtn, 'Settings', 'settings.html');
    preventDefaultAndOpenModal(editProfileBtn, 'Edit Profile', 'edit-profile.html');
    preventDefaultAndOpenModal(withdrawBtn, 'Withdraw Funds', 'withdrawal.html');
    preventDefaultAndOpenModal(historyBtn, 'Transaction History', 'history.html');
    
    // Special case buttons
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleLogout();
        });
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            shareProfile();
        });
    }
    
    if (shareReferralBtn) {
        shareReferralBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            shareReferralCode();
        });
    }
    
    // Modal close button
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside of it
    if (universalModal) {
        universalModal.addEventListener('click', function(event) {
            if (event.target === universalModal) {
                closeModal();
            }
        });
    }
    
    // Only prevent clicks on game items and specific buttons, not all links
    document.addEventListener('click', function(e) {
        // Only prevent default if we're logged in and the auth check is complete
        if (!isAuthCheckComplete || !currentUser) return;
        
        const target = e.target;
        // Check if the target is a game item or has a parent that is a game item
        const gameItem = target.closest('.game-item');
        if (gameItem) {
            e.preventDefault();
            e.stopPropagation();
            // Game item click is handled in addGameToUI
        }
    }, true); // Use capture phase
}

// Check if user is logged in
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        isAuthCheckComplete = true;
        
        if (user) {
            // User is signed in
            currentUser = user;
            fetchUserProfile(user.uid);
            fetchRecentGames(user.uid);
        } else {
            // User is not signed in, open login in modal instead of redirecting
            console.log("User not authenticated, opening login in modal");
            openModal('Login', '../auth/login.html');
        }
    });
}

// Fetch user profile data from Firestore
function fetchUserProfile(userId) {
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                userProfile = doc.data();
                updateProfileUI(userProfile);
            } else {
                console.log("No user profile found!");
                // Create a basic profile if none exists
                createBasicProfile(userId);
            }
        })
        .catch((error) => {
            console.error("Error fetching user profile:", error);
        });
}

// Create a basic profile if none exists
function createBasicProfile(userId) {
    const user = auth.currentUser;
    const basicProfile = {
        fullName: user.displayName || 'User',
        username: user.email ? user.email.split('@')[0] : 'user',
        walletBalance: 0,
        airtimeBalance: 0,
        referralCode: generateReferralCode(),
        referrals: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('users').doc(userId).set(basicProfile)
        .then(() => {
            console.log("Basic profile created");
            userProfile = basicProfile;
            updateProfileUI(basicProfile);
        })
        .catch((error) => {
            console.error("Error creating basic profile:", error);
        });
}

// Generate a random referral code
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'GAME';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Update UI with user profile data
function updateProfileUI(profile) {
    // Safety checks for DOM elements
    if (!fullName || !username || !userInitials || !walletBalance || 
        !airtimeBalance || !referralCode || !referralCount) {
        console.warn("Some UI elements are missing");
        return;
    }

    // Update profile info
    fullName.textContent = profile.fullName || 'User';
    username.textContent = '@' + (profile.username || 'user');
    
    // Set user initials for avatar
    if (profile.fullName) {
        const nameParts = profile.fullName.trim().split(' ');
        let initials = '';
        if (nameParts.length >= 2) {
            initials = nameParts[0].charAt(0) + nameParts[1].charAt(0);
        } else if (nameParts.length === 1) {
            initials = nameParts[0].charAt(0);
        }
        userInitials.textContent = initials.toUpperCase();
    }
    
    // Update wallet balances
    walletBalance.textContent = '$' + (profile.walletBalance || 0).toFixed(2);
    airtimeBalance.textContent = '$' + (profile.airtimeBalance || 0).toFixed(2);
    
    // Update referral info
    referralCode.textContent = profile.referralCode || 'GAMECODE';
    referralCount.textContent = profile.referrals || 0;
}

// Fetch recent games
function fetchRecentGames(userId) {
    if (!gamesContainer) {
        console.warn("Games container element not found");
        return;
    }

    const gamesRef = db.collection('user_games').doc(userId).collection('games')
        .orderBy('lastPlayed', 'desc')
        .limit(3);
    
    gamesRef.get()
        .then((snapshot) => {
            // Clear loading spinner
            gamesContainer.innerHTML = '';
            
            if (snapshot.empty) {
                gamesContainer.innerHTML = '<p style="text-align: center; padding: 20px;">No recently played games</p>';
                return;
            }
            
            snapshot.forEach((doc) => {
                const game = doc.data();
                game.id = doc.id; // Make sure game id is set
                addGameToUI(game);
            });
        })
        .catch((error) => {
            console.error("Error fetching recent games:", error);
            gamesContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Error loading games</p>';
        });
}

// Add a game to the UI
function addGameToUI(game) {
    const gameElement = document.createElement('div');
    gameElement.className = 'game-item';
    gameElement.innerHTML = `
        <div class="game-image">${game.icon || game.name.charAt(0)}</div>
        <div class="game-info">
            <div class="game-title">${game.name}</div>
            <div class="game-stats">
                <span><i class="fas fa-star"></i> ${game.rating || '4.0'}</span>
                <span><i class="fas fa-gamepad"></i> ${game.plays || '0'} plays</span>
            </div>
        </div>
    `;
    
    // Add click handler to open game in modal
    gameElement.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openModal(game.name, `game.html?id=${game.id}`);
    });
    
    gamesContainer.appendChild(gameElement);
}

// Modal Management
function openModal(title, contentUrl) {
    if (!universalModal || !modalTitle || !modalLoader || !modalIframe) {
        console.error("Modal elements not found");
        return;
    }

    modalTitle.textContent = title;
    
    // Show loader
    modalLoader.style.display = 'flex';
    modalIframe.style.display = 'none';
    
    // Show modal immediately to prevent flashing
    universalModal.classList.add('active');
    
    // Add userId to URL if it exists
    const url = new URL(contentUrl, window.location.href);
    if (currentUser) {
        url.searchParams.append('userId', currentUser.uid);
    }
    
    try {
        // Load content in iframe
        modalIframe.src = url.toString();
        
        // Set up onload handler
        modalIframe.onload = function() {
            modalLoader.style.display = 'none';
            modalIframe.style.display = 'block';
            
            // For login page, set up message listener to handle successful login
            if (contentUrl.includes('login.html')) {
                try {
                    const frameWindow = modalIframe.contentWindow;
                    
                    // Create a message event listener for login success
                    window.addEventListener('message', function loginSuccessHandler(event) {
                        // Verify origin for security
                        if (event.origin !== window.location.origin) return;
                        
                        // Check if this is a login success message
                        if (event.data && event.data.type === 'loginSuccess') {
                            console.log("Login successful, refreshing page");
                            
                            // Remove the event listener to avoid duplicates
                            window.removeEventListener('message', loginSuccessHandler);
                            
                            // Close the modal
                            closeModal();
                            
                            // Refresh the page to update the UI with the logged-in user
                            setTimeout(() => {
                                window.location.reload();
                            }, 500);
                        }
                    });
                    
                } catch (e) {
                    console.warn("Could not set up login communication:", e);
                }
            }
        };
    } catch (error) {
        console.error("Error loading modal content:", error);
        modalLoader.style.display = 'none';
        if (modalContent) {
            modalContent.innerHTML = `<p>Error loading content. Please try again.</p>`;
        }
    }
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (!universalModal || !modalIframe || !modalLoader) {
        return;
    }

    universalModal.classList.remove('active');
    
    // Re-enable body scrolling
    document.body.style.overflow = '';
    
    // Clear iframe src after transition completes
    setTimeout(() => {
        modalIframe.src = '';
        modalIframe.style.display = 'none';
        modalLoader.style.display = 'flex';
    }, 300);
}

// Share profile via navigator.share if available
function shareProfile() {
    if (!userProfile) {
        console.warn("User profile not available");
        return;
    }

    if (navigator.share) {
        navigator.share({
            title: 'Check out my gaming profile',
            text: `Check out ${userProfile.fullName}'s gaming profile on Aha Games!`,
            url: window.location.href
        })
        .catch((error) => console.log('Error sharing profile:', error));
    } else {
        alert('Copy this link to share your profile: ' + window.location.href);
    }
}

// Share referral code
function shareReferralCode() {
    if (!userProfile) {
        console.warn("User profile not available");
        return;
    }

    if (navigator.share) {
        navigator.share({
            title: 'Join me on Aha Games',
            text: `Use my referral code ${userProfile.referralCode} to join Aha Games and get a bonus!`,
            url: window.location.origin + '/signup.html?ref=' + userProfile.referralCode
        })
        .catch((error) => console.log('Error sharing referral code:', error));
    } else {
        alert('Share this referral code with your friends: ' + userProfile.referralCode);
    }
}

// Handle logout
function handleLogout() {
    auth.signOut()
        .then(() => {
            // Open login modal instead of redirecting
            console.log("User signed out successfully");
            openModal('Login', '../auth/login.html');
        })
        .catch((error) => {
            console.error("Error signing out:", error);
        });
}
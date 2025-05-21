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
const profileLoader = document.getElementById('profile-loader'); // Add this element to your HTML for loading state

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
    setupLoginSuccessHandler();
    setupEventListeners();
});

// Enhanced checkAuthState function
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        isAuthCheckComplete = true;

        if (user) {
            // User is signed in
            currentUser = user;
            
            // Check for cached data for fast UI update
            const cachedData = getCachedUserData();
            if (cachedData) {
                // Use cached data for immediate UI update
                updateProfileUI(cachedData);
            }
            
            // Always fetch fresh data from the server
            fetchUserProfile(user.uid);
            fetchRecentGames(user.uid);
        } else {
            // User is not signed in, open login in modal
            console.log("User not authenticated, opening login in modal");
            openModal('Login', '../auth/login.html');
        }
    });
}

// Login success handler for iframe communication
function setupLoginSuccessHandler() {
    window.addEventListener('message', function loginSuccessHandler(event) {
        // Verify origin for security
        if (event.origin !== window.location.origin) return;
        
        // Check if this is a login success message
        if (event.data && event.data.type === 'loginSuccess') {
            console.log("Login successful message received");
            
            if (event.data.userData) {
                console.log("User data received with login success:", event.data.userData);
                
                // Store the received user data
                const userData = event.data.userData;
                
                // We might want to update UI immediately with this data
                if (userData.uid) {
                    const basicProfile = {
                        fullName: userData.displayName || 'User',
                        username: userData.email ? userData.email.split('@')[0] : 'user',
                        uid: userData.uid,
                        email: userData.email,
                        lastLogin: new Date().toISOString()
                    };
                    
                    // Update localStorage
                    saveUserDataToLocalStorage(basicProfile);
                }
            }
            
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
}

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
    preventDefaultAndOpenModal(settingsBtn, 'Settings', 'setting/settings.html');
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

// Enhanced function to fetch user profile data
function fetchUserProfile(userId) {
    // Show loading indicator
    if (profileLoader) profileLoader.style.display = 'block';

    // First check Firestore for user profile
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                userProfile = doc.data();
                updateProfileUI(userProfile);
                
                // Also fetch real-time data from RTDB for dynamic data
                fetchRealtimeUserData(userId);
                
                // Save essential user data to localStorage for quick access
                saveUserDataToLocalStorage(userProfile);
            } else {
                console.log("No user profile found in Firestore!");
                // Try checking realtime database as fallback
                checkRealtimeDatabase(userId);
            }
        })
        .catch((error) => {
            console.error("Error fetching user profile from Firestore:", error);
            // Try checking realtime database as fallback
            checkRealtimeDatabase(userId);
        })
        .finally(() => {
            if (profileLoader) profileLoader.style.display = 'none';
        });
}

// Check the realtime database for user data
function checkRealtimeDatabase(userId) {
    rtdb.ref(`users/${userId}`).once('value')
        .then((snapshot) => {
            const rtdbUserData = snapshot.val();
            
            if (rtdbUserData) {
                console.log("Found user data in Realtime Database:", rtdbUserData);
                
                // Convert RTDB data to Firestore format
                const convertedProfile = convertRtdbToFirestoreFormat(rtdbUserData, userId);
                
                // Save to Firestore for future consistency
                migrateToFirestore(userId, convertedProfile);
                
                // Update UI with the data
                userProfile = convertedProfile;
                updateProfileUI(convertedProfile);
                
                // Save to localStorage
                saveUserDataToLocalStorage(convertedProfile);
            } else {
                console.log("No user profile found in RTDB either. Creating new profile.");
                // Create a basic profile if none exists in either database
                createBasicProfile(userId);
            }
        })
        .catch((error) => {
            console.error("Error fetching from RTDB:", error);
            // Create a basic profile as last resort
            createBasicProfile(userId);
        });
}

// Convert RTDB data format to Firestore format
function convertRtdbToFirestoreFormat(rtdbData, userId) {
    // Construct a profile object that matches your Firestore schema
    return {
        fullName: rtdbData.fullName || rtdbData.displayName || auth.currentUser.displayName || 'User',
        username: rtdbData.username || (rtdbData.email ? rtdbData.email.split('@')[0] : 'user'),
        walletBalance: parseFloat(rtdbData.walletBalance || rtdbData.balance || 0),
        airtimeBalance: parseFloat(rtdbData.airtimeBalance || 0),
        referralCode: rtdbData.referralCode || generateReferralCode(),
        referrals: parseInt(rtdbData.referrals || 0),
        email: rtdbData.email || auth.currentUser.email,
        uid: userId,
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    };
}

// Migrate user data from RTDB to Firestore
function migrateToFirestore(userId, profileData) {
    // Remove any undefined fields for Firestore
    Object.keys(profileData).forEach(key => 
        profileData[key] === undefined && delete profileData[key]
    );

    // Save to Firestore
    db.collection('users').doc(userId).set(profileData, { merge: true })
        .then(() => {
            console.log("Successfully migrated user data to Firestore");
        })
        .catch((error) => {
            console.error("Error migrating data to Firestore:", error);
        });
}

// Fetch real-time dynamic user data
function fetchRealtimeUserData(userId) {
    // Set up real-time listener for dynamic data (balance, etc.)
    rtdb.ref(`users/${userId}/walletBalance`).on('value', (snapshot) => {
        const balance = snapshot.val() || 0;
        if (userProfile) {
            userProfile.walletBalance = parseFloat(balance);
            updateWalletUI(userProfile.walletBalance);
        }
    });
    
    rtdb.ref(`users/${userId}/airtimeBalance`).on('value', (snapshot) => {
        const airtime = snapshot.val() || 0;
        if (userProfile) {
            userProfile.airtimeBalance = parseFloat(airtime);
            updateAirtimeUI(userProfile.airtimeBalance);
        }
    });
}

// Update specific wallet UI elements for real-time updates
function updateWalletUI(balance) {
    if (walletBalance) {
        walletBalance.textContent = '$' + parseFloat(balance).toFixed(2);
    }
}

// Update specific airtime UI elements for real-time updates
function updateAirtimeUI(balance) {
    if (airtimeBalance) {
        airtimeBalance.textContent = '$' + parseFloat(balance).toFixed(2);
    }
}

// Save essential user data to localStorage for quick access
function saveUserDataToLocalStorage(profile) {
    // Don't store sensitive data in localStorage
    const essentialData = {
       
        fullName: profile.fullName,
        username: profile.username,
        referralCode: profile.referralCode,
        lastUpdated: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('userProfile', JSON.stringify(essentialData));
    } catch (e) {
        console.warn("Could not save to localStorage:", e);
    }
}

// Get cached user data on page load for fast rendering
function getCachedUserData() {
    try {
        const cached = localStorage.getItem('userProfile');
        if (cached) {
            const parsedData = JSON.parse(cached);
            
            // Check if cache is recent (less than 30 minutes old)
            const lastUpdated = new Date(parsedData.lastUpdated || 0);
            const now = new Date();
            const diffMinutes = (now - lastUpdated) / (1000 * 60);
            
            if (diffMinutes < 30 && parsedData.uid === auth.currentUser.uid) {
                // Use cached data for initial UI update
                console.log("Using cached profile data");
                return parsedData;
            }
        }
    } catch (e) {
        console.warn("Error reading from localStorage:", e);
    }
    return null;
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
        email: user.email,
        uid: userId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('users').doc(userId).set(basicProfile)
        .then(() => {
            console.log("Basic profile created");
            userProfile = basicProfile;
            updateProfileUI(basicProfile);
            
            // Also save to RTDB for compatibility with existing code
            rtdb.ref(`users/${userId}`).update({
                fullName: basicProfile.fullName,
                username: basicProfile.username,
                walletBalance: basicProfile.walletBalance,
                airtimeBalance: basicProfile.airtimeBalance,
                referralCode: basicProfile.referralCode,
                referrals: basicProfile.referrals,
                email: basicProfile.email
            });
            
            // Save to localStorage
            saveUserDataToLocalStorage(basicProfile);
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
            if (contentUrl.includes('../auth/login.html')) {
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
            text: `Check out ${userProfile.fullName}'s gaming profile on Multi Games!`,
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
            title: 'Join me on Multi Games',
            text: `Use my referral code ${userProfile.referralCode} to join Multi Games and get a bonus!`,
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
            // Clean up localStorage data
            try {
                localStorage.removeItem('userProfile');
            } catch (e) {
                console.warn("Could not clear localStorage:", e);
            }
            
            // Open login modal instead of redirecting
            console.log("User signed out successfully");
            openModal('Login', '../auth/login.html');
        })
        .catch((error) => {
            console.error("Error signing out:", error);
        });
}
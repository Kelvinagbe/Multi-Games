// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    onValue, 
    update, 
    set, 
    get 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBw1uA-kNKOZEufWKZ9AMBxvRGHNGF1lkA",
    authDomain: "multi-games-a2561.firebaseapp.com",
    projectId: "multi-games-a2561",
    storageBucket: "multi-games-a2561.appspot.com",
    messagingSenderId: "150551898066",
    appId: "1:150551898066:web:4e8fb185f2321ba4140a0b",
    measurementId: "G-PB8Y87E6XV",
    databaseURL: "https://multi-games-a2561-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM Elements
const usernameEl = document.getElementById('username');
const userEmailEl = document.getElementById('user-email');
const authActionBtn = document.getElementById('auth-action-btn');
const avatarEl = document.getElementById('user-avatar');
const avatarFileInput = document.getElementById('avatar-file-input');
const walletBalanceEl = document.getElementById('wallet-balance');
const loadingOverlay = document.getElementById('loading-overlay');
const referralCodeEl = document.getElementById('referral-code');
const shareReferralCodeEl = document.getElementById('share-referral-code');
const referralInputSection = document.querySelector('.referral-input-section');
const submitReferralBtn = document.getElementById('submit-referral');
const referralCountEl = document.getElementById('referral-count');
const changeFullNameInput = document.getElementById('change-fullname');
const saveFullNameBtn = document.getElementById('save-fullname');

// Modal Elements
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const withdrawModal = document.getElementById('withdraw-modal');
const settingsModal = document.getElementById('settings-modal');
const referralModal = document.getElementById('referral-modal');
const gamePlayerModal = document.getElementById('game-player-modal'); // New game player modal

// State Variables
let currentUser = null;
let userBalance = 0;
let transactions = [];
let walletSyncInterval = null;

// Create game player modal if it doesn't exist
if (!gamePlayerModal) {
    const gamePlayerModalHTML = `
        <div id="game-player-modal" class="modal-container">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Game Player</h2>
                    <button class="back-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="iframe-container">
                        <iframe id="game-frame" frameborder="0"></iframe>
                        <div class="iframe-loader">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', gamePlayerModalHTML);
}

// Central loading indicator (not the overlay)
if (!document.getElementById('center-loader')) {
    const centerLoaderHTML = `
        <div id="center-loader" class="center-loader">
            <div class="spinner"></div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', centerLoaderHTML);
}

// Update loading overlay CSS to cover the whole screen
if (!document.getElementById('overlay-styles')) {
    const overlayStyles = document.createElement('style');
    overlayStyles.id = 'overlay-styles';
    overlayStyles.textContent = `
        #loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
    `;
    document.head.appendChild(overlayStyles);
}

// Utility Functions
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// New function to show center loader instead of overlay
function showCenterLoader() {
    const centerLoader = document.getElementById('center-loader');
    if (centerLoader) {
        centerLoader.style.display = 'flex';
    }
}

function hideCenterLoader() {
    const centerLoader = document.getElementById('center-loader');
    if (centerLoader) {
        centerLoader.style.display = 'none';
    }
}

function showNotification(title, message, duration = 3000) {
    const notification = document.getElementById('notification');
    document.getElementById('notification-title').textContent = title;
    document.getElementById('notification-message').textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, duration);
}

// Firebase User Data Management
async function initUserData(uid) {
    const userRef = ref(database, `users/${uid}`);
    
    try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            // Create new user data - without generating referral code
            // as this will be handled by the sign-in process
            await set(userRef, {
                fullName: 'GameMaster',
                airtimeBalance: 0,
                lastClaim: 0,
                referrals: 0,
                transactions: [],
                createdAt: new Date().toISOString()
            });
            
            showNotification('Account Created', 'Welcome to GameXP!');
            
            // Show referral input for new users
            if (referralInputSection) {
                referralInputSection.style.display = 'block';
            }
        }
    } catch (error) {
        console.error("Error initializing user data:", error);
        showNotification('Error', 'Failed to set up your account', 'error');
    }
}

function updateTransactionHistory(newTransactions) {
    const transactionHistoryEl = document.querySelector('.wallet-history');
    
    if (!transactionHistoryEl) {
        return;
    }
    
    if (!newTransactions || newTransactions.length === 0) {
        transactionHistoryEl.innerHTML = '<div class="no-transactions">No transactions yet</div>';
        return;
    }
    
    // Sort transactions by date (most recent first)
    const sortedTransactions = Array.isArray(newTransactions) 
        ? newTransactions.sort((a, b) => b.date - a.date)
        : Object.values(newTransactions).sort((a, b) => b.date - a.date);
    
    // Limit to only the 2 most recent transactions (changed from 3)
    const limitedTransactions = sortedTransactions.slice(0, 2);
    
    const transactionsHtml = limitedTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-details">
                <span class="transaction-type">${transaction.type}</span>
                <span class="transaction-amount ${transaction.amount > 0 ? 'credit' : 'debit'}">
                    ${transaction.amount > 0 ? '+' : ''}₦${Math.abs(transaction.amount)}
                </span>
            </div>
            <div class="transaction-meta">
                <span class="transaction-date">${new Date(transaction.date).toLocaleString()}</span>
                <span class="transaction-status ${transaction.status}">${transaction.status}</span>
            </div>
        </div>
    `).join('');
    
    transactionHistoryEl.innerHTML = transactionsHtml;
}

// Set up wallet auto-sync
function setupWalletSync() {
    // Clear any existing interval first
    if (walletSyncInterval) {
        clearInterval(walletSyncInterval);
    }
    
    // Only set up sync if user is logged in
    if (!currentUser) return;
    
    // Set up interval to sync wallet every 5 seconds
    walletSyncInterval = setInterval(async () => {
        try {
            if (!currentUser) return;
            
            // Get latest user data
            const userRef = ref(database, `users/${currentUser.uid}`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                const userData = snapshot.val();
                // Update balance if changed
                const newBalance = userData.airtimeBalance || 0;
                
                if (newBalance !== userBalance) {
                    userBalance = newBalance;
                    if (walletBalanceEl) {
                        walletBalanceEl.textContent = `Wallet: ₦${userBalance}`;
                    }
                    
                    // Update transactions if they've changed
                    if (userData.transactions) {
                        transactions = userData.transactions;
                        updateTransactionHistory(transactions);
                    }
                }
            }
        } catch (error) {
            console.error('Error syncing wallet:', error);
            // Don't show notification for background sync errors
        }
    }, 5000); // Every 5 seconds
}

// Profile Update function
async function updateProfileInfo(user) {
    try {
        showCenterLoader(); // Use center loader instead of overlay
        currentUser = user;
        
        // Get user data from Realtime Database
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        
        // If user doc doesn't exist, create it
        if (!snapshot.exists()) {
            await initUserData(user.uid);
            return; // Exit and let the auth state change trigger this function again
        }
        
        // Get user data
        const userData = snapshot.val();
        
        // Update username - use fullName instead of displayName
        let fullName = userData.fullName || user.displayName || 'GameMaster';
        
        if (usernameEl) {
            usernameEl.textContent = fullName;
        }
        
        // Update email
        if (userEmailEl) {
            userEmailEl.textContent = user.email || 'Elite Gamer';
        }
        
        // Update avatar
        if (avatarEl) {
            avatarEl.src = user.photoURL || userData.photoURL || 'https://i.postimg.cc/gJZr2MPG/images-20.jpg';
        }
        
        // Update auth action button
        if (authActionBtn) {
            authActionBtn.textContent = 'Logout';
            authActionBtn.onclick = () => {
                signOut(auth).then(() => {
                    // Reset UI after logout
                    usernameEl.textContent = 'Guest Player';
                    userEmailEl.textContent = 'Sign in to continue';
                    avatarEl.src = 'https://i.postimg.cc/gJZr2MPG/images-20.jpg';
                    walletBalanceEl.textContent = 'Wallet: ₦0';
                    referralCodeEl.textContent = 'Sign in to get code';
                    updateTransactionHistory([]);
                    
                    // Clear wallet sync interval
                    if (walletSyncInterval) {
                        clearInterval(walletSyncInterval);
                        walletSyncInterval = null;
                    }
                    
                    // Update auth button
                    authActionBtn.textContent = 'Login';
                    authActionBtn.onclick = showLoginModal;
                    
                    showNotification('Logged Out', 'Come back soon!');
                }).catch((error) => {
                    console.error('Logout error', error);
                });
            };
        }
        
        // Update wallet balance - use airtimeBalance directly
        userBalance = userData.airtimeBalance || 0;
        if (walletBalanceEl) {
            walletBalanceEl.textContent = `Wallet: ₦${userBalance}`;
        }
        
        // Set up wallet auto-sync
        setupWalletSync();
        
        // Update referral code - use the code created during sign-in
        if (referralCodeEl && shareReferralCodeEl && userData.referralCode) {
            referralCodeEl.textContent = userData.referralCode;
            shareReferralCodeEl.value = userData.referralCode;
        } else if (referralCodeEl && shareReferralCodeEl) {
            referralCodeEl.textContent = 'Code unavailable';
            shareReferralCodeEl.value = '';
        }
        
        // Update referral count
        if (referralCountEl) {
            referralCountEl.textContent = userData.referrals || 0;
        }
        
        // Update transactions
        if (userData.transactions) {
            transactions = userData.transactions;
            updateTransactionHistory(transactions);
        } else {
            transactions = [];
            updateTransactionHistory([]);
        }
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error', 'Failed to update profile information');
    } finally {
        hideCenterLoader(); // Hide center loader instead of overlay
    }
}

// Modal Functions
function showModal(modal) {
    if (modal) {
        modal.classList.add('open');
        const iframe = modal.querySelector('iframe');
        if (iframe) {
            iframe.style.display = 'block';
            
            // Show iframe loader
            const loaderInModal = modal.querySelector('.iframe-loader');
            if (loaderInModal) {
                loaderInModal.style.display = 'flex';
            }
            
            // Set iframe src based on modal
            if (modal.id === 'login-modal') {
                iframe.src = '../auth/login.html';
            } else if (modal.id === 'register-modal') {
                iframe.src = 'auth/login/signup/signup.html';
            } else if (modal.id === 'withdraw-modal') {
                iframe.src = 'withdraw.html';
            } else if (modal.id === 'game-player-modal') {
                iframe.src = 'games/played.html';
            }
        }
    }
}

function hideModal(modal) {
    if (modal) {
        modal.classList.remove('open');
        const iframe = modal.querySelector('iframe');
        if (iframe) {
            iframe.style.display = 'none';
            iframe.src = '';
        }
    }
}

function showLoginModal() {
    showModal(loginModal);
}

// Show Game Player Modal
function showGamePlayerModal(gameUrl) {
    const modal = document.getElementById('game-player-modal');
    if (modal) {
        const iframe = modal.querySelector('iframe');
        if (iframe) {
            // Set game URL if provided, otherwise use default
            iframe.src = gameUrl || 'games/game-player.html';
        }
        showModal(modal);
    }
}

// Update the settings modal to remove gender and sound toggles
document.addEventListener('DOMContentLoaded', () => {
    const settingsModalBody = settingsModal?.querySelector('.modal-body');
    if (settingsModalBody) {
        // Find and remove game sound toggle if it exists
        const soundToggleEl = settingsModalBody.querySelector('.sound-toggle-wrapper');
        if (soundToggleEl) {
            soundToggleEl.remove();
        }
        
        // Find and remove gender selection if it exists
        const genderSelectionEl = settingsModalBody.querySelector('.gender-selection');
        if (genderSelectionEl) {
            genderSelectionEl.remove();
        }
    }
});

// Full Name Change Functionality
if (saveFullNameBtn) {
    saveFullNameBtn.addEventListener('click', async () => {
        const newFullName = changeFullNameInput.value.trim();
        
        if (!newFullName) {
            showNotification('Error', 'Please enter a valid name');
            return;
        }
        
        if (!currentUser) {
            showNotification('Login Required', 'Please login to change your name');
            hideModal(settingsModal);
            showLoginModal();
            return;
        }
        
        showCenterLoader(); // Use center loader
        
        try {
            // Update fullName in the database
            await update(ref(database, `users/${currentUser.uid}`), {
                fullName: newFullName
            });
            
            if (usernameEl) {
                usernameEl.textContent = newFullName;
            }
            
            showNotification('Success', 'Name updated successfully');
            changeFullNameInput.value = ''; // Clear the input field
            hideModal(settingsModal);
            
        } catch (error) {
            console.error('Error updating name:', error);
            showNotification('Error', 'Failed to update name');
        } finally {
            hideCenterLoader(); // Hide center loader
        }
    });
}

// Avatar Upload Functionality with size restrictions
if (avatarEl && avatarFileInput) {
    const cameraIcon = document.querySelector('.avatar-upload-icon');
    
    cameraIcon.addEventListener('click', () => {
        if (!currentUser) {
            showNotification('Login Required', 'Please login to change your avatar');
            showLoginModal();
            return;
        }
        
        avatarFileInput.click();
     });
    
    avatarFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check file size (50KB max)
        const maxSizeKB = 50;
        const fileSizeKB = file.size / 1024;
        
        if (fileSizeKB > maxSizeKB) {
            showNotification('Error', `Image size exceeds ${maxSizeKB}KB limit (${Math.round(fileSizeKB)}KB)`);
            return;
        }
        
        showCenterLoader();
        
        // Create an image element to check dimensions
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.onload = () => {
                // Check dimensions (512x512 max)
                if (img.width > 512 || img.height > 512) {
                    showNotification('Error', `Image dimensions exceed 512x512px limit (${img.width}x${img.height}px)`);
                    hideCenterLoader();
                    return;
                }
                
                // All checks passed, update avatar
                avatarEl.src = e.target.result;
                
                // Save to database
                if (currentUser) {
                    update(ref(database, `users/${currentUser.uid}`), {
                        photoURL: e.target.result
                    }).then(() => {
                        showNotification('Success', 'Avatar updated successfully');
                        hideCenterLoader();
                    }).catch(error => {
                        console.error('Error updating avatar:', error);
                        showNotification('Error', 'Failed to update avatar');
                        hideCenterLoader();
                    });
                } else {
                    hideCenterLoader();
                }
            };
            
            img.onerror = () => {
                showNotification('Error', 'Invalid image file');
                hideCenterLoader();
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    });
}

// Button Click Handlers
document.getElementById('withdraw-btn').addEventListener('click', () => {
    if (!currentUser) {
        showNotification('Login Required', 'Please login to withdraw funds');
        showLoginModal();
        return;
    }
    
    if (userBalance < 100) {
        showNotification('Insufficient Balance', 'You need at least ₦100 to withdraw');
        return;
    }
    
    showModal(withdrawModal);
});

document.getElementById('play-games-btn').addEventListener('click', () => {
    if (!currentUser) {
        showNotification('Login Required', 'Please login to play games');
        showLoginModal();
        return;
    }
    
    // Use game player modal instead of redirect
    showGamePlayerModal();
});

document.getElementById('leaderboard-btn').addEventListener('click', () => {
    // Show "Coming Soon" notification for leaderboard
    showNotification('Coming Soon', 'Leaderboard feature will be available soon!');
    // window.location.href = 'leaderboard.html'; // Commented out
});

document.getElementById('achievements-btn').addEventListener('click', () => {
    if (!currentUser) {
        showNotification('Login Required', 'Please login to view achievements');
        showLoginModal();
        return;
    }
    
    // Show "Coming Soon" notification for achievements
    showNotification('Coming Soon', 'Achievements feature will be available soon!');
    // window.location.href = 'achievements.html'; // Commented out
});

document.getElementById('referral-btn').addEventListener('click', () => {
    if (!currentUser) {
        showNotification('Login Required', 'Please login to view your referral code');
        showLoginModal();
        return;
    }
    
    showModal(referralModal);
});

document.getElementById('settings-btn').addEventListener('click', () => {
    if (currentUser) {
        // Get current full name and populate the input
        const userRef = ref(database, `users/${currentUser.uid}`);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (changeFullNameInput) {
                    changeFullNameInput.value = userData.fullName || '';
                    changeFullNameInput.placeholder = userData.fullName || 'Enter your full name';
                }
            }
        }).catch((error) => {
            console.error('Error getting user data:', error);
        });
    }
    
    showModal(settingsModal);
});

document.getElementById('update-app').addEventListener('click', () => {
    // App download link or logic
    showNotification('Download Started', 'Your download will begin shortly');
    window.location.href = 'https://play.google.com/store/search?q=GameXP&c=apps';
});

// Process referral code
if (submitReferralBtn) {
    submitReferralBtn.addEventListener('click', async () => {
        const referralCode = document.getElementById('input-referral-code').value;
        
        if (!referralCode) {
            showNotification('Error', 'Please enter a referral code');
            return;
        }
        
        if (!currentUser) {
            showNotification('Login Required', 'Please login to submit a referral code');
            showLoginModal();
            return;
        }
        
        showCenterLoader(); // Use center loader
        
        try {
            // Get all users to find the referrer
            const usersRef = ref(database, 'users');
            const snapshot = await get(usersRef);
            const users = snapshot.val();
            
            let referrerFound = false;
            let referrerId = null;
            
            // Find the user with this referral code
            for (const [userId, userData] of Object.entries(users)) {
                if (userData.referralCode === referralCode && userId !== currentUser.uid) {
                    referrerId = userId;
                    referrerFound = true;
                    break;
                }
            }
            
            if (!referrerFound) {
                showNotification('Invalid Code', 'This referral code is invalid or expired');
                return;
            }

       // Check if user has already used a referral code
            const userSnapshot = await get(ref(database, `users/${currentUser.uid}`));
            const userData = userSnapshot.val();
            
            if (userData.usedReferralCode) {
                showNotification('Already Used', 'You have already used a referral code');
                return;
            }
            
            // Update referrer's stats
            const referrerRef = ref(database, `users/${referrerId}`);
            const referrerSnapshot = await get(referrerRef);
            const referrerData = referrerSnapshot.val();
            
            const referralCount = (referrerData.referrals || 0) + 1;
            const bonusAmount = 50; // ₦50 bonus for each referral
            
            // Update referrer balance and count
            await update(referrerRef, {
                airtimeBalance: (referrerData.airtimeBalance || 0) + bonusAmount,
                referrals: referralCount
            });
            
            // Add transaction to referrer
            const referrerTransactions = referrerData.transactions || [];
            referrerTransactions.push({
                type: 'Referral Bonus',
                amount: bonusAmount,
                date: Date.now(),
                status: 'completed'
            });
            
            await update(referrerRef, { transactions: referrerTransactions });

            // Mark the current user as having used a referral
            await update(ref(database, `users/${currentUser.uid}`), {
                usedReferralCode: referralCode,
                referredBy: referrerId
            });
            
            showNotification('Success', 'Referral code applied successfully!');
            referralInputSection.style.display = 'none';
            
        } catch (error) {
            console.error('Error processing referral:', error);
            showNotification('Error', 'Failed to process referral code');
        } finally {
            hideCenterLoader(); // Hide center loader
        }
    });
}

// Close modals when clicking the back button
document.querySelectorAll('.back-btn').forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal-container');
        hideModal(modal);
    });
});

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        updateProfileInfo(user);
    } else {
        // User is signed out
        currentUser = null;
        
        // Clear wallet sync interval
        if (walletSyncInterval) {
            clearInterval(walletSyncInterval);
            walletSyncInterval = null;
        }
        
        // Set default values
        if (usernameEl) usernameEl.textContent = 'Guest Player';
        if (userEmailEl) userEmailEl.textContent = 'Sign in to continue';
        if (walletBalanceEl) walletBalanceEl.textContent = 'Wallet: ₦0';
        if (referralCodeEl) referralCodeEl.textContent = 'Sign in to get code';
        if (authActionBtn) {
            authActionBtn.textContent = 'Login';
            authActionBtn.onclick = showLoginModal;
        }
        
        // Clean up transaction history
        updateTransactionHistory([]);
    }
});

// Initial setup
if (authActionBtn) {
    authActionBtn.onclick = showLoginModal;
}


// Add iframe loader functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add center loader CSS if not already added
    if (!document.getElementById('loader-styles')) {
        const style = document.createElement('style');
        style.id = 'loader-styles';
        style.textContent = `
            .iframe-container {
                position: relative;
                width: 100%;
                height: 100%;
            }
            
            .iframe-loader {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: rgba(255, 255, 255, 0.8);
                z-index: 10;
            }
            
            .center-loader {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                background-color: rgba(255, 255, 255, 0.9);
                border-radius: 0;
                padding: 20px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Get all modal containers with iframes
    const modalContainers = document.querySelectorAll('.modal-container');
    
    modalContainers.forEach(modal => {
        const iframe = modal.querySelector('iframe');
        if (iframe) {
            // Create a wrapper for the iframe if it doesn't exist
            let container = iframe.parentElement;
            if (!container.classList.contains('iframe-container')) {
                container = document.createElement('div');
                container.classList.add('iframe-container');
                iframe.parentNode.insertBefore(container, iframe);
                container.appendChild(iframe);
            }
            
            // Create the loader element if it doesn't exist
            if (!container.querySelector('.iframe-loader')) {
                const loader = document.createElement('div');
                loader.classList.add('iframe-loader');
                loader.innerHTML = '<div class="spinner"></div>';
                container.appendChild(loader);
            }
            
            // Show loader when iframe starts loading
            iframe.addEventListener('loadstart', () => {
                const loader = container.querySelector('.iframe-loader');
                if (loader) {
                    loader.style.display = 'flex';
                }
            });
            
            // Hide loader when iframe is loaded
            iframe.addEventListener('load', () => {
                const loader = container.querySelector('.iframe-loader');
                if (loader) {
                    loader.style.display = 'none';
                }
            });
        }
    });
});

// Listen for message from signup iframe to close login modal
window.addEventListener('message', (event) => {
    if (event.data?.action === 'close-login-modal') {
        hideModal(loginModal);
        showNotification('Welcome!', 'Welcome Login Successfull');
        
        // Optional: refresh user data if needed
        if (auth.currentUser) {
            updateProfileInfo(auth.currentUser);
        }
    }
});

// Initialize the modal listeners for newly created game player modal
const gamePlayerModalEl = document.getElementById('game-player-modal');
if (gamePlayerModalEl) {
    const backBtn = gamePlayerModalEl.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            hideModal(gamePlayerModalEl);
        });
    }
    
    const iframe = gamePlayerModalEl.querySelector('iframe');
    if (iframe) {
        // Show loader when iframe starts loading
        iframe.addEventListener('loadstart', () => {
            const loader = gamePlayerModalEl.querySelector('.iframe-loader');
            if (loader) {
                loader.style.display = 'flex';
            }
        });
        
        // Hide loader when iframe is loaded
        iframe.addEventListener('load', () => {
            const loader = gamePlayerModalEl.querySelector('.iframe-loader');
            if (loader) {
                loader.style.display = 'none';
            }
        });
    }
}
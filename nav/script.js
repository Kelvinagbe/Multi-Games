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

// Modal Elements
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const withdrawModal = document.getElementById('withdraw-modal');
const settingsModal = document.getElementById('settings-modal');
const referralModal = document.getElementById('referral-modal');

// State Variables
let currentUser = null;
let userBalance = 0;
let transactions = [];


// Utility Functions
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
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

// Profile Update function
async function updateProfileInfo(user) {
    try {
        showLoading();
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
        const fullName = userData.fullName || user.displayName || 'GameMaster';
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
        hideLoading();
    }
}

// Modal Functions
function showModal(modal) {
    if (modal) {
        modal.classList.add('open');
        const iframe = modal.querySelector('iframe');
        if (iframe) {
            iframe.style.display = 'block';
            
            // Set iframe src based on modal
            if (modal.id === 'login-modal') {
                iframe.src = '../auth/login.html';
            } else if (modal.id === 'register-modal') {
                iframe.src = 'auth/login/signup/signup.html';
            } else if (modal.id === 'withdraw-modal') {
                iframe.src = 'withdraw.html';
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

// Avatar Upload Functionality
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
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarEl.src = e.target.result;
                
                // Save to database - update photoURL instead of avatarURL
                if (currentUser) {
                    update(ref(database, `users/${currentUser.uid}`), {
                        photoURL: e.target.result
                    }).then(() => {
                        showNotification('Success', 'Avatar updated successfully');
                    }).catch(error => {
                        console.error('Error updating avatar:', error);
                        showNotification('Error', 'Failed to update avatar');
                    });
                }
            };
            reader.readAsDataURL(file);
        }
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
    
    // Redirect to games page
    window.location.href = 'games.html';
});

document.getElementById('leaderboard-btn').addEventListener('click', () => {
    window.location.href = 'leaderboard.html';
});

document.getElementById('achievements-btn').addEventListener('click', () => {
    if (!currentUser) {
        showNotification('Login Required', 'Please login to view achievements');
        showLoginModal();
        return;
    }
    
    window.location.href = 'achievements.html';
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
        
        showLoading();
        
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
            hideLoading();
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
    // Create styles for the loader
    const style = document.createElement('style');
    style.textContent = `
        .iframe-container {
            position: relative;
        }
        
        .iframe-loader {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
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
            
            // Create the loader element
            const loader = document.createElement('div');
            loader.classList.add('iframe-loader');
            loader.innerHTML = '<div class="spinner"></div>';
            container.appendChild(loader);
            
            // Show loader when iframe starts loading
            iframe.addEventListener('loadstart', () => {
                loader.style.display = 'flex';
            });
            
            // Hide loader when iframe is loaded
            iframe.addEventListener('load', () => {
                loader.style.display = 'none';
            });
            
            // Also handle iframe src changes (for modal openings)
            const originalShowModal = window.showModal;
            if (typeof originalShowModal === 'function') {
                window.showModal = function(modal) {
                    originalShowModal(modal);
                    const frameInModal = modal.querySelector('iframe');
                    if (frameInModal && frameInModal.style.display === 'block') {
                        const loaderInModal = modal.querySelector('.iframe-loader');
                        if (loaderInModal) {
                            loaderInModal.style.display = 'flex';
                        }
                    }
                };
            }
        }
    });
    
    // Override the showModal function to ensure loaders appear
    const originalShowModal = window.showModal;
    if (typeof originalShowModal === 'function') {
        window.showModal = function(modal) {
            if (modal) {
                modal.classList.add('open');
                const iframe = modal.querySelector('iframe');
                if (iframe) {
                    iframe.style.display = 'block';
                    
                    const loaderInModal = modal.querySelector('.iframe-loader');
                    if (loaderInModal) {
                        loaderInModal.style.display = 'flex';
                    }
                    
                    // Set iframe src based on modal
                    if (modal.id === 'login-modal') {
                        iframe.src = 'auth/login/login.html';
                    } else if (modal.id === 'register-modal') {
                        iframe.src = 'auth/login/signup/signup.html';
                    } else if (modal.id === 'withdraw-modal') {
                        iframe.src = 'withdraw.html';
                    }
                }
            }
        };
    }
});

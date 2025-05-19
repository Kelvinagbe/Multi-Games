
// Firebase Configuration and Authentication Script
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    child,
    update,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// Initialize Firebase with minimal client config
// The API key is still needed for client SDK, but we'll use it only for authentication
// Other sensitive operations will go through our API
const firebaseConfig = {
  apiKey: "AIzaSyBw1uA-kNKOZEufWKZ9AMBxvRGHNGF1lkA",
  authDomain: "multi-games-a2561.firebaseapp.com",
  databaseURL: "https://multi-games-a2561-default-rtdb.firebaseio.com",
  projectId: "multi-games-a2561",
  storageBucket: "multi-games-a2561.firebasestorage.app",
  messagingSenderId: "150551898066",
  appId: "1:150551898066:web:4e8fb185f2321ba4140a0b",
  measurementId: "G-PB8Y87E6XV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// API endpoint for secure operations
const API_ENDPOINT = "/api/auth";

// DOM Elements - same as your original script
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const googleLoginBtn = document.getElementById('google-login');
const facebookLoginBtn = document.getElementById('facebook-login');
const forgotPasswordLink = document.getElementById('forgot-password');
const loadingOverlay = document.getElementById('loading-overlay');
const notification = document.getElementById('notification');
const notificationTitle = document.getElementById('notification-title');
const notificationMessage = document.getElementById('notification-message');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const verificationBar = document.getElementById('verification-bar');
const verifiedBadge = document.getElementById('verified-badge');
const fullNameInput = document.getElementById('full-name');
const usernameInput = document.getElementById('username');
const referralCodeInput = document.getElementById('referral-code');
const form = document.getElementById('login-form');
const successMessage = document.getElementById('success-message');

// Anti-spam verification setup - same as your original script
const verificationTime = 17; // seconds
let verificationProgress = 0;
let verificationInterval;
let isVerified = false;

// Verification functions - same as your original script
function startVerification() {
    verificationProgress = 0;
    verificationBar.style.width = '0%';
    verifiedBadge.style.display = 'none';
    loginBtn.disabled = true;
    
    const intervalTime = 100; // update every 100ms
    const increment = 100 / (verificationTime * 10); // 100% spread over 17 seconds with 10 updates per second
    
    verificationInterval = setInterval(() => {
        verificationProgress += increment;
        verificationBar.style.width = Math.min(verificationProgress, 100) + '%';
        
        if (verificationProgress >= 100) {
            completeVerification();
        }
    }, intervalTime);
}

function completeVerification() {
    clearInterval(verificationInterval);
    verificationBar.style.width = '100%';
    document.querySelector('.verification-text').style.display = 'none';
    verifiedBadge.style.display = 'flex';
    loginBtn.disabled = false;
    isVerified = true;
}

// Reset verification on page load
startVerification();

// Field validation - same as your original script
emailInput.addEventListener('input', () => {
    validateEmail();
});

passwordInput.addEventListener('input', () => {
    validatePassword();
});

function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        emailError.textContent = "Email is required";
        emailError.style.display = 'block';
        return false;
    } else if (!emailRegex.test(email)) {
        emailError.textContent = "Please enter a valid email address";
        emailError.style.display = 'block';
        return false;
    } else {
        emailError.style.display = 'none';
        return true;
    }
}

function validatePassword() {
    const password = passwordInput.value;
    
    if (!password) {
        passwordError.textContent = "Password is required";
        passwordError.style.display = 'block';
        return false;
    } else if (password.length < 6) {
        passwordError.textContent = "Password must be at least 6 characters";
        passwordError.style.display = 'block';
        return false;
    } else {
        passwordError.style.display = 'none';
        return true;
    }
}

// Generate unique referral code for new users - same as your original script
function generateReferralCode(email, userId) {
    const emailPrefix = email.split('@')[0].substring(0, 4).toUpperCase();
    const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
    const userIdPortion = userId.substring(0, 3).toUpperCase();
    
    return `${emailPrefix}${randomChars}${userIdPortion}`;
}

// Secure user profile update via API
async function updateUserProfile(userId, userData) {
    try {
        // Get current user's ID token
        const idToken = await auth.currentUser.getIdToken();
        
        // Call our secure API to update user profile
        const response = await fetch(`${API_ENDPOINT}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                action: 'updateProfile',
                payload: {
                    userId: userId,
                    userData: userData
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update profile');
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}

// Check if user is already logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Update last login via API instead of direct database access
            await updateUserProfile(user.uid, {
                lastLogin: new Date().toISOString()
            });
            
            // Show success message and notify parent to close modal
            if (form) form.style.display = 'none';
            if (successMessage) successMessage.style.display = 'block';
            
            // Send message to parent to close login modal
            window.parent.postMessage({ action: 'close-login-modal' }, '*');
        } catch (error) {
            console.error("Error updating login timestamp:", error);
            // Still close modal even if update fails
            window.parent.postMessage({ action: 'close-login-modal' }, '*');
        }
    }
});

// Login with Email and Password
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!isVerified) {
        showNotification("Error", "Please wait for device verification to complete", true);
        return;
    }
    
    if (!validateEmail() || !validatePassword()) {
        return; // Don't proceed if validation fails
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Show loading
    showLoading();
    
    try {
        // Sign in with email and password - this is still direct to Firebase Auth
        // This is acceptable because we're only using Firebase Auth service here
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update last login timestamp via our secure API
        await updateUserProfile(user.uid, {
            lastLogin: new Date().toISOString()
        });
        
        hideLoading();
        
        // Show success message and notify parent to close modal
        if (form) form.style.display = 'none';
        if (successMessage) successMessage.style.display = 'block';
        
        // Send message to parent to close login modal
        window.parent.postMessage({ action: 'close-login-modal' }, '*');
    } catch (error) {
        hideLoading();
        
        // Handle errors
        let errorMessage = "Failed to sign in. Please check your credentials.";
        if (error.code === 'auth/user-not-found') {
            errorMessage = "No account found with this email. Please sign up.";
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = "Incorrect password. Please try again.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Invalid email format. Please enter a valid email.";
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = "Too many unsuccessful login attempts. Please try again later.";
        }
        
        // Show error notification
        showNotification("Error", errorMessage, true);
    }
});

// Google Sign In
googleLoginBtn.addEventListener('click', () => {
    if (!isVerified) {
        showNotification("Error", "Please wait for device verification to complete", true);
        return;
    }
    
    const provider = new GoogleAuthProvider();
    signInWithSocialProvider(provider, 'Google');
});

// Facebook Sign In
facebookLoginBtn.addEventListener('click', () => {
    if (!isVerified) {
        showNotification("Error", "Please wait for device verification to complete", true);
        return;
    }
    
    const provider = new FacebookAuthProvider();
    signInWithSocialProvider(provider, 'Facebook');
});

// Social Sign In Function
async function signInWithSocialProvider(provider, providerName) {
    showLoading();
    
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if this is a new user
        const isNewUser = result._tokenResponse.isNewUser;
        
        if (isNewUser) {
            // Create user profile via our secure API
            await createUserProfile(user);
        } else {
            // Update last login for existing user via our secure API
            await updateUserProfile(user.uid, {
                lastLogin: new Date().toISOString()
            });
        }
        
        hideLoading();
        
        // Show success message and notify parent to close modal
        if (form) form.style.display = 'none';
        if (successMessage) successMessage.style.display = 'block';
        
        // Send message to parent to close login modal
        window.parent.postMessage({ action: 'close-login-modal' }, '*');
    } catch (error) {
        hideLoading();
        
        // Handle errors
        let errorMessage = `Failed to sign in with ${providerName}. Please try again.`;
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = `${providerName} sign-in was cancelled. Please try again.`;
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = `An account already exists with the same email address but different sign-in credentials.`;
        }
        
        // Show error notification
        showNotification("Error", errorMessage, true);
    }
}

// Create user profile via API instead of direct database access
async function createUserProfile(user) {
    try {
        // Generate a unique referral code for the user
        const referralCode = generateReferralCode(user.email, user.uid);
        
        // Get full name and username if available
        const fullName = (fullNameInput && fullNameInput.value.trim()) || user.displayName || '';
        const username = (usernameInput && usernameInput.value.trim()) || user.email.split('@')[0];
        const referredBy = (referralCodeInput && referralCodeInput.value.trim()) || null;
        
        // Get photo URL or use default avatar
        const photoURL = user.photoURL || 'assets/default-avatar.png';
        
        // Set comprehensive user data
        const userData = {
            email: user.email,
            fullName: fullName,
            username: username,
            photoURL: photoURL,
            walletBalance: 0,
            createdAt: new Date().toISOString(),
            dateJoined: new Date().toISOString().split('T')[0],
            lastLogin: new Date().toISOString(),
            referralCode: referralCode,
            referredBy: referredBy,
            referrals: 0,
            airtimeBalance: 0,
            airtimeScore: 0
        };
        
        // Get ID token for authorization
        const idToken = await user.getIdToken();
        
        // Call our secure API to create the user profile
        const response = await fetch(`${API_ENDPOINT}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                action: 'createProfile',
                payload: {
                    userId: user.uid,
                    userData: userData
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create profile');
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
}

// Forgot Password
forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (!email) {
        showNotification("Error", "Please enter your email address in the email field.", true);
        emailInput.focus();
        return;
    }
    
    showLoading();
    
    try {
        // This operation can stay with Firebase Auth client
        await sendPasswordResetEmail(auth, email);
        hideLoading();
        showNotification("Success", "Password reset email sent. Please check your inbox.", false);
    } catch (error) {
        hideLoading();
        
        let errorMessage = "Failed to send password reset email. Please try again.";
        if (error.code === 'auth/user-not-found') {
            errorMessage = "No account found with this email address.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Invalid email format. Please enter a valid email.";
        }
        
        showNotification("Error", errorMessage, true);
    }
});

// Helper functions
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function showNotification(title, message, isError = false) {
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    // Add or remove error class
    if (isError) {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }
    
    // Show notification
    notification.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

console.log("Enhanced script loaded with secure API integration!");
// Firebase Authentication Client Script
// This script should be included in your login form page

// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Firebase Configuration - Move this to environment variables in production
// For frontend, use a config that only contains public data
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "your-api-key",
    authDomain: "multi-games-a2561.firebaseapp.com",
    projectId: "multi-games-a2561",
    storageBucket: "multi-games-a2561.appspot.com",
    messagingSenderId: "150551898066",
    appId: "1:150551898066:web:4e8fb185f2321ba4140a0b",
    databaseURL: "https://multi-games-a2561-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
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

// Anti-spam verification setup
const verificationTime = 17; // seconds
let verificationProgress = 0;
let verificationInterval;
let isVerified = false;

// Start verification process
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

// Complete verification
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

// Field validation
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

// Check if user is already logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Get the ID token
            const idToken = await user.getIdToken();
            
            // Update last login via server API instead of direct DB access
            await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    action: 'updateLogin',
                    payload: {
                        userId: user.uid
                    }
                })
            });
            
            // Success handling - close modal
            if (form) form.style.display = 'none';
            if (successMessage) successMessage.style.display = 'block';
            
            // Send message to parent to close login modal
            window.parent.postMessage({ action: 'close-login-modal' }, '*');
            
        } catch (error) {
            console.error("Error updating login:", error);
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
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get ID token
        const idToken = await user.getIdToken();
        
        // Update last login via server API
        await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                action: 'updateLogin',
                payload: {
                    userId: user.uid
                }
            })
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
        
        // Get ID token
        const idToken = await user.getIdToken();
        
        // Check if this is a new user
        const isNewUser = result._tokenResponse.isNewUser;
        
        if (isNewUser) {
            // Get full name and username
            const fullName = (fullNameInput && fullNameInput.value.trim()) || user.displayName || '';
            const username = (usernameInput && usernameInput.value.trim()) || user.email.split('@')[0];
            const referredBy = (referralCodeInput && referralCodeInput.value.trim()) || null;
            
            // Create user profile via server API
            await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    action: 'createProfile',
                    payload: {
                        userId: user.uid,
                        userData: {
                            email: user.email,
                            fullName: fullName,
                            username: username,
                            photoURL: user.photoURL || 'assets/default-avatar.png',
                            walletBalance: 0,
                            dateJoined: new Date().toISOString().split('T')[0],
                            referredBy: referredBy,
                            referrals: 0,
                            airtimeBalance: 0,
                            airtimeScore: 0
                        }
                    }
                })
            });
        } else {
            // Update last login for existing user
            await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    action: 'updateLogin',
                    payload: {
                        userId: user.uid
                    }
                })
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

// Show loading overlay
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Show notification
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

console.log("Secure Firebase authentication loaded!");
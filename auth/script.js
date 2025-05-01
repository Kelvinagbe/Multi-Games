// Enhanced Firebase Authentication Client Code
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "firebase/auth";

// Initialize Firebase with the complete client config
const firebaseConfig = {
    apiKey: "AIzaSyBw1uA-kNKOZEufWKZ9AMBxvRGHNGF1lkA",
    authDomain: "multi-games-a2561.firebaseapp.com",
    projectId: "multi-games-a2561",
    databaseURL: "https://multi-games-a2561-default-rtdb.firebaseio.com",
    storageBucket: "multi-games-a2561.appspot.com",
    messagingSenderId: "150551898066",
    appId: "1:150551898066:web:4e8fb185f2321ba4140a0b",
    measurementId: "G-PB8Y87E6XV"
};

// API endpoint for secure backend operations
const API_ENDPOINT = "/api/auth";

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

// Verification functions
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

// Generate unique referral code
function generateReferralCode(email, userId) {
    const emailPrefix = email.split('@')[0].substring(0, 4).toUpperCase();
    const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
    const userIdPortion = userId.substring(0, 3).toUpperCase();
    
    return `${emailPrefix}${randomChars}${userIdPortion}`;
}

// API helper function for secure operations
async function callSecureApi(action, payload, idToken = null) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add authorization if token is provided
        if (idToken) {
            headers['Authorization'] = `Bearer ${idToken}`;
        }
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ action, payload })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API error (${action}):`, error);
        throw error;
    }
}

// Check if user is already logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Get ID token for API authentication
            const idToken = await user.getIdToken();
            
            // Update last login via secure API
            await callSecureApi('updateLogin', { userId: user.uid }, idToken);
            
            // Show success message and notify parent to close modal
            if (form) form.style.display = 'none';
            if (successMessage) successMessage.style.display = 'block';
            
            // Send message to parent to close login modal
            window.parent.postMessage({ action: 'close-login-modal', userId: user.uid }, '*');
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
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get ID token for API authentication
        const idToken = await user.getIdToken();
        
        // Update last login via secure API
        await callSecureApi('updateLogin', { userId: user.uid }, idToken);
        
        hideLoading();
        
        // Show success message and notify parent to close modal
        if (form) form.style.display = 'none';
        if (successMessage) successMessage.style.display = 'block';
        
        // Send message to parent to close login modal
        window.parent.postMessage({ action: 'close-login-modal', userId: user.uid }, '*');
    } catch (error) {
        hideLoading();
        console.error("Authentication error:", error);
        
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

// Sign Up with Email and Password (if needed)
// This function can be used if you have a sign-up form
async function signUpWithEmailPassword(email, password, userData) {
    try {
        // Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get ID token for API authentication
        const idToken = await user.getIdToken();
        
        // Create user profile via secure API
        await callSecureApi('createProfile', {
            userId: user.uid,
            userData: {
                ...userData,
                email: user.email,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            }
        }, idToken);
        
        return user;
    } catch (error) {
        console.error("Sign up error:", error);
        throw error;
    }
}

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
        const isNewUser = result._tokenResponse.isNewUser;
        
        // Get ID token for API authentication
        const idToken = await user.getIdToken();
        
        if (isNewUser) {
            // For new users, prepare profile data
            const fullName = (fullNameInput && fullNameInput.value.trim()) || user.displayName || '';
            const username = (usernameInput && usernameInput.value.trim()) || user.email.split('@')[0];
            const referredBy = (referralCodeInput && referralCodeInput.value.trim()) || null;
            const referralCode = generateReferralCode(user.email, user.uid);
            const photoURL = user.photoURL || 'assets/default-avatar.png';
            
            // Create user profile via secure API
            await callSecureApi('createProfile', {
                userId: user.uid,
                userData: {
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
                }
            }, idToken);
        } else {
            // Update last login for existing users
            await callSecureApi('updateLogin', { userId: user.uid }, idToken);
        }
        
        hideLoading();
        
        // Show success message and notify parent to close modal
        if (form) form.style.display = 'none';
        if (successMessage) successMessage.style.display = 'block';
        
        // Send message to parent to close login modal
        window.parent.postMessage({ action: 'close-login-modal', userId: user.uid }, '*');
    } catch (error) {
        hideLoading();
        console.error(`${providerName} sign-in error:`, error);
        
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
        // Firebase Auth password reset (client-side is fine for this operation)
        await sendPasswordResetEmail(auth, email);
        hideLoading();
        showNotification("Success", "Password reset email sent. Please check your inbox.", false);
    } catch (error) {
        hideLoading();
        console.error("Password reset error:", error);
        
        let errorMessage = "Failed to send password reset email. Please try again.";
        if (error.code === 'auth/user-not-found') {
            errorMessage = "No account found with this email address.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Invalid email format. Please enter a valid email.";
        }
        
        showNotification("Error", errorMessage, true);
    }
});

// Sign out function
async function signOutUser() {
    try {
        await signOut(auth);
        console.log("User signed out successfully");
        // Additional sign-out logic here
    } catch (error) {
        console.error("Sign out error:", error);
    }
}

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

// Export functions that might be needed elsewhere
export {
    auth,
    signOutUser,
    signInWithEmailAndPassword,
    signUpWithEmailPassword,
    onAuthStateChanged
};

console.log("Enhanced Firebase Authentication client loaded!");
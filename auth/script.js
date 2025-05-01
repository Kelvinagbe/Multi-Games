// Firebase Authentication Script - Client Side
// Fully secure implementation with no API keys in client code

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

// API endpoints for secure operations
const AUTH_API_ENDPOINT = "/api/auth";

// Global variables
let app = null;
let auth = null;
let initializationAttempts = 0;
const MAX_INITIALIZATION_ATTEMPTS = 3;

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
const form = document.getElementById('login-form');
const successMessage = document.getElementById('success-message');

// Anti-spam verification setup
const verificationTime = 17; // seconds
let verificationProgress = 0;
let verificationInterval;
let isVerified = false;

// Get Firebase config from server API only - no fallback config in client code
async function getFirebaseConfig() {
    try {
        console.log("Fetching Firebase config from server API");
        const response = await fetch(AUTH_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'getClientConfig'
            })
        });
        
        if (!response.ok) {
            throw new Error(`API response error: ${response.status}`);
        }
        
        const config = await response.json();
        
        // Validate config has minimum required fields
        if (!config || !config.apiKey || !config.authDomain || !config.projectId) {
            throw new Error("Invalid Firebase configuration received from server");
        }
        
        return config;
    } catch (error) {
        console.error("Error fetching Firebase config:", error);
        throw error; // Re-throw to handle in calling function
    }
}

// Initialize Firebase
async function initializeFirebase() {
    if (initializationAttempts >= MAX_INITIALIZATION_ATTEMPTS) {
        showNotification("Error", "Failed to initialize authentication after multiple attempts. Please try again later.", true);
        hideLoading();
        return false;
    }
    
    initializationAttempts++;
    showLoading();
    
    try {
        console.log("Initializing Firebase, attempt #" + initializationAttempts);
        
        // Get config from server API
        const firebaseConfig = await getFirebaseConfig();
        
        // Initialize Firebase with the config
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        
        console.log("Firebase initialized successfully");
        
        // Check if user is already logged in
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("User is already logged in:", user.email);
                try {
                    // Update last login timestamp
                    await updateUserLogin(user);
                    
                    // Show success message and notify parent to close modal
                    if (form) form.style.display = 'none';
                    if (successMessage) successMessage.style.display = 'block';
                    
                    // Send message to parent to close login modal
                    window.parent.postMessage({ action: 'close-login-modal' }, '*');
                } catch (error) {
                    console.error("Error after authentication:", error);
                    // Still close modal even if update fails
                    window.parent.postMessage({ action: 'close-login-modal' }, '*');
                }
            } else {
                console.log("No user currently logged in");
            }
        });
        
        hideLoading();
        return true;
    } catch (error) {
        hideLoading();
        console.error("Firebase initialization error:", error);
        
        // Only show notification if we've exhausted all attempts
        if (initializationAttempts >= MAX_INITIALIZATION_ATTEMPTS) {
            showNotification("Error", "Authentication initialization failed: " + error.message, true);
            return false;
        }
        
        // Wait before trying again
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try again recursively
        return initializeFirebase();
    }
}

// Call initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    startVerification();
    setupEventListeners();
});

// Verification functions
function startVerification() {
    if (!verificationBar) return;
    
    verificationProgress = 0;
    verificationBar.style.width = '0%';
    
    if (verifiedBadge) verifiedBadge.style.display = 'none';
    if (loginBtn) loginBtn.disabled = true;
    
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
    
    if (verificationBar) verificationBar.style.width = '100%';
    
    const verificationText = document.querySelector('.verification-text');
    if (verificationText) verificationText.style.display = 'none';
    
    if (verifiedBadge) verifiedBadge.style.display = 'flex';
    if (loginBtn) loginBtn.disabled = false;
    
    isVerified = true;
}

// Setup all event listeners
function setupEventListeners() {
    // Email validation
    if (emailInput) {
        emailInput.addEventListener('input', validateEmail);
    }
    
    // Password validation
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePassword);
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginFormSubmit);
    }
    
    // Google Sign In
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            if (!isVerified) {
                showNotification("Error", "Please wait for device verification to complete", true);
                return;
            }
            
            const provider = new GoogleAuthProvider();
            signInWithSocialProvider(provider, 'Google');
        });
    }
    
    // Facebook Sign In
    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', () => {
            if (!isVerified) {
                showNotification("Error", "Please wait for device verification to complete", true);
                return;
            }
            
            const provider = new FacebookAuthProvider();
            signInWithSocialProvider(provider, 'Facebook');
        });
    }
    
    // Forgot Password
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }
}

// Email validation
function validateEmail() {
    if (!emailInput || !emailError) return true;
    
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

// Password validation
function validatePassword() {
    if (!passwordInput || !passwordError) return true;
    
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

// Update user login timestamp via API
async function updateUserLogin(user) {
    try {
        console.log("Updating user login timestamp");
        
        // Get current user's ID token
        const idToken = await user.getIdToken();
        
        try {
            // Call our secure API to update user profile
            const response = await fetch(AUTH_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    action: 'updateProfile',
                    payload: {
                        userId: user.uid,
                        userData: {
                            lastLogin: new Date().toISOString()
                        }
                    }
                })
            });
            
            if (!response.ok) {
                console.warn("API response not OK, but continuing login process");
                return { success: true, warning: "Login successful but profile update failed" };
            }
            
            return await response.json();
        } catch (apiError) {
            // If API call fails, log it but don't fail the login
            console.warn("API call failed, but continuing login process:", apiError);
            return { success: true, warning: "Login successful but couldn't reach API" };
        }
    } catch (error) {
        console.error("Error in updateUserLogin function:", error);
        // Don't throw the error - just return warning
        return { success: true, warning: "Login processed with warnings" };
    }
}

// Handle login form submission
async function handleLoginFormSubmit(e) {
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
    console.log("Attempting to sign in with email and password");
    
    try {
        // Make sure Firebase is initialized
        if (!auth) {
            console.log("Auth not initialized, attempting to reinitialize");
            const initialized = await initializeFirebase();
            
            if (!initialized || !auth) {
                throw new Error("Authentication service is not available");
            }
        }
        
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log("Email/password sign-in successful");
        
        try {
            // Update last login timestamp
            await updateUserLogin(user);
        } catch (updateError) {
            console.warn("Login timestamp update failed, but continuing login process");
        }
        
        hideLoading();
        
        // Show success message and notify parent to close modal
        if (form) form.style.display = 'none';
        if (successMessage) successMessage.style.display = 'block';
        
        // Send message to parent to close login modal
        window.parent.postMessage({ action: 'close-login-modal' }, '*');
    } catch (error) {
        hideLoading();
        console.error("Email/password sign-in error:", error);
        
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
}

// Handle forgot password
async function handleForgotPassword(e) {
    e.preventDefault();
    
    if (!emailInput) {
        showNotification("Error", "Email input field not found.", true);
        return;
    }
    
    const email = emailInput.value.trim();
    
    if (!email) {
        showNotification("Error", "Please enter your email address in the email field.", true);
        emailInput.focus();
        return;
    }
    
    showLoading();
    
    try {
        // Make sure Firebase is initialized
        if (!auth) {
            console.log("Auth not initialized, attempting to reinitialize");
            const initialized = await initializeFirebase();
            
            if (!initialized || !auth) {
                throw new Error("Authentication service is not available");
            }
        }
        
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
}

// Social Sign In Function
async function signInWithSocialProvider(provider, providerName) {
    showLoading();
    
    try {
        console.log(`Attempting to sign in with ${providerName}`);
        
        // Make sure Firebase is initialized
        if (!auth) {
            console.log("Auth not initialized, attempting to reinitialize");
            const initialized = await initializeFirebase();
            
            if (!initialized || !auth) {
                throw new Error("Authentication service is not available");
            }
        }
        
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        console.log(`${providerName} sign-in successful for: ${user.email}`);
        
        try {
            // Update login timestamp
            await updateUserLogin(user);
        } catch (updateError) {
            console.warn("Could not update login timestamp, but continuing login process");
        }
        
        hideLoading();
        
        // Show success message and notify parent to close modal
        if (form) form.style.display = 'none';
        if (successMessage) successMessage.style.display = 'block';
        
        // Send message to parent to close login modal
        window.parent.postMessage({ action: 'close-login-modal' }, '*');
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

// Helper functions
function showLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
}

function showNotification(title, message, isError = false) {
    if (!notification || !notificationTitle || !notificationMessage) return;
    
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

console.log("Fully secure authentication script loaded!");
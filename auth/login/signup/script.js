// Firebase configuration and initialization
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const rtdb = firebase.database(); // Realtime Database only

// DOM Elements
const form = document.getElementById('registration-form');
const steps = document.querySelectorAll('.form-step');
const stepIndicators = document.querySelectorAll('.progress-step');
const fullNameInput = document.getElementById('fullName');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const referralCodeInput = document.getElementById('referralCode');
const captchaText = document.getElementById('captcha-text');
const captchaInput = document.getElementById('captcha-input');
const termsCheckbox = document.getElementById('terms');
const successMessage = document.getElementById('success-message');
const countdown = document.getElementById('countdown');
const submitBtn = document.getElementById('submit-btn');

// Current step and captcha
let currentStep = 1;
let captchaCode = '';

// Initialize the form
document.addEventListener('DOMContentLoaded', function() {
    generateCaptcha();
    setupEventListeners();
    validatePasswordRequirements();
});

// Setup event listeners
function setupEventListeners() {
    // Step 1 navigation
    document.getElementById('step1-next').addEventListener('click', function() {
        if (validateStep1()) {
            // Check if username exists before proceeding
            checkUsernameExists(usernameInput.value.trim())
                .then(exists => {
                    if (exists) {
                        toggleError('username-taken-error', true);
                    } else {
                        toggleError('username-taken-error', false);
                        goToStep(2);
                    }
                })
                .catch(error => {
                    console.error("Error checking username:", error);
                    goToStep(2); // Proceed anyway if check fails
                });
        }
    });

    // Step 2 navigation
    document.getElementById('step2-prev').addEventListener('click', function() {
        goToStep(1);
    });
    document.getElementById('step2-next').addEventListener('click', function() {
        if (validateStep2()) {
            // Check if email exists before proceeding
            checkEmailExists(emailInput.value.trim())
                .then(exists => {
                    if (exists) {
                        toggleError('email-taken-error', true);
                    } else {
                        toggleError('email-taken-error', false);
                        goToStep(3);
                    }
                })
                .catch(error => {
                    console.error("Error checking email:", error);
                    goToStep(3); // Proceed anyway if check fails
                });
        }
    });

    // Step 3 navigation
    document.getElementById('step3-prev').addEventListener('click', function() {
        goToStep(2);
    });
    document.getElementById('step3-next').addEventListener('click', function() {
        if (validateStep3()) {
            // If referral code is provided, validate it
            const referralCode = referralCodeInput.value.trim();
            if (referralCode) {
                validateReferralCodeExists(referralCode)
                    .then(isValid => {
                        toggleError('referralCode-error', !isValid);
                        if (isValid) {
                            goToStep(4);
                        }
                    })
                    .catch(error => {
                        console.error("Error validating referral code:", error);
                        goToStep(4); // Proceed anyway if validation fails
                    });
            } else {
                goToStep(4);
            }
        }
    });

    // Step 4 navigation
    document.getElementById('step4-prev').addEventListener('click', function() {
        goToStep(3);
    });

    // Form submission
    form.addEventListener('submit', handleSubmit);

    // Real-time validation
    fullNameInput.addEventListener('input', validateFullName);
    usernameInput.addEventListener('input', validateUsername);
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    referralCodeInput.addEventListener('input', validateReferralCode);
    passwordInput.addEventListener('input', validatePasswordRequirements);
    captchaInput.addEventListener('input', validateCaptcha);
    termsCheckbox.addEventListener('change', validateTerms);
}

// Check if username already exists in Realtime Database
async function checkUsernameExists(username) {
    try {
        const snapshot = await rtdb.ref(`usernames/${username.toLowerCase()}`).once('value');
        return snapshot.exists();
    } catch (error) {
        console.error("Error checking username:", error);
        return false; // Assume it doesn't exist if there's an error
    }
}

// Check if email already exists
async function checkEmailExists(email) {
    try {
        // We can't directly query by email in RTDB without custom indexing
        // This is a simple method that works for this example but isn't scalable
        const usersSnapshot = await rtdb.ref('users').orderByChild('email').equalTo(email).once('value');
        return usersSnapshot.exists();
    } catch (error) {
        console.error("Error checking email:", error);
        return false; // Assume it doesn't exist if there's an error
    }
}

// Check if a referral code exists in the database
async function validateReferralCodeExists(code) {
    try {
        // Try to find a user with this referral code
        const snapshot = await rtdb.ref('users').orderByChild('referralCode').equalTo(code).once('value');
        return snapshot.exists();
    } catch (error) {
        console.error("Error validating referral code:", error);
        return true; // Allow it if validation fails
    }
}

// Navigate to specific step
function goToStep(step) {
    steps.forEach((s, index) => {
        s.classList.remove('active');
        stepIndicators[index].classList.remove('active', 'completed');
    });
    
    document.getElementById(`step-${step}`).classList.add('active');
    
    // Update progress indicators
    for (let i = 0; i < step; i++) {
        if (i + 1 === step) {
            stepIndicators[i].classList.add('active');
        } else {
            stepIndicators[i].classList.add('completed');
        }
    }
    
    currentStep = step;
}

// Generate captcha
function generateCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    captchaCode = '';
    
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        captchaCode += chars[randomIndex];
    }
    
    captchaText.textContent = captchaCode;
}

// Validation functions
function validateFullName() {
    const value = fullNameInput.value.trim();
    const isValid = value.length >= 3;
    toggleError('fullName-error', !isValid);
    return isValid;
}

function validateUsername() {
    const value = usernameInput.value.trim();
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    const isValid = regex.test(value);
    toggleError('username-error', !isValid);
    return isValid;
}

function validateEmail() {
    const value = emailInput.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = regex.test(value);
    toggleError('email-error', !isValid);
    return isValid;
}

function validatePassword() {
    const value = passwordInput.value;
    
    // Complex password validation
    const hasLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    const isValid = hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
    toggleError('password-error', !isValid);
    
    return isValid;
}

function validatePasswordRequirements() {
    const value = passwordInput.value;
    
    // Update requirement indicators
    const requirements = {
        'length-req': value.length >= 8,
        'uppercase-req': /[A-Z]/.test(value),
        'lowercase-req': /[a-z]/.test(value),
        'number-req': /[0-9]/.test(value),
        'special-req': /[!@#$%^&*(),.?":{}|<>]/.test(value)
    };
    
    for (const [id, isValid] of Object.entries(requirements)) {
        const element = document.getElementById(id);
        if (isValid) {
            element.classList.add('valid-requirement');
        } else {
            element.classList.remove('valid-requirement');
        }
    }
}

function validateConfirmPassword() {
    const passwordValue = passwordInput.value;
    const confirmValue = confirmPasswordInput.value;
    const isValid = confirmValue && confirmValue === passwordValue;
    toggleError('confirmPassword-error', !isValid);
    return isValid;
}

function validateReferralCode() {
    // Always valid since it's optional
    return true;
}

function validateCaptcha() {
    const value = captchaInput.value.trim();
    const isValid = value === captchaCode;
    toggleError('captcha-error', !isValid);
    return isValid;
}

function validateTerms() {
    const isValid = termsCheckbox.checked;
    toggleError('terms-error', !isValid);
    return isValid;
}

// Step validations
function validateStep1() {
    const isFullNameValid = validateFullName();
    const isUsernameValid = validateUsername();
    return isFullNameValid && isUsernameValid;
}

function validateStep2() {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    return isEmailValid && isPasswordValid && isConfirmPasswordValid;
}

function validateStep3() {
    // Step 3 contains optional field only
    return true;
}

function validateStep4() {
    const isCaptchaValid = validateCaptcha();
    const isTermsValid = validateTerms();
    return isCaptchaValid && isTermsValid;
}

// Error display toggle
function toggleError(errorId, show) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.style.display = show ? 'block' : 'none';
    }
}

// Form submission handler
async function handleSubmit(event) {
    event.preventDefault();
    
    if (!validateStep4()) {
        return;
    }
    
    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    
    try {
        // Create user account with Firebase Authentication
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Generate a new referral code for the user
        const referralCode = generateReferralCode();
        
        // Create the user with Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Prepare the user data
        const userData = {
            fullName: fullNameInput.value.trim(),
            username: usernameInput.value.trim(),
            email: email,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            referralCode: referralCode,
            referredBy: referralCodeInput.value.trim() || null,
            dateJoined: new Date().toISOString().split('T')[0],
            referrals: 0,  // Initialize referral count
            airtimeBalance: 0,  // Initialize with 0 balance
            airtimeScore: 0     // Initialize with 0 score
        };
        
        // Store user data in Realtime Database
        await rtdb.ref(`users/${user.uid}`).set(userData);
        
        // Store username mapping
        await rtdb.ref(`usernames/${userData.username.toLowerCase()}`).set(user.uid);
        
        // Store referral code mapping
        await rtdb.ref(`referralCodes/${referralCode}`).set({
            userId: user.uid,
            created: new Date().toISOString()
        });
        
        // Process referral if provided
        if (userData.referredBy) {
            try {
                // Find the user with this referral code
                const referralSnapshot = await rtdb.ref('users')
                    .orderByChild('referralCode')
                    .equalTo(userData.referredBy)
                    .once('value');
                
                if (referralSnapshot.exists()) {
                    // Get the referrer's user ID
                    const referrerData = referralSnapshot.val();
                    const referrerUid = Object.keys(referrerData)[0];
                    
                    // Increment referrer's referral count using a transaction
                    const referrerRef = rtdb.ref(`users/${referrerUid}/referrals`);
                    await referrerRef.transaction((currentCount) => {
                        return (currentCount || 0) + 1;
                    });
                }
            } catch (referralError) {
                console.warn('Error processing referral:', referralError);
                // Continue with registration even if referral processing fails
            }
        }
        
        // Show success message and redirect
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Countdown redirect
        let secondsLeft = 5;
        countdown.textContent = secondsLeft;
        
        const countdownInterval = setInterval(() => {
            secondsLeft--;
            countdown.textContent = secondsLeft;
            
            if (secondsLeft <= 0) {
                clearInterval(countdownInterval);
                window.location.href = 'login.html'; // Redirect to login page
            }
        }, 1000);
        
    } catch (error) {
        console.error('Registration error:', error);
        alert(`Registration failed: ${error.message}`);
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
}

// Generate random referral code
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomIndex];
    }
    
    return code;
}
// Firebase configuration
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
const database = firebase.database();

// Notification System
class NotificationManager {
    constructor() {
        this.createNotificationContainer();
    }

    createNotificationContainer() {
        // Create notification container if it doesn't exist
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        this.container = container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 16px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: all 0.3s ease;
            pointer-events: auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            position: relative;
            border-left: 4px solid ${this.getBorderColor(type)};
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 10px;">
                <div style="flex: 1;">${message}</div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0; line-height: 1;">×</button>
            </div>
        `;

        this.container.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        if (notification.parentElement) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, duration);
        }

        // Send to parent window if in iframe
        this.notifyParent(message, type);

        return notification;
    }

    getBackgroundColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    getBorderColor(type) {
        const colors = {
            success: '#059669',
            error: '#dc2626',
            warning: '#d97706',
            info: '#2563eb'
        };
        return colors[type] || colors.info;
    }

    notifyParent(message, type) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'notification',
                data: { message, type }
            }, window.location.origin);
        }
    }
}

// Initialize notification manager
const notifications = new NotificationManager();

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Firebase Auth');

    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const formSections = document.querySelectorAll('.form-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            console.log('Tab clicked:', tab.id);

            // Remove active class from all tabs and forms
            tabs.forEach(t => t.classList.remove('active'));
            formSections.forEach(f => f.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Show corresponding form
            const formId = tab.id.replace('tab-', '') + '-form';
            const targetForm = document.getElementById(formId);
            if (targetForm) {
                targetForm.classList.add('active');
            }

            // Clear error and success messages
            document.querySelectorAll('.error-message').forEach(el => {
                el.style.display = 'none';
                el.textContent = '';
            });

            document.querySelectorAll('.success-message').forEach(el => {
                el.style.display = 'none';
                el.textContent = '';
            });
        });
    });

    // Generate a random referral code
    function generateReferralCode(length = 8) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    // Check if referral code exists - FIXED VERSION
    async function checkReferralCodeExists(code) {
        try {
            console.log('Checking referral code:', code);
            const snapshot = await database.ref('users').orderByChild('referralCode').equalTo(code).once('value');
            const exists = snapshot.exists();
            console.log('Referral code exists:', exists);
            return exists;
        } catch (error) {
            console.error('Error checking referral code:', error);
            return false;
        }
    }

    // Validate referral code - NEW FUNCTION
    async function validateReferralCode(code) {
        if (!code || code.trim() === '') {
            return { valid: true, data: null }; // Empty referral code is valid (optional)
        }

        try {
            console.log('Validating referral code:', code.trim().toUpperCase());
            const normalizedCode = code.trim().toUpperCase();
            
            const snapshot = await database.ref('users')
                .orderByChild('referralCode')
                .equalTo(normalizedCode)
                .once('value');

            if (snapshot.exists()) {
                const userData = snapshot.val();
                const userId = Object.keys(userData)[0];
                return { 
                    valid: true, 
                    data: { userId, ...userData[userId] } 
                };
            } else {
                return { valid: false, data: null };
            }
        } catch (error) {
            console.error('Error validating referral code:', error);
            return { valid: false, data: null };
        }
    }

    // Generate unique referral code
    async function generateUniqueReferralCode() {
        let code;
        let exists = true;
        let attempts = 0;
        const maxAttempts = 10;

        while (exists && attempts < maxAttempts) {
            code = generateReferralCode();
            exists = await checkReferralCodeExists(code);
            attempts++;
        }

        if (attempts >= maxAttempts) {
            throw new Error('Unable to generate unique referral code');
        }

        return code;
    }

    // Show loading state
    function showLoading(buttonId, loadingId) {
        const button = document.getElementById(buttonId);
        const loading = document.getElementById(loadingId);
        if (button) button.disabled = true;
        if (loading) loading.style.display = 'inline-block';
    }

    // Hide loading state
    function hideLoading(buttonId, loadingId) {
        const button = document.getElementById(buttonId);
        const loading = document.getElementById(loadingId);
        if (button) button.disabled = false;
        if (loading) loading.style.display = 'none';
    }

    // Show error message
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        notifications.show(message, 'error');
    }

    // Show success message
    function showSuccess(elementId, message) {
        const successElement = document.getElementById(elementId);
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
        }
        notifications.show(message, 'success');
    }

    // Send user data to parent window (only for login)
    function notifyParentOfLogin(user) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'loginSuccess',
                userData: {
                    displayName: user.displayName || '',
                    email: user.email || '',
                    uid: user.uid || ''
                }
            }, window.location.origin);
        }
    }

    // ----- Verification Challenge System -----
    const verificationOverlay = document.getElementById('verification-overlay');
    const challengeContainer = document.getElementById('challenge-container');
    const verifyButton = document.getElementById('verify-button');
    const progressFill = document.getElementById('progress-fill');
    const timerDisplay = document.getElementById('verification-timer');

    let currentChallenge = null;
    let verificationTimer = null;
    let timerSeconds = 30;
    let verificationCallback = null;

    // Challenge types
    const challengeTypes = [
        {
            type: 'math',
            generate: () => {
                const operations = ['+', '-', '*'];
                const operation = operations[Math.floor(Math.random() * operations.length)];

                let num1, num2, answer;

                if (operation === '+') {
                    num1 = Math.floor(Math.random() * 50) + 10;
                    num2 = Math.floor(Math.random() * 50) + 10;
                    answer = num1 + num2;
                } else if (operation === '-') {
                    num1 = Math.floor(Math.random() * 50) + 30;
                    num2 = Math.floor(Math.random() * 20) + 5;
                    answer = num1 - num2;
                } else {
                    num1 = Math.floor(Math.random() * 10) + 2;
                    num2 = Math.floor(Math.random() * 10) + 2;
                    answer = num1 * num2;
                }

                return {
                    question: `What is ${num1} ${operation} ${num2}?`,
                    answer: answer.toString()
                };
            },
            render: (challenge) => {
                return `
                    <p>${challenge.question}</p>
                    <input type="text" class="answer-input" id="challenge-answer" placeholder="Enter answer">
                `;
            }
        },
        {
            type: 'word',
            generate: () => {
                const words = [
                    'game', 'play', 'score', 'level', 'winner', 
                    'player', 'bonus', 'match', 'multi', 'luck',
                    'skill', 'prize', 'power', 'challenge', 'reward'
                ];
                const word = words[Math.floor(Math.random() * words.length)];
                return {
                    question: `Type the word: <strong>${word}</strong>`,
                    answer: word.toLowerCase()
                };
            },
            render: (challenge) => {
                return `
                    <p>${challenge.question}</p>
                    <input type="text" class="answer-input" id="challenge-answer" placeholder="Type the word">
                `;
            }
        },
        {
            type: 'sequence',
            generate: () => {
                const sequences = [
                    {seq: [2, 4, 6, 8], next: 10},
                    {seq: [1, 3, 5, 7], next: 9},
                    {seq: [3, 6, 9, 12], next: 15},
                    {seq: [2, 4, 8, 16], next: 32},
                    {seq: [1, 4, 9, 16], next: 25}
                ];

                const selected = sequences[Math.floor(Math.random() * sequences.length)];

                return {
                    question: `What is the next number in this sequence? ${selected.seq.join(', ')}, ...`,
                    answer: selected.next.toString()
                };
            },
            render: (challenge) => {
                return `
                    <p>${challenge.question}</p>
                    <input type="text" class="answer-input" id="challenge-answer" placeholder="Enter next number">
                `;
            }
        }
    ];

    // Start verification challenge
    function startVerification(callback) {
        if (!verificationOverlay || !challengeContainer) {
            console.error('Verification elements not found');
            if (callback) callback();
            return;
        }

        // Select a random challenge type
        const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

        // Generate the challenge
        currentChallenge = challengeType.generate();

        // Render the challenge
        challengeContainer.innerHTML = challengeType.render(currentChallenge);

        // Store the callback
        verificationCallback = callback;

        // Reset and start the timer
        timerSeconds = 30;
        updateTimer();
        startTimer();

        // Show the overlay
        verificationOverlay.classList.add('active');

        // Add enter key listener to the answer input
        const answerInput = document.getElementById('challenge-answer');
        if (answerInput) {
            answerInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    verifyAnswer();
                }
            });

            // Focus on the input
            setTimeout(() => {
                answerInput.focus();
            }, 300);
        }
    }

    // Start the timer
    function startTimer() {
        // Clear any existing timer
        if (verificationTimer) {
            clearInterval(verificationTimer);
        }

        if (progressFill) {
            progressFill.style.width = '100%';
        }

        // Start a new timer
        verificationTimer = setInterval(() => {
            timerSeconds--;
            updateTimer();

            // Update progress bar
            const percentage = (timerSeconds / 30) * 100;
            if (progressFill) {
                progressFill.style.width = `${percentage}%`;
            }

            if (timerSeconds <= 0) {
                clearInterval(verificationTimer);
                // Time's up - refresh the challenge
                refreshChallenge();
            }
        }, 1000);
    }

    // Update the timer display
    function updateTimer() {
        if (timerDisplay) {
            timerDisplay.textContent = `Time remaining: ${timerSeconds}s`;
        }
    }

    // Refresh the challenge
    function refreshChallenge() {
        // Select a random challenge type
        const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

        // Generate the challenge
        currentChallenge = challengeType.generate();

        // Render the challenge
        if (challengeContainer) {
            challengeContainer.innerHTML = challengeType.render(currentChallenge);
        }

        // Reset and start the timer
        timerSeconds = 30;
        updateTimer();
        startTimer();

        // Focus on the input
        const answerInput = document.getElementById('challenge-answer');
        if (answerInput) {
            setTimeout(() => {
                answerInput.focus();
            }, 100);
        }
    }

    // Verify the answer
    function verifyAnswer() {
        const answerInput = document.getElementById('challenge-answer');
        if (!answerInput) return;

        const userAnswer = answerInput.value.trim().toLowerCase();

        if (userAnswer === currentChallenge.answer.toLowerCase()) {
            // Correct answer
            clearInterval(verificationTimer);
            if (verificationOverlay) {
                verificationOverlay.classList.remove('active');
            }

            // Call the callback function
            if (verificationCallback) {
                verificationCallback();
                verificationCallback = null;
            }
        } else {
            // Wrong answer - refresh the challenge
            answerInput.value = '';
            answerInput.classList.add('shake');
            setTimeout(() => {
                answerInput.classList.remove('shake');
            }, 500);
            refreshChallenge();
        }
    }

    // Add event listener to the verify button
    if (verifyButton) {
        verifyButton.addEventListener('click', verifyAnswer);
    }

    // Login functionality
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            console.log('Login button clicked');

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                showError('login-error', 'Please enter both email and password');
                return;
            }

            // Start verification before processing login
            startVerification(() => {
                showLoading('login-button', 'login-loading');
                notifications.show('Signing you in...', 'info');

                auth.signInWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        const userId = user.uid;

                        console.log('Login successful for user:', user.email);

                        // Update last login timestamp
                        const lastLoginUpdate = {
                            lastLogin: new Date().toISOString()
                        };

                        return database.ref(`users/${userId}`).update(lastLoginUpdate)
                            .then(() => {
                                hideLoading('login-button', 'login-loading');
                                showSuccess('login-success', `Welcome back, ${user.displayName || user.email}!`);

                                // Wait a moment then notify parent
                                setTimeout(() => {
                                    notifyParentOfLogin(user);
                                }, 1000);
                            });
                    })
                    .catch((error) => {
                        console.error('Login error:', error);
                        hideLoading('login-button', 'login-loading');
                        let errorMessage = 'Login failed. Please check your credentials.';

                        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                            errorMessage = 'Invalid email or password';
                        } else if (error.code === 'auth/too-many-requests') {
                            errorMessage = 'Too many attempts. Please try again later';
                        } else if (error.code === 'auth/invalid-email') {
                            errorMessage = 'Invalid email format';
                        } else if (error.code === 'auth/user-disabled') {
                            errorMessage = 'This account has been disabled';
                        }

                        showError('login-error', errorMessage);
                    });
            });
        });
    }

    // Sign up functionality - IMPROVED VERSION
    const signupButton = document.getElementById('signup-button');
    if (signupButton) {
        signupButton.addEventListener('click', async () => {
            console.log('Signup button clicked');

            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            const fullName = document.getElementById('signup-fullname').value.trim();
            const username = document.getElementById('signup-username').value.trim();
            const referredBy = document.getElementById('signup-referral').value.trim();

            // Clear previous messages
            document.querySelectorAll('.error-message, .success-message').forEach(el => {
                el.style.display = 'none';
                el.textContent = '';
            });

            // Validation
            if (!email || !password || !confirmPassword || !fullName || !username) {
                showError('signup-error', 'Please fill in all required fields');
                return;
            }

            if (password !== confirmPassword) {
                showError('signup-error', 'Passwords do not match');
                return;
            }

            if (password.length < 6) {
                showError('signup-error', 'Password must be at least 6 characters');
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('signup-error', 'Please enter a valid email address');
                return;
            }

            // Username validation
            if (username.length < 3) {
                showError('signup-error', 'Username must be at least 3 characters');
                return;
            }

            // Validate referral code if provided - IMPROVED
            if (referredBy) {
                notifications.show('Validating referral code...', 'info');
                const referralValidation = await validateReferralCode(referredBy);
                if (!referralValidation.valid) {
                    showError('signup-error', 'Invalid referral code. Please check and try again.');
                    return;
                }
            }

            // Start verification before processing sign up
            startVerification(async () => {
                showLoading('signup-button', 'signup-loading');
                notifications.show('Creating your account...', 'info');

                try {
                    console.log('Starting signup process...');

                    // Generate unique referral code
                    const referralCode = await generateUniqueReferralCode();
                    console.log('Generated referral code:', referralCode);

                    // Validate referral code again if provided (double-check)
                    let referrerData = null;
                    if (referredBy) {
                        const referralValidation = await validateReferralCode(referredBy);
                        if (!referralValidation.valid) {
                            hideLoading('signup-button', 'signup-loading');
                            showError('signup-error', 'Invalid referral code');
                            return;
                        }
                        referrerData = referralValidation.data;
                        console.log('Valid referral code confirmed:', referrerData);
                    }

                    // Create user account
                    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                    const user = userCredential.user;
                    const userId = user.uid;
                    console.log('User account created:', user.email);

                    // Create user profile data
                    const userData = {
                        email: user.email,
                        fullName: fullName,
                        username: username,
                        photoURL: '',
                        walletBalance: 0,
                        createdAt: new Date().toISOString(),
                        dateJoined: new Date().toISOString().split('T')[0],
                        lastLogin: new Date().toISOString(),
                        referralCode: referralCode,
                        referredBy: referredBy ? referredBy.trim().toUpperCase() : '',
                        referrals: 0,
                        airtimeBalance: 0,
                        isActive: true
                    };

                    console.log('Creating user data:', userData);

                    // Save user data to Firebase Realtime Database
                    await database.ref(`users/${userId}`).set(userData);
                    console.log('User data saved successfully to database');

                    // Update Firebase Auth profile
                    await user.updateProfile({
                        displayName: fullName
                    });
                    console.log('Auth profile updated');

                    // If user was referred, increment referral count for referrer
                    if (referredBy && referrerData) {
                        try {
                            await database.ref(`users/${referrerData.userId}/referrals`).transaction(count => {
                                return (count || 0) + 1;
                            });
                            console.log('Referral count updated for referrer');
                            notifications.show(`Referral bonus applied! ${referrerData.fullName} will be notified.`, 'success');
                        } catch (referralError) {
                            console.error('Error updating referral count:', referralError);
                            // Don't fail the signup for this
                        }
                    }

                    hideLoading('signup-button', 'signup-loading');
                    showSuccess('signup-success', `Account created successfully! Welcome, ${fullName}!`);

                    // Clear form fields
                    document.getElementById('signup-email').value = '';
                    document.getElementById('signup-password').value = '';
                    document.getElementById('signup-confirm-password').value = '';
                    document.getElementById('signup-fullname').value = '';
                    document.getElementById('signup-username').value = '';
                    document.getElementById('signup-referral').value = '';

                    // Switch to login tab after 2 seconds
                    setTimeout(() => {
                        const loginTab = document.getElementById('tab-login');
                        if (loginTab) {
                            loginTab.click();
                            // Pre-fill email in login form
                            const loginEmailField = document.getElementById('login-email');
                            if (loginEmailField) {
                                loginEmailField.value = email;
                            }
                            notifications.show('Please log in with your new account', 'info');
                        }
                    }, 2000);

                } catch (error) {
                    hideLoading('signup-button', 'signup-loading');
                    console.error('Signup error:', error);

                    let errorMessage = 'Sign up failed. Please try again.';

                    if (error.code === 'auth/email-already-in-use') {
                        errorMessage = 'This email is already in use';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'Invalid email address';
                    } else if (error.code === 'auth/weak-password') {
                        errorMessage = 'Password is too weak';
                    } else if (error.code === 'auth/operation-not-allowed') {
                        errorMessage = 'Email/password accounts are not enabled';
                    } else if (error.message && error.message.includes('referral')) {
                        errorMessage = error.message;
                    }

                    showError('signup-error', errorMessage);
                }
            });
        });
    }

    // Forgot password functionality
    const forgotButton = document.getElementById('forgot-button');
    if (forgotButton) {
        forgotButton.addEventListener('click', () => {
            console.log('Forgot password button clicked');

            const email = document.getElementById('forgot-email').value.trim();

            if (!email) {
                showError('forgot-error', 'Please enter your email address');
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('forgot-error', 'Please enter a valid email address');
                return;
            }

            // Start verification before processing password reset
            startVerification(() => {
                showLoading('forgot-button', 'forgot-loading');
                notifications.show('Sending password reset email...', 'info');

                auth.sendPasswordResetEmail(email)
                    .then(() => {
                        console.log('Password reset email sent');
                        hideLoading('forgot-button', 'forgot-loading');
                        showSuccess('forgot-success', 'Password reset email sent. Please check your inbox.');
                        document.getElementById('forgot-email').value = '';
                    })
                    .catch((error) => {
                        console.error('Password reset error:', error);
                        hideLoading('forgot-button', 'forgot-loading');
                        let errorMessage = 'Failed to send reset email. Please try again.';

                        if (error.code === 'auth/user-not-found') {
                            errorMessage = 'No account found with this email';
                        } else if (error.code === 'auth/invalid-email') {
                            errorMessage = 'Invalid email address';
                        } else if (error.code === 'auth/too-many-requests') {
                            errorMessage = 'Too many requests. Please try again later';
                        }

                        showError('forgot-error', errorMessage);
                    });
            });
        });
    }

    // Check if user is already logged in on page load
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log('Auth state changed - user logged in:', user.email);
            // Check if user data exists in database
            database.ref(`users/${user.uid}`).once('value').then(snapshot => {
                if (snapshot.exists()) {
                    console.log('User data found in database');
                    notifications.show(`Welcome back, ${user.displayName || user.email}!`, 'success');
                    // Only notify parent for existing users with complete profiles
                    setTimeout(() => {
                        notifyParentOfLogin(user);
                    }, 500);
                } else {
                    console.log('User authenticated but no profile data found - signing out');
                    notifications.show('Account data missing. Please sign up again.', 'error');
                    // Sign out user if no profile data exists
                    auth.signOut();
                }
            }).catch(error => {
                console.error('Error checking user data:', error);
                notifications.show('Error verifying account. Please try again.', 'error');
            });
        } else {
            console.log('No user logged in');
        }
    });

    console.log('Firebase Auth initialization complete');
});
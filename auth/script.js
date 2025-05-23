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

// Tab switching functionality
const tabs = document.querySelectorAll('.tab');
const formSections = document.querySelectorAll('.form-section');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and forms
        tabs.forEach(t => t.classList.remove('active'));
        formSections.forEach(f => f.classList.remove('active'));

        // Add active class to clicked tab
        tab.classList.add('active');

        // Show corresponding form
        const formId = tab.id.replace('tab-', '') + '-form';
        document.getElementById(formId).classList.add('active');

        // Clear error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });

        // Clear success messages
        document.querySelectorAll('.success-message').forEach(el => {
            el.style.display = 'none';
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

// Check if referral code exists
async function checkReferralCodeExists(code) {
    try {
        const snapshot = await database.ref('users').orderByChild('referralCode').equalTo(code).once('value');
        return snapshot.exists();
    } catch (error) {
        console.error('Error checking referral code:', error);
        return false;
    }
}

// Generate unique referral code
async function generateUniqueReferralCode() {
    let code;
    let exists = true;
    
    while (exists) {
        code = generateReferralCode();
        exists = await checkReferralCodeExists(code);
    }
    
    return code;
}

// Show loading state
function showLoading(buttonId, loadingId) {
    document.getElementById(buttonId).disabled = true;
    document.getElementById(loadingId).style.display = 'inline-block';
}

// Hide loading state
function hideLoading(buttonId, loadingId) {
    document.getElementById(buttonId).disabled = false;
    document.getElementById(loadingId).style.display = 'none';
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Show success message
function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    successElement.textContent = message;
    successElement.style.display = 'block';
}

// Send user data to parent window (only for login, not signup)
function notifyParentOfLogin(user) {
    window.parent.postMessage({
        type: 'loginSuccess',
        userData: {
            displayName: user.displayName || '',
            email: user.email || '',
            uid: user.uid || ''
        }
    }, window.location.origin);
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

    progressFill.style.width = '100%';

    // Start a new timer
    verificationTimer = setInterval(() => {
        timerSeconds--;
        updateTimer();

        // Update progress bar
        const percentage = (timerSeconds / 30) * 100;
        progressFill.style.width = `${percentage}%`;

        if (timerSeconds <= 0) {
            clearInterval(verificationTimer);
            // Time's up - refresh the challenge
            refreshChallenge();
        }
    }, 1000);
}

// Update the timer display
function updateTimer() {
    timerDisplay.textContent = `Time remaining: ${timerSeconds}s`;
}

// Refresh the challenge
function refreshChallenge() {
    // Select a random challenge type
    const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

    // Generate the challenge
    currentChallenge = challengeType.generate();

    // Render the challenge
    challengeContainer.innerHTML = challengeType.render(currentChallenge);

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
    const userAnswer = answerInput.value.trim().toLowerCase();

    if (userAnswer === currentChallenge.answer.toLowerCase()) {
        // Correct answer
        clearInterval(verificationTimer);
        verificationOverlay.classList.remove('active');

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
verifyButton.addEventListener('click', verifyAnswer);

// Login functionality with verification
document.getElementById('login-button').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showError('login-error', 'Please enter both email and password');
        return;
    }

    // Start verification before processing login
    startVerification(() => {
        showLoading('login-button', 'login-loading');

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const userId = user.uid;
                
                // Update last login timestamp
                const lastLoginUpdate = {
                    lastLogin: new Date().toISOString()
                };

                return database.ref(`users/${userId}`).update(lastLoginUpdate)
                    .then(() => {
                        hideLoading('login-button', 'login-loading');
                        showSuccess('login-success', 'Login successful!');
                        
                        // Wait a moment then notify parent
                        setTimeout(() => {
                            notifyParentOfLogin(user);
                        }, 1000);
                    });
            })
            .catch((error) => {
                hideLoading('login-button', 'login-loading');
                let errorMessage = 'Login failed. Please check your credentials.';

                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    errorMessage = 'Invalid email or password';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Too many attempts. Please try again later';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Invalid email format';
                }

                showError('login-error', errorMessage);
                console.error('Login error:', error);
            });
    });
});

// Sign up functionality with verification - FIXED
document.getElementById('signup-button').addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const fullName = document.getElementById('signup-fullname').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const referredBy = document.getElementById('signup-referral').value.trim();

    // Clear previous messages
    document.querySelectorAll('.error-message, .success-message').forEach(el => {
        el.style.display = 'none';
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

    // Start verification before processing sign up
    startVerification(async () => {
        showLoading('signup-button', 'signup-loading');

        try {
            // Generate unique referral code
            const referralCode = await generateUniqueReferralCode();
            
            // Validate referral code if provided
            let referrerData = null;
            if (referredBy) {
                const referrerSnapshot = await database.ref('users').orderByChild('referralCode').equalTo(referredBy).once('value');
                if (!referrerSnapshot.exists()) {
                    hideLoading('signup-button', 'signup-loading');
                    showError('signup-error', 'Invalid referral code');
                    return;
                }
                referrerData = Object.entries(referrerSnapshot.val())[0];
            }

            // Create user account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            const userId = user.uid;

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
                referredBy: referredBy || '',
                referrals: 0,
                airtimeBalance: 0,
                isActive: true
            };

            console.log('Creating user data:', userData);

            // Save user data to Firebase Realtime Database
            await database.ref(`users/${userId}`).set(userData);
            console.log('User data saved successfully');

            // Update Firebase Auth profile
            await user.updateProfile({
                displayName: fullName
            });

            // If user was referred, increment referral count for referrer
            if (referredBy && referrerData) {
                const [referrerKey] = referrerData;
                await database.ref(`users/${referrerKey}/referrals`).transaction(count => {
                    return (count || 0) + 1;
                });
                console.log('Referral count updated');
            }

            hideLoading('signup-button', 'signup-loading');
            showSuccess('signup-success', 'Account created successfully! Switching to login...');

            // Clear form fields
            document.getElementById('signup-email').value = '';
            document.getElementById('signup-password').value = '';
            document.getElementById('signup-confirm-password').value = '';
            document.getElementById('signup-fullname').value = '';
            document.getElementById('signup-username').value = '';
            document.getElementById('signup-referral').value = '';

            // Switch to login tab after 2 seconds
            setTimeout(() => {
                document.getElementById('tab-login').click();
                // Pre-fill email in login form
                document.getElementById('login-email').value = email;
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
            }

            showError('signup-error', errorMessage);
        }
    });
});

// Forgot password functionality with verification
document.getElementById('forgot-button').addEventListener('click', () => {
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

        auth.sendPasswordResetEmail(email)
            .then(() => {
                hideLoading('forgot-button', 'forgot-loading');
                showSuccess('forgot-success', 'Password reset email sent. Please check your inbox.');
                document.getElementById('forgot-email').value = '';
            })
            .catch((error) => {
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
                console.error('Password reset error:',
});
    });
});

// Check if user is already logged in on page load
auth.onAuthStateChanged(user => {
    if (user) {
        // Check if user data exists in database
        database.ref(`users/${user.uid}`).once('value').then(snapshot => {
            if (snapshot.exists()) {
                console.log('User already logged in:', user.email);
                // Only notify parent for existing users with complete profiles
                setTimeout(() => {
                    notifyParentOfLogin(user);
                }, 500);
            } else {
                console.log('User authenticated but no profile data found');
                // Sign out user if no profile data exists
                auth.signOut();
            }
        }).catch(error => {
            console.error('Error checking user data:', error);
        });
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Firebase Auth page initialized');
    
    // Set default tab to login
    const loginTab = document.getElementById('tab-login');
    if (loginTab) {
        loginTab.click();
    }
});
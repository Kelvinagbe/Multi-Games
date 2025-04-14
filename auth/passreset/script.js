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
        firebase.initializeApp(firebaseConfig);

        // Global variables
        let captchaVerified = false;
        let cooldownActive = false;
        const cooldownTime = 30 * 60 * 1000; // 30 minutes cooldown in milliseconds
        let cooldownTimer = null;
        let remainingTime = 0;
        
        // DOM elements
        const submitButton = document.getElementById('submit-button');
        const notification = document.getElementById('notification');
        const timerElement = document.getElementById('timer');
        const emailInput = document.getElementById('email');
        const verificationStatus = document.getElementById('verification-status');
        const loadingOverlay = document.getElementById('loading-overlay');
        
        // Check for existing cooldown
        document.addEventListener('DOMContentLoaded', function() {
            checkExistingCooldown();
        });
        
        function checkExistingCooldown() {
            const savedCooldown = localStorage.getItem('resetPasswordCooldown');
            if (savedCooldown) {
                const cooldownData = JSON.parse(savedCooldown);
                const now = new Date().getTime();
                const expiryTime = cooldownData.expiryTime;
                
                if (now < expiryTime) {
                    // Cooldown still active
                    const timeLeft = Math.ceil((expiryTime - now) / 1000);
                    cooldownActive = true;
                    
                    submitButton.textContent = 'Try Again Later';
                    submitButton.disabled = true;
                    
                    timerElement.style.display = 'block';
                    startCountdownFromSeconds(timeLeft);
                }
            }
        }
        
        // Start countdown from seconds
        function startCountdownFromSeconds(seconds) {
            remainingTime = seconds;
            
            timerElement.textContent = formatTime(remainingTime);
            
            cooldownTimer = setInterval(function() {
                remainingTime--;
                timerElement.textContent = formatTime(remainingTime);
                
                // Update localStorage
                const expiryTime = new Date().getTime() + (remainingTime * 1000);
                localStorage.setItem('resetPasswordCooldown', JSON.stringify({
                    expiryTime: expiryTime
                }));
                
                if (remainingTime <= 0) {
                    clearInterval(cooldownTimer);
                    cooldownActive = false;
                    timerElement.style.display = 'none';
                    localStorage.removeItem('resetPasswordCooldown');
                    
                    // Reset CAPTCHA
                    grecaptcha.reset();
                    
                    submitButton.textContent = 'Complete CAPTCHA to Continue';
                    submitButton.disabled = true;
                }
            }, 1000);
        }
        
        // Format time to MM:SS
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `Please wait ${minutes}:${secs < 10 ? '0' + secs : secs} before trying again`;
        }
        
        // Show notification
        function showNotification(message, type) {
            notification.textContent = message;
            notification.style.display = 'block';
            notification.className = 'notification';
            notification.classList.add(type);
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        }
        
        // Render reCAPTCHA
        window.onload = function() {
            grecaptcha.render('recaptcha-checkbox', {
                'sitekey': '6LcUC_0qAAAAAO9Aa5ydOLmbp2_ymtNJlj9v3ZfF',
                'callback': onCaptchaSubmitted,
                'expired-callback': onCaptchaExpired
            });
        };
        
        // Called when CAPTCHA is submitted - simulated verification
        function onCaptchaSubmitted() {
            // Show verification in progress
            verificationStatus.style.display = 'block';
            verificationStatus.textContent = 'Verification in progress...';
            verificationStatus.className = 'verification-status';
            
            // Set a 3-second timer to simulate verification (reduced from 30 seconds for demonstration)
            setTimeout(function() {
                captchaVerified = true;
                verificationStatus.textContent = '✓ Verification successful';
                verificationStatus.className = 'verification-status verified';
                
                submitButton.textContent = 'Send Reset Link';
                submitButton.disabled = false;
            }, 3000); // 3 seconds delay for demonstration
        }
        
        // Called when CAPTCHA expires
        function onCaptchaExpired() {
            captchaVerified = false;
            verificationStatus.style.display = 'none';
            submitButton.textContent = 'Complete CAPTCHA to Continue';
            submitButton.disabled = true;
        }
        
        // Start cooldown timer
        function startCooldown() {
            cooldownActive = true;
            
            // Set expiry time to 30 minutes from now
            const expiryTime = new Date().getTime() + cooldownTime;
            localStorage.setItem('resetPasswordCooldown', JSON.stringify({
                expiryTime: expiryTime
            }));
            
            remainingTime = cooldownTime / 1000;
            
            submitButton.textContent = 'Try Again Later';
            submitButton.disabled = true;
            
            timerElement.style.display = 'block';
            startCountdownFromSeconds(remainingTime);
        }
        
        // Show loading overlay
        function showLoading() {
            loadingOverlay.style.display = 'flex';
        }
        
        // Hide loading overlay
        function hideLoading() {
            loadingOverlay.style.display = 'none';
        }

        // Handle form submission
        document.getElementById('resetForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // If cooldown is active, don't process the form
            if (cooldownActive) {
                return;
            }
            
            // Double check that CAPTCHA is verified
            if (!captchaVerified) {
                showNotification('Please complete the CAPTCHA verification first.', 'error');
                return;
            }
            
            const email = emailInput.value;
            
            // Show loading
            showLoading();
            
            // Disable button and show loading state
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Send password reset email
            firebase.auth().sendPasswordResetEmail(email)
                .then(() => {
                    // Success
                    hideLoading();
                    showNotification('Password reset link sent! Check your email inbox.', 'success');
                    emailInput.value = '';
                    
                    // Start cooldown to prevent spam
                    startCooldown();
                    
                    // Reset CAPTCHA state
                    captchaVerified = false;
                    verificationStatus.style.display = 'none';
                })
                .catch((error) => {
                    // Error
                    hideLoading();
                    let errorMessage;
                    
                    switch(error.code) {
                        case 'auth/user-not-found':
                            errorMessage = 'User not found.';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = 'Please enter a valid email address.';
                            break;
                        default:
                            errorMessage = 'Error: ' + error.message;
                    }
                    
                    showNotification(errorMessage, 'error');
                    
                    // Start cooldown even on error to prevent brute force
                    startCooldown();
                    
                    // Reset CAPTCHA state
                    captchaVerified = false;
                    verificationStatus.style.display = 'none';
                });
        });
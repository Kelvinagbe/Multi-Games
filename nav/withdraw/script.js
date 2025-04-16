
        // Initialize Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyBw1uA-kNKOZEufWKZ9AMBxvRGHNGF1lkA",
            authDomain: "multi-games-a2561.firebaseapp.com",
            databaseURL: "https://multi-games-a2561-default-rtdb.firebaseio.com",
            projectId: "multi-games-a2561",
            storageBucket: "multi-games-a2561.appspot.com",
            messagingSenderId: "150551898066",
            appId: "1:150551898066:web:4e8fb185f2321ba4140a0b",
            measurementId: "G-PB8Y87E6XV"
        };

        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const database = firebase.database();

        // Constants
        const API_KEY = '2K6DSZdbL57EWYJNI4f31cX0O9PHQ8MFGaVCAUBReT7345D80Jea5bbEGkLfBFvAj9C';
        const PIN = '5678';

        // DOM Elements
        const phoneNumberInput = document.getElementById('phone-number');
        const purchaseBtn = document.getElementById('purchase-btn');
        const purchaseLoader = document.getElementById('purchase-loader');
        const alertContainer = document.getElementById('alert-container');
        const toast = document.getElementById('toast');
        const networkIcons = document.querySelectorAll('.network-icon');
        const amountOptions = document.querySelectorAll('.amount-option');
        const balanceDisplay = document.getElementById('balance-display');
        const networkStatus = document.getElementById('network-status');

        // Step navigation elements
        const nextToStep2Btn = document.getElementById('next-to-step-2');
        const nextToStep3Btn = document.getElementById('next-to-step-3');
        const nextToStep4Btn = document.getElementById('next-to-step-4');
        const backToStep1Btn = document.getElementById('back-to-step-1');
        const backToStep2Btn = document.getElementById('back-to-step-2');
        const backToStep3Btn = document.getElementById('back-to-step-3');

        // Confirmation elements
        const confirmNetwork = document.getElementById('confirm-network');
        const confirmAmount = document.getElementById('confirm-amount');
        const confirmPhone = document.getElementById('confirm-phone');

        // State variables
        let userId = null;
        let selectedNetwork = 'mtn';
        let selectedPlanId = '10'; // MTN by default
        let selectedAmount = 50;
        let airtimeBalance = 0;
        let transactions = [];
        let balanceRef = null;
        let currentStep = 1;
        let balanceSyncInterval = null;
        let networkErrorRetryCount = 0;
        let onlineStatus = navigator.onLine;

        // Network status listeners
        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);

        // Update network status and show/hide the indicator
        function updateNetworkStatus() {
            onlineStatus = navigator.onLine;
            
            if (onlineStatus) {
                networkStatus.classList.remove('show');
                if (userId) {
                    syncBalanceWithFirebase();
                }
            } else {
                networkStatus.classList.add('show');
                showAlert('You are currently offline. Some features may not work.', 'warning');
            }
        }

        // Auth state listener
        auth.onAuthStateChanged((user) => {
            if (user) {
                userId = user.uid;
                setupRealtimeListeners(userId);
                startBalanceSync();
            } else {
                userId = null;
                loadFromLocalStorage();
                showAlert('You are not logged in. Your purchase may not be saved.', 'warning');
                updateBalanceDisplay();
            }
        });

        // Setup realtime listeners for Firebase data
        function setupRealtimeListeners(uid) {
            // Listen for balance changes
            balanceRef = database.ref(`users/${uid}/airtimeBalance`);
            balanceRef.on('value', (snapshot) => {
                if (snapshot.exists()) {
                    airtimeBalance = snapshot.val() || 0;
                    updateBalanceDisplay();
                    // Save to localStorage as backup
                    localStorage.setItem('airtimeBalance', airtimeBalance.toString());
                } else {
                    initUserData(uid);
                }
            }, (error) => {
                console.error("Firebase balance listener error:", error);
                handleFirebaseError(error);
            });

            // Listen for transaction changes
            const transactionsRef = database.ref(`users/${uid}/transactions`);
            transactionsRef.on('value', (snapshot) => {
                if (snapshot.exists()) {
                    transactions = snapshot.val() || [];
                    // Save to localStorage as backup
                    localStorage.setItem('transactions', JSON.stringify(transactions));
                }
            }, (error) => {
                console.error("Firebase transactions listener error:", error);
                handleFirebaseError(error);
            });
        }

        // Start balance sync with 2-second interval
        function startBalanceSync() {
            if (balanceSyncInterval) {
                clearInterval(balanceSyncInterval);
            }
            
            balanceSyncInterval = setInterval(() => {
                if (userId && onlineStatus) {
                    syncBalanceWithFirebase();
                }
            }, 2000);
        }

        // Sync balance with Firebase
        function syncBalanceWithFirebase() {
            if (!userId || !onlineStatus) return;
            
            database.ref(`users/${userId}/airtimeBalance`).once('value')
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        airtimeBalance = snapshot.val() || 0;
                        updateBalanceDisplay();
                        // Reset error count on successful connection
                        networkErrorRetryCount = 0;
                    }
                })
                .catch((error) => {
                    console.error("Error syncing balance:", error);
                    handleFirebaseError(error);
                });
        }

        // Handle Firebase errors with retry mechanism
        function handleFirebaseError(error) {
            networkErrorRetryCount++;
            
            if (networkErrorRetryCount <= 3) {
                showToast(`Connection issue. Retrying... (${networkErrorRetryCount}/3)`);
                
                // Try to reconnect after a delay
                setTimeout(() => {
                    if (onlineStatus) {
                        syncBalanceWithFirebase();
                    }
                }, 1000 * networkErrorRetryCount);
            } else {
                showAlert('Unable to connect to server. Using local data.', 'warning');
                // Fall back to local storage
                loadFromLocalStorage();
                updateBalanceDisplay();
            }
        }

        // Update balance display
        function updateBalanceDisplay() {
            balanceDisplay.textContent = `Your Balance: ₦${airtimeBalance}`;
        }

        // Initialize user data in Firebase
        function initUserData(uid) {
            const userRef = database.ref(`users/${uid}`);
            
            userRef.set({
                airtimeBalance: 0,
                transactions: []
            }).catch((error) => {
                console.error("Error initializing user data:", error);
                showAlert('Error initializing user data. Using local storage.', 'warning');
                loadFromLocalStorage();
            });
        }

        // Load data from local storage
        function loadFromLocalStorage() {
            airtimeBalance = parseInt(localStorage.getItem('airtimeBalance') || '0');
            transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        }

        // Save transaction to Firebase with error handling
        function saveTransaction(transaction) {
            if (!userId) {
                // If not logged in, save to local storage
                transactions.unshift(transaction);
                localStorage.setItem('transactions', JSON.stringify(transactions));
                return;
            }

            if (!onlineStatus) {
                showAlert('You are offline. Transaction will be saved when connection is restored.', 'warning');
                // Save locally for now
                transactions.unshift(transaction);
                localStorage.setItem('transactions', JSON.stringify(transactions));
                return;
            }

            // Get a reference to the transactions array
            const transactionsRef = database.ref(`users/${userId}/transactions`);
            
            // Fetch current transactions
            transactionsRef.once('value')
                .then((snapshot) => {
                    let currentTransactions = [];
                    if (snapshot.exists()) {
                        currentTransactions = snapshot.val() || [];
                    }
                    
                    // Add new transaction at the beginning
                    currentTransactions.unshift(transaction);
                    
                    // Update Firebase
                    return transactionsRef.set(currentTransactions);
                })
                .then(() => {
                    console.log("Transaction saved successfully");
                })
                .catch((error) => {
                    console.error("Error saving transaction:", error);
                    showAlert('Error saving transaction. Will retry when online.', 'warning');
                    
                    // Save locally for now
                    transactions.unshift(transaction);
                    localStorage.setItem('transactions', JSON.stringify(transactions));
                });
        }

        // Update balance in Firebase with error handling
        function updateBalance(newBalance) {
            // Always update local storage
            airtimeBalance = newBalance;
            localStorage.setItem('airtimeBalance', airtimeBalance.toString());
            updateBalanceDisplay();
            
            if (!userId || !onlineStatus) {
                return;
            }

            // Update balance in Firebase
            const balanceRef = database.ref(`users/${userId}/airtimeBalance`);
            balanceRef.set(newBalance)
                .catch((error) => {
                    console.error("Error updating balance:", error);
                    showAlert('Error updating balance on server. Local balance updated.', 'warning');
                });
        }

        // Purchase airtime with improved error handling
        async function purchaseAirtime() {
            const phoneNumber = phoneNumberInput.value.trim();
            
            // Validation
            if (!phoneNumber || phoneNumber.length < 11) {
                showAlert('Please enter a valid 11-digit phone number', 'danger');
                return;
            }
            
            if (!onlineStatus) {
                showAlert('You are offline. Please check your connection and try again.', 'danger');
                return;
            }
            
            // Get the latest balance directly from Firebase if logged in
            if (userId && onlineStatus) {
                try {
                    const snapshot = await database.ref(`users/${userId}/airtimeBalance`).once('value');
                    if (snapshot.exists()) {
                        airtimeBalance = snapshot.val() || 0;
                    }
                } catch (error) {
                    console.error("Error fetching real-time balance:", error);
                    // Continue with local balance
                }
            }
            
            if (airtimeBalance < selectedAmount) {
                showAlert(`Insufficient balance. You need ₦${selectedAmount} to make this withdrawal.`, 'danger');
                return;
            }
            
            // Show loader
            purchaseLoader.classList.add('show');
            purchaseBtn.disabled = true;
            
            try {
                // Make API call
                const referenceID = generateReference();
                const response = await makeApiCall(phoneNumber, selectedAmount, referenceID);
                
                // Deduct balance
                const newBalance = airtimeBalance - selectedAmount;
                updateBalance(newBalance);
                
                // Add transaction
                const transaction = {
                    type: `Airtime Withdrawal (${selectedNetwork.toUpperCase()})`,
                    amount: -selectedAmount,
                    date: new Date().getTime(),
                    status: 'pending',
                    reference: referenceID,
                    phone: phoneNumber
                };
                
                saveTransaction(transaction);
                
                showAlert('Your airtime withdrawal is being processed...', 'warning');

                // Update status to success after 5 seconds (simulating API processing)
                setTimeout(() => {
                    updateTransactionStatus(referenceID, 'success');
                    showToast(`Airtime withdrawal completed for ${phoneNumber}!`);
                    
                    // Reset to step 1
                    goToStep(1);
                }, 5000);
                
            } catch (error) {
                console.error('Error purchasing airtime:', error);
                showAlert('Failed to process your request. Please try again.', 'danger');
            } finally {
                // Hide loader
                purchaseLoader.classList.remove('show');
                purchaseBtn.disabled = false;
                
                // Clear form
                phoneNumberInput.value = '';
            }
        }

        // API call function with timeout and retry
        async function makeApiCall(phoneNumber, amount, reference) {
            let retries = 2;
            
            while (retries >= 0) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                    
                    const formData = new FormData();
                    formData.append('pin', PIN);
                    formData.append('plan_id', selectedPlanId);
                    formData.append('phone', phoneNumber);
                    formData.append('amount', amount.toString());
                    formData.append('reference', reference);
           
                     const response = await fetch(`https://sabuss.com/vtu/api/buy/${API_KEY}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            return data;


                    // For demo purposes, we'll simulate a successful API call
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    clearTimeout(timeoutId);
                    
                    return {
                        status: 200,
                        message: 'Successful',
                        reference: reference
                    };
                } catch (error) {
                    console.error(`API Error (retry ${2-retries}/2):`, error);
                    
                    if (error.name === 'AbortError') {
                        showToast('Request timed out. Retrying...');
                    } else {
                        showToast('Network error. Retrying...');
                    }
                    
                    retries--;
                    
                    if (retries < 0) {
                        throw new Error('Failed after multiple retries');
                    }
                    
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        // Update transaction status with error handling
        function updateTransactionStatus(referenceID, status) {
            // Update local copy first
            transactions = transactions.map(transaction => {
                if (transaction.reference === referenceID) {
                    transaction.status = status;
                }
                return transaction;
            });
            
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            if (!userId || !onlineStatus) return;
            
            const transactionsRef = database.ref(`users/${userId}/transactions`);
            
            transactionsRef.once('value')
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        let updatedTransactions = snapshot.val().map(transaction => {
                            if (transaction.reference === referenceID) {
                                transaction.status = status;
                            }
                            return transaction;
                        });
                        
                        return transactionsRef.set(updatedTransactions);
                    }
                })
                .catch((error) => {
                    console.error("Error updating transaction status:", error);
                    showAlert('Error updating transaction status on server.', 'warning');
                });
        }

        // Navigate between steps
        function goToStep(step) {
            // Hide all steps
            document.querySelectorAll('.step').forEach(el => {
                el.classList.remove('active');
            });
            
            // Show the target step
            document.getElementById(`step-${step}`).classList.add('active');
            
            // Update current step
            currentStep = step;
            
            // Update confirmation details if going to step 4
            if (step === 4) {
                confirmNetwork.textContent = selectedNetwork.toUpperCase();
                confirmAmount.textContent = `₦${selectedAmount}`;
                confirmPhone.textContent = phoneNumberInput.value || 'Not set';
            }
        }

        // Generate reference ID
        function generateReference() {
            return 'REF' + Math.random().toString(36).substring(2, 10).toUpperCase();
        }

        // Show alert
        function showAlert(message, type) {
            alertContainer.innerHTML = `
                <div class="alert alert-${type}">
                    ${message}
                </div>
            `;
            
            alertContainer.style.display = 'block';
            
            // Hide after 5 seconds
            setTimeout(() => {
                alertContainer.style.display = 'none';
            }, 5000);
        }

        // Show toast
        function showToast(message) {
            toast.textContent = message;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // Event Listeners
        // Step navigation
        nextToStep2Btn.addEventListener('click', () => {
            if (!selectedNetwork) {
                showAlert('Please select a network provider', 'warning');
                return;
            }
            goToStep(2);
        });
  
        nextToStep3Btn.addEventListener('click', () => {
            if (!selectedAmount) {
                showAlert('Please select an amount', 'warning');
                return;
            }
            goToStep(3);
        });
        
        nextToStep4Btn.addEventListener('click', () => {
            const phoneNumber = phoneNumberInput.value.trim();
            if (!phoneNumber || phoneNumber.length < 11) {
                showAlert('Please enter a valid 11-digit phone number', 'warning');
                return;
            }
            goToStep(4);
        });
        
        backToStep1Btn.addEventListener('click', () => goToStep(1));
        backToStep2Btn.addEventListener('click', () => goToStep(2));
        backToStep3Btn.addEventListener('click', () => goToStep(3));

        // Purchase button
        purchaseBtn.addEventListener('click', purchaseAirtime);

        // Network selection
        networkIcons.forEach(icon => {
            icon.addEventListener('click', function() {
                // Remove active class from all networks
                networkIcons.forEach(i => i.classList.remove('active'));
                
                // Add active class to clicked network
                this.classList.add('active');
                
                // Update selected network
                selectedNetwork = this.getAttribute('data-network');
                selectedPlanId = this.getAttribute('data-plan');
            });
        });

        // Amount selection
        amountOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all amounts
                amountOptions.forEach(o => o.classList.remove('active'));
                
                // Add active class to clicked amount
                this.classList.add('active');
                
                // Update selected amount
                selectedAmount = parseInt(this.getAttribute('data-amount'));
            });
        });

        // Phone number input validation
        phoneNumberInput.addEventListener('input', function() {
            // Allow only numbers
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Limit to 11 digits
            if (this.value.length > 11) {
                this.value = this.value.slice(0, 11);
            }
        });

        // Initial network status check
        updateNetworkStatus();
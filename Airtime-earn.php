<?php
// This PHP block handles reCAPTCHA verification and processes different actions.
// It supports "claimReward" for daily reward claims and "buyAirtime" for airtime purchases.
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    // Get the reCAPTCHA token from POST data.
    $recaptchaResponse = $_POST['recaptchaResponse'] ?? '';
    if (empty($recaptchaResponse)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No reCAPTCHA token provided']);
        exit;
    }
    
    // Use your secret key (replace YOUR_SECRET_KEY_HERE with your actual secret key)
    $secretKey = "6LfANf0qAAAAAH8m8Q8xL5ubfM-2-P2kxBUmccr5";
    $remoteIp = $_SERVER['REMOTE_ADDR'];
    
    // Build the verification URL.
    $verifyUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" . urlencode($secretKey) .
                 "&response=" . urlencode($recaptchaResponse) .
                 "&remoteip=" . urlencode($remoteIp);
                 
    // Verify token with Google's API.
    $response = file_get_contents($verifyUrl);
    $responseData = json_decode($response, true);
    
    header('Content-Type: application/json');
    if (empty($responseData["success"]) || $responseData["success"] !== true) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'reCAPTCHA verification failed']);
        exit;
    }
    
    // Determine action.
    $action = $_POST['action'];
    if ($action === 'claimReward') {
        // Process daily reward claim.
        // (Insert your actual daily reward logic here.)
        echo json_encode(['success' => true, 'message' => 'Daily reward verified']);
        exit;
    } elseif ($action === 'buyAirtime') {
        // Process airtime purchase request via VTU API.
        // Extract additional parameters from POST data.
        $phone = $_POST['phone'] ?? '';
        $amount = $_POST['amount'] ?? '';
        $plan_id = $_POST['plan_id'] ?? '';
        // Use your PIN securely.
        $pin = '5678';
        // Generate a reference.
        $reference = uniqid('REF');
        
        // Prepare POST data for the VTU API call.
        $postData = http_build_query([
           'pin'       => $pin,
           'plan_id'   => $plan_id,
           'phone'     => $phone,
           'amount'    => $amount,
           'reference' => $reference,
        ]);
        
        // VTU API endpoint.
        // If your API key is already in your API endpoint URL, use that URL directly.
        // For example, if your endpoint is: https://sabuss.com/vtu/api/buy/2K6DSZdbL57EWYJNI4f31cX0O9PHQ8MFGaVCAUBReT7345D80Jea5bbEGkLfBFvAj9C
        $vtuApiUrl = "https://sabuss.com/vtu/api/buy/2K6DSZdbL57EWYJNI4f31cX0O9PHQ8MFGaVCAUBReT7345D80Jea5bbEGkLfBFvAj9C";
        
        // Use cURL to call the VTU API.
        $ch = curl_init($vtuApiUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $apiResponse = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'VTU API call error: ' . $error]);
        } else {
            // Optionally process the API response before returning it.
            echo $apiResponse;
        }
        exit;
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Airtime Earner</title>
  
  <!-- External CSS file reference (if applicable) -->
  <link rel="stylesheet" href="styles.css">
  
  <!-- Inline CSS -->
  <style>
    :root {
      --primary-color: #4CAF50;
      --secondary-color: #FFC107;
      --danger-color: #f44336;
      --warning-color: #ff9800;
      --success-color: #4CAF50;
      --info-color: #2196F3;
      --dark-color: #333;
      --light-color: #f4f4f4;
    }
    body {
      background-color: #f5f5f5;
      color: #333;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      padding: 15px;
      background-color: #fff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      min-height: 100vh;
      position: relative;
    }
header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            margin-bottom: 20px;
            border-bottom: 3px solid #eee;
        }
        
        .logo {
            font-size: 20px;
            font-weight: bold;
            color: var(--primary-color);
        }
        
        .balance-section {
            background: linear-gradient(135deg, var(--primary-color), #2E7D32);
            color: white;
            padding: 20px;
            border-radius: 25px;
            margin-bottom: 20px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        
        .balance-title {
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .balance-amount {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .balance-amount::before {
            content: '₦';
            font-size: 24px;
            margin-right: 2px;
        }
        
        .progress-container {
            background-color: rgba(255,255,255,0.2);
            border-radius: 25px;
            height: 10px;
            width: 100%;
            margin-bottom: 5px;
        }
        
        .progress-bar {
            background-color: white;
            border-radius: 25px;
            height: 100%;
            width: 0%;
            transition: width 0.3s;
        }
        
        .progress-text {
            font-size: 12px;
            display: flex;
            justify-content: space-between;
        }
        
        .card {
            background-color: white;
            border-radius: 25px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        }
        
        .card-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .daily-reward-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .reward-info {
            flex: 1;
        }
        
        .reward-amount {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
            color: var(--primary-color);
        }
        
        .reward-status {
            font-size: 12px;
            color: #666;
        }
        
        .btn {
            padding: 10px 15px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }
        
        .btn-primary:hover {
            background-color: #3e8e41;
        }
        
        .countdown-display {
            margin-top: 10px;
            font-size: 12px;
            color: #666;
            display: none;
        }
        
        .countdown-timer {
            font-weight: bold;
        }
        
        .network-selection {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        
        .network-icon {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s;
            width: 23%;
            border: 1px solid #eee;
        }
        
        .network-icon img {
            width: 40px;
            height: 40px;
            margin-bottom: 5px;
        }
        
        .network-name {
            font-size: 12px;
        }
        
        .network-icon.active {
            background-color: #f0f8f0;
            border-color: var(--primary-color);
        }
        
        .amount-selection {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .amount-option {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s;
            flex: 1;
            min-width: 70px;
            text-align: center;
            font-weight: bold;
        }
        
        .amount-option.active {
            background-color: var(--primary-color);
            color: white;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-size: 14px;
        }
        
        .form-group input {
            width: 100%;
            padding: 10px;
            border: 3px solid #ddd;
            border-radius: 25px;
            font-size: 16px;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        
        .purchase-btn-container {
            display: flex;
            align-items: center;
        }
        
        .purchase-loader {
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid var(--primary-color);
            border-radius: 50%;
            margin-right: 10px;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .hidden {
            display: none;
        }
        
        .transactions-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .see-all {
            font-size: 12px;
            color: var(--primary-color);
            text-decoration: none;
        }
        
        .transaction-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .transaction-date {
            font-size: 12px;
            color: #888;
        }
        
        .transaction-amount {
            font-weight: bold;
        }
        
        .transaction-status {
            font-size: 12px;
            text-align: right;
        }
        
        .status-success {
            color: var(--success-color);
        }
        
        .status-pending {
            color: var(--warning-color);
        }
        
        .status-failed {
            color: var(--danger-color);
        }
        
        .alert {
            padding: 10px 15px;
            border-radius: 5px;
            margin-bottom: 15px;
        }
        
        .alert-success {
            background-color: #dff0d8;
            color: #3c763d;
        }
        
        .alert-danger {
            background-color: #f2dede;
            color: #a94442;
        }
        
        .alert-warning {
            background-color: #fcf8e3;
            color: #8a6d3b;
        }
        
        .alert-info {
            background-color: #d9edf7;
            color: #31708f;
        }
        
        .toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0,0,0,0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
        }
        
        .toast.show {
            opacity: 1;
            visibility: visible;
        }
        
        .navigation {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: white;
            display: flex;
            justify-content: space-around;
            padding: 10px 0;
            box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
            z-index: 100;
        }
        
        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-decoration: none;
            color: #888;
            font-size: 12px;
        }
        
        .nav-icon {
            font-size: 20px;
            margin-bottom: 3px;
        }
        
        .nav-item.active {
            color: var(--primary-color);
        }
        
        .footer-space {
            height: 70px;
        }
    /* Additional inline CSS as needed */
  </style>
  
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header>
      <div class="logo">Airtime Earner</div>
      <div>
        <button id="sign-out-btn" class="btn btn-primary hidden">Sign Out</button>
      </div>
    </header>
    
    <div id="alert-container" class="hidden"></div>
    
    <div class="balance-section">
      <div class="balance-title">Available Balance</div>
      <div class="balance-amount">₦<span id="balance-display">0</span></div>
      <div class="progress-container">
        <div id="progress-bar" class="progress-bar"></div>
      </div>
      <div class="progress-text">
        <span>₦0</span>
        <span>₦50 (Min. Withdrawal)</span>
      </div>
    </div>
    
    <!-- Daily reward section -->
    <div class="card" style="margin-bottom: 30px;">
      <div class="daily-reward-card">
        <div class="reward-info">
          <div class="reward-amount">₦4</div>
          <b>Complete reCAPTCHA to claim</b>
          <div class="reward-status">Daily Reward: <span id="daily-reward-status">Loading...</span></div>
          <div id="countdown-display" class="countdown-display">
            Next reward in: <span id="countdown-timer">24:00:00</span>
          </div>
        </div>
        <button id="claim-btn" class="btn btn-primary" disabled>Claim</button>
      </div>
    </div>
    
    <!-- reCAPTCHA widget -->
    <div style="display: flex; justify-content: center; margin-bottom: 20px;">
      <div class="g-recaptcha" data-sitekey="6LfANf0qAAAAALmlg5u3HnW00PtLEEkKMV-ulglv" data-callback="enableClaimButton"></div>
    </div>
    
    <!-- Airtime purchase section -->
    <div class="card">
      <div class="card-title">Buy Airtime</div>
      <div class="form-group">
        <label for="phone-number">Phone Number</label>
        <input type="text" id="phone-number" placeholder="Enter 11 digit phone number">
      </div>
      <!-- You can add additional inputs for amount or plan selection if needed -->
      <button id="purchase-btn" class="btn btn-primary">Buy Airtime</button>
    </div>
    
    <!-- Firebase SDK and additional scripts -->
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js"></script>
    
    <!-- JavaScript Code -->
    <script>
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
      const DAILY_REWARD = 4;
      const MINIMUM_WITHDRAWAL = 50;
      const PIN = '5678';

      let userId = null;
      let airtimeBalance = 0;
      let lastClaim = 0;
      let transactions = [];

      // Firebase auth state listener
      auth.onAuthStateChanged(user => {
        if (user) {
          userId = user.uid;
          // Initialize or sync user data if needed.
        } else {
          userId = null;
        }
      });

      // UI update functions
      function updateBalance() {
        const balanceDisplay = document.getElementById('balance-display');
        if (balanceDisplay) balanceDisplay.textContent = airtimeBalance;
      }
      function checkDailyReward() {
        const claimBtn = document.getElementById('claim-btn');
        if (claimBtn) {
          claimBtn.disabled = false;
          claimBtn.style.opacity = '1';
        }
      }
      function saveData() {
        // Implement saving to Firebase/localStorage as needed.
      }
      function addTransaction(transaction) {
        transactions.unshift(transaction);
      }
      function claimDailyReward() {
        if (!userId) {
          alert('Please login to claim your daily reward');
          return;
        }
        airtimeBalance += DAILY_REWARD;
        lastClaim = new Date().getTime();
        saveData();
        addTransaction({
          type: 'Daily Reward Claimed',
          amount: DAILY_REWARD,
          date: lastClaim,
          status: 'success'
        });
        updateBalance();
        alert('Daily reward claimed!');
      }

      // Function to verify reCAPTCHA and process daily reward claim.
      async function verifyRecaptchaForReward(token) {
        try {
          const res = await fetch('airtime-earn.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=claimReward&recaptchaResponse=' + encodeURIComponent(token)
          });
          return await res.json();
        } catch (err) {
          console.error("Error verifying reCAPTCHA:", err);
          return { success: false, error: 'Network error' };
        }
      }
      async function validateRewardRecaptcha(event) {
        event.preventDefault();
        const responseToken = grecaptcha.getResponse();
        if (!responseToken) {
          alert("Please complete the reCAPTCHA verification.");
          return;
        }
        const result = await verifyRecaptchaForReward(responseToken);
        if (result.success) {
          claimDailyReward();
        } else {
          alert("reCAPTCHA verification failed. Please try again.");
        }
        grecaptcha.reset();
        const claimBtn = document.getElementById('claim-btn');
        if (claimBtn) {
          claimBtn.disabled = true;
          claimBtn.style.opacity = '0.5';
        }
      }
      function enableClaimButton() {
        const claimBtn = document.getElementById('claim-btn');
        if (claimBtn) {
          claimBtn.disabled = false;
          claimBtn.style.opacity = '1';
        }
      }
      if (document.getElementById('claim-btn')) {
        document.getElementById('claim-btn').addEventListener("click", validateRewardRecaptcha);
      }

      // Function to verify reCAPTCHA and process airtime purchase.
      async function verifyRecaptchaForAirtime(token, phone, amount, plan_id) {
        try {
          const res = await fetch('airtime-earn.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=buyAirtime&recaptchaResponse=' + encodeURIComponent(token) +
                  '&phone=' + encodeURIComponent(phone) +
                  '&amount=' + encodeURIComponent(amount) +
                  '&plan_id=' + encodeURIComponent(plan_id)
          });
          return await res.json();
        } catch (err) {
          console.error("Error verifying reCAPTCHA for airtime purchase:", err);
          return { success: false, error: 'Network error' };
        }
      }
      async function purchaseAirtime() {
        const phoneInput = document.getElementById('phone-number');
        const phone = phoneInput.value.trim();
        // Replace with your logic to get amount and plan_id.
        const amount = 50; // Example amount.
        const plan_id = "10"; // Example plan for MTN.
        
        if (!phone || phone.length < 11) {
          alert('Please enter a valid 11-digit phone number.');
          return;
        }
        
        const token = grecaptcha.getResponse();
        if (!token) {
          alert("Please complete the reCAPTCHA verification.");
          return;
        }
        
        const result = await verifyRecaptchaForAirtime(token, phone, amount, plan_id);
        if (result.success) {
          alert("Airtime purchase verified and processing...");
          // Process the VTU API response as needed.
        } else {
          alert("reCAPTCHA verification failed for airtime purchase. Please try again.");
        }
        grecaptcha.reset();
      }
      document.addEventListener('DOMContentLoaded', function() {
        const purchaseBtn = document.getElementById('purchase-btn');
        if (purchaseBtn) {
          purchaseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            purchaseAirtime();
          });
        }
        updateBalance();
        checkDailyReward();
      });
    </script>
  </div>
</body>
</html>
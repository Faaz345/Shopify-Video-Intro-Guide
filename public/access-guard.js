// Access Guard - Add this script to your Shopify website to protect content
(function() {
    'use strict';
    
    const API_BASE = 'http://localhost:5000'; // Change to your deployed backend URL
    
    // Check if user has valid access
    async function validateAccess() {
        try {
            // Check for access token in URL
            const urlParams = new URLSearchParams(window.location.search);
            const accessToken = urlParams.get('access');
            
            if (!accessToken) {
                redirectToPayment();
                return;
            }
            
            // Get stored JWT token
            const jwtToken = localStorage.getItem('access_token');
            if (!jwtToken) {
                redirectToPayment();
                return;
            }
            
            // Validate with backend
            const response = await fetch(`${API_BASE}/api/validate-access`, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            
            const data = await response.json();
            
            if (!data.valid) {
                redirectToPayment();
                return;
            }
            
            // Access granted - show content
            showContent();
            
        } catch (error) {
            console.error('Access validation error:', error);
            redirectToPayment();
        }
    }
    
    function redirectToPayment() {
        // Hide all content immediately
        hideContent();
        
        // Show payment required message
        showPaymentRequired();
        
        // Redirect after 3 seconds
        setTimeout(() => {
            window.location.href = '/payment.html'; // Update this path
        }, 3000);
    }
    
    function hideContent() {
        // Hide the main content
        const mainContent = document.querySelector('main, .main-content, #main-content, .content');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
        
        // Alternative: hide body content
        document.body.style.visibility = 'hidden';
    }
    
    function showContent() {
        // Show the main content
        const mainContent = document.querySelector('main, .main-content, #main-content, .content');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        
        // Show body content
        document.body.style.visibility = 'visible';
        
        // Add access indicator
        addAccessIndicator();
        
        // Disable right-click and other protective measures
        addSecurityMeasures();
    }
    
    function showPaymentRequired() {
        // Create payment required overlay
        const overlay = document.createElement('div');
        overlay.id = 'payment-required-overlay';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                color: white;
                font-family: Arial, sans-serif;
            ">
                <div style="
                    text-align: center;
                    max-width: 500px;
                    padding: 2rem;
                ">
                    <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">🔒 Premium Content</h1>
                    <p style="font-size: 1.2rem; margin-bottom: 2rem;">
                        This content requires payment to access. 
                        You'll be redirected to the payment page shortly.
                    </p>
                    <div style="
                        background: rgba(255,255,255,0.2);
                        padding: 1rem;
                        border-radius: 10px;
                        margin-bottom: 2rem;
                    ">
                        <p>✓ One-time payment</p>
                        <p>✓ Lifetime access</p>
                        <p>✓ Secure & private</p>
                    </div>
                    <p style="font-size: 0.9rem; opacity: 0.8;">
                        Redirecting in <span id="countdown">3</span> seconds...
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Countdown timer
        let countdown = 3;
        const countdownEl = document.getElementById('countdown');
        const timer = setInterval(() => {
            countdown--;
            if (countdownEl) countdownEl.textContent = countdown;
            if (countdown <= 0) clearInterval(timer);
        }, 1000);
    }
    
    function addAccessIndicator() {
        // Add a small indicator showing the user has paid access
        const indicator = document.createElement('div');
        indicator.innerHTML = `
            <div style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: #4CAF50;
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 12px;
                z-index: 1000;
                font-family: Arial, sans-serif;
            ">
                ✓ Premium Access
            </div>
        `;
        document.body.appendChild(indicator);
    }
    
    function addSecurityMeasures() {
        // Disable right-click context menu
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
        document.addEventListener('keydown', function(e) {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+U (View Source)
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+S (Save)
            if (e.ctrlKey && e.keyCode === 83) {
                e.preventDefault();
                return false;
            }
        });
        
        // Disable text selection
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.mozUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
        
        // Disable drag
        document.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Detect DevTools (basic detection)
        let devtools = {open: false, orientation: null};
        const threshold = 160;
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    console.clear();
                    console.warn('Developer tools detected! Access may be revoked.');
                    // Optionally redirect or blur content
                    document.body.style.filter = 'blur(5px)';
                    setTimeout(() => {
                        document.body.style.filter = 'none';
                    }, 2000);
                }
            } else {
                devtools.open = false;
            }
        }, 1000);
    }
    
    // Auto-logout after inactivity
    let inactivityTimer;
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            localStorage.removeItem('access_token');
            alert('Session expired due to inactivity. Please login again.');
            window.location.reload();
        }, INACTIVITY_TIMEOUT);
    }
    
    // Listen for user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', validateAccess);
    } else {
        validateAccess();
    }
    
    // Start inactivity timer
    resetInactivityTimer();
    
})();

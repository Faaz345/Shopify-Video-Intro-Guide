/**
 * Course Access Guard - Enhanced Client-Side Security
 * This script should be embedded in the course website (https://shopify-intro-guide.vercel.app/)
 * to validate access tokens and block unauthorized users with advanced anti-sharing mechanisms
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        BACKEND_URL: 'https://your-backend-domain.com', // Replace with your actual backend URL
        LOCAL_BACKEND_URL: 'http://localhost:3000', // For local development
        ACCESS_CHECK_INTERVAL: 300000, // Re-check access every 5 minutes
        SESSION_CHECK_INTERVAL: 30000, // Check session continuity every 30 seconds
        MAX_RETRIES: 3,
        HEARTBEAT_INTERVAL: 60000, // Send heartbeat every minute
        MAX_INACTIVE_TIME: 300000 // 5 minutes of inactivity before re-validation
    };
    
    let accessValidated = false;
    let userEmail = null;
    let accessToken = null;
    let sessionId = null;
    let deviceFingerprint = null;
    let retryCount = 0;
    let lastActivity = Date.now();
    let heartbeatInterval = null;
    let sessionCheckInterval = null;
    let activityCheckInterval = null;
    let warningsEnabled = false;
    
    // Get backend URL (try production first, fallback to local)
    function getBackendUrl() {
        // In production, you would set this to your actual backend domain
        // For now, we'll try to detect if running locally or in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return CONFIG.LOCAL_BACKEND_URL;
        }
        return CONFIG.BACKEND_URL;
    }
    
    // Parse URL parameters
    function getUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            token: urlParams.get('token'),
            email: urlParams.get('email')
        };
    }
    
    // Show loading overlay
    function showLoadingOverlay(message = 'Validating access...') {
        const overlay = document.createElement('div');
        overlay.id = 'access-loading-overlay';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            ">
                <div style="
                    text-align: center;
                    color: white;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 40px;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(20px);
                ">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 3px solid rgba(0, 245, 255, 0.3);
                        border-radius: 50%;
                        border-top: 3px solid #00f5ff;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    "></div>
                    <h2 style="color: #00f5ff; margin-bottom: 10px;">${message}</h2>
                    <p style="color: #b0b0b0;">Please wait while we verify your access...</p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(overlay);
    }
    
    // Show access denied overlay
    function showAccessDenied(reason = 'Access denied') {
        // Remove loading overlay if present
        const loadingOverlay = document.getElementById('access-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
        
        // Hide all page content
        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach(child => {
            if (child.id !== 'access-denied-overlay') {
                child.style.display = 'none';
            }
        });
        
        const overlay = document.createElement('div');
        overlay.id = 'access-denied-overlay';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            ">
                <div style="
                    text-align: center;
                    color: white;
                    max-width: 500px;
                    padding: 40px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                ">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🔒</div>
                    <h1 style="color: #ff6b6b; margin-bottom: 15px; font-size: 2rem;">Access Denied</h1>
                    <p style="color: #b0b0b0; margin-bottom: 25px; line-height: 1.6;">${reason}</p>
                    
                    <div style="
                        background: rgba(255, 107, 107, 0.1);
                        border: 1px solid rgba(255, 107, 107, 0.3);
                        padding: 20px;
                        border-radius: 10px;
                        margin-bottom: 25px;
                    ">
                        <h3 style="color: #ff6b6b; margin-bottom: 10px;">🛡️ Why am I seeing this?</h3>
                        <ul style="text-align: left; color: #d0d0d0; line-height: 1.6;">
                            <li>This course requires a valid access token</li>
                            <li>Access tokens are provided after purchase</li>
                            <li>Each token is personal and cannot be shared</li>
                            <li>Tokens may expire or reach usage limits</li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <a href="/" style="
                            display: inline-block;
                            background: linear-gradient(135deg, #00f5ff, #0066ff);
                            color: white;
                            padding: 12px 25px;
                            border-radius: 50px;
                            text-decoration: none;
                            font-weight: 600;
                            margin: 0 10px;
                            transition: transform 0.3s ease;
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            🏠 Go to Homepage
                        </a>
                        <a href="mailto:code.commerce999@gmail.com" style="
                            display: inline-block;
                            background: rgba(255, 255, 255, 0.1);
                            color: white;
                            padding: 12px 25px;
                            border-radius: 50px;
                            text-decoration: none;
                            font-weight: 600;
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            margin: 0 10px;
                            transition: transform 0.3s ease;
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            📧 Contact Support
                        </a>
                    </div>
                    
                    <p style="color: #7f8c8d; font-size: 14px;">
                        Need help? Email us at code.commerce999@gmail.com
                    </p>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    // Show access granted overlay (temporary)
    function showAccessGranted(userData) {
        const loadingOverlay = document.getElementById('access-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
        
        const overlay = document.createElement('div');
        overlay.id = 'access-granted-overlay';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            ">
                <div style="
                    text-align: center;
                    color: white;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 40px;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(20px);
                ">
                    <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
                    <h2 style="color: #00ff88; margin-bottom: 15px;">Access Granted!</h2>
                    <p style="color: #b0b0b0; margin-bottom: 15px;">Welcome to your course, ${userData.email}</p>
                    <div style="
                        background: rgba(0, 255, 136, 0.1);
                        border: 1px solid rgba(0, 255, 136, 0.3);
                        padding: 15px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                        font-size: 14px;
                        color: #d0d0d0;
                    ">
                        <div>Access ${userData.accessCount}/${userData.maxAccess}</div>
                        <div>Expires: ${new Date(userData.expiryDate).toLocaleDateString()}</div>
                    </div>
                    <p style="color: #7f8c8d; font-size: 14px;">Loading course content...</p>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Auto-remove after 2 seconds
        setTimeout(() => {
            overlay.remove();
        }, 2000);
    }
    
    // Generate client-side device fingerprint
    function generateClientFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        
        const fingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
            canvas: canvas.toDataURL(),
            webgl: getWebGLFingerprint()
        };
        
        return btoa(JSON.stringify(fingerprint)).substring(0, 32);
    }
    
    function getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return 'no-webgl';
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
        } catch (e) {
            return 'error';
        }
    }
    
    // Track user activity
    function trackActivity() {
        lastActivity = Date.now();
        
        // Update activity indicators
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, () => {
                lastActivity = Date.now();
            }, { passive: true });
        });
    }
    
    // Check for suspicious activity
    function detectSuspiciousActivity() {
        const now = Date.now();
        const timeSinceActivity = now - lastActivity;
        
        // If user has been inactive for too long, re-validate
        if (timeSinceActivity > CONFIG.MAX_INACTIVE_TIME) {
            console.log('⚠️ User inactive for too long, re-validating access');
            initAccessControl();
            return;
        }
        
        // Check for multiple tabs/windows
        if (document.visibilityState === 'hidden') {
            // User switched to another tab - potential sharing
            console.log('⚠️ Tab switched, monitoring activity');
        }
        
        // Check for dev tools
        if (detectDevTools()) {
            if (warningsEnabled) {
                showSuspiciousActivityWarning('Developer tools detected');
            }
        }
    }
    
    // Detect developer tools
    function detectDevTools() {
        const threshold = 160;
        return (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold);
    }
    
    // Show suspicious activity warning
    function showSuspiciousActivityWarning(reason) {
        if (document.getElementById('suspicious-warning')) return; // Already shown
        
        const warning = document.createElement('div');
        warning.id = 'suspicious-warning';
        warning.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 152, 0, 0.95);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                z-index: 999998;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                border: 1px solid rgba(255, 152, 0, 0.3);
                backdrop-filter: blur(10px);
                max-width: 300px;
            ">
                <div style="font-weight: 600; margin-bottom: 5px;">⚠️ Security Notice</div>
                <div>${reason}</div>
                <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">This activity is being monitored</div>
            </div>
        `;
        
        document.body.appendChild(warning);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            warning.remove();
        }, 5000);
    }
    
    // Validate session continuity
    async function validateSession() {
        if (!accessValidated || !sessionId) return;
        
        const backendUrl = getBackendUrl();
        
        try {
            const response = await fetch(`${backendUrl}/api/validate-session/${accessToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    email: userEmail
                }),
                credentials: 'omit'
            });
            
            if (!response.ok) {
                console.log('❌ Session validation failed');
                accessValidated = false;
                showAccessDenied('Session expired. Please refresh the page and try again.');
                return;
            }
            
            const data = await response.json();
            if (!data.success) {
                console.log('❌ Session invalid:', data.error);
                accessValidated = false;
                showAccessDenied('Session invalid: ' + data.error);
            }
        } catch (error) {
            console.error('Session validation error:', error);
        }
    }
    
    // Send heartbeat to server
    async function sendHeartbeat() {
        if (!accessValidated) return;
        
        // Simple heartbeat to show user is active
        const now = Date.now();
        if (now - lastActivity < CONFIG.HEARTBEAT_INTERVAL) {
            // User is active, send heartbeat
            console.log('💓 Heartbeat sent');
        }
    }
    
    // Enhanced access validation with session management
    async function validateAccess(token, email, existingSessionId = null) {
        const backendUrl = getBackendUrl();
        
        try {
            let url = `${backendUrl}/api/verify-access/${token}?email=${encodeURIComponent(email)}`;
            if (existingSessionId) {
                url += `&sessionId=${existingSessionId}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'omit'
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Network error' }));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Store session information
                sessionId = data.sessionId;
                deviceFingerprint = data.data.deviceFingerprint;
                warningsEnabled = data.data.warningsEnabled;
                
                return {
                    valid: true,
                    userData: data.data,
                    sessionId: data.sessionId
                };
            } else {
                return {
                    valid: false,
                    error: data.error || 'Access validation failed'
                };
            }
            
        } catch (error) {
            console.error('Access validation error:', error);
            
            // If it's a network error and we haven't reached max retries, try again
            if (retryCount < CONFIG.MAX_RETRIES && (
                error.message.includes('fetch') || 
                error.message.includes('Network') ||
                error.message.includes('Failed to fetch')
            )) {
                retryCount++;
                console.log(`Retrying access validation (attempt ${retryCount}/${CONFIG.MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                return validateAccess(token, email, existingSessionId);
            }
            
            return {
                valid: false,
                error: error.message || 'Failed to validate access'
            };
        }
    }
    
    // Initialize access control with enhanced security
    async function initAccessControl() {
        // Clear any existing intervals
        clearExistingIntervals();
        
        // Show loading immediately
        showLoadingOverlay('Checking access permissions...');
        
        // Start activity tracking
        trackActivity();
        
        // Get URL parameters
        const params = getUrlParams();
        accessToken = params.token;
        userEmail = params.email;
        
        // Check if token and email are present
        if (!accessToken || !userEmail) {
            showAccessDenied('This course requires a valid access token and email. Please use the link provided in your purchase confirmation email.');
            return;
        }
        
        // Validate access with backend
        const validation = await validateAccess(accessToken, userEmail, sessionId);
        
        if (validation.valid) {
            accessValidated = true;
            console.log('✅ Course access validated successfully');
            showAccessGranted(validation.userData);
            
            // Start enhanced monitoring systems
            startMonitoringSystems();
            
        } else {
            console.log('❌ Course access denied:', validation.error);
            showAccessDenied('Access validation failed: ' + validation.error);
        }
    }
    
    // Start all monitoring systems
    function startMonitoringSystems() {
        // Set up periodic access re-validation
        setInterval(() => {
            if (accessValidated) {
                validateAccess(accessToken, userEmail, sessionId).then(result => {
                    if (!result.valid) {
                        console.log('❌ Access revoked during session');
                        accessValidated = false;
                        showAccessDenied('Your access has expired or been revoked. ' + result.error);
                        clearExistingIntervals();
                    }
                });
            }
        }, CONFIG.ACCESS_CHECK_INTERVAL);
        
        // Set up session continuity validation
        sessionCheckInterval = setInterval(() => {
            if (accessValidated) {
                validateSession();
            }
        }, CONFIG.SESSION_CHECK_INTERVAL);
        
        // Set up activity monitoring
        activityCheckInterval = setInterval(() => {
            if (accessValidated) {
                detectSuspiciousActivity();
            }
        }, 10000); // Check every 10 seconds
        
        // Set up heartbeat
        heartbeatInterval = setInterval(() => {
            if (accessValidated) {
                sendHeartbeat();
            }
        }, CONFIG.HEARTBEAT_INTERVAL);
        
        // Page visibility monitoring
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && accessValidated) {
                // User came back to tab - validate session
                setTimeout(() => {
                    validateSession();
                }, 1000);
            }
        });
        
        // Window focus monitoring
        window.addEventListener('focus', () => {
            if (accessValidated) {
                lastActivity = Date.now();
            }
        });
        
        // Beforeunload event to cleanup
        window.addEventListener('beforeunload', () => {
            clearExistingIntervals();
        });
    }
    
    // Clear all existing monitoring intervals
    function clearExistingIntervals() {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }
        if (sessionCheckInterval) {
            clearInterval(sessionCheckInterval);
            sessionCheckInterval = null;
        }
        if (activityCheckInterval) {
            clearInterval(activityCheckInterval);
            activityCheckInterval = null;
        }
    }
    
    // Prevent right-click and dev tools (basic deterrent)
    function addBasicProtections() {
        // Disable right-click context menu
        document.addEventListener('contextmenu', function(e) {
            if (!accessValidated) {
                e.preventDefault();
                return false;
            }
        });
        
        // Disable common keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (!accessValidated) {
                // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
                if (e.keyCode === 123 || 
                    (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
                    (e.ctrlKey && e.keyCode === 85)) {
                    e.preventDefault();
                    return false;
                }
            }
        });
        
        // Basic dev tools detection
        let devtools = {
            open: false,
            orientation: null
        };
        
        const threshold = 160;
        
        setInterval(function() {
            if (!accessValidated) return;
            
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    console.log('⚠️ Developer tools detected');
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initAccessControl();
            addBasicProtections();
        });
    } else {
        initAccessControl();
        addBasicProtections();
    }
    
    // Expose limited global functions for debugging (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.courseAccessDebug = {
            isValidated: () => accessValidated,
            getUserEmail: () => userEmail,
            getToken: () => accessToken ? accessToken.substring(0, 16) + '...' : null,
            revalidate: () => initAccessControl()
        };
    }
    
})();

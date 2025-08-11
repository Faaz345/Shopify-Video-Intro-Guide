/**
 * ULTRA-AGGRESSIVE SINGLE TAB COURSE GUARD
 * This script MUST be loaded as the FIRST script on the page
 * It immediately blocks access if opened in a new tab/window/device
 */

// IMMEDIATE EXECUTION - No delays, no waiting
(function() {
    'use strict';
    
    // CRITICAL: Block everything immediately if this is a new tab/window
    const COURSE_TAB_KEY = 'secure_course_tab_active';
    const COURSE_URL_KEY = 'secure_course_original_url';
    const DEVICE_ID_KEY = 'secure_course_device_id';
    
    // Check if course is already open in another tab
    const existingTab = sessionStorage.getItem(COURSE_TAB_KEY);
    const existingUrl = sessionStorage.getItem(COURSE_URL_KEY);
    const existingDevice = localStorage.getItem(DEVICE_ID_KEY);
    
    // Generate device fingerprint immediately
    const generateDeviceId = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('device', 2, 2);
        
        return btoa(JSON.stringify({
            ua: navigator.userAgent,
            lang: navigator.language,
            platform: navigator.platform,
            screen: screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            canvas: canvas.toDataURL(),
            memory: navigator.deviceMemory || 0,
            cores: navigator.hardwareConcurrency || 0,
            connection: navigator.connection ? navigator.connection.effectiveType : 'unknown',
            timestamp: Date.now()
        })).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
    };
    
    const currentDeviceId = generateDeviceId();
    const currentUrl = window.location.href;
    
    // IMMEDIATE BLOCKING CONDITIONS
    let blockAccess = false;
    let blockReason = '';
    
    // Check 1: Different device attempting access
    if (existingDevice && existingDevice !== currentDeviceId) {
        blockAccess = true;
        blockReason = 'DEVICE_LOCKED';
    }
    
    // Check 2: Course already open in another tab
    else if (existingTab && existingTab === 'active') {
        // This is a new tab trying to access the same course
        blockAccess = true;
        blockReason = 'TAB_ALREADY_OPEN';
    }
    
    // Check 3: URL opened via new tab/window (window.opener exists)
    else if (window.opener !== null) {
        blockAccess = true;
        blockReason = 'NEW_WINDOW_DETECTED';
    }
    
    // Check 4: URL pasted into address bar (no referrer from our domain)
    else if (document.referrer && !document.referrer.includes(window.location.hostname) && existingTab) {
        blockAccess = true;
        blockReason = 'DIRECT_URL_ACCESS';
    }
    
    if (blockAccess) {
        // IMMEDIATE BLOCKING - Stop all loading
        window.stop();
        document.head.innerHTML = '';
        document.body.innerHTML = '';
        
        // Set up the blocking page immediately
        setupBlockingPage(blockReason);
        
        // Prevent any further JavaScript execution
        throw new Error('Course access blocked');
    }
    
    // If we reach here, this is the original/allowed tab
    sessionStorage.setItem(COURSE_TAB_KEY, 'active');
    sessionStorage.setItem(COURSE_URL_KEY, currentUrl);
    localStorage.setItem(DEVICE_ID_KEY, currentDeviceId);
    
    // Set up monitoring for tab close/navigation
    window.addEventListener('beforeunload', () => {
        sessionStorage.removeItem(COURSE_TAB_KEY);
        sessionStorage.removeItem(COURSE_URL_KEY);
    });
    
    // Set up storage monitoring for new tab detection
    window.addEventListener('storage', (e) => {
        if (e.key === COURSE_TAB_KEY && e.newValue === 'active' && e.oldValue === 'active') {
            // Another tab is trying to access - block this one
            setupBlockingPage('CONCURRENT_ACCESS');
        }
    });
    
    function setupBlockingPage(reason) {
        // Create blocking HTML immediately
        const blockingHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Access Blocked - Course Security</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: white;
                }
                .container {
                    max-width: 600px;
                    background: rgba(0,0,0,0.2);
                    padding: 3rem;
                    border-radius: 20px;
                    text-align: center;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }
                .icon { font-size: 4rem; margin-bottom: 1.5rem; }
                h1 { font-size: 2.5rem; margin-bottom: 1rem; font-weight: 700; }
                p { font-size: 1.2rem; line-height: 1.6; margin-bottom: 2rem; opacity: 0.9; }
                .instructions {
                    background: rgba(0,0,0,0.3);
                    padding: 2rem;
                    border-radius: 15px;
                    margin: 2rem 0;
                    text-align: left;
                }
                .instructions h3 { 
                    color: #ffd700; 
                    margin-bottom: 1rem; 
                    display: flex; 
                    align-items: center; 
                    gap: 0.5rem;
                }
                .instructions ol { 
                    list-style: none; 
                    counter-reset: step; 
                    padding-left: 0;
                }
                .instructions li {
                    counter-increment: step;
                    margin: 1rem 0;
                    padding: 0.8rem 1rem;
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    position: relative;
                    padding-left: 3rem;
                }
                .instructions li::before {
                    content: counter(step);
                    position: absolute;
                    left: 1rem;
                    top: 0.8rem;
                    background: #ffd700;
                    color: #333;
                    width: 1.5rem;
                    height: 1.5rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 0.9rem;
                }
                .warning {
                    background: rgba(255, 107, 107, 0.2);
                    border: 1px solid rgba(255, 107, 107, 0.5);
                    padding: 1.5rem;
                    border-radius: 10px;
                    margin-top: 2rem;
                }
                .warning h4 { color: #ff6b6b; margin-bottom: 0.5rem; }
                .security-info { 
                    font-size: 0.9rem; 
                    opacity: 0.8; 
                    margin-top: 2rem; 
                    border-top: 1px solid rgba(255,255,255,0.2); 
                    padding-top: 1rem; 
                }
                .pulse { animation: pulse 2s infinite; }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon pulse">🚫</div>
                <h1>Course Access Blocked</h1>
                <p>This course can only be accessed from a single browser tab and device for security reasons.</p>
                
                <div class="instructions">
                    <h3>📧 To access your course:</h3>
                    <ol>
                        <li>Close this browser tab</li>
                        <li>Open your email inbox</li>
                        <li>Find the "Shopify Video Intro Guide" email</li>
                        <li>Click the "🚀 Access Course Now" button</li>
                        <li>Do NOT copy/paste the URL</li>
                    </ol>
                </div>
                
                <div class="warning">
                    <h4>⚠️ Security Violation Detected</h4>
                    <p><strong>Reason:</strong> ${getBlockingMessage(reason)}</p>
                </div>
                
                <div class="security-info">
                    <strong>Why is this happening?</strong><br>
                    This security system prevents course sharing and protects your purchase. 
                    Each course access is tied to a specific device and browser tab.
                </div>
            </div>
            
            <script>
                // Block all user interactions
                document.addEventListener('contextmenu', e => e.preventDefault());
                document.addEventListener('selectstart', e => e.preventDefault());
                document.addEventListener('dragstart', e => e.preventDefault());
                document.addEventListener('keydown', e => {
                    // Block F12, Ctrl+Shift+I, Ctrl+U, etc.
                    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73) || (e.ctrlKey && e.keyCode === 85)) {
                        e.preventDefault();
                    }
                });
                
                // Prevent navigation
                window.addEventListener('beforeunload', e => {
                    e.preventDefault();
                    return '';
                });
                
                // Auto-close tab after 30 seconds
                setTimeout(() => {
                    try {
                        window.close();
                    } catch (e) {
                        window.location.href = 'about:blank';
                    }
                }, 30000);
                
                // Block back/forward navigation
                history.pushState(null, null, location.href);
                window.addEventListener('popstate', () => {
                    history.go(1);
                });
            </script>
        </body>
        </html>`;
        
        // Replace entire document
        document.open();
        document.write(blockingHTML);
        document.close();
        
        // Prevent any further script execution
        window.stop();
    }
    
    function getBlockingMessage(reason) {
        const messages = {
            'DEVICE_LOCKED': 'Course is locked to your original device. Please use the same browser and device where you first accessed the course.',
            'TAB_ALREADY_OPEN': 'Course is already open in another browser tab. Please return to the original tab or close it first.',
            'NEW_WINDOW_DETECTED': 'Course cannot be opened in a new window. Please access through the email link.',
            'DIRECT_URL_ACCESS': 'Direct URL access detected. Please access the course through your email link.',
            'CONCURRENT_ACCESS': 'Multiple tab access attempt detected. Only one tab is allowed at a time.'
        };
        return messages[reason] || 'Unauthorized access attempt detected.';
    }
    
    // If we reach here, access is allowed - set up the secure course environment
    console.log('✅ Course access granted - Original tab detected');
    
})();

/**
 * MAIN COURSE SECURITY GUARD
 * This runs after the initial blocking logic
 */
class SecureCourseGuard {
    constructor() {
        this.config = {
            apiBaseUrl: window.location.origin,
            heartbeatInterval: 15000, // 15 seconds
            sessionValidationInterval: 10000, // 10 seconds
            maxIdleTime: 20 * 60 * 1000 // 20 minutes
        };
        
        this.state = {
            token: null,
            email: null,
            tabId: null,
            sessionId: null,
            isAuthenticated: false,
            lastActivity: Date.now(),
            heartbeatCount: 0
        };
        
        this.timers = {
            heartbeat: null,
            validation: null,
            activity: null
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🔐 Initializing Secure Course Guard...');
            
            // Extract URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            this.state.token = urlParams.get('token');
            this.state.email = urlParams.get('email');
            
            if (!this.state.token || !this.state.email) {
                throw new Error('Missing authentication parameters');
            }
            
            // Verify access with server
            await this.verifyAccess();
            
            // Set up security monitoring
            this.setupSecurity();
            
            // Start monitoring
            this.startMonitoring();
            
            console.log('✅ Secure Course Guard initialized');
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('❌ Course Guard initialization failed:', error);
            this.handleError(error.message);
        }
    }
    
    async verifyAccess() {
        try {
            // Generate tab ID for this session
            this.state.tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            const response = await fetch(`${this.config.apiBaseUrl}/api/verify-access/${this.state.token}?email=${encodeURIComponent(this.state.email)}&tabId=${this.state.tabId}&isNewTab=false`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Access verification failed');
            }
            
            this.state.sessionData = data.sessionData;
            this.state.sessionId = data.sessionData.sessionId;
            this.state.isAuthenticated = true;
            
            console.log('✅ Server access verification successful');
            
        } catch (error) {
            console.error('❌ Server verification failed:', error);
            throw error;
        }
    }
    
    setupSecurity() {
        // Block common keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Block F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P, etc.
            if (
                e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
                (e.ctrlKey && e.keyCode === 83) || // Ctrl+S
                (e.ctrlKey && e.keyCode === 80) || // Ctrl+P
                (e.ctrlKey && e.keyCode === 82) || // Ctrl+R (refresh)
                e.keyCode === 116 // F5 (refresh)
            ) {
                e.preventDefault();
                this.showWarning('🔒 Security Notice', 'This action is not allowed for course security.');
            }
        });
        
        // Block right-click context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showWarning('🔒 Content Protected', 'Right-click is disabled for security reasons.');
        });
        
        // Block text selection and dragging
        document.addEventListener('selectstart', (e) => {
            if (!e.target.matches('input, textarea')) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('dragstart', (e) => e.preventDefault());
        
        // Monitor tab visibility
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateActivity();
                this.validateSession();
            }
        });
        
        // Monitor user activity
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => this.updateActivity(), { passive: true });
        });
        
        // Prevent printing
        window.addEventListener('beforeprint', (e) => {
            e.preventDefault();
            this.showWarning('🖨️ Printing Disabled', 'Course content cannot be printed.');
        });
        
        // Monitor for developer tools
        this.detectDevTools();
    }
    
    detectDevTools() {
        let devtools = { open: false };
        const threshold = 160;
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    this.showWarning('🔧 Developer Tools', 'Please close developer tools to continue.');
                }
            } else {
                devtools.open = false;
            }
        }, 1000);
    }
    
    startMonitoring() {
        // Heartbeat to server
        this.timers.heartbeat = setInterval(async () => {
            if (this.state.isAuthenticated) {
                await this.sendHeartbeat();
            }
        }, this.config.heartbeatInterval);
        
        // Session validation
        this.timers.validation = setInterval(async () => {
            if (this.state.isAuthenticated) {
                await this.validateSession();
            }
        }, this.config.sessionValidationInterval);
        
        // Activity monitoring
        this.timers.activity = setInterval(() => {
            const idleTime = Date.now() - this.state.lastActivity;
            if (idleTime > this.config.maxIdleTime) {
                this.handleIdleTimeout();
            }
        }, 60000); // Check every minute
        
        console.log('🔄 Security monitoring started');
    }
    
    async sendHeartbeat() {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/api/heartbeat/${this.state.token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tabId: this.state.tabId,
                    email: this.state.email
                })
            });
            
            if (!response.ok) {
                throw new Error('Heartbeat failed');
            }
            
            const data = await response.json();
            this.state.heartbeatCount = data.heartbeatCount || 0;
            
        } catch (error) {
            console.warn('💔 Heartbeat failed:', error);
            this.handleSessionExpired();
        }
    }
    
    async validateSession() {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/api/validate-session/${this.state.token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.state.sessionId,
                    tabId: this.state.tabId,
                    email: this.state.email
                })
            });
            
            if (!response.ok) {
                throw new Error('Session validation failed');
            }
            
        } catch (error) {
            console.warn('❌ Session validation failed:', error);
            this.handleSessionExpired();
        }
    }
    
    updateActivity() {
        this.state.lastActivity = Date.now();
    }
    
    handleIdleTimeout() {
        this.showWarning('⏰ Idle Timeout', 'Please interact with the page to maintain access.');
        
        setTimeout(() => {
            if (Date.now() - this.state.lastActivity > this.config.maxIdleTime) {
                this.handleSessionExpired();
            }
        }, 60000);
    }
    
    handleSessionExpired() {
        console.warn('⏱️ Session expired');
        this.cleanup();
        
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #ff7675, #d63031);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                color: white;
                text-align: center;
                padding: 2rem;
            ">
                <div style="
                    max-width: 500px;
                    background: rgba(0,0,0,0.2);
                    padding: 3rem;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                ">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⏱️</div>
                    <h1 style="font-size: 2rem; margin-bottom: 1rem;">Session Expired</h1>
                    <p style="font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9;">
                        Your course session has expired for security reasons.
                    </p>
                    <p style="font-size: 1rem; opacity: 0.8;">
                        Please check your email and click the course access link again.
                    </p>
                </div>
            </div>
        `;
    }
    
    handleError(message) {
        console.error('🚨 Course Guard Error:', message);
        this.cleanup();
        
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #2d3436, #636e72);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                color: white;
                text-align: center;
                padding: 2rem;
            ">
                <div style="
                    max-width: 500px;
                    background: rgba(231, 76, 60, 0.1);
                    padding: 3rem;
                    border-radius: 20px;
                    border: 2px solid rgba(231, 76, 60, 0.3);
                ">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                    <h1 style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;">Access Denied</h1>
                    <p style="font-size: 1.1rem; margin-bottom: 2rem;">${message}</p>
                    <p style="font-size: 1rem; opacity: 0.8;">
                        Please check your email for the original course access link.
                    </p>
                </div>
            </div>
        `;
    }
    
    showSuccessMessage() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00b894, #00a085);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">✅</span>
                <div>
                    <div style="font-size: 1rem;">Secure Access Granted</div>
                    <div style="font-size: 0.8rem; opacity: 0.9;">Device and tab locked</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transition = 'all 0.5s ease';
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
    
    showWarning(title, message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #f39c12;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-weight: 600;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 10001;
            max-width: 400px;
            text-align: center;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 1rem; margin-bottom: 0.3rem;">${title}</div>
            <div style="font-size: 0.85rem; opacity: 0.9;">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transition = 'all 0.3s ease';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    cleanup() {
        // Clear all timers
        Object.values(this.timers).forEach(timer => {
            if (timer) clearInterval(timer);
        });
        
        // Clear session storage
        sessionStorage.removeItem('secure_course_tab_active');
        sessionStorage.removeItem('secure_course_original_url');
        
        this.state.isAuthenticated = false;
    }
    
    // Public API
    isAuthenticated() {
        return this.state.isAuthenticated;
    }
    
    getSessionInfo() {
        return {
            sessionId: this.state.sessionId,
            tabId: this.state.tabId,
            email: this.state.email,
            heartbeatCount: this.state.heartbeatCount,
            lastActivity: new Date(this.state.lastActivity)
        };
    }
}

// Initialize the secure course guard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.courseGuard = new SecureCourseGuard();
    });
} else {
    window.courseGuard = new SecureCourseGuard();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureCourseGuard;
}

// Ultra-Secure Single Tab Course Access Guard v2.0
// Enforces device-locked, single-tab access with real-time validation
// Prevents URL sharing across tabs, browsers, devices, and incognito mode

class UltraSecureCourseGuard {
    constructor(config = {}) {
        this.config = {
            apiBaseUrl: config.apiBaseUrl || 'http://localhost:3000',
            heartbeatInterval: config.heartbeatInterval || 10000, // 10 seconds
            validationInterval: config.validationInterval || 5000, // 5 seconds
            sessionTimeout: config.sessionTimeout || 30 * 60 * 1000, // 30 minutes
            maxInactiveTime: config.maxInactiveTime || 10 * 60 * 1000, // 10 minutes
            ...config
        };
        
        this.state = {
            isInitialized: false,
            isValidated: false,
            sessionActive: false,
            tabId: null,
            sessionId: null,
            deviceFingerprint: null,
            email: null,
            token: null,
            lastActivity: Date.now(),
            isOriginalTab: false,
            heartbeatCount: 0,
            violations: [],
            blockAccess: false
        };
        
        this.timers = {
            heartbeat: null,
            validation: null,
            activity: null,
            focus: null
        };
        
        this.listeners = new Map();
        
        // Start initialization immediately
        this.init();
    }

    async init() {
        try {
            console.log('🔐 Initializing Ultra-Secure Single Tab Course Guard...');
            
            // Extract credentials from URL
            const urlParams = new URLSearchParams(window.location.search);
            this.state.token = urlParams.get('token');
            this.state.email = urlParams.get('email');
            
            if (!this.state.token || !this.state.email) {
                throw new Error('Missing required authentication parameters');
            }
            
            // CRITICAL: Check if this is a new tab/window
            const isNewTab = this.detectNewTab();
            
            if (isNewTab) {
                console.warn('🚫 New tab/window detected - blocking access');
                this.blockNewTabAccess();
                return;
            }
            
            // Generate unique tab identifier
            this.state.tabId = this.generateTabId();
            
            // Store tab ID in session to detect new tabs
            if (!sessionStorage.getItem('courseTabId')) {
                sessionStorage.setItem('courseTabId', this.state.tabId);
                this.state.isOriginalTab = true;
                console.log('✅ Original tab detected and registered');
            } else {
                // This is a new tab attempting to access the course
                console.warn('🚫 Multiple tab access detected - redirecting to email');
                this.blockNewTabAccess();
                return;
            }
            
            // Generate device fingerprint
            this.state.deviceFingerprint = await this.generateDeviceFingerprint();
            
            // Setup critical security monitoring
            this.setupCriticalSecurity();
            
            // Verify initial access with server
            await this.verifyAccess();
            
            // Start continuous monitoring
            this.startContinuousMonitoring();
            
            this.state.isInitialized = true;
            console.log('✅ Single Tab Course Guard initialized successfully');
            
            // Show access granted message
            this.showAccessGrantedMessage();
            
        } catch (error) {
            console.error('❌ Course Guard initialization failed:', error);
            this.handleCriticalError(error.message);
        }
    }

    detectNewTab() {
        // Check if there's already a tab ID in session storage
        const existingTabId = sessionStorage.getItem('courseTabId');
        
        // Check if this tab was opened via window.open or similar
        const wasOpenedInNewTab = window.opener !== null;
        
        // Check if this is a duplicate tab (same URL in different tab)
        const isTabDuplicate = existingTabId && !performance.getEntriesByType('navigation')[0].type === 'navigate';
        
        return existingTabId && (wasOpenedInNewTab || isTabDuplicate);
    }

    generateTabId() {
        return 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    }

    async generateDeviceFingerprint() {
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
            screenResolution: `${screen.width}x${screen.height}`,
            screenDepth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            canvas: canvas.toDataURL(),
            webgl: this.getWebGLFingerprint(),
            hardwareConcurrency: navigator.hardwareConcurrency || 0,
            deviceMemory: navigator.deviceMemory || 0,
            timestamp: Date.now(),
            tabId: this.state.tabId
        };
        
        const fingerprintString = JSON.stringify(fingerprint);
        const encoder = new TextEncoder();
        const data = encoder.encode(fingerprintString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
            if (!gl) return 'no-webgl';
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (!debugInfo) return 'no-debug-info';
            
            return gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) + '|' +
                   gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        } catch (e) {
            return 'webgl-error';
        }
    }

    async verifyAccess() {
        try {
            // Include tab ID and new tab detection in verification
            const queryParams = new URLSearchParams({
                email: this.state.email,
                tabId: this.state.tabId || '',
                isNewTab: !this.state.isOriginalTab
            });
            
            const response = await fetch(`${this.config.apiBaseUrl}/api/verify-access/${this.state.token}?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Device-Fingerprint': this.state.deviceFingerprint,
                    'X-Tab-Id': this.state.tabId,
                    'X-Session-Type': this.state.isOriginalTab ? 'original' : 'new'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                if (data.isNewTabBlocked) {
                    this.blockNewTabAccess();
                    return;
                }
                
                if (data.action === 'redirect_to_email') {
                    this.redirectToEmailInstructions(data.error);
                    return;
                }
                
                throw new Error(data.error || 'Access verification failed');
            }
            
            // Store session data from server
            this.state.sessionData = data.sessionData;
            this.state.sessionId = data.sessionData.sessionId;
            this.state.tabId = data.sessionData.tabId;
            this.state.isValidated = true;
            this.state.sessionActive = true;
            
            console.log('✅ Single tab access verified successfully');
            console.log('📊 Session ID:', this.state.sessionId);
            
            return data;
            
        } catch (error) {
            console.error('❌ Access verification failed:', error);
            this.handleCriticalError(error.message);
            throw error;
        }
    }

    setupCriticalSecurity() {
        // CRITICAL: New tab/window detection and blocking
        this.setupTabSecurity();
        
        // CRITICAL: Page visibility monitoring
        this.setupVisibilityMonitoring();
        
        // CRITICAL: User activity monitoring
        this.setupActivityMonitoring();
        
        // CRITICAL: Developer tools detection
        this.setupDevToolsDetection();
        
        // CRITICAL: Content protection
        this.setupContentProtection();
    }

    setupTabSecurity() {
        // Prevent opening in new tabs/windows
        document.addEventListener('keydown', (e) => {
            // Block Ctrl+T, Ctrl+N, Ctrl+Shift+N, Ctrl+W, Ctrl+Shift+T
            if (e.ctrlKey && (e.keyCode === 84 || e.keyCode === 78 || e.keyCode === 87)) {
                e.preventDefault();
                this.showTabWarning();
            }
            // Block F12, Ctrl+Shift+I, Ctrl+U, F11
            if (e.keyCode === 123 || e.keyCode === 122 || 
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || 
                (e.ctrlKey && e.keyCode === 85)) {
                e.preventDefault();
                this.logViolation('DEV_TOOLS_ATTEMPT');
            }
        });
        
        // Monitor storage changes (detect new tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'courseTabId' && e.newValue !== this.state.tabId) {
                console.warn('🚫 Multiple tab access detected via storage');
                this.handleMultipleTabAttempt();
            }
        });
        
        // Block right-click context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenuWarning();
        });
        
        // Monitor tab close/reload
        window.addEventListener('beforeunload', (e) => {
            this.invalidateSession();
            sessionStorage.removeItem('courseTabId');
        });
        
        // Block text selection and copying
        document.addEventListener('selectstart', (e) => {
            if (!e.target.matches('input, textarea')) {
                e.preventDefault();
            }
        });
        
        // Block drag and drop
        document.addEventListener('dragstart', (e) => e.preventDefault());
    }

    setupVisibilityMonitoring() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 Tab/window became hidden');
                this.state.lastActivity = Date.now();
            } else {
                console.log('👀 Tab/window became visible - validating session');
                this.updateActivity();
                this.validateSession();
            }
        });
        
        // Window focus/blur monitoring
        window.addEventListener('focus', () => {
            console.log('🎯 Window gained focus - validating session');
            this.updateActivity();
            this.validateSession();
        });
        
        window.addEventListener('blur', () => {
            console.log('😴 Window lost focus');
            this.state.lastActivity = Date.now();
        });
    }

    setupActivityMonitoring() {
        // Monitor user interactions
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        activityEvents.forEach(event => {
            document.addEventListener(event, (e) => {
                this.updateActivity();
            }, { passive: true });
        });
        
        // Monitor idle time
        this.timers.activity = setInterval(() => {
            const idleTime = Date.now() - this.state.lastActivity;
            
            if (idleTime > this.config.maxInactiveTime) {
                console.warn('⏰ Maximum idle time exceeded');
                this.handleIdleTimeout();
            }
        }, 60000); // Check every minute
    }

    setupDevToolsDetection() {
        // DevTools detection via console
        let devtools = { open: false, orientation: null };
        const threshold = 160;
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    console.warn('🔧 Developer tools detected');
                    this.handleDevToolsDetection();
                }
            } else {
                devtools.open = false;
            }
        }, 500);
        
        // Console detection
        const consoleRegex = /./;
        consoleRegex.toString = () => {
            this.handleDevToolsDetection();
            return 'DevTools detected';
        };
        console.log(consoleRegex);
    }

    setupContentProtection() {
        // Disable text selection
        document.onselectstart = () => false;
        document.onmousedown = () => false;
        
        // Disable printing
        window.addEventListener('beforeprint', (e) => {
            e.preventDefault();
            this.showPrintWarning();
        });
        
        // Disable screenshots (partial)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                this.showScreenshotWarning();
            }
        });
    }

    startContinuousMonitoring() {
        // Heartbeat to maintain session
        this.timers.heartbeat = setInterval(async () => {
            if (this.state.sessionActive) {
                await this.sendHeartbeat();
            }
        }, this.config.heartbeatInterval);
        
        // Continuous session validation
        this.timers.validation = setInterval(async () => {
            if (this.state.sessionActive) {
                await this.validateSession();
            }
        }, this.config.validationInterval);
        
        console.log('🔄 Continuous monitoring started');
    }

    async sendHeartbeat() {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/api/heartbeat/${this.state.token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tabId: this.state.tabId,
                    email: this.state.email
                })
            });
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Heartbeat failed');
            }
            
            this.state.heartbeatCount = data.heartbeatCount;
            
        } catch (error) {
            console.error('💔 Heartbeat failed:', error);
            this.handleSessionExpired();
        }
    }

    async validateSession() {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/api/validate-session/${this.state.token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.state.sessionId,
                    tabId: this.state.tabId,
                    email: this.state.email
                })
            });
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                if (data.action === 'redirect_to_email') {
                    this.redirectToEmailInstructions(data.error);
                    return;
                }
                throw new Error(data.error || 'Session validation failed');
            }
            
            console.log('✅ Session validation successful');
            
        } catch (error) {
            console.error('❌ Session validation failed:', error);
            this.handleSessionExpired();
        }
    }

    updateActivity() {
        this.state.lastActivity = Date.now();
    }

    // Event Handlers

    blockNewTabAccess() {
        this.state.blockAccess = true;
        
        // Clear the page content
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                font-family: Arial, sans-serif;
                color: white;
                text-align: center;
                padding: 20px;
                box-sizing: border-box;
            ">
                <div style="
                    max-width: 500px;
                    background: rgba(0,0,0,0.2);
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                ">
                    <h1 style="font-size: 2.5rem; margin-bottom: 20px;">🚫 Access Blocked</h1>
                    <p style="font-size: 1.2rem; margin-bottom: 30px; line-height: 1.6;">
                        This course can only be accessed in a single browser tab for security reasons.
                    </p>
                    <div style="
                        background: rgba(0,0,0,0.3);
                        padding: 20px;
                        border-radius: 10px;
                        margin: 20px 0;
                        text-align: left;
                    ">
                        <h3 style="margin-bottom: 15px; color: #ffd700;">📧 To access the course:</h3>
                        <ol style="line-height: 2;">
                            <li>Close this tab</li>
                            <li>Go to your email inbox</li>
                            <li>Find the course access email</li>
                            <li>Click the "Access Course Now" button</li>
                        </ol>
                    </div>
                    <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 30px;">
                        This security measure prevents unauthorized sharing and ensures your purchase is protected.
                    </p>
                </div>
            </div>
        `;
        
        // Redirect after 10 seconds
        setTimeout(() => {
            this.redirectToEmailInstructions('Multiple tab access detected');
        }, 10000);
    }

    handleMultipleTabAttempt() {
        this.logViolation('MULTIPLE_TAB_ATTEMPT');
        this.showCriticalWarning('Multiple tab access detected. This course is restricted to a single tab.');
        
        // Block the current tab
        setTimeout(() => {
            this.blockNewTabAccess();
        }, 3000);
    }

    handleIdleTimeout() {
        this.showIdleWarning();
        
        // Give user 60 seconds to respond
        setTimeout(() => {
            if (Date.now() - this.state.lastActivity > this.config.maxInactiveTime) {
                this.handleSessionExpired();
            }
        }, 60000);
    }

    handleDevToolsDetection() {
        this.logViolation('DEV_TOOLS_DETECTED');
        this.showDeveloperToolsWarning();
        
        // After multiple violations, block access
        if (this.state.violations.filter(v => v.type === 'DEV_TOOLS_DETECTED').length > 3) {
            this.handleCriticalError('Repeated developer tools usage detected');
        }
    }

    handleSessionExpired() {
        console.warn('⏱️ Session expired');
        this.invalidateSession();
        this.redirectToEmailInstructions('Your session has expired. Please access the course through your email link.');
    }

    handleCriticalError(message) {
        console.error('🚨 Critical security error:', message);
        this.state.sessionActive = false;
        this.invalidateSession();
        
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #2c3e50, #34495e);
                font-family: Arial, sans-serif;
                color: white;
                text-align: center;
                padding: 20px;
            ">
                <div style="
                    max-width: 500px;
                    background: rgba(231, 76, 60, 0.1);
                    padding: 40px;
                    border-radius: 15px;
                    border: 2px solid rgba(231, 76, 60, 0.3);
                ">
                    <h1 style="color: #e74c3c; font-size: 2rem; margin-bottom: 20px;">🔒 Access Denied</h1>
                    <p style="font-size: 1.1rem; margin-bottom: 20px; line-height: 1.6;">${message}</p>
                    <p style="font-size: 0.9rem; opacity: 0.8;">
                        Please check your email for the original course access link.
                    </p>
                    <div style="margin-top: 30px;">
                        <button onclick="window.location.reload()" style="
                            background: #3498db;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 1rem;
                        ">Try Again</button>
                    </div>
                </div>
            </div>
        `;
    }

    redirectToEmailInstructions(message) {
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #3498db, #2980b9);
                font-family: Arial, sans-serif;
                color: white;
                text-align: center;
                padding: 20px;
            ">
                <div style="
                    max-width: 600px;
                    background: rgba(0,0,0,0.1);
                    padding: 40px;
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                ">
                    <h1 style="font-size: 2.5rem; margin-bottom: 20px;">📧 Check Your Email</h1>
                    <p style="font-size: 1.2rem; margin-bottom: 30px; line-height: 1.6;">
                        ${message || 'Please access the course through the original email link.'}
                    </p>
                    <div style="
                        background: rgba(0,0,0,0.2);
                        padding: 30px;
                        border-radius: 10px;
                        margin: 30px 0;
                        text-align: left;
                    ">
                        <h3 style="margin-bottom: 20px; color: #f1c40f;">🔍 How to find your course access:</h3>
                        <ol style="line-height: 2; font-size: 1.1rem;">
                            <li>Open your email application</li>
                            <li>Search for "Shopify Video Intro Guide"</li>
                            <li>Look for the email from code.commerce999@gmail.com</li>
                            <li>Click the "🚀 Access Course Now" button</li>
                        </ol>
                    </div>
                    <p style="font-size: 1rem; margin-top: 30px; opacity: 0.9;">
                        <strong>Security Notice:</strong> This course is protected by advanced security measures<br>
                        to prevent unauthorized sharing and ensure your purchase is secure.
                    </p>
                </div>
            </div>
        `;
    }

    // Warning and Notification Methods

    showAccessGrantedMessage() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00b894, #00a085);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.5s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5rem;">✅</span>
                <div>
                    <div style="font-size: 1.1rem;">Secure Access Granted</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Device and tab locked</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease forwards';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    showTabWarning() {
        this.showNotification('🚫 Tab Access Blocked', 'Course access is restricted to this tab only', 'warning');
    }

    showContextMenuWarning() {
        this.showNotification('🔒 Content Protected', 'Right-click is disabled for security', 'info');
    }

    showDeveloperToolsWarning() {
        this.showNotification('🔧 Developer Tools Detected', 'Please close developer tools to continue', 'warning');
    }

    showIdleWarning() {
        this.showNotification('⏰ Idle Timeout Warning', 'Please interact with the page to maintain access', 'warning');
    }

    showPrintWarning() {
        this.showNotification('🖨️ Printing Disabled', 'Content cannot be printed for security reasons', 'info');
    }

    showScreenshotWarning() {
        this.showNotification('📸 Screenshots Blocked', 'Screenshots are not allowed for this content', 'info');
    }

    showCriticalWarning(message) {
        this.showNotification('🚨 Security Alert', message, 'critical');
    }

    showNotification(title, message, type = 'info') {
        const colors = {
            info: '#3498db',
            warning: '#f39c12',
            critical: '#e74c3c',
            success: '#27ae60'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10001;
            max-width: 400px;
            text-align: center;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 1.1rem; margin-bottom: 5px;">${title}</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Utility Methods

    logViolation(type, details = {}) {
        const violation = {
            type,
            timestamp: Date.now(),
            details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.state.violations.push(violation);
        console.warn('⚠️ Security violation logged:', violation);
        
        // Send to server if needed
        this.reportViolation(violation);
    }

    async reportViolation(violation) {
        try {
            await fetch(`${this.config.apiBaseUrl}/api/report-violation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: this.state.token,
                    email: this.state.email,
                    tabId: this.state.tabId,
                    violation
                })
            });
        } catch (error) {
            console.error('Failed to report violation:', error);
        }
    }

    async invalidateSession() {
        try {
            if (this.state.sessionId && this.state.tabId) {
                await fetch(`${this.config.apiBaseUrl}/api/validate-session/${this.state.token}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sessionId: this.state.sessionId,
                        tabId: this.state.tabId,
                        email: this.state.email,
                        action: 'invalidate'
                    })
                });
            }
        } catch (error) {
            console.error('Failed to invalidate session:', error);
        }
        
        // Clear local state
        this.state.sessionActive = false;
        sessionStorage.removeItem('courseTabId');
        
        // Clear all timers
        Object.values(this.timers).forEach(timer => {
            if (timer) clearInterval(timer);
        });
    }

    // Public API for course content integration

    isAccessGranted() {
        return this.state.isValidated && this.state.sessionActive && !this.state.blockAccess;
    }

    getSessionInfo() {
        return {
            sessionId: this.state.sessionId,
            tabId: this.state.tabId,
            email: this.state.email,
            heartbeatCount: this.state.heartbeatCount,
            lastActivity: new Date(this.state.lastActivity),
            isOriginalTab: this.state.isOriginalTab
        };
    }

    destroy() {
        console.log('🗑️ Destroying Course Guard...');
        this.invalidateSession();
        
        // Remove all event listeners
        this.listeners.forEach((listener, element) => {
            element.removeEventListener(listener.event, listener.handler);
        });
        this.listeners.clear();
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.courseGuard = new UltraSecureCourseGuard();
    });
} else {
    window.courseGuard = new UltraSecureCourseGuard();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UltraSecureCourseGuard;
}

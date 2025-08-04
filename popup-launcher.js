/**
 * SJIOC Chatbot Popup Launcher
 * This script can be embedded on any website to launch the chatbot in a popup window
 */

(function() {
    'use strict';

    // Configuration
    const CHATBOT_CONFIG = {
        // Replace with your Vercel deployment URL
        url: 'https://your-chatbot-deployment.vercel.app/chatbot.html',
        width: 450,
        height: 600,
        title: 'SJIOC Car Assistant'
    };

    // Create and inject the chatbot launcher button
    function createLauncherButton() {
        const button = document.createElement('div');
        button.id = 'sjioc-chatbot-launcher';
        button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        `;
        
        // Add styles
        const styles = `
            #sjioc-chatbot-launcher {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
                color: white;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            #sjioc-chatbot-launcher:hover {
                transform: scale(1.1);
                box-shadow: 0 12px 35px rgba(0,0,0,0.25);
            }
            
            @media (max-width: 768px) {
                #sjioc-chatbot-launcher {
                    width: 55px;
                    height: 55px;
                    bottom: 20px;
                    right: 20px;
                }
            }
        `;

        // Inject styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        // Add click event
        button.addEventListener('click', openChatbotPopup);
        
        // Append to body
        document.body.appendChild(button);
    }

    // Open chatbot in popup window
    function openChatbotPopup() {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        
        // Calculate center position
        const left = (screenWidth - CHATBOT_CONFIG.width) / 2;
        const top = (screenHeight - CHATBOT_CONFIG.height) / 2;
        
        // Popup window features
        const features = [
            `width=${CHATBOT_CONFIG.width}`,
            `height=${CHATBOT_CONFIG.height}`,
            `left=${left}`,
            `top=${top}`,
            'resizable=yes',
            'scrollbars=no',b
            'status=no',
            'menubar=no',
            'toolbar=no',
            'location=no'
        ].join(',');

        // Open popup
        const popup = window.open(
            CHATBOT_CONFIG.url,
            'sjioc-chatbot',
            features
        );

        // Focus the popup window
        if (popup) {
            popup.focus();
        }
        
        return popup;
    }

    // Initialize when DOM is ready
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createLauncherButton);
        } else {
            createLauncherButton();
        }
    }

    // Auto-initialize
    init();

    // Expose global function for manual launching
    window.openSJIOCChatbot = openChatbotPopup;

})();
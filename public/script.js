class SJIOCChatbot {
    constructor() {
        this.membersData = [];
        this.isAdminMode = false;
        this.adminAuthenticated = false;
        this.pendingUpload = null;
        this.chatbotToggle = document.getElementById('chatbotToggle');
        this.chatbotPopup = document.getElementById('chatbotPopup');
        this.chatbotClose = document.getElementById('chatbotClose');
        this.chatbotInput = document.getElementById('chatbotInput');
        this.chatbotSend = document.getElementById('chatbotSend');
        this.chatbotMessages = document.getElementById('chatbotMessages');
        
        this.initializeEventListeners();
        this.loadMemberData();
    }

    initializeEventListeners() {
        this.chatbotToggle.addEventListener('click', () => this.toggleChatbot());
        this.chatbotClose.addEventListener('click', () => this.closeChatbot());
        this.chatbotSend.addEventListener('click', () => this.sendMessage());
        this.chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChatbot() {
        this.chatbotPopup.classList.toggle('active');
        if (this.chatbotPopup.classList.contains('active')) {
            this.chatbotInput.focus();
        }
    }

    closeChatbot() {
        this.chatbotPopup.classList.remove('active');
    }

    async loadMemberData() {
        try {
            // Try JSON first (for Vercel deployment), fallback to CSV
            let response = await fetch('/api/members');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.membersData = result.data;
                    return;
                }
            }
            
            // Fallback to CSV for local development
            response = await fetch('members_data.csv');
            const csvText = await response.text();
            this.parseCSV(csvText);
        } catch (error) {
            console.error('Error loading member data:', error);
            this.addBotMessage('Sorry, I encountered an error loading the member data. Please try again later.');
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        
        this.membersData = lines.slice(1).map(line => {
            const values = line.split(',').map(value => value.trim());
            const member = {};
            headers.forEach((header, index) => {
                member[header] = values[index] || '';
            });
            return member;
        });
    }

    sendMessage() {
        const message = this.chatbotInput.value.trim();
        if (!message) return;

        this.addUserMessage(message);
        this.chatbotInput.value = '';
        
        setTimeout(() => {
            this.showTypingIndicator();
            setTimeout(async () => {
                this.hideTypingIndicator();
                await this.processUserMessage(message);
            }, 1000);
        }, 100);
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-time">${this.getCurrentTime()}</div>
        `;
        this.chatbotMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        // Convert newlines to HTML line breaks and preserve formatting
        const formattedMessage = message
            .replace(/\n\n/g, '<br><br>') // Double newlines to double line breaks
            .replace(/\n/g, '<br>') // Single newlines to single line breaks
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Convert **text** to bold
        
        messageDiv.innerHTML = `
            <div class="message-content">${formattedMessage}</div>
            <div class="message-time">${this.getCurrentTime()}</div>
        `;
        this.chatbotMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        this.chatbotMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingMessage = this.chatbotMessages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    async processUserMessage(message) {
        const lowerMessage = message.toLowerCase();
        let response = '';

        // Check for admin commands first
        if (this.isAdminCommand(lowerMessage)) {
            response = await this.handleAdminCommand(message);
        } else {
            // Always use AI for user queries - more engaging and natural
            response = await this.getAIResponse(message);
        }

        this.addBotMessage(response);
    }

    async getAIResponse(message) {
        try {
            // Check if asking for specific car number - provide targeted response
            const carNumberMatch = message.match(/\b([A-Z0-9]{4,8})\b/i) || message.match(/\b([A-Z0-9]{2,4}-[A-Z0-9]{2,4})\b/i);
            let specificCarData = null;
            
            if (carNumberMatch) {
                const inputPlate = carNumberMatch[0].toUpperCase();
                
                // Smart plate matching - try exact match first, then fuzzy match without dashes
                specificCarData = this.membersData.find(member => 
                    member['Car Number']?.toUpperCase() === inputPlate
                );
                
                // If no exact match, try matching without dashes/symbols
                if (!specificCarData) {
                    const inputWithoutSymbols = inputPlate.replace(/[^A-Z0-9]/g, '');
                    specificCarData = this.membersData.find(member => {
                        const plateWithoutSymbols = member['Car Number']?.replace(/[^A-Z0-9]/g, '').toUpperCase();
                        return plateWithoutSymbols === inputWithoutSymbols;
                    });
                }
            }

            // Use API endpoint instead of direct OpenAI call for security
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    memberData: this.buildPrivacyAwareContext(specificCarData)
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                return data.response;
            } else {
                throw new Error(data.error || 'Unknown error');
            }

        } catch (error) {
            console.error('Error calling AI API:', error);
            
            // Fallback to local responses for common queries
            return this.getLocalFallbackResponse(message);
        }
    }

    getLocalFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // ONLY respond to specific car number queries - privacy protection
        const carNumberMatch = message.match(/\b([A-Z0-9]{4,8})\b/i) || message.match(/\b([A-Z0-9]{2,4}-[A-Z0-9]{2,4})\b/i);
        if (carNumberMatch) {
            const inputPlate = carNumberMatch[0].toUpperCase();
            
            // Smart plate matching - try exact match first, then fuzzy match without dashes
            let specificCarData = this.membersData.find(member => 
                member['Car Number']?.toUpperCase() === inputPlate
            );
            
            // If no exact match, try matching without dashes/symbols
            if (!specificCarData) {
                const inputWithoutSymbols = inputPlate.replace(/[^A-Z0-9]/g, '');
                specificCarData = this.membersData.find(member => {
                    const plateWithoutSymbols = member['Car Number']?.replace(/[^A-Z0-9]/g, '').toUpperCase();
                    return plateWithoutSymbols === inputWithoutSymbols;
                });
            }
            
            const displayPlate = specificCarData ? specificCarData['Car Number'] : inputPlate;
            
            if (specificCarData) {
                const memberStatus = specificCarData.Member === 'Y' ? 'Active Member' : 'Non-Member';
                
                // Privacy protection: Show full first name + masked last name (first 2 chars + asterisks)
                const firstName = specificCarData['First Name'] || '';
                const lastName = specificCarData['Last Name'] || '';
                const maskedLastName = lastName.length >= 2 ? lastName.substring(0, 2) + '*'.repeat(Math.max(0, lastName.length - 2)) : lastName;
                
                return `🚗 **${displayPlate}**\n\n👤 **Owner:** ${firstName} ${maskedLastName}\n\n🚙 **Vehicle:** ${specificCarData['Car Manufacturer']} ${specificCarData['Car Type']}\n\n📋 **Status:** ${memberStatus}\n\n📞 Please contact the owner directly or connect with Trustee OR Secretary.\n\nNeed help with anything else about this vehicle?`;
            } else {
                return `🔍 I don't have information about license plate ${inputPlate} in our database. Please check the number and try again.`;
            }
        }
        
        // Block all manufacturer/brand queries for privacy
        if (lowerMessage.includes('jaguar') || lowerMessage.includes('bmw') || lowerMessage.includes('audi') || lowerMessage.includes('mercedes') || lowerMessage.includes('all cars') || lowerMessage.includes('list cars')) {
            return "🔒 **Privacy Protection**\n\nI don't share lists of cars or owners by manufacturer for privacy reasons.\n\nIf you need to identify a specific car owner, please provide the exact car number in this format: **ABC-1234**\n\nThis helps protect our church member privacy.";
        }
        
        // Common greetings
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "👋 Welcome to SJIOC! I'm your car identification assistant. I can help you find out whose car belongs to which registration number. Just provide the license plate number (e.g., ABC-1234). What would you like to know?";
        }
        
        // Help requests
        if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
            return "🤖 I can help you with:\n• 🔍 Car owner identification by registration number (GJ-XX-XX-XXXX)\n• 📊 SJIOC church statistics and information\n• 🚗 Car manufacturer and type information\n• 🏛️ General church member car information\n\nJust ask naturally - I'll understand!";
        }
        
        // Car maintenance questions - redirect to car owner lookup
        if (lowerMessage.includes('maintenance') || lowerMessage.includes('oil') || lowerMessage.includes('service')) {
            return "🚗 I'm here to help identify car owners, not provide maintenance advice. If you have a specific car number (GJ-XX-XX-XXXX format), I can tell you whose car it is!";
        }
        
        // Privacy protection - block general member requests
        if (lowerMessage.includes('all members') || lowerMessage.includes('list members') || lowerMessage.includes('show all')) {
            return "🔒 I protect member privacy and don't share general member lists. However, I can help with specific car numbers!\n\nTry: 'Tell me about GJ-01-AB-1234'";
        }
        
        // Default response
        return "🤖 I'm here to help identify car owners at SJIOC! For the best experience, ask about:\n\n🚗 Specific car numbers (GJ-XX-XX-XXXX format)\n📊 Church member statistics\n❓ Car owner identification\n\n*My AI features are temporarily unavailable, but I can still help with car lookups!*";
    }

    buildPrivacyAwareContext(specificCarData = null) {
        if (specificCarData) {
            // Only provide specific car data when car number is mentioned with proper name masking
            const memberStatus = specificCarData.Member === 'Y' ? 'Active Member' : 'Non-Member';
            
            // Privacy protection: Show full first name + masked last name (first 2 chars + asterisks)
            const firstName = specificCarData['First Name'] || '';
            const lastName = specificCarData['Last Name'] || '';
            const maskedLastName = lastName.length >= 2 ? lastName.substring(0, 2) + '*'.repeat(Math.max(0, lastName.length - 2)) : lastName;
            
            return `Car ${specificCarData['Car Number']}: Owner ${firstName} ${maskedLastName}, ${specificCarData['Car Manufacturer']} ${specificCarData['Car Type']} - ${memberStatus}`;
        }
        
        // General context without personal details
        const totalMembers = this.membersData.length;
        const activeMembers = this.membersData.filter(m => m.Member === 'Y').length;
        const manufacturers = [...new Set(this.membersData.map(m => m['Car Manufacturer']))];
        const carTypes = [...new Set(this.membersData.map(m => m['Car Type']))];
        
        return `St. John's Indian Orthodox Church (SJIOC) has ${totalMembers} registered vehicles with ${activeMembers} active members. Popular brands include ${manufacturers.slice(0, 3).join(', ')}. Car types include ${carTypes.slice(0, 4).join(', ')}.`;
    }

    buildContextFromData() {
        const memberCount = this.membersData.length;
        const activeMembers = this.membersData.filter(m => m.Member === 'Y').length;
        const manufacturers = [...new Set(this.membersData.map(m => m['Car Manufacturer']))];
        
        return `Total members: ${memberCount}, Active members: ${activeMembers}, Car brands: ${manufacturers.join(', ')}`;
    }

    isAdminCommand(message) {
        const adminCommands = ['/admin', '/login', '/upload', '/stats', '/logout', '/help-admin'];
        return adminCommands.some(cmd => message.startsWith(cmd)) || 
               (this.adminAuthenticated && message.includes('upload file'));
    }

    async handleAdminCommand(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.startsWith('/admin') || lowerMessage.startsWith('/login')) {
            return this.handleAdminLogin(message);
        }
        
        if (!this.adminAuthenticated) {
            return "🔐 **Admin Access Required**\n\nPlease authenticate first using:\n`/admin <password>`\n\n*This is a secure area for authorized church administrators only.*";
        }
        
        if (lowerMessage.startsWith('/stats')) {
            return this.getAdminStats();
        } else if (lowerMessage.startsWith('/upload')) {
            return this.handleUploadCommand();
        } else if (lowerMessage.startsWith('/logout')) {
            return this.handleAdminLogout();
        } else if (lowerMessage.startsWith('/help-admin')) {
            return this.getAdminHelp();
        }
        
        return "❓ Unknown admin command. Type `/help-admin` for available commands.";
    }

    handleAdminLogin(message) {
        const parts = message.split(' ');
        if (parts.length < 2) {
            return "🔐 **Admin Login**\n\nUsage: `/admin <password>`\n\n*Enter the admin password to access management functions.*";
        }
        
        const password = parts.slice(1).join(' ');
        
        // Simple password check (in production, use proper hashing)
        const adminPassword = 'sjioc-admin-2024'; // This should be in environment variables
        
        if (password === adminPassword) {
            this.adminAuthenticated = true;
            this.isAdminMode = true;
            this.updateChatbotHeader(true);
            return "✅ **Admin Authenticated**\n\n🛡️ You now have administrative access.\n\n**Available Commands:**\n" +
                   "• `/stats` - View database statistics\n" +
                   "• `/upload` - Upload new member data\n" +
                   "• `/help-admin` - Show admin help\n" +
                   "• `/logout` - Exit admin mode\n\n" +
                   "*Remember to logout when finished.*";
        } else {
            // Add delay to prevent brute force
            setTimeout(() => {}, 2000);
            return "❌ **Authentication Failed**\n\nInvalid admin password. Access denied.\n\n*Please contact the system administrator if you believe this is an error.*";
        }
    }

    handleAdminLogout() {
        this.adminAuthenticated = false;
        this.isAdminMode = false;
        this.pendingUpload = null;
        this.updateChatbotHeader(false);
        return "👋 **Admin Logout**\n\nYou have been logged out of admin mode.\n\n*Thank you for keeping our member data secure.*";
    }

    getAdminStats() {
        const activeMembers = this.membersData.filter(m => m.Member === 'Y');
        const nonMembers = this.membersData.filter(m => m.Member === 'N');
        const jaguarCars = this.membersData.filter(m => m['Car Manufacturer'] === 'Jaguar');
        const manufacturers = [...new Set(this.membersData.map(m => m['Car Manufacturer']))];
        
        return "📊 **Database Statistics**\n\n" +
               `📈 **Total Records:** ${this.membersData.length}\n` +
               `✅ **Active Members:** ${activeMembers.length}\n` +
               `❌ **Non-Members:** ${nonMembers.length}\n` +
               `🐆 **Jaguar Cars:** ${jaguarCars.length}\n` +
               `🚗 **Other Brands:** ${this.membersData.length - jaguarCars.length}\n` +
               `🏭 **Manufacturers:** ${manufacturers.join(', ')}\n\n` +
               `*Last updated: ${new Date().toLocaleString()}*`;
    }

    handleUploadCommand() {
        this.createFileUploader();
        return "📁 **File Upload Interface**\n\nA file upload dialog has been created below. Please select your CSV file.\n\n" +
               "**Requirements:**\n" +
               "• CSV format with required columns\n" +
               "• Car numbers in GJ-XX-XX-XXXX format\n" +
               "• Maximum file size: 5MB\n" +
               "• Backup will be created automatically\n\n" +
               "*Please ensure your CSV file follows the correct format before uploading.*";
    }

    createFileUploader() {
        const uploaderHtml = `
            <div class="admin-uploader" style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; border: 2px dashed #3498db;">
                <h4 style="margin-top: 0; color: #2c3e50;">📤 Upload Member Data</h4>
                <input type="file" id="adminFileInput" accept=".csv" style="margin: 10px 0; padding: 5px;">
                <br>
                <label style="font-size: 12px;">
                    <input type="checkbox" id="confirmUpload"> I confirm this will replace all current data (backup created)
                </label>
                <br><br>
                <button onclick="window.chatbot.processUpload()" 
                        style="background: #e74c3c; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;"
                        id="uploadButton" disabled>
                    🔄 Update Database
                </button>
                <button onclick="window.chatbot.cancelUpload()" 
                        style="background: #95a5a6; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                    ❌ Cancel
                </button>
            </div>
        `;
        
        const uploaderDiv = document.createElement('div');
        uploaderDiv.innerHTML = uploaderHtml;
        uploaderDiv.className = 'message bot-message admin-uploader-message';
        uploaderDiv.innerHTML += `<div class="message-time">${this.getCurrentTime()}</div>`;
        
        this.chatbotMessages.appendChild(uploaderDiv);
        this.scrollToBottom();
        
        // Add event listeners
        const fileInput = document.getElementById('adminFileInput');
        const confirmCheckbox = document.getElementById('confirmUpload');
        const uploadButton = document.getElementById('uploadButton');
        
        const validateUpload = () => {
            const file = fileInput.files[0];
            const confirmed = confirmCheckbox.checked;
            uploadButton.disabled = !(file && confirmed && file.name.toLowerCase().endsWith('.csv'));
        };
        
        fileInput.addEventListener('change', validateUpload);
        confirmCheckbox.addEventListener('change', validateUpload);
        
        window.chatbot = this; // Make accessible to onclick handlers
    }

    async processUpload() {
        const fileInput = document.getElementById('adminFileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            this.addBotMessage("❌ **Upload Error**\n\nNo file selected.");
            return;
        }
        
        this.addBotMessage("⏳ **Processing Upload**\n\nValidating and uploading file...");
        
        try {
            const formData = new FormData();
            formData.append('csvFile', file);
            formData.append('password', 'sjioc-admin-2024'); // Use the same admin password
            
            const response = await fetch('/api/admin-upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.addBotMessage(`✅ **Upload Successful**\n\n${result.message}\n\n*Database has been updated. Reloading data...*`);
                await this.loadMemberData();
                this.removeUploader();
            } else {
                this.addBotMessage(`❌ **Upload Failed**\n\n${result.error}\n\n*Please check your file format and try again.*`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.addBotMessage("❌ **Upload Error**\n\nFailed to upload file. Please try again or contact support.");
        }
    }

    cancelUpload() {
        this.removeUploader();
        this.addBotMessage("🚫 **Upload Cancelled**\n\nFile upload has been cancelled.");
    }

    removeUploader() {
        const uploader = document.querySelector('.admin-uploader-message');
        if (uploader) {
            uploader.remove();
        }
    }

    updateChatbotHeader(isAdmin) {
        const header = document.querySelector('.chatbot-title h3');
        const subtitle = document.querySelector('.chatbot-title p');
        
        if (isAdmin) {
            header.innerHTML = '🔐 SJIOC Admin Console';
            subtitle.innerHTML = 'Administrative access enabled';
            this.chatbotPopup.style.borderTop = '3px solid #e74c3c';
        } else {
            header.innerHTML = '🚗 SJIOC Car Assistant';
            subtitle.innerHTML = 'Ask me about member cars!';
            this.chatbotPopup.style.borderTop = '';
        }
    }

    getAdminHelp() {
        return "🛠️ **Admin Command Reference**\n\n" +
               "**Authentication:**\n" +
               "• `/admin <password>` - Login to admin mode\n" +
               "• `/logout` - Exit admin mode\n\n" +
               "**Data Management:**\n" +
               "• `/stats` - View database statistics\n" +
               "• `/upload` - Upload new member CSV file\n\n" +
               "**File Format Requirements:**\n" +
               "• Required columns: First Name, Last Name, Member, Car Type, Car Manufacturer, Car Number\n" +
               "• Car numbers: GJ-XX-XX-XXXX format\n" +
               "• Member field: Y/N for active/inactive\n" +
               "• CSV format only, max 5MB\n\n" +
               "*All admin actions are logged for security.*";
    }

    isGreeting(message) {
        const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
        return greetings.some(greeting => message.includes(greeting));
    }

    isNameQuery(message) {
        return message.includes("'s car") || 
               message.includes("car of") || 
               message.includes("find") && (message.includes("car") || message.includes("member")) ||
               message.includes("show me") && message.includes("car") ||
               this.containsName(message);
    }

    isManufacturerQuery(message) {
        const manufacturers = ['jaguar', 'bmw', 'audi', 'mercedes'];
        return manufacturers.some(brand => message.includes(brand)) && (message.includes('car') || message.includes('list'));
    }

    isCarNumberQuery(message) {
        return /[a-z0-9]{4,8}/i.test(message) || /[a-z0-9]{2,4}-[a-z0-9]{2,4}/i.test(message) || message.includes('car number') || message.includes('registration') || message.includes('license plate') || message.includes('plate number');
    }

    isMemberQuery(message) {
        return message.includes('member') && (message.includes('count') || message.includes('total') || message.includes('how many'));
    }

    isListQuery(message) {
        return message.includes('list') || message.includes('show all') || message.includes('all cars');
    }

    isHelpQuery(message) {
        return message.includes('help') || message.includes('what can you do') || message.includes('commands');
    }

    containsName(message) {
        const names = this.membersData.flatMap(member => [
            member['First Name']?.toLowerCase(),
            member['Last Name']?.toLowerCase(),
            `${member['First Name']} ${member['Last Name']}`.toLowerCase()
        ]);
        return names.some(name => name && message.includes(name));
    }

    searchByName(message) {
        const found = this.membersData.filter(member => {
            const fullName = `${member['First Name']} ${member['Last Name']}`.toLowerCase();
            const firstName = member['First Name']?.toLowerCase();
            const lastName = member['Last Name']?.toLowerCase();
            
            return message.includes(fullName) || 
                   message.includes(firstName) || 
                   message.includes(lastName);
        });

        if (found.length === 0) {
            return "I couldn't find any member with that name. Please check the spelling or try a different name.";
        }

        let response = found.length === 1 ? "Here's the car information:\n\n" : "I found multiple matches:\n\n";
        
        found.forEach(member => {
            const memberStatus = member.Member === 'Y' ? '✅ Active Member' : '❌ Non-Member';
            response += `👤 **${member['First Name']} ${member['Last Name']}**\n`;
            response += `${memberStatus}\n`;
            response += `🚗 ${member['Car Type']} by ${member['Car Manufacturer']}\n`;
            response += `🔢 ${member['Car Number']}\n\n`;
        });

        return response;
    }

    searchByManufacturer(message) {
        let manufacturer = '';
        if (message.includes('jaguar')) manufacturer = 'Jaguar';
        else if (message.includes('bmw')) manufacturer = 'BMW';
        else if (message.includes('audi')) manufacturer = 'Audi';
        else if (message.includes('mercedes')) manufacturer = 'Mercedes';

        const found = this.membersData.filter(member => 
            member['Car Manufacturer'] === manufacturer
        );

        if (found.length === 0) {
            return `No ${manufacturer} cars found in our database.`;
        }

        let response = `Found ${found.length} ${manufacturer} car(s):\n\n`;
        found.forEach(member => {
            const memberStatus = member.Member === 'Y' ? '✅' : '❌';
            response += `${memberStatus} ${member['First Name']} ${member['Last Name']} - ${member['Car Type']} (${member['Car Number']})\n`;
        });

        return response;
    }

    searchByCarNumber(message) {
        const carNumberPattern = /[a-z0-9]{4,8}/i;
        const match = message.match(carNumberPattern);
        
        if (!match) {
            return "Please provide a valid license plate format (e.g., ABC-1234, 123-ABC, AB1-234).";
        }

        const carNumber = match[0].toUpperCase();
        const found = this.membersData.find(member => 
            member['Car Number'].toUpperCase() === carNumber
        );

        if (!found) {
            return `No car found with number ${carNumber}.`;
        }

        const memberStatus = found.Member === 'Y' ? '✅ Active Member' : '❌ Non-Member';
        return `Car Details for ${carNumber}:\n\n` +
               `👤 **${found['First Name']} ${found['Last Name']}**\n` +
               `${memberStatus}\n` +
               `🚗 ${found['Car Type']} by ${found['Car Manufacturer']}`;
    }

    getMemberStats() {
        const activeMembers = this.membersData.filter(member => member.Member === 'Y');
        const nonMembers = this.membersData.filter(member => member.Member === 'N');
        
        const jaguarCars = this.membersData.filter(member => member['Car Manufacturer'] === 'Jaguar');
        
        return `📊 **SJIOC Statistics:**\n\n` +
               `👥 Total Records: ${this.membersData.length}\n` +
               `✅ Active Members: ${activeMembers.length}\n` +
               `❌ Non-Members: ${nonMembers.length}\n` +
               `🐆 Jaguar Cars: ${jaguarCars.length}\n` +
               `🚗 Other Brands: ${this.membersData.length - jaguarCars.length}`;
    }

    getListResponse(message) {
        if (message.includes('jaguar')) {
            return this.searchByManufacturer('jaguar cars');
        } else if (message.includes('member')) {
            const activeMembers = this.membersData.filter(member => member.Member === 'Y');
            let response = `📋 **Active SJIOC Members (${activeMembers.length}):**\n\n`;
            activeMembers.forEach(member => {
                response += `👤 ${member['First Name']} ${member['Last Name']} - ${member['Car Manufacturer']} ${member['Car Type']}\n`;
            });
            return response;
        } else {
            return this.getMemberStats();
        }
    }

    getGreetingResponse() {
        const responses = [
            "Hello! I'm your SJIOC car assistant. How can I help you today?",
            "Hi there! Ready to explore our Jaguar community cars?",
            "Greetings! Ask me about any SJIOC member's car details.",
            "Welcome! I can help you find information about our car members."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getHelpResponse() {
        return `🤖 **I can help you with:**\n\n` +
               `🔍 **Search by name:** "Show me John's car" or "Find Sarah"\n` +
               `🏭 **By manufacturer:** "List Jaguar cars" or "BMW cars"\n` +
               `🔢 **By car number:** "Find GJ-01-AB-1234"\n` +
               `📊 **Statistics:** "How many members?" or "Member count"\n` +
               `📋 **Lists:** "List all members" or "Show active members"\n\n` +
               `Just type your question naturally - I'll understand!`;
    }

    getDefaultResponse() {
        return "I'm not sure I understand that query. Try asking about:\n" +
               "• A member's name (e.g., 'John's car')\n" +
               "• Car manufacturer (e.g., 'Jaguar cars')\n" +
               "• Car numbers (e.g., 'GJ-01-AB-1234')\n" +
               "• General info (e.g., 'member count')\n\n" +
               "Type 'help' for more examples!";
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    scrollToBottom() {
        this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SJIOCChatbot();
});
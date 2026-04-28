// ========== API BASE URL (change when deploying) ==========
const API_BASE = window.location.origin;

// ========== LOAD ALL CHARACTERS ==========
async function loadAllCharacters() {
    try {
        const response = await fetch(`${API_BASE}/api/get-bots`);
        const characters = await response.json();
        
        const grid = document.getElementById('characters-grid');
        
        if (!characters || characters.length === 0) {
            grid.innerHTML = '<div class="loading">No characters yet. <a href="creator.html">Create the first one!</a></div>';
            return;
        }
        
        grid.innerHTML = characters.map(char => `
            <div class="character-card" onclick="startChat('${char.id}')">
                <img src="${char.avatar || 'https://via.placeholder.com/80'}" alt="${char.name}">
                <h3>${escapeHtml(char.name)}</h3>
                <p>${escapeHtml(char.personality.substring(0, 100))}...</p>
                <small>Click to chat →</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading characters:', error);
        document.getElementById('characters-grid').innerHTML = '<div class="loading">Error loading. Make sure backend is deployed.</div>';
    }
}

// ========== CREATE NEW CHARACTER ==========
async function createNewCharacter(event) {
    event.preventDefault();
    
    const name = document.getElementById('char-name').value;
    const personality = document.getElementById('char-personality').value;
    const avatar = document.getElementById('char-avatar').value;
    
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'Creating character...';
    
    try {
        const response = await fetch(`${API_BASE}/api/create-bot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, personality, avatar })
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultDiv.innerHTML = `✅ Character "${name}" created! <a href="chat.html?id=${data.id}">Chat now →</a>`;
            document.getElementById('creator-form').reset();
        } else {
            resultDiv.innerHTML = `❌ Error: ${data.error}`;
        }
    } catch (error) {
        resultDiv.innerHTML = '❌ Network error. Make sure backend is running.';
    }
}

// ========== START CHAT ==========
function startChat(characterId) {
    window.location.href = `chat.html?id=${characterId}`;
}

// ========== LOAD CHARACTER FOR CHAT ==========
let currentCharacter = null;
let conversationHistory = [];

async function loadCharacter(characterId) {
    try {
        const response = await fetch(`${API_BASE}/api/get-bots`);
        const characters = await response.json();
        
        currentCharacter = characters.find(c => c.id === characterId);
        
        if (currentCharacter) {
            document.getElementById('char-name').innerText = currentCharacter.name;
            document.getElementById('char-avatar').src = currentCharacter.avatar || 'https://via.placeholder.com/80';
            
            // Initialize conversation with character's personality
            conversationHistory = [
                { role: "system", content: currentCharacter.personality }
            ];
        } else {
            document.getElementById('char-name').innerText = 'Character not found';
        }
    } catch (error) {
        console.error('Error loading character:', error);
    }
}

// ========== SEND MESSAGE ==========
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message || !currentCharacter) return;
    
    // Add user message to chat display
    addMessageToChat('user', message);
    input.value = '';
    
    // Add to conversation history
    conversationHistory.push({ role: "user", content: message });
    
    // Show typing indicator
    const typingId = addTypingIndicator();
    
    try {
        const response = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: conversationHistory,
                characterName: currentCharacter.name
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        // Add AI reply
        addMessageToChat('ai', data.reply);
        
        // Add to conversation history
        conversationHistory.push({ role: "assistant", content: data.reply });
        
        // Keep history manageable (last 20 messages)
        if (conversationHistory.length > 20) {
            conversationHistory = [conversationHistory[0], ...conversationHistory.slice(-18)];
        }
        
    } catch (error) {
        removeTypingIndicator(typingId);
        addMessageToChat('ai', 'Sorry, I had an error. Please try again.');
    }
}

function addMessageToChat(role, content) {
    const chatDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role === 'user' ? 'user-message' : 'ai-message'}`;
    messageDiv.innerHTML = `<strong>${role === 'user' ? 'You' : 'AI'}:</strong><br>${escapeHtml(content)}`;
    chatDiv.appendChild(messageDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

function addTypingIndicator() {
    const chatDiv = document.getElementById('chat-messages');
    const id = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = id;
    typingDiv.className = 'message ai-message';
    typingDiv.innerHTML = '<em>AI is typing...</em>';
    chatDiv.appendChild(typingDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

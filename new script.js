// ========== TEMPORARY FAKE DATA VERSION ==========
// This lets you see the design without a backend

async function loadAllCharacters() {
    // Fake characters for testing
    const fakeCharacters = [
        {
            id: '1',
            name: 'Obsessive CEO',
            personality: 'Cold, possessive, rich. You own a company and demand respect.',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        {
            id: '2',
            name: 'Shy Best Friend',
            personality: 'Quiet, caring, nervous around you. You blush easily.',
            avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
        },
        {
            id: '3',
            name: 'Mafia Boss',
            personality: 'Dangerous, protective, speaks in threats and promises.',
            avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
        }
    ];
    
    const grid = document.getElementById('characters-grid');
    
    grid.innerHTML = fakeCharacters.map(char => `
        <div class="character-card" onclick="startChat('${char.id}')">
            <img src="${char.avatar}" alt="${char.name}">
            <h3>${escapeHtml(char.name)}</h3>
            <p>${escapeHtml(char.personality.substring(0, 100))}...</p>
            <small>Click to chat →</small>
        </div>
    `).join('');
}

async function createNewCharacter(event) {
    event.preventDefault();
    const name = document.getElementById('char-name').value;
    const resultDiv = document.getElementById('result');
    
    // Fake success message
    resultDiv.innerHTML = `✅ "${name}" would be saved here! (Backend coming in Step 3)`;
    setTimeout(() => {
        resultDiv.innerHTML = '';
    }, 3000);
}

// Keep all the other functions the same (startChat, loadCharacter, sendMessage, etc.)
// Just paste the rest of your original script.js below this

function startChat(characterId) {
    window.location.href = `chat.html?id=${characterId}`;
}

let currentCharacter = null;
let conversationHistory = [];

async function loadCharacter(characterId) {
    const fakeCharacters = {
        '1': { name: 'Obsessive CEO', personality: 'Cold, possessive, rich. You own a company and demand respect.', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
        '2': { name: 'Shy Best Friend', personality: 'Quiet, caring, nervous around you. You blush easily.', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
        '3': { name: 'Mafia Boss', personality: 'Dangerous, protective, speaks in threats and promises.', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' }
    };
    
    currentCharacter = fakeCharacters[characterId];
    
    if (currentCharacter) {
        document.getElementById('char-name').innerText = currentCharacter.name;
        document.getElementById('char-avatar').src = currentCharacter.avatar;
        conversationHistory = [
            { role: "system", content: currentCharacter.personality }
        ];
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message || !currentCharacter) return;
    
    addMessageToChat('user', message);
    input.value = '';
    
    const typingId = addTypingIndicator();
    
    // Simulate AI response (fake for testing)
    setTimeout(() => {
        removeTypingIndicator(typingId);
        const fakeReplies = [
            "I've been thinking about you all day...",
            "That's exactly what I like to hear.",
            "Tell me more. I'm listening.",
            "You have my full attention.",
            "Interesting. What else?"
        ];
        const fakeReply = fakeReplies[Math.floor(Math.random() * fakeReplies.length)];
        addMessageToChat('ai', fakeReply);
        conversationHistory.push({ role: "assistant", content: fakeReply });
    }, 1000);
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

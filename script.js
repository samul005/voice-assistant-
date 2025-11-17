// DOM Elements
const micButton = document.getElementById('micButton');
const micStatus = document.getElementById('micStatus');
const responseText = document.getElementById('responseText');
const avatar = document.getElementById('avatar');
const settingsButton = document.getElementById('settingsButton');
const historyButton = document.getElementById('historyButton');
const settingsPanel = document.getElementById('settingsPanel');
const historyPanel = document.getElementById('historyPanel');
const closeSettings = document.getElementById('closeSettings');
const closeHistory = document.getElementById('closeHistory');
const wakeWordToggle = document.getElementById('wakeWordToggle');
const aiToggle = document.getElementById('aiToggle');
const backendStatus = document.getElementById('backendStatus');
const voiceSpeed = document.getElementById('voiceSpeed');
const voiceSpeedValue = document.getElementById('voiceSpeedValue');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const historyList = document.getElementById('historyList');

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

// Speech Synthesis Setup
const synth = window.speechSynthesis;

// Backend Configuration
// Update this URL when you deploy backend to Render/Railway/Heroku
const BACKEND_URL = 'https://voice-assistant-backend.onrender.com'; // Change to your deployed backend URL
const FALLBACK_BACKEND_URL = 'http://localhost:5000';
let useBackend = false;
let sessionId = generateSessionId();
let localHistory = [];
let currentVoiceSpeed = 1.0;

// Wake word detection
let wakeWordEnabled = false;
let isListeningForWakeWord = false;
let wakeWordRecognition = null;

// Initialize Speech Recognition if available
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    // Initialize wake word recognition
    wakeWordRecognition = new SpeechRecognition();
    wakeWordRecognition.continuous = true;
    wakeWordRecognition.interimResults = true;
    wakeWordRecognition.lang = 'en-US';

    recognition.onstart = () => {
        isListening = true;
        setAvatarState('listening');
        micButton.classList.add('active');
        micStatus.textContent = 'Listening...';
        responseText.textContent = 'I\'m listening...';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        console.log('User said:', transcript);
        processCommand(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        handleError(event.error);
    };

    recognition.onend = () => {
        isListening = false;
        micButton.classList.remove('active');
        micStatus.textContent = wakeWordEnabled ? 'Say "Hey Vyra"' : 'Tap to speak';
        if (avatar.classList.contains('listening')) {
            setAvatarState('idle');
        }
        
        // Restart wake word listening if enabled
        if (wakeWordEnabled && !isListeningForWakeWord) {
            startWakeWordListening();
        }
    };

    // Wake word recognition handlers
    wakeWordRecognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.toLowerCase().trim();
            console.log('Wake word listening:', transcript);
            
            if (transcript.includes('hey vyra') || transcript.includes('hi vyra') || 
                transcript.includes('hey vira') || transcript.includes('hi vira')) {
                console.log('Wake word detected!');
                stopWakeWordListening();
                speak('Yes?');
                setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (error) {
                        console.error('Error starting recognition after wake word:', error);
                        startWakeWordListening();
                    }
                }, 1500);
                break;
            }
        }
    };

    wakeWordRecognition.onerror = (event) => {
        console.error('Wake word recognition error:', event.error);
        if (wakeWordEnabled && event.error !== 'aborted') {
            setTimeout(() => {
                if (wakeWordEnabled && !isListening) {
                    startWakeWordListening();
                }
            }, 1000);
        }
    };

    wakeWordRecognition.onend = () => {
        if (wakeWordEnabled && !isListening) {
            setTimeout(() => {
                startWakeWordListening();
            }, 100);
        }
    };
}

// Microphone Button Click Handler
micButton.addEventListener('click', async () => {
    if (!recognition) {
        responseText.textContent = 'Sorry, speech recognition is not supported in your browser. Please use Chrome or Edge.';
        return;
    }

    // If wake word is active, stop it temporarily
    if (wakeWordEnabled && isListeningForWakeWord) {
        stopWakeWordListening();
    }

    // Request microphone permission first
    if (!isListening) {
        try {
            // Check if microphone is available
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            
            if (audioInputs.length === 0) {
                displayResponse('No microphone detected. Please connect a microphone and try again.');
                speak('No microphone detected. Please connect a microphone.');
                return;
            }
            
            // Request permission using getUserMedia
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop the stream immediately - we just needed permission
            stream.getTracks().forEach(track => track.stop());
            
            recognition.start();
        } catch (error) {
            console.error('Microphone permission error:', error);
            let errorMessage = 'Microphone access issue. ';
            
            if (error.name === 'NotFoundError') {
                errorMessage = 'No microphone found. Please connect a microphone or check your device settings.';
            } else if (error.name === 'NotAllowedError') {
                errorMessage = 'Microphone access denied. Please allow microphone permissions in your browser settings.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Microphone is being used by another application. Please close other apps and try again.';
            } else {
                errorMessage = 'Unable to access microphone. Please check your device settings and try again.';
            }
            
            displayResponse(errorMessage);
            speak('Unable to access microphone');
        }
    } else {
        recognition.stop();
    }
});

// Process Voice Commands
async function processCommand(command) {
    const commandLower = command.toLowerCase();
    
    // Try backend first if enabled
    if (useBackend) {
        let response = null;
        try {
            response = await fetch(`${BACKEND_URL}/api/process-command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    command: command,
                    session_id: sessionId,
                    use_ai: aiToggle.checked
                })
            });
        } catch (error) {
            // Try fallback URL
            try {
                response = await fetch(`${FALLBACK_BACKEND_URL}/api/process-command`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        command: command,
                        session_id: sessionId,
                        use_ai: aiToggle.checked
                    })
                });
            } catch (fallbackError) {
                console.error('Both backend URLs failed:', error, fallbackError);
            }
        }

        if (response && response.ok) {
            try {
                const data = await response.json();
                addToHistory(command, data.response);
                displayResponse(data.response);
                
                let action = null;
                if (data.action) {
                    if (data.action.type === 'open_url') {
                        action = () => window.open(data.action.url, '_blank');
                    } else if (data.action.type === 'search') {
                        if (data.action.platform === 'youtube') {
                            action = () => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.action.query)}`, '_blank');
                        } else if (data.action.platform === 'google') {
                            action = () => window.open(`https://www.google.com/search?q=${encodeURIComponent(data.action.query)}`, '_blank');
                        }
                    }
                }
                
                speak(data.response, action);
                return;
            } catch (parseError) {
                console.error('Error parsing backend response:', parseError);
            }
        }
    }

    // Fallback to local processing
    let response = '';
    let action = null;

    // Greetings
    if (commandLower.includes('hello') || commandLower.includes('hi') || commandLower.includes('hey')) {
        response = 'Hello! How can I help you today?';
    }
    // Name
    else if (commandLower.includes('your name') || commandLower.includes('who are you')) {
        response = 'I am Vyra, your web assistant!';
    }
    // Time
    else if (commandLower.includes('time') || commandLower.includes('what time')) {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        response = `The current time is ${time}`;
    }
    // Date
    else if (commandLower.includes('date') || commandLower.includes('today')) {
        const now = new Date();
        const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        response = `Today is ${date}`;
    }
    // Joke
    else if (commandLower.includes('joke') || commandLower.includes('funny')) {
        const jokes = [
            'Why did the programmer quit his job? Because he didn\'t get arrays!',
            'Why do programmers prefer dark mode? Because light attracts bugs!',
            'What\'s a computer\'s favorite snack? Microchips!',
            'Why did the developer go broke? Because he used up all his cache!',
            'How many programmers does it take to change a light bulb? None, that\'s a hardware problem!'
        ];
        response = jokes[Math.floor(Math.random() * jokes.length)];
    }
    // Open YouTube
    else if (commandLower.includes('open youtube')) {
        response = 'Opening YouTube for you!';
        action = () => window.open('https://www.youtube.com', '_blank');
    }
    // Open Google
    else if (commandLower.includes('open google')) {
        response = 'Opening Google!';
        action = () => window.open('https://www.google.com', '_blank');
    }
    // Open Instagram
    else if (commandLower.includes('open instagram')) {
        response = 'Opening Instagram!';
        action = () => window.open('https://www.instagram.com', '_blank');
    }
    // Search YouTube
    else if (commandLower.includes('search') && commandLower.includes('youtube')) {
        const query = extractSearchQuery(commandLower, 'youtube');
        response = `Searching YouTube for ${query}`;
        action = () => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    }
    // Search Google
    else if (commandLower.includes('search') && (commandLower.includes('google') || commandLower.includes('for'))) {
        const query = extractSearchQuery(commandLower, 'google');
        response = `Searching Google for ${query}`;
        action = () => window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
    // Default
    else {
        response = 'I\'m not sure how to help with that. Try saying hello, asking for the time, or requesting to open a website.';
    }

    // Display and speak response
    addToHistory(command, response);
    displayResponse(response);
    speak(response, action);
}

// Extract search query from command
function extractSearchQuery(command, platform) {
    let query = command;
    
    if (platform === 'youtube') {
        query = command.replace(/search|youtube|on|for/gi, '').trim();
    } else if (platform === 'google') {
        query = command.replace(/search|google|on|for/gi, '').trim();
    }
    
    return query || 'search';
}

// Display response text
function displayResponse(text) {
    responseText.textContent = text;
}

// Speak response using Text-to-Speech
function speak(text, callback) {
    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = currentVoiceSpeed;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a preferred voice
    const voices = synth.getVoices();
    const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && (voice.name.includes('Female') || voice.name.includes('Google'))
    );
    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
        setAvatarState('speaking');
    };

    utterance.onend = () => {
        setAvatarState('idle');
        if (callback) {
            setTimeout(callback, 500);
        }
    };

    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setAvatarState('idle');
        if (callback) {
            callback();
        }
    };

    synth.speak(utterance);
}

// Set avatar animation state
function setAvatarState(state) {
    avatar.classList.remove('idle', 'listening', 'speaking');
    avatar.classList.add(state);
}

// Handle errors
function handleError(error) {
    let message = '';
    switch (error) {
        case 'no-speech':
            message = 'I didn\'t hear anything. Please try again.';
            break;
        case 'audio-capture':
            message = 'Microphone not detected. Please check your device.';
            break;
        case 'not-allowed':
            message = 'Microphone access denied. Please allow microphone permissions in your browser settings. Click the lock icon in the address bar to grant access.';
            speak('Please allow microphone permissions to use voice features');
            break;
        default:
            message = 'Something went wrong. Please try again.';
    }
    displayResponse(message);
    setAvatarState('idle');
}

// Load voices when available
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = () => {
        synth.getVoices();
    };
}

// Initialize avatar state
setAvatarState('idle');

// Check microphone permissions on load
async function checkMicrophonePermissions() {
    try {
        const result = await navigator.permissions.query({ name: 'microphone' });
        if (result.state === 'denied') {
            responseText.textContent = 'Microphone access is blocked. Click the lock icon in the address bar to grant permissions.';
        } else if (result.state === 'prompt') {
            responseText.textContent = 'Hi! Tap the microphone to speak to me. You\'ll need to allow microphone access.';
        }
    } catch (error) {
        // Permissions API not supported in all browsers
        console.log('Permissions API not available');
    }
}

checkMicrophonePermissions();

// Panel Controls
settingsButton.addEventListener('click', () => {
    settingsPanel.classList.toggle('active');
    historyPanel.classList.remove('active');
});

historyButton.addEventListener('click', () => {
    historyPanel.classList.toggle('active');
    settingsPanel.classList.remove('active');
    displayHistory();
});

closeSettings.addEventListener('click', () => {
    settingsPanel.classList.remove('active');
});

closeHistory.addEventListener('click', () => {
    historyPanel.classList.remove('active');
});

// Wake Word Toggle
wakeWordToggle.addEventListener('change', async (e) => {
    wakeWordEnabled = e.target.checked;
    localStorage.setItem('vyra_wake_word', wakeWordEnabled);
    
    if (wakeWordEnabled) {
        // Request microphone permission first
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            
            if (audioInputs.length === 0) {
                displayResponse('No microphone detected for wake word.');
                wakeWordToggle.checked = false;
                wakeWordEnabled = false;
                return;
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            
            startWakeWordListening();
            displayResponse('Wake word enabled. Say \"Hey Vyra\" to activate!');
            speak('Wake word enabled. Just say Hey Vyra to activate me.');
        } catch (error) {
            console.error('Wake word permission error:', error);
            wakeWordToggle.checked = false;
            wakeWordEnabled = false;
            displayResponse('Microphone access needed for wake word feature.');
        }
    } else {
        stopWakeWordListening();
        setAvatarState('idle');
        micStatus.textContent = 'Tap to speak';
        displayResponse('Wake word disabled. Tap the microphone to speak.');
    }
});

// AI Toggle
aiToggle.addEventListener('change', (e) => {
    useBackend = e.target.checked;
    localStorage.setItem('vyra_use_ai', useBackend);
    if (useBackend) {
        checkBackendHealth();
    }
});

// Voice Speed Control
voiceSpeed.addEventListener('input', (e) => {
    currentVoiceSpeed = parseFloat(e.target.value);
    voiceSpeedValue.textContent = currentVoiceSpeed.toFixed(1) + 'x';
    localStorage.setItem('vyra_voice_speed', currentVoiceSpeed);
});

// Clear History
clearHistoryButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear chat history?')) {
        localHistory = [];
        if (useBackend) {
            try {
                await fetch(`${BACKEND_URL}/api/clear-history`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId })
                });
            } catch (error) {
                console.error('Error clearing backend history:', error);
            }
        }
        displayHistory();
        responseText.textContent = 'Chat history cleared!';
    }
});

// Generate Session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Wake word functions
function startWakeWordListening() {
    if (!wakeWordRecognition || isListening) return;
    
    try {
        isListeningForWakeWord = true;
        wakeWordRecognition.start();
        micStatus.textContent = 'Say "Hey Vyra"';
        setAvatarState('listening');
        console.log('Wake word listening started');
    } catch (error) {
        console.error('Error starting wake word listening:', error);
        isListeningForWakeWord = false;
    }
}

function stopWakeWordListening() {
    if (!wakeWordRecognition) return;
    
    try {
        isListeningForWakeWord = false;
        wakeWordRecognition.stop();
        console.log('Wake word listening stopped');
    } catch (error) {
        console.error('Error stopping wake word listening:', error);
    }
}

// Check Backend Health
async function checkBackendHealth() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/health`);
        if (response.ok) {
            const data = await response.json();
            backendStatus.textContent = data.ai_enabled ? 'Online (AI Enabled)' : 'Online (AI Disabled)';
            backendStatus.className = 'status-indicator online';
            return true;
        }
    } catch (error) {
        // Try fallback URL
        try {
            const fallbackResponse = await fetch(`${FALLBACK_BACKEND_URL}/api/health`);
            if (fallbackResponse.ok) {
                const data = await fallbackResponse.json();
                backendStatus.textContent = 'Online (Local) - ' + (data.ai_enabled ? 'AI Enabled' : 'AI Disabled');
                backendStatus.className = 'status-indicator online';
                return true;
            }
        } catch (fallbackError) {
            backendStatus.textContent = 'Offline';
            backendStatus.className = 'status-indicator offline';
            aiToggle.checked = false;
            useBackend = false;
        }
    }
    return false;
}

// Display History
function displayHistory() {
    if (localHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No chat history yet. Start talking to Vyra!</p>';
        return;
    }

    historyList.innerHTML = localHistory.map(item => `
        <div class="history-item">
            <div class="history-item-user"><strong>You:</strong> ${item.user}</div>
            <div class="history-item-vyra"><strong>Vyra:</strong> ${item.assistant}</div>
            <div class="history-item-time">${new Date(item.timestamp).toLocaleString()}</div>
        </div>
    `).reverse().join('');
}

// Add to History
function addToHistory(userText, vyraResponse) {
    localHistory.push({
        user: userText,
        assistant: vyraResponse,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 items
    if (localHistory.length > 50) {
        localHistory = localHistory.slice(-50);
    }
}

// Load Settings
function loadSettings() {
    const savedWakeWord = localStorage.getItem('vyra_wake_word');
    const savedAiMode = localStorage.getItem('vyra_use_ai');
    const savedVoiceSpeed = localStorage.getItem('vyra_voice_speed');
    
    if (savedWakeWord === 'true') {
        wakeWordToggle.checked = true;
        wakeWordEnabled = true;
        // Will start after mic permission check
    }
    
    if (savedAiMode === 'true') {
        aiToggle.checked = true;
        useBackend = true;
        checkBackendHealth();
    }
    
    if (savedVoiceSpeed) {
        currentVoiceSpeed = parseFloat(savedVoiceSpeed);
        voiceSpeed.value = currentVoiceSpeed;
        voiceSpeedValue.textContent = currentVoiceSpeed.toFixed(1) + 'x';
    }
}

// Initialize
loadSettings();
checkBackendHealth();

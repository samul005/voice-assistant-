# Vyra Web Assistant

A modern, AI-powered voice assistant that runs directly in your browser with optional Python backend for enhanced capabilities.

## Features

### Client-Side (No Backend Required)
- 🎤 Voice recognition using Web Speech API
- 🔊 Text-to-speech responses
- 🎨 Beautiful animated avatar with state transitions
- ⏰ Basic commands (time, date, jokes, web searches)
- 📱 Fully responsive design

### Enhanced with Python Backend
- 🤖 AI-powered responses using Google Gemini
- 💬 Chat history tracking
- 🧠 Context-aware conversations
- ⚙️ Customizable settings
- 📊 Backend health monitoring

## Quick Start

### Option 1: Client-Only (No Installation)
Simply open `index.html` in any modern browser (Chrome/Edge recommended).

### Option 2: With Python Backend (Enhanced Features)

#### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 2. Configure API Key (Optional for AI)
Create a `.env` file:
```
GEMINI_API_KEY=your_actual_api_key_here
```

Get your free API key at: https://makersuite.google.com/app/apikey

#### 3. Start Backend Server
```bash
python app.py
```

#### 4. Open Website
Open `index.html` in your browser and enable "AI Mode" in settings.

## Supported Commands

### Basic Commands (Work Offline)
- **Greetings**: "Hello Vyra", "Hi"
- **Time**: "What time is it?"
- **Date**: "What's the date today?"
- **Jokes**: "Tell me a joke"
- **Open Sites**: "Open YouTube/Google/Instagram"
- **Search**: "Search YouTube for cats", "Search Google for Python"

### AI-Enhanced (With Backend)
- Ask any general question
- Have natural conversations
- Context-aware responses
- More intelligent command interpretation

## Settings

Access settings via the gear icon:
- **Enable AI Mode**: Toggle backend AI processing
- **Backend Status**: Check server connection
- **Voice Speed**: Adjust speech rate (0.5x - 2.0x)
- **Clear History**: Reset conversation history

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Safari (Limited speech recognition)
- ✅ Firefox (Limited speech recognition)
- ⚠️ Microphone permissions required

## Technical Stack

**Frontend:**
- HTML5
- CSS3 (Custom animations)
- Vanilla JavaScript
- Web Speech API

**Backend (Optional):**
- Python 3.8+
- Flask
- Google Generative AI (Gemini)
- Flask-CORS

## Project Structure
```
├── index.html          # Main HTML file
├── styles.css          # Styling and animations
├── script.js           # Frontend logic
├── app.py              # Python backend server
├── requirements.txt    # Python dependencies
├── .env.example        # Environment template
└── README.md           # Documentation
```

## Troubleshooting

**"Speech recognition not supported"**
- Use Chrome or Edge browser
- Check microphone permissions

**"Backend offline"**
- Ensure Python server is running: `python app.py`
- Check if port 5000 is available
- Verify firewall settings

**"AI responses not working"**
- Add GEMINI_API_KEY to .env file
- Restart backend server
- Check API key validity

## Future Enhancements
- Wake word detection
- Multiple language support
- Custom voice selection
- Theme customization
- Mobile app version

## License
MIT License - Feel free to modify and distribute!

## Credits
Built with ❤️ for seamless voice interaction on the web.

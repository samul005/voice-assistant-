from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Configure OpenRouter AI with Gemini 2.0 Flash
DEFAULT_API_KEY = "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"
OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY', DEFAULT_API_KEY)

SYSTEM_PROMPT = ("You are Vyra, a friendly and helpful personal voice assistant. "
                 "Keep your responses concise and conversational, suitable for voice interaction. "
                 "Limit responses to 2-3 sentences when possible.")

# Initialize OpenRouter client
try:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
        default_headers={
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "Vyra Web Assistant"
        }
    )
    model = "google/gemini-2.0-flash-exp:free"
    ai_available = True
except Exception as e:
    print(f"Failed to initialize AI client: {e}")
    client = None
    ai_available = False

# Chat history storage
chat_histories = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'ai_enabled': ai_available,
        'ai_model': model if ai_available else None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/process-command', methods=['POST'])
def process_command():
    try:
        data = request.json
        command = data.get('command', '').lower().strip()
        session_id = data.get('session_id', 'default')
        use_ai = data.get('use_ai', False) and ai_available
        
        # Initialize chat history for session
        if session_id not in chat_histories:
            chat_histories[session_id] = []
        
        # Check for basic commands first
        basic_response = handle_basic_commands(command)
        
        if basic_response:
            return jsonify(basic_response)
        
        # Use AI for complex queries if enabled
        if use_ai:
            ai_response = get_ai_response(command, session_id)
            if ai_response:
                return jsonify(ai_response)
        
        # Fallback response
        return jsonify({
            'response': "I'm not sure how to help with that. Try asking me about the time, weather, or general questions.",
            'action': None,
            'confidence': 0.3
        })
        
    except Exception as e:
        print(f"Error processing command: {e}")
        return jsonify({
            'response': 'Sorry, I encountered an error processing your request.',
            'action': None,
            'error': str(e)
        }), 500

def handle_basic_commands(command):
    """Handle basic predefined commands"""
    
    # Greetings
    if any(word in command for word in ['hello', 'hi', 'hey', 'greetings']):
        return {
            'response': 'Hello! How can I help you today?',
            'action': None,
            'confidence': 1.0
        }
    
    # Name/Identity
    if 'your name' in command or 'who are you' in command:
        return {
            'response': 'I am Vyra, your intelligent web assistant powered by advanced AI!',
            'action': None,
            'confidence': 1.0
        }
    
    # Time
    if 'time' in command or 'what time' in command:
        now = datetime.now()
        time_str = now.strftime('%I:%M %p')
        return {
            'response': f'The current time is {time_str}',
            'action': None,
            'confidence': 1.0
        }
    
    # Date
    if 'date' in command or 'today' in command:
        now = datetime.now()
        date_str = now.strftime('%A, %B %d, %Y')
        return {
            'response': f'Today is {date_str}',
            'action': None,
            'confidence': 1.0
        }
    
    # Jokes
    if 'joke' in command or 'funny' in command:
        jokes = [
            'Why did the programmer quit his job? Because he didn\'t get arrays!',
            'Why do programmers prefer dark mode? Because light attracts bugs!',
            'What\'s a computer\'s favorite snack? Microchips!',
            'Why did the developer go broke? Because he used up all his cache!',
            'How many programmers does it take to change a light bulb? None, that\'s a hardware problem!',
            'Why do Python programmers prefer snakes? Because they\'re byte-friendly!',
            'What did the AI say to the programmer? You complete me... literally!'
        ]
        import random
        return {
            'response': random.choice(jokes),
            'action': None,
            'confidence': 1.0
        }
    
    # Open websites
    if 'open youtube' in command:
        return {
            'response': 'Opening YouTube for you!',
            'action': {'type': 'open_url', 'url': 'https://www.youtube.com'},
            'confidence': 1.0
        }
    
    if 'open google' in command:
        return {
            'response': 'Opening Google!',
            'action': {'type': 'open_url', 'url': 'https://www.google.com'},
            'confidence': 1.0
        }
    
    if 'open instagram' in command:
        return {
            'response': 'Opening Instagram!',
            'action': {'type': 'open_url', 'url': 'https://www.instagram.com'},
            'confidence': 1.0
        }
    
    if 'open twitter' in command or 'open x' in command:
        return {
            'response': 'Opening Twitter!',
            'action': {'type': 'open_url', 'url': 'https://www.twitter.com'},
            'confidence': 1.0
        }
    
    if 'open github' in command:
        return {
            'response': 'Opening GitHub!',
            'action': {'type': 'open_url', 'url': 'https://www.github.com'},
            'confidence': 1.0
        }
    
    # Search commands
    if 'search' in command and 'youtube' in command:
        query = command.replace('search', '').replace('youtube', '').replace('on', '').replace('for', '').strip()
        if query:
            return {
                'response': f'Searching YouTube for {query}',
                'action': {'type': 'search', 'platform': 'youtube', 'query': query},
                'confidence': 1.0
            }
    
    if 'search' in command and ('google' in command or 'for' in command):
        query = command.replace('search', '').replace('google', '').replace('on', '').replace('for', '').strip()
        if query:
            return {
                'response': f'Searching Google for {query}',
                'action': {'type': 'search', 'platform': 'google', 'query': query},
                'confidence': 1.0
            }
    
    # Capabilities
    if 'what can you do' in command or 'help me' in command or 'your capabilities' in command:
        return {
            'response': 'I can help you with time and date, tell jokes, open websites like YouTube and Google, search the web, and answer general questions using AI!',
            'action': None,
            'confidence': 1.0
        }
    
    return None

def get_ai_response(command, session_id):
    """Get AI-powered response using OpenRouter (Gemini 2.0 Flash)"""
    if not client or not ai_available:
        return None
    
    try:
        # Build messages from chat history
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Add recent conversation history
        if chat_histories[session_id]:
            for item in chat_histories[session_id][-5:]:  # Last 5 exchanges
                messages.append({"role": "user", "content": item['user']})
                messages.append({"role": "assistant", "content": item['assistant']})
        
        # Add current user message
        messages.append({"role": "user", "content": command})
        
        # Generate response using OpenRouter
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=150
        )
        
        ai_text = response.choices[0].message.content.strip()
        
        # Store in history
        chat_histories[session_id].append({
            'user': command,
            'assistant': ai_text,
            'timestamp': datetime.now().isoformat()
        })
        
        # Keep only last 10 exchanges
        if len(chat_histories[session_id]) > 10:
            chat_histories[session_id] = chat_histories[session_id][-10:]
        
        return {
            'response': ai_text,
            'action': None,
            'confidence': 0.9,
            'ai_powered': True
        }
        
    except Exception as e:
        print(f"AI error: {e}")
        return None

@app.route('/api/clear-history', methods=['POST'])
def clear_history():
    try:
        data = request.json
        session_id = data.get('session_id', 'default')
        
        if session_id in chat_histories:
            chat_histories[session_id] = []
        
        return jsonify({
            'success': True,
            'message': 'Chat history cleared'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/history', methods=['POST'])
def get_history():
    try:
        data = request.json
        session_id = data.get('session_id', 'default')
        
        history = chat_histories.get(session_id, [])
        
        return jsonify({
            'success': True,
            'history': history
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Vyra Web Assistant Backend...")
    print(f"AI Mode: {'Enabled' if ai_available else 'Disabled'}")
    if ai_available:
        print(f"Using Model: {model} via OpenRouter")
    app.run(debug=True, host='0.0.0.0', port=5000)

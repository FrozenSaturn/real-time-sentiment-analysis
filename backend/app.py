# backend/app.py

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob

# Initialize Flask app
app = Flask(__name__)

# Configuration
DEBUG_MODE = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
PORT = int(os.environ.get('FLASK_PORT', 5001))

# Enable CORS
CORS(app) 

# Setup basic logging
logging.basicConfig(level=logging.INFO) 

def make_error(status_code, message, error_type="Error"):
    """Helper function to create a consistent JSON error response."""
    response = jsonify({
        'status': status_code,
        'error': error_type,
        'message': message
    })
    response.status_code = status_code
    return response

@app.route('/analyze_sentiment', methods=['POST'])
def analyze_sentiment():
    app.logger.info(f"Received request for /analyze_sentiment from {request.remote_addr}")
    
    if not request.is_json:
        app.logger.warning("Request content type was not JSON.")
        return make_error(400, "Request must be JSON", "BadRequest")

    data = request.get_json()
    if data is None:
        app.logger.warning("Failed to decode JSON from request.")
        return make_error(400, "Invalid JSON payload", "BadRequest")
        
    text_to_analyze = data.get('text')

    if text_to_analyze is None:
        app.logger.warning("Missing 'text' field in request.")
        return make_error(400, "Missing 'text' field in request", "BadRequest")
    
    if not isinstance(text_to_analyze, str):
        app.logger.warning(f"'text' field was not a string, type: {type(text_to_analyze)}.")
        return make_error(400, "'text' field must be a string", "BadRequest")

    app.logger.info(f"Analyzing text: '{text_to_analyze[:50]}...'") 

    try:
        # Perform sentiment analysis using TextBlob
        blob = TextBlob(text_to_analyze)
        sentiment = blob.sentiment
        
        response_data = {
            'polarity': sentiment.polarity,
            'subjectivity': sentiment.subjectivity
        }
        app.logger.info(f"Sentiment analysis successful: Polarity={sentiment.polarity:.4f}, Subjectivity={sentiment.subjectivity:.4f}")
        return jsonify(response_data)

    except Exception as e:
        app.logger.error(f"Error during sentiment analysis: {str(e)}", exc_info=True)
        return make_error(500, "An internal error occurred during sentiment analysis.", "InternalServerError")

# Generic error handlers 
@app.errorhandler(404)
def not_found_error(error):
    app.logger.warning(f"404 Not Found: {request.path} (Referrer: {request.referrer}, User-Agent: {request.user_agent.string})")
    return make_error(404, "Resource not found. Please check the URL.", "NotFound")

@app.errorhandler(500)
def internal_error(error):
    if not hasattr(error, 'json') or not error.json.get('error'):
      app.logger.error(f"Unhandled Internal Server Error: {error}", exc_info=True)
    return make_error(500, "An unexpected internal server error occurred.", "InternalServerError")


if __name__ == '__main__':
    app.logger.info(f"Starting Flask app in {'debug' if DEBUG_MODE else 'production'} mode on port {PORT}")
    app.run(debug=DEBUG_MODE, port=PORT, host='0.0.0.0')
# Real-time Text Sentiment Analyzer

Analyzes text sentiment in real-time. Frontend built with React (Vite), backend API with Flask and TextBlob.

## Tech Stack

* **Backend:** Python, Flask, TextBlob
* **Frontend:** React, Vite, JavaScript, CSS

## Setup & Run

**1. Backend (`/backend` directory):**

   ```bash
   # Create and activate virtual environment (use python3 if needed)
   python -m venv .venv
   # On macOS/Linux:
   source .venv/bin/activate
   # On Windows PowerShell:
   # .\.venv\Scripts\Activate.ps1

   # Install dependencies
   pip install -r requirements.txt

   # Download NLTK resources (if first time using TextBlob)
   python -c "import nltk; nltk.download('punkt'); nltk.download('averaged_perceptron_tagger')"
   
   # Run backend server (defaults to [http://127.0.0.1:5000](http://127.0.0.1:5000))
   python app.py

// frontend/src/App.jsx
import React, { useState, useCallback } from 'react';
import './App.css'; // We'll create/modify this later for basic styling

// Basic debounce function
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function App() {
  const [inputText, setInputText] = useState('');
  const [sentimentResult, setSentimentResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeText = async (text) => {
    if (!text.trim()) {
      setSentimentResult(null);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5001/analyze_sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSentimentResult(data);
    } catch (e) {
      console.error("Error analyzing sentiment:", e);
      setError(e.message || "Failed to analyze sentiment. Is the backend server running?");
      setSentimentResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a debounced version of analyzeText
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedAnalyzeText = useCallback(debounce(analyzeText, 500), []); // 500ms delay

  const handleInputChange = (event) => {
    const text = event.target.value;
    setInputText(text);
    debouncedAnalyzeText(text);
  };

  const getSentimentLabel = (polarity) => {
    if (polarity > 0.1) return "Positive 😊";
    if (polarity < -0.1) return "Negative 😠";
    if (polarity >= -0.1 && polarity <= 0.1) return "Neutral 😐";
    return "";
  };

  const getBackgroundColor = (polarity) => {
    if (polarity > 0.1) return "#e6ffed"; // Light green
    if (polarity < -0.1) return "#ffe6e6"; // Light red
    if (polarity >= -0.1 && polarity <= 0.1) return "#f0f0f0"; // Light gray
    return "white";
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Real-time Sentiment Analyzer</h1>
      </header>
      <main>
        <textarea
          className="text-input"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type your text here..."
          rows="5"
        />
        {isLoading && <p className="loading-text">Analyzing...</p>}
        {error && <p className="error-text">Error: {error}</p>}
        {sentimentResult && (
          <div className="result-container" style={{ backgroundColor: getBackgroundColor(sentimentResult.polarity) }}>
            <h2>Sentiment Analysis Result:</h2>
            <p><strong>Overall Sentiment:</strong> {getSentimentLabel(sentimentResult.polarity)}</p>
            <p><strong>Polarity Score:</strong> {sentimentResult.polarity.toFixed(4)}</p>
            <p><strong>Subjectivity Score:</strong> {sentimentResult.subjectivity.toFixed(4)}</p>
          </div>
        )}
      </main>
      <footer>
        <p>Powered by React, Flask, and TextBlob</p>
      </footer>
    </div>
  );
}

export default App;
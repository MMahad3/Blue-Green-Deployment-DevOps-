import React, { useState } from 'react';
import GestureRecognition from './gesturerecognition';
import './App.css';

function App() {
  const [gestureResult, setGestureResult] = useState('');
  const [detecting, setDetecting] = useState(false);

  const recognizeGesture = async (gestureName) => {
    if (!detecting) return;

    setDetecting(false);
    setGestureResult(`Detected: ${gestureName}`);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          gesture: gestureName,
          confidence: 0.8  // Default confidence for simplicity
        }),
      });

      const data = await response.json();
      setGestureResult(`${data.message}`);
    } catch (error) {
      console.error('Error:', error);
      setGestureResult(`Error recognizing gesture: ${error.message}`);
    }
  };

  const handleStartDetection = () => {
    setDetecting(true);
    setGestureResult('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="app-title">Gesture Recognition</h1>

        <div className="gesture-container">
          <GestureRecognition
            onGestureDetected={recognizeGesture}
            isDetecting={detecting}
            onDetectionStart={handleStartDetection}
          />
        </div>

        <button
          onClick={handleStartDetection}
          className="start-detection-button"
          disabled={detecting}
        >
          {detecting ? 'Detecting...' : 'Start Gesture Detection'}
        </button>

        {gestureResult && (
          <div className={`result-display ${gestureResult.includes('Error') ? 'error' : 'success'}`}>
            <p>{gestureResult}</p>
          </div>
        )}

        <footer className="app-footer">
          Gesture Recognition System © {new Date().getFullYear()}
        </footer>
      </header>
    </div>
  );
}

export default App;
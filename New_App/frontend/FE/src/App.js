import React, { useState } from 'react';
import GestureRecognition from './gesturerecognition';
import ImageGeneration from './imagegeneration';
import './App.css';

function App() {
  const [gestureResult, setGestureResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const gesturePromptMap = {
    "Thumb_Up": "a peaceful forest landscape at sunrise, digital art",
    "Victory": "a futuristic cyberpunk city skyline at night, neon lights",
    "Open_Palm": "a surreal cosmic landscape with colorful nebulae and planets",
    "Closed_Fist": "a surreal suset in an animated world",
    "Pointing_Up": "a majestic castle floating in the clouds, dreamlike atmosphere"
  };

  const recognizeGesture = async (gestureName) => {
    if (isGenerating || !detecting) return;

    setDetecting(false);
    setIsGenerating(true);
    setGestureResult(`Detected: ${gestureName}`);

    const prompt = gesturePromptMap[gestureName];
    if (!prompt) {
      setGestureResult(`No prompt defined for ${gestureName}`);
      setIsGenerating(false);
      return;
    }
  };

  const handleStartDetection = () => {
    if (isGenerating) return;
    setDetecting(true);
    setGestureResult('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="app-title">Gesture to Image Generator</h1>

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
          disabled={detecting || isGenerating}
        >
          {detecting ? 'Detecting...' : 'Start Gesture Detection'}
        </button>

        {gestureResult && (
          <div className={`result-display ${gestureResult.includes('Error') ? 'error' : 'success'}`}>
            <p>{gestureResult}</p>
          </div>
        )}

        <ImageGeneration 
          prompt={gesturePromptMap[gestureResult.split(': ')[1]]}
          isGenerating={isGenerating}
        />

        <footer className="app-footer">
          Gesture Recognition System © {new Date().getFullYear()}
        </footer>
      </header>
    </div>
  );
}

export default App;
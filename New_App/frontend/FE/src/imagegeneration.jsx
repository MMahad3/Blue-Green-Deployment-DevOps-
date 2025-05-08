import React, { useState, useEffect } from 'react';
import './App.css';

const ImageGeneration = ({ prompt, isGenerating }) => {
  const [currentImage, setCurrentImage] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(15);  // Set to 15 steps to match backend
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let eventSource;

    const startImageGeneration = async () => {
      if (!prompt || !isGenerating) return;

      setIsLoading(true);
      setCurrentStep(0);
      setCurrentImage(null);
      setError(null);

      try {
        // Create URL with query parameters
        const url = new URL('http://localhost:8000/api/generate-stream');
        url.searchParams.append('prompt', prompt);
        
        // Close any existing connection
        if (eventSource) {
          eventSource.close();
        }

        // Create new EventSource connection
        eventSource = new EventSource(url.toString());

        // Handle specific event types
        eventSource.addEventListener('step', (event) => {
          try {
            const data = JSON.parse(event.data);
            setCurrentStep(data.step);
            if (data.total_steps) {
              setTotalSteps(data.total_steps);
            }
            if (data.image) {
              setCurrentImage(`data:image/png;base64,${data.image}`);
            }
          } catch (e) {
            console.error('Error parsing step event:', e);
          }
        });

        eventSource.addEventListener('complete', (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.image) {
              setCurrentImage(`data:image/png;base64,${data.image}`);
            }
            setCurrentStep(totalSteps);
            setIsLoading(false);
            eventSource.close();
          } catch (e) {
            console.error('Error parsing complete event:', e);
          }
        });

        // Handle general messages
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received message:', data);
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        };

        // Handle errors
        eventSource.onerror = (error) => {
          console.error('EventSource error:', error);
          if (isLoading) {
            setError('Connection to server failed');
            setIsLoading(false);
          }
          eventSource.close();
        };

      } catch (error) {
        console.error('Initialization error:', error);
        setError(`Initialization failed: ${error.message}`);
        setIsLoading(false);
        if (eventSource) {
          eventSource.close();
        }
      }
    };

    startImageGeneration();

    // Cleanup function
    return () => {
      if (eventSource) {
        console.log('Cleaning up EventSource connection');
        eventSource.close();
      }
    };
  }, [prompt, isGenerating, totalSteps]);

  const progressPercentage = isLoading ? Math.min((currentStep / totalSteps) * 100, 100) : 0;

  return (
    <div className="image-generation-container">
      {isLoading && (
        <div className="generation-progress">
          <p>Generating image... Step {currentStep} of {totalSteps}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {currentImage && (
        <div className="generated-image">
          <img 
            src={currentImage} 
            alt="Generated from gesture" 
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageGeneration;

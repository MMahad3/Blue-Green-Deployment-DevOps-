import React, { useEffect, useRef, useState } from 'react';

const GestureRecognition = ({ onGestureDetected, isDetecting, onDetectionStart }) => {
  const [status, setStatus] = useState('Initializing...');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const gestureRecognizerRef = useRef(null);
  const animationRef = useRef(null);
  const runningModeRef = useRef('VIDEO');

  useEffect(() => {
    const initRecognizer = async () => {
      setStatus('Loading model...');
      try {
        const vision = await window.FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );

        const recognizer = await window.GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
            delegate: 'GPU'
          },
          runningMode: runningModeRef.current
        });

        gestureRecognizerRef.current = recognizer;
        setStatus('Model loaded ✅ - Click Start Detection');
      } catch (err) {
        console.error(err);
        setStatus('Failed to load model');
      }
    };

    initRecognizer();

    return () => {
      stopCamera();
    };
  }, []);

  // Start/stop camera based on detection state
  useEffect(() => {
    if (isDetecting) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isDetecting]);

  const startCamera = () => {
    if (videoRef.current && !videoRef.current.srcObject) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            detectFrame();
          };
          setStatus('Detection active - Show your gesture');
        })
        .catch((err) => {
          console.error('Camera error:', err);
          setStatus('Camera access denied');
          if (onDetectionStart) onDetectionStart(false); // Notify parent
        });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    cancelAnimationFrame(animationRef.current);
  };

  const detectFrame = async () => {
    if (!isDetecting) return; // Stop if detection was turned off
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const recognizer = gestureRecognizerRef.current;

    if (!video || !canvas || !recognizer) {
      animationRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const nowInMs = Date.now();
      const result = await recognizer.recognizeForVideo(video, nowInMs);

      if (result?.landmarks?.length) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);

        const drawingUtils = new window.DrawingUtils(ctx);
        for (const landmarks of result.landmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            window.GestureRecognizer.HAND_CONNECTIONS,
            { color: '#00FF00', lineWidth: 4 }
          );
          drawingUtils.drawLandmarks(landmarks, { color: '#FF0000', lineWidth: 2 });
        }
        ctx.restore();
      }

      if (result?.gestures?.length > 0) {
        const topGesture = result.gestures[0][0];
        setStatus(`Detected: ${topGesture.categoryName}`);
        if (onGestureDetected) {
          onGestureDetected(topGesture.categoryName);
        }
      }
    } catch (error) {
      console.error('Detection error:', error);
    }

    animationRef.current = requestAnimationFrame(detectFrame);
  };

  return (
    <div style={{ 
      position: 'relative',
      width: '640px',
      height: '480px',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      margin: '20px auto',
      backgroundColor: '#000' // Black background when camera is off
    }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          transform: 'scaleX(-1)',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          objectFit: 'cover',
          display: isDetecting ? 'block' : 'none'
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          width: '100%',
          height: '100%'
        }}
      />
      <p style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '8px 20px',
        borderRadius: '25px',
        zIndex: 3,
        fontSize: '1.1rem',
        fontWeight: '500',
        minWidth: '250px',
        textAlign: 'center',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        margin: 0,
      }}>
        {status}
      </p>
    </div>
  );
};

export default GestureRecognition;
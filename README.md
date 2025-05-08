# Gesture Recognition System with Two Versions

This project demonstrates real-time hand gesture recognition using **MediaPipe Hands**. It includes two versions: a simplified gesture recognition version (Old_App) and a full-featured gesture-to-image generation version (New_App).

## 📌 Objective [Common]

To develop a system capable of detecting hand gestures in real-time, with two different implementations:
- Old_App: Focused purely on gesture recognition
- New_App: Extended functionality with gesture-to-image generation

## 🧩 Project Structure

The repository is organized into two main applications:

### Old_App (Gesture Recognition Only)
- Simplified version focusing on core gesture detection
- Clean, minimalist UI
- Real-time gesture feedback
- Optimized for performance
- Runs on ports 3000 (frontend) and 8000 (backend)

### New_App (Full Feature Set)
- Complete gesture-to-image generation functionality
- Enhanced UI with image generation preview
- Real-time progress visualization
- Additional features beyond gesture recognition

## ⚙️ Technical Implementation

### Hand Gesture Recognition (Both Apps)
- Implemented using **MediaPipe Hands** by Google
- Tracks 21 3D landmarks per hand
- Recognizes multiple gestures:
  - Thumb_Up 👍
  - Victory ✌️
  - Open_Palm ✋
  - Closed_Fist ✊
  - Pointing_Up ☝️
  - ILoveYou 🤟

### Frontend Implementation
- React-based UI
- Real-time webcam integration
- Responsive design that fits any screen without scrolling
- Modern gradient-based styling
- Clear visual feedback for detected gestures

### Backend Implementation
- FastAPI server
- Real-time gesture processing
- Efficient communication between frontend and backend
- Robust error handling

## 🛠️ Setup and Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Set up virtual environment:
```bash
python -m venv myvenv
myvenv\Scripts\activate  # Windows
source myvenv/bin/activate  # Unix/MacOS
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running Old_App
```bash
cd Old_App

# Start the backend (Terminal 1)
cd backend
uvicorn main:app --reload

# Start the frontend (Terminal 2)
cd frontend/FE
npm install
npm start
```

### Running New_App
```bash
cd New_App

# Start the backend (Terminal 1)
cd backend
uvicorn main:app --reload

# Start the frontend (Terminal 2)
cd frontend/FE
npm install
npm start
```

## 🎯 Features

### Old_App Features
- Real-time gesture detection
- Clean, minimalist interface
- Responsive design (no scrolling)
- Clear visual feedback
- Optimized performance
- Modern UI with gradient effects

### New_App Additional Features
- Image generation capabilities
- Enhanced UI/UX
- Progress visualization
- Advanced error handling
- Extended gesture-to-prompt mapping

## 💻 Technical Details

### Frontend Technologies
- React
- MediaPipe Hands API
- Modern CSS with gradients and animations
- Responsive viewport units
- Canvas-based hand visualization

### Backend Technologies
- FastAPI
- Python 3.8+
- MediaPipe
- CORS middleware

## 🔄 Git Structure
The repository uses a submodule structure where:
- Old_App is maintained as a submodule
- This allows for independent versioning
- Supports blue-green deployment on AWS
- Enables separate development cycles

## 📚 References

- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands)
- [React Documentation](https://reactjs.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 🔜 Future Improvements

### Common Improvements
- Additional gesture recognition patterns
- Enhanced visualization options
- Performance optimizations
- Extended gesture set
- Improved error handling

### Old_App Specific
- Gesture recording and playback
- Custom gesture definitions
- Performance metrics display
- Enhanced hand tracking visualization

### New_App Specific
- Advanced image generation features
- Multi-gesture combinations
- Real-time style transfer options
- Enhanced prompt mapping

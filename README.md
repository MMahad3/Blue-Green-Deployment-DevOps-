# Gesture-to-Image Generation using Deep Learning and Generative AI 

This project explores the fusion of **computer vision** and **generative AI** by translating **hand gestures into images** using **MediaPipe Hands** and **Stable Diffusion**. The project includes two versions: a CPU-based version (Old_App) and a GPU-accelerated version (New_App).

## 📌 Objective [Common]

To develop a system capable of detecting hand gestures in real-time and generating a contextually relevant image using generative AI, enabling intuitive visual creativity through human gestures.

## 🧩 Problem Statement [Common]

While text-to-image generation is widely researched, **gesture-based control for image generation** is still underexplored. This project addresses the challenge of bridging this gap by building a system that transforms hand gestures into visual outputs using state-of-the-art models.

## ⚙️ Methodology [Common]

- **Hand Gesture Detection**: 
  - Implemented using **MediaPipe Hands** by Google, which tracks 21 3D landmarks per hand using a lightweight CNN+BlazePose architecture.

- **Gesture Mapping**: 
  - Predefined gestures are mapped to corresponding image prompts (e.g., a "peace" sign maps to the prompt "sunset on a beach").

- **Image Generation**: 
  - Leveraged **Stable Diffusion**, a latent diffusion model (LDM), to generate photorealistic images based on the prompt.
  - The image is generated through 15 **denoising steps**, where random noise is progressively refined into an image using a U-Net guided by a CLIP-based text encoder.

## 🚀 Features

### Old App (CPU Version)
Located in the `Old_App` directory:
- CPU-based image generation
- Basic streaming implementation
- Suitable for systems without GPU
- Simple and straightforward implementation
- Runs on ports 3000 (frontend) and 8000 (backend)

### New App (GPU-Accelerated Version)
Located in the `New_App` directory:
- GPU acceleration support for faster image generation
- Enhanced streaming with intermediate image previews
- Real-time progress visualization
- More detailed logging and error handling
- Additional CORS support (ports 3000, 5173, 8080)
- Improved user experience with step-by-step generation preview

## 🛠️ Setup and Installation

### Common Steps
1. Clone the repository:
```bash
git clone https://github.com/MMahad3/Gesture-2-Image
cd Gesture-2-Image
```

2. Set up virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Old App Setup
```bash
cd Old_App

# Start the backend (Terminal 1)
cd backend
uvicorn main:app --reload

# Start the frontend (Terminal 2)
cd frontend
npm install
npm start
```

### New App Setup
```bash
cd New_App

# Start the backend (Terminal 1)
cd backend
uvicorn main:app --reload

# Start the frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

## 🖼️ Results

### Common Results
- Successfully detected multiple hand gestures in real-time using webcam input
- Generated visually accurate and contextually aligned images based on gesture-mapped prompts
- Demonstrated practical application of gesture-controlled generative systems

### New App Specific Results
- Achieved faster generation times with GPU acceleration
- Real-time visualization of the generation process
- Improved user feedback during image generation

## 📚 References [Common]

- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands)
- [Stable Diffusion (CompVis)](https://github.com/CompVis/stable-diffusion)
- [Diffusers Library by HuggingFace](https://github.com/huggingface/diffusers)
- [Gesture Recognition with OpenCV + MediaPipe](https://google.github.io/mediapipe/)

## 🧪 Future Improvements

### Common Improvements
- Dynamic prompt generation using gesture context
- Training custom gestures and fine-tuned diffusion models
- Integration with AR/VR for immersive gesture-controlled creativity
- Enhanced UI/UX with more interactive features
- Support for multiple gesture recognition frameworks

### New App Specific Improvements
- Multi-GPU support for parallel image generation
- Advanced streaming optimizations
- Real-time model parameter adjustments
- Enhanced error handling and recovery mechanisms

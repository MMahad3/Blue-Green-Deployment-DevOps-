from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import base64
import io
from PIL import Image
import os
import uuid
import torch
from diffusers import StableDiffusionPipeline
from typing import Optional
import json

app = FastAPI()

# CORS configuration
origins = [
    "*"  # Allow all origins
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create folder for generated images if it doesn't exist
GENERATED_DIR = "generated_images"
os.makedirs(GENERATED_DIR, exist_ok=True)

# Mount static files so images can be accessed via URL
app.mount("/images", StaticFiles(directory=GENERATED_DIR), name="images")

# Feature toggle
FEATURE2 = os.getenv("FEATURE2_ENABLED", "true").lower() == "true"

# Lazy model loading
pipe = None

def load_model():
    global pipe
    if pipe is None:
        print("Loading Stable Diffusion model...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if device == "cuda" else torch.float32
        
        pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=dtype
        )
        pipe = pipe.to(device)
        print(f"Model loaded successfully on {device.upper()}")

class GenerateStreamQuery(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None        

class PromptRequest(BaseModel):
    prompt: str
    negative_prompt: str = None

@app.post("/api/recognize")
async def recognize_gesture(request: Request):
    try:
        data = await request.json()
        gesture = data.get('gesture')
        
        if not gesture:
            raise HTTPException(status_code=400, detail="Gesture data is required")
            
        return {
            "message": f"Gesture '{gesture}' recognized successfully",
            "gesture": gesture,
            "confidence": 0.855
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
async def generate_image(prompt_req: PromptRequest):
    if not FEATURE2:
        raise HTTPException(
            status_code=403,
            detail="Image generation feature is not enabled. Set FEATURE2_ENABLED=true to enable."
        )

    try:
        load_model()

        generator = torch.Generator(device="cpu").manual_seed(42)
        num_steps = 15

        pipe.scheduler = pipe.scheduler.from_config(pipe.scheduler.config)
        pipe.scheduler.set_timesteps(num_inference_steps=num_steps)
        print("Timesteps:", len(pipe.scheduler.timesteps))

        image = pipe(
            prompt_req.prompt,
            negative_prompt=prompt_req.negative_prompt,
            generator=generator,
            num_inference_steps=num_steps
        ).images[0]

        # Save image to file
        filename = f"{uuid.uuid4().hex}.png"
        file_path = os.path.join(GENERATED_DIR, filename)
        image.save(file_path)

        # Convert to base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return {
            "status": "success",
            "prompt": prompt_req.prompt,
            "image": f"data:image/png;base64,{img_str}",
            "image_url": f"/images/{filename}"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Image generation failed: {str(e)}"
        )

@app.get("/api/generate-stream")
async def generate_image_stream(
    prompt: str = Query(..., description="The prompt for image generation"),
    negative_prompt: str = Query(None, description="Negative prompt for image generation")
):
    if not FEATURE2:
        raise HTTPException(
            status_code=403,
            detail="Image generation feature is not enabled."
        )

    async def event_stream():
        try:
            print("Loading model...")
            load_model()
            device = "cuda" if torch.cuda.is_available() else "cpu"
            print("Model loaded, starting generation...")

            # Set up generation parameters
            generator = torch.Generator(device=device).manual_seed(42)
            guidance_scale = 7.5  # Standard value for stable diffusion
            num_steps = 15  # Exactly 15 steps

            # Configure the scheduler and force 15 steps
            pipe.scheduler = pipe.scheduler.from_config(pipe.scheduler.config)
            pipe.scheduler.set_timesteps(num_inference_steps=num_steps)
            pipe.scheduler.timesteps = pipe.scheduler.timesteps[:num_steps]  # Force exactly 15 steps
            print(f"Beginning inference loop with {num_steps} steps...")

            # Initialize the latent space
            latents = torch.randn(
                (1, pipe.unet.config.in_channels, 64, 64),
                generator=generator,
                device=device
            )
            latents = latents * pipe.scheduler.init_noise_sigma

            # Prepare text embeddings
            text_input = pipe.tokenizer(
                prompt,
                padding="max_length",
                max_length=pipe.tokenizer.model_max_length,
                truncation=True,
                return_tensors="pt"
            )

            # Handle negative prompt
            uncond_input = pipe.tokenizer(
                "" if negative_prompt is None else negative_prompt,
                padding="max_length",
                max_length=pipe.tokenizer.model_max_length,
                truncation=True,
                return_tensors="pt"
            )

            with torch.no_grad():
                text_embeddings = pipe.text_encoder(text_input.input_ids)[0]
                uncond_embeddings = pipe.text_encoder(uncond_input.input_ids)[0]
                text_embeddings = torch.cat([uncond_embeddings, text_embeddings])

            for i, t in enumerate(pipe.scheduler.timesteps):
                print(f"Step {i+1}/{num_steps}")

                # Expand latents for classifier free guidance
                latent_model_input = torch.cat([latents] * 2)

                # Predict noise residual
                with torch.no_grad():
                    noise_pred = pipe.unet(
                        latent_model_input,
                        t,
                        encoder_hidden_states=text_embeddings
                    )["sample"]

                # Perform guidance
                noise_pred_uncond, noise_pred_text = noise_pred.chunk(2)
                noise_pred = noise_pred_uncond + guidance_scale * (noise_pred_text - noise_pred_uncond)

                # Update latents
                latents = pipe.scheduler.step(noise_pred, t, latents).prev_sample

                # Generate intermediate image
                with torch.no_grad():
                    image = pipe.vae.decode(latents / pipe.vae.config.scaling_factor, return_dict=False)[0]
                    image = (image / 2 + 0.5).clamp(0, 1)
                    image = image.detach().cpu().permute(0, 2, 3, 1).numpy()
                    image = (image * 255).round().astype("uint8")[0]
                    image = Image.fromarray(image)

                # Convert to base64
                buffered = io.BytesIO()
                image.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

                # Send step update
                yield f"event: step\ndata: {json.dumps({'type': 'step', 'step': i+1, 'total_steps': num_steps, 'image': img_str})}\n\n"

            # Save final image
            filename = f"{uuid.uuid4().hex}.png"
            file_path = os.path.join(GENERATED_DIR, filename)
            image.save(file_path)

            print("Sending final image to client...")
            yield f"event: complete\ndata: {json.dumps({'type': 'complete', 'image': img_str, 'image_url': f'/images/{filename}'})}\n\n"

        except Exception as e:
            print("Error during image generation:", e)
            yield f"event: error\ndata: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/favicon.ico")
async def favicon():
    return {"message": "ok"}

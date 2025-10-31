---
title: Simpson Finder Backend
emoji: 🍩
colorFrom: yellow
colorTo: pink
sdk: docker
pinned: false
---

# Simpson Finder Backend API

AI-powered Simpson character matching service using CLIP embeddings.

## 🎯 Features

- **CLIP-based image similarity**: OpenAI ViT-B-32 model
- **100+ Simpson characters**: Pre-computed embeddings
- **RESTful API**: FastAPI framework
- **Cosine similarity matching**: Top-3 candidates with similarity scores

## 🚀 API Endpoints

### `GET /`
Health check endpoint

**Response:**
```json
{
  "message": "Simpson Finder Backend API",
  "status": "running",
  "version": "1.0.0"
}
```

### `POST /api/match`
Upload image and get matched Simpson character

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (image file, max 3MB)

**Response:**
```json
{
  "character": {
    "id": 100,
    "name": "Marge Simpson",
    "age": 36,
    "gender": "Female",
    "occupation": "Homemaker",
    "portrait_path": "/character/100.webp"
  },
  "similarity": 95,
  "candidates": [...]
}
```

### `GET /api/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy"
}
```

## 🛠️ Tech Stack

- **Framework**: FastAPI
- **AI Model**: OpenCLIP ViT-B-32 (OpenAI pretrained)
- **ML Framework**: PyTorch (CPU)
- **Image Processing**: Pillow
- **Embeddings**: 512-dimensional vectors
- **Similarity**: Cosine similarity

## 📊 Memory Usage

- **RAM**: ~1.5GB
- **Model Size**: ViT-B-32 (~600MB)
- **Character Embeddings**: 100 characters (512D each)

## 🔧 Environment Variables

- `PORT`: Server port (default: 7860 for Hugging Face)
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)

## 📄 License

MIT

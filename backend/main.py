"""
Simpson Finder - Backend API
FastAPI 서버로 CLIP 임베딩 기반 캐릭터 매칭 제공
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from typing import Dict, Any

# CLIP 및 매칭 서비스 임포트
from services.clip_service import clip_service
from services.matching_service import matching_service

app = FastAPI(
    title="Simpson Finder API",
    description="AI-powered Simpson character matching service",
    version="1.0.0"
)

# CORS 설정 (Next.js에서 접근 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
async def root():
    """
    Health check 엔드포인트
    """
    return{
        "message": "Simpson Finder Backend API",
        "status": "running",
        "version": "1.0.0"
    }

@app.post('/api/match')
async def match_character(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    캐릭터 매칭 엔드포인트
    
    Args:
        file: 업로드된 사용자 이미지
    
    Returns:
        matched_character: 매칭된 캐릭터 정보
        similarity: 유사도 (0-100)
    """
    try:
        # 이미지 파일 검증
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail='이미지 파일만 업로드 가능합니다.')
        
        # 1. 업로드된 이미지 읽기
        image_data = await file.read()

        # 2. CLIP 임베딩 추출
        user_embedding = clip_service.extract_embedding(image_data)

        # 3. 가장 닮은 캐릭터 찾기
        result = matching_service.find_best_match(user_embedding)

        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"매칭 중 오류 발생: {str(e)}")
    
@app.get('/api/health')
async def health_check():
    """
    서버 상태 확인
    """
    return {"status": "healthy"}

if __name__ == "__main__":
    # 서버 실행
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,  # 개발 모드: 코드 변경 시 자동 재시작
        log_level="info"
    )
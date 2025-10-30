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

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
).split(",")

# CORS 설정 (Next.js에서 접근 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS, 
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

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@app.post('/api/match')
async def match_character(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    캐릭터 매칭 엔드포인트

    Args:
        file: 업로드된 사용자 이미지

    Returns:
        character: 매칭된 캐릭터 정보
        similarity: 유사도 (0-100)
        candidates: Top-3 후보 리스트 (선택적)
    """
    try:
        # 이미지 파일 검증
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail='이미지 파일만 업로드 가능합니다.')

        # 1. 업로드된 이미지 읽기
        image_data = await file.read()

        if len(image_data) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="파일이 너무 큽니다 (최대 10MB)"
            )
        
        print(f"📸 이미지 분석 중: {file.filename}")

        # 2. CLIP 임베딩 추출
        user_embedding = clip_service.extract_embedding(image_data)
        print(f"✅ 임베딩 추출 완료 (차원: {user_embedding.shape})")

        # 3. 가장 닮은 캐릭터 찾기 (Top-3, 임계값 없음)
        print("🔍 캐릭터 매칭 중...")
        result = matching_service.find_best_match(
            user_embedding,
            top_k=3,
            threshold=None,  # Unknown 처리 비활성화 (항상 매칭)
            score_mode="percent"
        )

        # 프론트엔드 호환성을 위한 응답 형식 변환
        if result['top'] is not None:
            response = {
                "character": result['top']['character'],
                "similarity": result['top']['score'],
                "candidates": result['candidates']  # 추가 정보
            }
            print(f"✅ 매칭 완료: {response['character']['name']} ({response['similarity']}%)")
            return response
        else:
            # Unknown 케이스 (임계값 설정 시)
            raise HTTPException(status_code=422, detail="매칭 실패: 유사도가 너무 낮습니다.")

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 매칭 중 오류: {str(e)}")
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
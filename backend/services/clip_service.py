"""
CLIP 임베딩 추출 서비스
- OpenCLIP 모델 로딩
- 이미지 임베딩 추출
- L2 정규화
"""


import torch
import open_clip
from PIL import Image
import numpy as np
from typing import Optional
import io

class CLIPService:
    """
    CLIP 모델을 사용한 이미지 임베딩 추출
    - 싱글톤 패턴으로 모델을 한 번만 로딩
    """
    _instance: Optional['CLIPService'] = None
    _model = None
    _preprocess = None
    _device = None

    def __new__(cls):
        """
        싱글톤 패턴 구현
        - 이유: 모델 로딩은 무거운 작업이므로 한 번만 수행
        """
        if cls._instance is None:
            cls._instance = super(CLIPService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        """
        CLIP 모델 초기화
        - 최초 1번만 실행
        """
        if self._model is None:
            self._load_model()

    def _load_model(self):
        """
        CLIP 모델 로딩
        - 모델: Vit-B-32 (OpenAI pretrained)
        - 디바이스: GPU or CPU
        """
        print("모델 로딩 중")
        
        # 디바이스 설정
        self._device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f" 디바이스: {self._device}")

        # CLIP 모델 및 전처리 함수 로딩
        self._model, _, self._preprocess =open_clip.create_model_and_transforms('ViT-B-32', pretrained='openai')

        # 모델을 디바이스로 이동 및 평가 모드 설정
        self._model = self._model.to(self._device)
        self._model.eval() # 추론 모드

        print("CLIP 모델 로딩 완료")
    
    def extract_embedding(self, image_data: bytes) -> np.ndarray:
        """
        이미지 파일에서 CLIP 임베딩 추출
        
        Args:
            image_data: 이미지 바이트 데이터 (업로드된 파일)
        
        Returns:
            numpy.ndarray: L2 정규화된 512차원 임베딩 벡터
        """
        try:
            # 바이트 데이터를 PIL Image로 변환
            image = Image.open(io.BytesIO(image_data)).convert("RGB")

            # CLIP 전처리
            image_tensor = self._preprocess(image).unsqueeze(0).to(self._device)

            # 임베딩 추출(기울기 계산 비활성화 => 메모리 절약)
            with torch.no_grad():
                image_features = self._model.encode_image(image_tensor)

                # L2 정규화 (코사인 유사도 계산)
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            
            # numpy 배열로 변환 후 반환
            return image_features.cpu().numpy()[0]
        except Exception as e:
            print(f"임베딩 추출 실패: {str(e)}")
            raise
# 전역 인스턴스 생성
clip_service = CLIPService()
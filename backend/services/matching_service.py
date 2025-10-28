"""
캐릭터 매칭 서비스
- 코사인 유사도 계산
- 닮은 캐릭터 찾기
"""

import numpy as np
from typing import Dict, List, Any
import json
import os

class MatchingService:
    """
    사용자 임베딩과 캐릭터 임베딩 매칭
    - 코사인 유사도 기반 Top-1 매칭
    """

    def __init__(self):
        """
        캐릭터 임베딩 데이터 로딩
        - data/prototypes.json 파일에서 미리 계산된 임베딩 로드
        """
        self.prototypes: List[Dict[str, Any]] = []
        self._load_prototypes()
    
    def _load_prototypes(self):
        """
        캐릭터 임베딩 데이터 로딩
        - 파일: backend/data/prototypes.json
        - 형식: [{"id": 1, "name": "Homer", "embedding": [...], ...}, ...]
        """
        prototypes_path = os.path.join(
            os.path.dirname(__file__), '..', 'data', 'prototypes.json'
        )

        if os.path.exists(prototypes_path):
            with open(prototypes_path, 'r', encoding='utf-8') as f:
                self.prototypes = json.load(f)
            print(f" {len(self.prototypes)}개 캐릭터 임베딩 로딩 완료")
        else:
            print("⚠️ prototypes.json 파일이 없습니다. 먼저 캐릭터 임베딩을 생성하세요.")
            self.prototypes = []
        
    def cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """
        코사인 유사도 계산
        - 두 벡터가 L2 정규화되어 있으면 내적(dot product)만으로 계산 가능
        
        Args:
            vec1: 임베딩 벡터 1 (사용자)
            vec2: 임베딩 벡터 2 (캐릭터)
        
        Returns:
            float: 코사인 유사도 (-1 ~ 1, 1에 가까울수록 유사)
        """
        return float(np.dot(vec1, vec2))
    
    def find_best_match(self, user_embedding: np.ndarray) -> Dict[str, Any]:
        """
        가장 닮은 캐릭터 찾기
        
        Args:
            user_embedding: 사용자 이미지 임베딩 (512차원)
        
        Returns:
            Dict: {
                "character": {"id", "name", "age", "gender", "occupation", "portrait_path"},
                "similarity": 0-100 점수
            }
        """
        if not self.prototypes:
            raise ValueError('캐릭터 임베딩 데이터가 없습니다.')
        
        best_match = None
        best_similarity = -1.0

        # 모든 캐릭터와 유사도 비교
        for prototype in self.prototypes:
            character_embedding = np.array(prototype['embedding'])
            similarity = self.cosine_similarity(user_embedding, character_embedding)

            # 가장 높은 유사도 업데이트
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = prototype
        
        # 유사도를 0-100
        # 코사인 유사도는 -1 ~ 1 범위이므로 (similarity + 1) / 2 * 100
        similarity_score = int(((best_similarity + 1) / 2) * 100)

        return {
            "character": {
                "id": best_match['id'],
                "name": best_match['name'],
                "age": best_match.get('age'),
                "gender": best_match.get('gender'),
                "occupation": best_match.get('occupation'),
                "portrait_path": best_match.get('portrait_path')
            },
            "similarity": similarity_score
        }

# 전역 인스턴스 생성
matching_service = MatchingService()
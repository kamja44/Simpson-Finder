"""
캐릭터 매칭 서비스
- 코사인 유사도 계산
- Top-K 닮은 캐릭터 찾기 + Unknown 처리
"""

import json
import os
from typing import Dict, List, Any, Optional

import numpy as np


def l2_normalize(x: np.ndarray, eps: float = 1e-12) -> np.ndarray:
    """
    L2 정규화 (벡터 크기를 1로 만듦)
    - 코사인 유사도 계산을 내적만으로 가능하게 함
    """
    n = np.linalg.norm(x, ord=2, axis=-1, keepdims=True)
    n = np.maximum(n, eps)
    return x / n


class MatchingService:
    """
    사용자 임베딩과 캐릭터 임베딩 매칭
    - 코사인 유사도 기반 Top-K 매칭
    - 프로토타입을 행렬로 캐싱하여 배치 연산 (성능 최적화)
    """

    def __init__(self, prototypes_path: Optional[str] = None, expected_dim: int = 512):
        """
        매칭 서비스 초기화
        Args:
            prototypes_path: prototypes.json 경로 (기본값: data/prototypes.json)
            expected_dim: 임베딩 차원 (기본값: 512)
        """
        self.expected_dim = expected_dim

        if prototypes_path is None:
            prototypes_path = os.path.join(
                os.path.dirname(__file__), '..', 'data', 'prototypes.json'
            )

        self.prototypes_meta: List[Dict[str, Any]] = []
        self.prototypes_matrix: Optional[np.ndarray] = None  # shape: (N, D), float32
        self._load_and_prepare(prototypes_path)

    def _load_and_prepare(self, path: str) -> None:
        """
        프로토타입 로딩 및 행렬 준비
        - JSON에서 임베딩을 읽어 numpy 행렬로 변환
        - L2 정규화 적용
        """
        if not os.path.exists(path):
            raise FileNotFoundError("prototypes.json 파일이 없습니다. 먼저 캐릭터 임베딩을 생성하세요.")

        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if not isinstance(data, list) or len(data) == 0:
            raise ValueError("프로토타입 데이터가 비어있거나 형식이 올바르지 않습니다.")

        # 메타와 임베딩 분리, 차원 검증 및 정규화
        embeddings: List[np.ndarray] = []
        metas: List[Dict[str, Any]] = []

        for i, proto in enumerate(data):
            if 'embedding' not in proto or not isinstance(proto['embedding'], list):
                raise KeyError(f"index {i} 프로토타입에 embedding 키가 없거나 형식이 잘못되었습니다.")

            vec = np.asarray(proto['embedding'], dtype=np.float32)

            if vec.ndim != 1:
                raise ValueError(f"index {i} embedding 차원이 1D가 아닙니다.")
            if self.expected_dim is not None and vec.shape[0] != self.expected_dim:
                raise ValueError(f"index {i} embedding 차원 불일치: {vec.shape[0]} != {self.expected_dim}")

            embeddings.append(vec)

            # 메타 정보에서 embedding은 제거하여 경량화
            meta = {k: v for k, v in proto.items() if k != 'embedding'}
            metas.append(meta)

        # 행렬로 변환 및 정규화
        emb_mat = np.stack(embeddings, axis=0)  # (N, D)
        emb_mat = l2_normalize(emb_mat).astype(np.float32)

        self.prototypes_meta = metas
        self.prototypes_matrix = emb_mat

        print(f"✅ {len(self.prototypes_meta)}개 캐릭터 임베딩 로딩 완료")

    @staticmethod
    def cosine_similarity_matrix(user_vec: np.ndarray, proto_mat: np.ndarray) -> np.ndarray:
        """
        정규화된 벡터 전제 하에 내적으로 코사인 유사도 계산 (배치 연산)
        Args:
            user_vec: (D,) 또는 (B, D)
            proto_mat: (N, D)
        Returns:
            (N,) 또는 (B, N)
        """
        if user_vec.ndim == 1:
            return proto_mat @ user_vec  # (N,)
        elif user_vec.ndim == 2:
            return user_vec @ proto_mat.T  # (B, N)
        else:
            raise ValueError("user_vec는 (D,) 또는 (B, D) 여야 합니다.")

    def _prepare_user(self, user_embedding: np.ndarray) -> np.ndarray:
        """
        사용자 임베딩 준비 (타입 변환 및 정규화)
        """
        if not isinstance(user_embedding, np.ndarray):
            user_embedding = np.asarray(user_embedding, dtype=np.float32)
        else:
            user_embedding = user_embedding.astype(np.float32, copy=False)

        if user_embedding.ndim == 1:
            if user_embedding.shape[0] != self.prototypes_matrix.shape[1]:
                raise ValueError("사용자 임베딩 차원이 프로토타입과 다릅니다.")
        elif user_embedding.ndim == 2:
            if user_embedding.shape[1] != self.prototypes_matrix.shape[1]:
                raise ValueError("사용자 임베딩 차원이 프로토타입과 다릅니다.")
        else:
            raise ValueError("user_embedding은 (D,) 또는 (B, D) 여야 합니다.")

        return l2_normalize(user_embedding)

    def find_best_match(
        self,
        user_embedding: np.ndarray,
        top_k: int = 3,
        threshold: Optional[float] = None,
        score_mode: str = "percent",  # "cosine" or "percent"
    ) -> Dict[str, Any]:
        """
        가장 닮은 캐릭터 찾기 (Top-K 지원)

        Args:
            user_embedding: (D,) 또는 (1, D), float32 권장
            top_k: 상위 K개 반환 (기본값: 3)
            threshold: 코사인 임계값. 예: 0.35 미만이면 Unknown 처리
            score_mode: "cosine" 원점수 또는 "percent" 0~100 변환

        Returns:
            {
              "candidates": [
                {"character": {...}, "cosine": 0.73, "score": 86},
                ...
              ],
              "top": {...} | None,
              "unknown": bool
            }
        """
        if self.prototypes_matrix is None or len(self.prototypes_meta) == 0:
            raise ValueError("캐릭터 임베딩 데이터가 없습니다.")

        u = self._prepare_user(user_embedding)  # (D,) 또는 (1, D)
        sims = self.cosine_similarity_matrix(u, self.prototypes_matrix)  # (N,)

        if sims.ndim > 1:
            raise ValueError("단일 사용자 임베딩만 지원합니다.")

        # 상위 K개 인덱스
        k = min(top_k, sims.shape[0])
        top_idx = np.argpartition(-sims, kth=k-1)[:k]
        # 내림차순 정렬
        top_idx = top_idx[np.argsort(-sims[top_idx])]

        def to_percent(cos_val: float) -> int:
            # 코사인 유사도 -1~1 → 0~100 변환
            return int(((float(cos_val) + 1.0) / 2.0) * 100)

        candidates = []
        for idx in top_idx.tolist():
            meta = self.prototypes_meta[idx]
            cos_v = float(sims[idx])
            score = to_percent(cos_v) if score_mode == "percent" else cos_v

            candidates.append({
                "character": {
                    "id": meta.get("id"),
                    "name": meta.get("name"),
                    "age": meta.get("age"),
                    "gender": meta.get("gender"),
                    "occupation": meta.get("occupation"),
                    "portrait_path": meta.get("portrait_path")
                },
                "cosine": cos_v,
                "score": score
            })

        top = candidates[0] if candidates else None
        unknown = False

        if threshold is not None and top is not None:
            unknown = top["cosine"] < float(threshold)

        return {
            "candidates": candidates,
            "top": None if unknown else top,
            "unknown": unknown
        }


# 전역 인스턴스 생성
matching_service = MatchingService()
# Simpson Finder - Backend API

Python FastAPI 기반 AI 매칭 서버

## 설치 방법

```bash
# 가상환경 생성 (권장)
python -m venv venv

# 가상환경 활성화
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt
```

## 실행 방법

```bash
# 개발 서버 실행
python main.py

# 또는
uvicorn main:app --reload --port 8000
```

서버 실행 후: http://localhost:8000

API 문서: http://localhost:8000/docs

## API 엔드포인트

### POST /api/match
사용자 이미지를 받아 닮은 심슨 캐릭터 반환

**Request:**
- Content-Type: multipart/form-data
- file: 이미지 파일

**Response:**
```json
{
  "character": {
    "id": 1,
    "name": "Homer Simpson",
    "age": 39,
    "gender": "Male"
  },
  "similarity": 85
}
```

## 구조

```
backend/
├── main.py              # FastAPI 서버
├── requirements.txt     # Python 패키지
├── .env                 # 환경 변수
├── services/
│   ├── clip_service.py      # CLIP 임베딩
│   └── matching_service.py  # 매칭 로직
└── data/
    └── prototypes.json      # 캐릭터 임베딩
```

## 다음 단계

1. CLIP 모델 로딩
2. 캐릭터 임베딩 생성
3. 코사인 유사도 매칭
4. 스타일 변환 (선택)

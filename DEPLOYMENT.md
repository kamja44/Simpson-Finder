# 🚀 Simpson Finder - 배포 가이드

> 📅 **작성일**: 2025-10-28
> 💰 **비용**: $0/월 (완전 무료)
> ⏱️ **소요 시간**: 약 30분

---

## 📋 목차

1. [배포 전략 개요](#배포-전략-개요)
2. [프론트엔드 배포 (Vercel)](#프론트엔드-배포-vercel)
3. [백엔드 배포 (Render)](#백엔드-배포-render)
4. [환경 변수 설정](#환경-변수-설정)
5. [배포 전 체크리스트](#배포-전-체크리스트)
6. [배포 후 테스트](#배포-후-테스트)
7. [트러블슈팅](#트러블슈팅)

---

## 배포 전략 개요

### 전체 아키텍처

```
[사용자 브라우저]
       ↓
[Vercel (프론트엔드)]  ← 무료, Next.js 최적화
       ↓ API 호출
[Render (백엔드)]      ← 무료 750시간/월, Python FastAPI
       ↓
[CLIP AI 모델]         ← 이미 로딩됨 (prototypes.json)
```

### 비용 구조

| 서비스 | 플랫폼 | 비용 | 제한사항 |
|--------|--------|------|----------|
| **프론트엔드** | Vercel | **$0** | 100GB 대역폭/월 |
| **백엔드** | Render | **$0** | 750시간/월, 15분 idle 슬립 |
| **도메인** | (선택) | $0 | Vercel/Render 제공 |
| **총계** | | **$0/월** | |

---

## 프론트엔드 배포 (Vercel)

### 1단계: 코드 수정 (필수!)

#### 1.1. API URL 환경 변수로 변경

**파일: `frontend/components/CharacterMatcher.tsx`**

```typescript
// ❌ 수정 전 (하드코딩)
const apiResponse = await fetch("http://localhost:8000/api/match", {
  method: "POST",
  body: formData,
});

// ✅ 수정 후 (환경 변수)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const apiResponse = await fetch(`${API_URL}/api/match`, {
  method: "POST",
  body: formData,
});
```

#### 1.2. Next.js 이미지 도메인 추가

**파일: `frontend/next.config.ts`**

```typescript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.thesimpsonsapi.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

---

### 2단계: GitHub에 푸시

```bash
# 변경사항 커밋
git add .
git commit -m "feat: 배포를 위한 환경 변수 설정"
git push origin main
```

---

### 3단계: Vercel 배포

1. **Vercel 계정 생성**
   - https://vercel.com/ 접속
   - GitHub 계정으로 로그인

2. **프로젝트 Import**
   - "Add New" → "Project" 클릭
   - GitHub 레포지토리 선택: `Simpson-Finder`

3. **프로젝트 설정**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build (자동 감지)
   Output Directory: .next (자동 감지)
   ```

4. **환경 변수 설정**
   - "Environment Variables" 섹션
   - 추가: `NEXT_PUBLIC_API_URL` = (백엔드 배포 후 입력)
   - 일단 비워두고 나중에 추가 가능

5. **Deploy 클릭**
   - 약 2-3분 소요
   - 배포 완료 후 URL 생성: `https://simpson-finder-xxxx.vercel.app`

---

## 백엔드 배포 (Render)

### 1단계: 코드 수정 (필수!)

#### 1.1. CORS 환경 변수로 변경

**파일: `backend/main.py`**

```python
import os

# ❌ 수정 전
allow_origins=["http://localhost:3000", "http://localhost:3001"]

# ✅ 수정 후
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 1.2. 파일 크기 제한 추가 (권장)

**파일: `backend/main.py`**

```python
from fastapi import HTTPException

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@app.post('/api/match')
async def match_character(file: UploadFile = File(...)):
    # 파일 크기 체크
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="파일이 너무 큽니다 (최대 10MB)"
        )

    # 이미지 파일 검증
    try:
        from PIL import Image
        import io
        Image.open(io.BytesIO(contents))
    except:
        raise HTTPException(
            status_code=400,
            detail="올바른 이미지 파일이 아닙니다"
        )

    # 기존 로직 계속...
    user_embedding = clip_service.extract_embedding(contents)
    # ...
```

---

### 2단계: Render 배포

1. **Render 계정 생성**
   - https://render.com/ 접속
   - GitHub 계정으로 로그인

2. **Web Service 생성**
   - Dashboard → "New" → "Web Service"
   - GitHub 레포지토리 연결: `Simpson-Finder`

3. **서비스 설정**
   ```
   Name: simpson-finder-backend
   Region: Oregon (US West) - 가장 가까운 지역 선택
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   ```

4. **빌드 설정**
   ```
   Build Command: pip install -r requirements.txt
   Start Command: python main.py
   ```

5. **인스턴스 선택**
   ```
   Instance Type: Free (512 MB RAM, 0.1 CPU)
   ```

6. **환경 변수 설정**
   - "Environment" 탭 클릭
   - 추가:
     ```
     PORT = 8000
     ALLOWED_ORIGINS = https://simpson-finder-xxxx.vercel.app
     ```
   - **주의**: Vercel URL을 정확히 입력!

7. **Create Web Service 클릭**
   - 약 5-10분 소요 (Python 패키지 설치)
   - 배포 완료 후 URL 생성: `https://simpson-finder-backend.onrender.com`

---

### 3단계: prototypes.json 확인

Render는 자동으로 Git 레포지토리를 클론하므로 `backend/data/prototypes.json` 파일이 포함되어야 합니다.

**확인 방법:**
```bash
# 파일 크기 확인
ls -lh backend/data/prototypes.json

# Git에 포함되어 있는지 확인
git ls-files backend/data/prototypes.json
```

**만약 파일이 없다면:**
1. 로컬에서 `python backend/scripts/generate_prototypes.py` 실행
2. `backend/data/prototypes.json` 파일 생성 확인
3. Git에 커밋 & 푸시

---

## 환경 변수 설정

### Vercel 환경 변수

1. Vercel Dashboard → 프로젝트 선택
2. "Settings" → "Environment Variables"
3. 추가:

```bash
NEXT_PUBLIC_API_URL = https://simpson-finder-backend.onrender.com
```

4. "Save" → "Redeploy" 클릭 (환경 변수 적용)

---

### Render 환경 변수

1. Render Dashboard → 서비스 선택
2. "Environment" 탭
3. 추가:

```bash
PORT = 8000
ALLOWED_ORIGINS = https://simpson-finder-xxxx.vercel.app,https://your-custom-domain.com
```

4. "Save Changes" → 자동 재배포

---

## 배포 전 체크리스트

### ✅ 프론트엔드 (Vercel)

- [ ] `CharacterMatcher.tsx`에서 API URL 하드코딩 제거
- [ ] `next.config.ts`에 이미지 도메인 추가
- [ ] `layout.tsx` 메타데이터 업데이트 (title, description)
- [ ] GitHub에 푸시 완료
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 `NEXT_PUBLIC_API_URL` 설정
- [ ] 배포 성공 확인

### ✅ 백엔드 (Render)

- [ ] `main.py`에서 CORS 환경 변수로 변경
- [ ] 파일 크기 제한 추가 (선택)
- [ ] `prototypes.json` 파일 Git에 커밋
- [ ] GitHub에 푸시 완료
- [ ] Render Web Service 생성
- [ ] 빌드/시작 명령어 설정
- [ ] 환경 변수 `PORT`, `ALLOWED_ORIGINS` 설정
- [ ] 배포 성공 확인

### ✅ 연동 확인

- [ ] Vercel에서 환경 변수 업데이트 (백엔드 URL)
- [ ] 프론트엔드 재배포
- [ ] CORS 에러 없는지 확인
- [ ] 전체 플로우 테스트

---

## 배포 후 테스트

### 1. 백엔드 Health Check

브라우저에서 접속:
```
https://simpson-finder-backend.onrender.com/api/health
```

**예상 응답:**
```json
{
  "status": "healthy"
}
```

---

### 2. 프론트엔드 접속

브라우저에서 접속:
```
https://simpson-finder-xxxx.vercel.app
```

**확인 사항:**
- [ ] 페이지 로딩 정상
- [ ] 이미지 업로드 UI 표시
- [ ] 콘솔 에러 없음

---

### 3. 전체 플로우 테스트

1. **이미지 업로드**
   - 사진 드래그 앤 드롭 또는 파일 선택
   - 미리보기 표시 확인

2. **매칭 진행**
   - "AI 분석 준비 중..." 메시지 확인
   - Progress bar 진행 확인
   - **주의**: 첫 요청 시 30초-1분 대기 (Cold Start)

3. **결과 확인**
   - 업로드 사진 ↔ 유사도 ↔ 심슨 사진 표시
   - 캐릭터 이름 및 정보 표시
   - "심슨 정보가 더 궁금하신가요?" 버튼 작동
   - "다시 시도하기" 버튼 작동

4. **브라우저 콘솔 확인**
   - F12 → Console 탭
   - CORS 에러 없는지 확인
   - API 응답 확인

---

## 트러블슈팅

### 문제 1: CORS 에러

**증상:**
```
Access to fetch at 'https://simpson-finder-backend.onrender.com/api/match'
from origin 'https://simpson-finder-xxxx.vercel.app' has been blocked by CORS policy
```

**해결 방법:**
1. Render 환경 변수 확인:
   ```
   ALLOWED_ORIGINS = https://simpson-finder-xxxx.vercel.app
   ```
2. **주의**: `http://` vs `https://` 확인
3. **주의**: 끝에 `/` 없어야 함
4. 환경 변수 저장 후 자동 재배포 대기 (2-3분)

---

### 문제 2: 백엔드 Cold Start 너무 느림

**증상:**
- 첫 요청 시 30초-1분 대기
- "매칭 중 오류 발생: API 오류: 504" 에러

**원인:**
- Render 무료 플랜: 15분 idle 후 슬립

**해결 방법:**

**임시 (무료):**
1. 프론트엔드에서 timeout 늘리기:
   ```typescript
   // CharacterMatcher.tsx
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 120000); // 2분

   const apiResponse = await fetch(`${API_URL}/api/match`, {
     method: "POST",
     body: formData,
     signal: controller.signal
   });
   ```

2. Wake-up 서비스 사용 (cron job):
   - https://cron-job.org/ (무료)
   - 매 10분마다 `GET /api/health` 호출
   - 슬립 방지

**영구 (유료):**
- Render Starter 플랜 ($7/월)
- 항상 켜져있음, Cold Start 없음

---

### 문제 3: 메모리 부족 (Out of Memory)

**증상:**
```
Application error: a server-side exception has occurred
Memory limit exceeded
```

**원인:**
- Render 무료 플랜: 512MB RAM
- CLIP 모델 + 큰 이미지 = 메모리 부족

**해결 방법:**
1. 이미지 크기 제한 (5MB):
   ```python
   MAX_FILE_SIZE = 5 * 1024 * 1024
   ```

2. 이미지 리사이즈 추가:
   ```python
   from PIL import Image

   img = Image.open(io.BytesIO(contents))
   if img.width > 1024 or img.height > 1024:
       img.thumbnail((1024, 1024))
   ```

3. 유료 플랜 ($7/월 → 2GB RAM)

---

### 문제 4: prototypes.json 파일 없음

**증상:**
```
FileNotFoundError: prototypes.json 파일이 없습니다
```

**해결 방법:**
1. 로컬에서 확인:
   ```bash
   ls backend/data/prototypes.json
   ```

2. 없다면 생성:
   ```bash
   cd backend
   python scripts/generate_prototypes.py
   ```

3. Git에 커밋:
   ```bash
   git add backend/data/prototypes.json
   git commit -m "Add character embeddings"
   git push
   ```

4. Render 자동 재배포 대기

---

### 문제 5: 환경 변수 적용 안 됨

**증상:**
- 환경 변수를 설정했는데도 `localhost:8000` 호출

**해결 방법:**
1. Vercel: 환경 변수 저장 후 **반드시 재배포**
   - Settings → Environment Variables → Save
   - Deployments → 최신 배포 → "Redeploy"

2. Next.js 환경 변수는 **빌드 타임**에 적용됨
   - 환경 변수 변경 = 재배포 필수

---

## 📊 배포 완료 확인

### ✅ 체크리스트

- [ ] 프론트엔드 URL 접속 가능
- [ ] 백엔드 Health Check 응답 정상
- [ ] 이미지 업로드 작동
- [ ] AI 매칭 성공
- [ ] 결과 표시 정상
- [ ] CORS 에러 없음
- [ ] 모바일 반응형 작동
- [ ] "심슨 정보" 버튼 링크 작동

---

## 🎉 배포 완료!

축하합니다! Simpson Finder가 성공적으로 배포되었습니다.

**배포된 URL:**
- 프론트엔드: `https://simpson-finder-xxxx.vercel.app`
- 백엔드: `https://simpson-finder-backend.onrender.com`

**다음 단계:**
1. 친구들과 공유하기
2. 피드백 수집
3. 개선 사항 추가
4. 포트폴리오에 추가

---

## 💰 비용 업그레이드 (선택)

### Render Starter 플랜 ($7/월)

**장점:**
- ✅ 2GB RAM (안정적)
- ✅ Cold Start 없음
- ✅ 항상 켜져있음
- ✅ 빠른 응답 속도

**언제 업그레이드?**
- 하루 50명 이상 사용
- Cold Start가 불편할 때
- 메모리 부족 에러 발생 시

**업그레이드 방법:**
1. Render Dashboard → 서비스 선택
2. "Settings" → "Instance Type"
3. "Starter" 선택 → $7/월
4. 즉시 적용 (다운타임 없음)

---

## 📞 지원

**문제 발생 시:**
1. 이 문서의 [트러블슈팅](#트러블슈팅) 섹션 확인
2. GitHub Issues 등록
3. Render/Vercel 공식 문서 참고

**유용한 링크:**
- Vercel 문서: https://vercel.com/docs
- Render 문서: https://render.com/docs
- FastAPI 문서: https://fastapi.tiangolo.com/

---

**작성일**: 2025-10-28
**최종 수정**: 2025-10-28
**버전**: 1.0.0

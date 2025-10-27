# Simpson Finder - 심슨 닮은꼴 찾기 서비스

> 📅 **작성일**: 2025-10-22
> 📅 **최종 수정**: 2025-10-23

---

## ⚠️ 중요 지침 (Claude 작업 규칙)

**Claude는 사용자가 요청하기 전까지 파일을 직접 작성(Write/Edit)하지 않습니다.**

- 모든 코드는 **코드 블록으로 보여주기만** 합니다
- 사용자가 직접 파일을 생성하고 코드를 복사/붙여넣기 합니다
- Claude는 코드 설명과 다음 단계를 안내합니다

---

## 📊 현재 진행 상황

### ✅ 완료된 작업

#### 1. 프로젝트 초기 설정
- [x] Next.js 15 + TypeScript 프로젝트 생성
- [x] 필수 패키지 설치 (Emotion, Face-API.js, shadcn/ui)
- [x] shadcn 컴포넌트 추가 (button, card, progress)
- [x] public/models/ 폴더 생성
- [x] Face-API.js 모델 파일 다운로드 완료

#### 2. 페이지 레이아웃
- [x] app/page.tsx 작성 완료
  - 상태 관리 (uploadedImage, faceData, matchedCharacter)
  - 이벤트 핸들러 (handleImageUpload, handleAnalysisComplete, etc.)
  - 조건부 렌더링 구조 설정

#### 3. Header 컴포넌트
- [x] components/Header.tsx 작성 완료
  - Emotion으로 스타일링
  - 심슨 테마 디자인 (노란색 그라데이션)
  - 반응형 디자인
  - app/page.tsx에 통합 완료

### 🔄 현재 진행 중

#### 4. ImageUploader 컴포넌트
- [x] components/ImageUploader.tsx 코드 작성
- [ ] app/page.tsx에 통합
- [ ] 브라우저 테스트 (드래그 앤 드롭, 이미지 미리보기)

### 📝 남은 작업

#### 5. Face-API.js 연동
- [ ] lib/faceApi.ts 작성
  - 모델 로딩 함수
  - 얼굴 감지 함수
  - 특징 추출 함수
- [ ] types/face.ts 작성 (얼굴 데이터 타입 정의)

#### 6. FaceAnalyzer 컴포넌트
- [ ] components/FaceAnalyzer.tsx 작성
  - Face-API.js 호출
  - 로딩 상태 표시 (Progress bar)
  - 에러 처리
- [ ] app/page.tsx에 통합
- [ ] 브라우저 테스트

#### 7. The Simpsons API 연동
- [ ] services/simpsonsApi.ts 작성
  - API 호출 함수
  - 캐릭터 목록 조회
- [ ] types/character.ts 작성 (캐릭터 타입 정의)
- [ ] API 응답 테스트

#### 8. CharacterMatcher 컴포넌트
- [ ] components/CharacterMatcher.tsx 작성
  - 얼굴 특징과 캐릭터 매칭 알고리즘
  - 유사도 계산
- [ ] app/page.tsx에 통합

#### 9. ResultCard 컴포넌트
- [ ] components/ResultCard.tsx 작성
  - 캐릭터 정보 표시 (shadcn Card)
  - 유사도 표시
  - 다시 시도 버튼
- [ ] app/page.tsx에 통합

#### 10. 최종 통합 및 테스트
- [ ] 전체 플로우 테스트
- [ ] 에러 핸들링 보완
- [ ] UI/UX 개선
- [ ] 스타일링 최적화

---

## 🎯 다음 단계

1. ImageUploader를 page.tsx에 통합하고 브라우저에서 테스트
2. lib/faceApi.ts 작성 (Face-API.js 초기화)
3. FaceAnalyzer 컴포넌트 작성

---

## 📋 프로젝트 개요

**Simpson Finder**는 사용자가 업로드한 사진을 분석하여 The Simpsons 캐릭터 중 닮은 캐릭터를 찾아주는 웹 서비스입니다.

### 핵심 기능
1. 이미지 업로드 (드래그 앤 드롭 / 클릭)
2. 실시간 얼굴 인식 및 분석 (Face-API.js)
3. The Simpsons API를 통한 캐릭터 데이터 조회
4. 얼굴 특징 기반 닮은꼴 매칭 알고리즘
5. 매칭 결과 및 유사도 표시

---

## 🛠️ 기술 스택

### Core
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Runtime**: React 19

### 스타일링
- **UI Library**: shadcn/ui
- **CSS-in-JS**: Emotion (@emotion/react, @emotion/styled)
- **Base**: Tailwind CSS v4

### 얼굴 인식
- **Library**: Face-API.js (브라우저 기반 얼굴 인식)
- **Backend**: 없음 (클라이언트 사이드에서 모든 처리)

### API
- **External API**: [The Simpsons API](https://thesimpsonsapi.com/)

### 향후 필요시 추가 가능
- **상태관리**: Zustand (전역 상태 필요 시)
- **데이터 페칭**: TanStack Query (API 캐싱 필요 시)

---

## 🏗️ 컴포넌트 구조 및 역할

### 1. Header
- **역할**: 상단 헤더 (로고, 타이틀)
- **기능**:
  - 프로젝트 로고 및 타이틀 표시
  - 간단한 설명 텍스트
- **상태**: 없음
- **Props**: 없음

### 2. ImageUploader
- **역할**: 사용자 이미지 업로드 UI
- **기능**:
  - 드래그 앤 드롭 또는 클릭으로 이미지 업로드
  - 이미지 미리보기
  - 업로드된 이미지를 FaceAnalyzer로 전달
- **상태**:
  - uploadedImage (업로드된 이미지 파일/URL)
  - isDragging (드래그 중 여부)
- **Props**: onImageUpload (이미지 업로드 콜백)

### 3. FaceAnalyzer
- **역할**: 얼굴 분석 및 처리
- **기능**:
  - Face-API.js로 얼굴 특징 추출
    - 얼굴 랜드마크 (눈, 코, 입 위치)
    - 얼굴 표정 (행복, 슬픔, 놀람 등)
    - 성별, 나이 예측
  - 분석 중 로딩 상태 표시 (Progress bar)
- **상태**:
  - isAnalyzing (분석 중 여부)
  - faceData (추출된 얼굴 특징)
- **Props**:
  - image (분석할 이미지)
  - onAnalysisComplete (분석 완료 콜백)

### 4. CharacterMatcher
- **역할**: 심슨 캐릭터 매칭
- **기능**:
  - The Simpsons API에서 캐릭터 목록 가져오기
  - 얼굴 특징을 기반으로 닮은 캐릭터 찾기
  - 매칭 알고리즘:
    - 성별 매칭
    - 표정 유사도
    - 랜드마크 패턴 비교
- **상태**:
  - characters (심슨 캐릭터 목록)
  - isMatching (매칭 중 여부)
  - matchedCharacter (매칭된 캐릭터)
- **Props**:
  - faceData (얼굴 분석 데이터)
  - onMatchComplete (매칭 완료 콜백)

### 5. ResultCard
- **역할**: 매칭 결과 표시
- **기능**:
  - 닮은 캐릭터 이미지 및 정보 표시
  - 유사도 퍼센티지 표시
  - 캐릭터 설명 (이름, 직업 등)
  - "다시 시도" 버튼
- **상태**: 없음
- **Props**:
  - character (캐릭터 정보)
  - similarity (유사도 0-100)
  - onRetry (다시 시도 콜백)

---

## 📂 프로젝트 구조

```
simpson-finder/
├── app/
│   ├── page.tsx              # 메인 페이지 (레이아웃)
│   ├── layout.tsx            # 루트 레이아웃
│   └── globals.css           # 글로벌 스타일
├── components/
│   ├── Header.tsx            # 헤더 컴포넌트
│   ├── ImageUploader.tsx     # 이미지 업로드
│   ├── FaceAnalyzer.tsx      # 얼굴 분석
│   ├── CharacterMatcher.tsx  # 캐릭터 매칭
│   ├── ResultCard.tsx        # 결과 표시
│   └── ui/                   # shadcn 컴포넌트
│       ├── button.tsx
│       ├── card.tsx
│       └── progress.tsx
├── lib/
│   ├── faceApi.ts            # Face-API 초기화 및 유틸
│   └── utils.ts              # 공통 유틸 함수
├── services/
│   └── simpsonsApi.ts        # The Simpsons API 호출
├── types/
│   ├── face.ts               # 얼굴 관련 타입
│   └── character.ts          # 캐릭터 관련 타입
├── public/
│   └── models/               # Face-API.js 모델 파일 (다운로드 필요)
│       ├── tiny_face_detector_model-weights_manifest.json
│       ├── face_landmark_68_model-weights_manifest.json
│       ├── face_expression_model-weights_manifest.json
│       └── age_gender_model-weights_manifest.json
└── package.json
```

---

## 🚀 작업 순서

### 1단계: Face-API.js 모델 파일 설정 ✅
- [x] `public/models/` 폴더 생성
- [ ] Face-API.js 모델 파일 다운로드
  - tiny_face_detector
  - face_landmark_68
  - face_expression
  - age_gender
- [ ] `lib/faceApi.ts` 생성 (모델 로딩 함수)

### 2단계: 페이지 레이아웃 작성
- [ ] `app/page.tsx` 작성
  - 주석으로 각 컴포넌트 위치 표시
  - 전체 레이아웃 구조 설정
  - 상태 관리 (업로드된 이미지, 분석 결과 등)

### 3단계: Header 컴포넌트 (UI 우선)
- [ ] `components/Header.tsx` 작성
  - 로고 및 타이틀
  - Emotion으로 스타일링
- [ ] `app/page.tsx`에 추가 → 화면 확인

### 4단계: ImageUploader 컴포넌트 (UI 우선)
- [ ] `components/ImageUploader.tsx` 작성
  - 드래그 앤 드롭 UI
  - 파일 선택 버튼 (shadcn Button 사용)
  - 이미지 미리보기
  - Mock 데이터로 UI 먼저 테스트
- [ ] `app/page.tsx`에 추가 → 화면 확인
- [ ] 이미지 업로드 로직 구현

### 5단계: Face-API.js 연동
- [ ] `lib/faceApi.ts` 작성
  - 모델 로딩 함수
  - 얼굴 감지 함수
  - 특징 추출 함수
- [ ] `types/face.ts` 작성 (얼굴 데이터 타입)

### 6단계: FaceAnalyzer 컴포넌트
- [ ] `components/FaceAnalyzer.tsx` 작성
  - Face-API.js 호출
  - 로딩 상태 (shadcn Progress 사용)
  - 에러 처리
- [ ] `app/page.tsx`에 추가 → 화면 확인

### 7단계: The Simpsons API 연동
- [ ] `services/simpsonsApi.ts` 작성
  - API 호출 함수
  - 캐릭터 목록 조회
- [ ] `types/character.ts` 작성 (캐릭터 타입)
- [ ] API 응답 테스트

### 8단계: CharacterMatcher 컴포넌트
- [ ] `components/CharacterMatcher.tsx` 작성
  - 얼굴 특징과 캐릭터 매칭 알고리즘
  - 유사도 계산
- [ ] `app/page.tsx`에 추가 → 화면 확인

### 9단계: ResultCard 컴포넌트
- [ ] `components/ResultCard.tsx` 작성
  - 캐릭터 이미지 및 정보 (shadcn Card 사용)
  - 유사도 표시
  - 다시 시도 버튼
- [ ] `app/page.tsx`에 추가 → 화면 확인

### 10단계: 전체 플로우 통합 및 테스트
- [ ] 이미지 업로드 → 얼굴 분석 → 매칭 → 결과 표시
- [ ] 에러 핸들링 (얼굴 미감지, API 실패 등)
- [ ] 스타일링 최적화

---

## 🔧 개발 환경 설정

### 필수 작업
1. **Face-API.js 모델 다운로드**
   - GitHub에서 모델 파일 다운로드: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
   - `public/models/` 폴더에 복사

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   - URL: http://localhost:3000

3. **The Simpsons API 확인**
   - API 문서: https://thesimpsonsapi.com/#example
   - 엔드포인트: `GET https://api.sampleapis.com/simpsons/characters`

---

## 📝 중요 참고사항

### Face-API.js 사용 시 주의사항
- **브라우저 전용**: 서버 컴포넌트에서 사용 불가
- **모델 로딩**: 초기 로딩 시 2-3초 소요 (최초 1회)
- **성능**: 브라우저 성능에 따라 분석 속도 차이
- **프라이버시**: 모든 처리가 클라이언트에서 이루어짐 (서버 전송 없음)

### The Simpsons API
- **공개 API**: 인증 불필요
- **캐릭터 수**: 약 50+개
- **응답 형식**: JSON
- **필드**: name, image, occupation 등

### Emotion + shadcn 사용
- shadcn 컴포넌트는 기본적으로 Tailwind 사용
- 커스텀 스타일은 Emotion으로 추가 가능
- 두 방식 혼용 가능

---

## 🎯 핵심 원칙

1. **UI 우선**: 화면을 먼저 만들고 필요할 때 로직 추가
2. **점진적 구현**: 한 번에 하나씩, 화면을 보면서 작업
3. **컴포넌트 분리**: 재사용 가능하도록 설계
4. **에러 처리**: 모든 비동기 작업에 에러 핸들링
5. **설명 필수**: 모든 상태/props/함수에 용도 주석

---

## 📚 참고 링크

- **Next.js 15 문서**: https://nextjs.org/docs
- **Face-API.js 문서**: https://github.com/justadudewhohacks/face-api.js
- **The Simpsons API**: https://thesimpsonsapi.com/
- **shadcn/ui**: https://ui.shadcn.com/
- **Emotion**: https://emotion.sh/docs/introduction

---

**작성일**: 2025-10-22
**프로젝트 위치**: `c:\Users\YES\Desktop\study\Simpson-Finder\simpson-finder\`

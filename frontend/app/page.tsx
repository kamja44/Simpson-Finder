"use client";

import CharacterMatcher from "@/components/CharacterMatcher";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
import ResultCard from "@/components/ResultCard";
import { MatchResult } from "@/types/character";
import { useState } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(
        circle at 20% 50%,
        rgba(255, 216, 155, 0.3) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 80%,
        rgba(25, 84, 123, 0.3) 0%,
        transparent 50%
      );
    pointer-events: none;
  }
`;

const MainContainer = styled.main`
  position: relative;
  z-index: 1;
  container-type: inline-size;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  animation: ${fadeIn} 0.8s ease-out;

  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`;

/**
 * Simpson Finder - 메인 페이지
 * - 역할: 심슨 닮은꼴 찾기 서비스의 메인 페이지
 * - 구조:
 *   1. Header: 상단 헤더 (로고, 타이틀)
 *   2. ImageUploader: 이미지 업로드 UI
 *   3. CharacterMatcher: 백엔드 API로 캐릭터 매칭
 *   4. ResultCard: 결과 표시 (매칭 완료 후)
 */

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // 이미지 업로드 핸들러
  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setMatchResult(null);
  };

  // 매칭 완료 핸들러
  const handleMatchComplete = (result: MatchResult) => {
    setMatchResult(result);
  };

  // 다시 시도 핸들러
  const handleRetry = () => {
    setUploadedImage(null);
    setMatchResult(null);
  };

  return (
    <PageWrapper>
      <Header />

      <MainContainer>
        {/* 1단계: 이미지 업로드 */}
        {!uploadedImage && <ImageUploader onImageUpload={handleImageUpload} />}

        {/* 2단계: 캐릭터 매칭 */}
        {uploadedImage && !matchResult && (
          <CharacterMatcher
            uploadedImage={uploadedImage}
            onMatchComplete={handleMatchComplete}
          />
        )}

        {/* 3단계: 결과 표시 */}
        {matchResult && uploadedImage && (
          <ResultCard
            matchResult={matchResult}
            onRetry={handleRetry}
            uploadedImage={uploadedImage}
          />
        )}
      </MainContainer>
    </PageWrapper>
  );
}

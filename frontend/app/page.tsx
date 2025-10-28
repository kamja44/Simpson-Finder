"use client";

import CharacterMatcher from "@/components/CharacterMatcher";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
import ResultCard from "@/components/ResultCard";
import { MatchResult } from "@/types/character";
import { useState } from "react";

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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // 업로드된 이미지 상태
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // 이미지 업로드 핸들러
  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setMatchResult(null); // 새 이미지 업로드 시 기존 매칭 결과 초기화
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
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-200">
      <header className="py-8">
        <Header />
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 1단계: 이미지 업로드 */}
        {!uploadedImage && <ImageUploader onImageUpload={handleImageUpload} />}

        {/* 2단계: 캐릭터 매칭 (백엔드 API 사용) */}
        {uploadedImage && !matchResult && (
          <CharacterMatcher
            uploadedImage={uploadedImage}
            onMatchComplete={handleMatchComplete}
          />
        )}

        {/* 3단계: 결과 표시 */}
        {matchResult && (
          <ResultCard matchResult={matchResult} onRetry={handleRetry} />
        )}
      </main>
    </div>
  );
}

"use client";

import CharacterMatcher from "@/components/CharacterMatcher";
import FaceAnalyzer from "@/components/FaceAnalyzer";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
import ResultCard from "@/components/ResultCard";
import { MatchResult } from "@/types/character";
import { FaceData } from "@/types/face";
import { useState } from "react";

/**
 * Simpson Finder - 메인 페이지
 * - 역할: 심슨 닮은꼴 찾기 서비스의 메인 페이지
 * - 구조:
 *   1. Header: 상단 헤더 (로고, 타이틀)
 *   2. ImageUploader: 이미지 업로드 UI
 *   3. FaceAnalyzer: 얼굴 분석 (업로드 후)
 *   4. CharacterMatcher: 캐릭터 매칭 (분석 완료 후)
 *   5. ResultCard: 결과 표시 (매칭 완료 후)
 */

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // 업로드된 이미지 상태
  const [faceData, setFaceData] = useState<FaceData | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // 이미지 업로드 핸들러
  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setFaceData(null); // 새 이미지 업로드 시 기존 분석 데이터 초기화
    setMatchResult(null); // 새 이미지 업로드 시 기존 매칭 결과 초기화
  };

  // 얼굴 분석 완료 핸들러
  const handleAnalysisComplete = (data: FaceData) => {
    setFaceData(data);
  };

  // 매칭 완료 핸들러
  const handleMatchComplete = (character: MatchResult) => {
    setMatchResult(character);
  };

  // 다시 시도 핸들러
  const handleRetry = () => {
    setUploadedImage(null);
    setFaceData(null);
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

        {/* 2단계: 얼굴 분석 */}
        {uploadedImage && !faceData && (
          <FaceAnalyzer
            image={uploadedImage}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {/* 3단계: 캐릭터 매칭 */}
        {faceData && !matchResult && (
          <CharacterMatcher
            faceData={faceData}
            onMatchComplete={handleMatchComplete}
          />
        )}

        {/* 4단계: 결과 표시 */}
        {matchResult && (
          <ResultCard matchResult={matchResult} onRetry={handleRetry} />
        )}
      </main>
    </div>
  );
}

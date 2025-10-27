"use client";

import FaceAnalyzer from "@/components/FaceAnalyzer";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
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
  const [faceData, setFaceData] = useState<any>(null); // 얼굴 분석 데이터 상태
  const [matchedCharacter, setMatchedCharacter] = useState<any>(null);

  // 이미지 업로드 핸들러
  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setFaceData(null); // 새 이미지 업로드 시 기존 분석 데이터 초기화
    setMatchedCharacter(null); // 새 이미지 업로드 시 기존 매칭 결과 초기화
  };

  // 얼굴 분석 완료 핸들러
  const handleAnalysisComplete = (data: any) => {
    setFaceData(data);
  };

  // 매칭 완료 핸들러
  const handleMatchComplete = (character: any) => {
    setMatchedCharacter(character);
  };

  // 다시 시도 핸들러
  const handleRetry = () => {
    setUploadedImage(null);
    setFaceData(null);
    setMatchedCharacter(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-200">
      <header className="py-8">
        <Header />
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>

          {/* 이미지가 업로드되면 FaceAnalyzer 표시 */}
          {uploadedImage && !faceData && (
            <div>
              {/* TODO: FaceAnalyzer 컴포넌트 추가 */}
              <FaceAnalyzer
                image={uploadedImage}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          )}

          {/* 얼굴 분석이 완료되면 CharacterMatcher 표시 */}
          {faceData && !matchedCharacter && (
            <div>
              {/* TODO: CharacterMatcher 컴포넌트 추가 */}
              {/* <CharacterMatcher 
                faceData={faceData} 
                onMatchComplete={handleMatchComplete} 
              /> */}
            </div>
          )}

          {/* 매칭이 완료되면 ResultCard 표시 */}
          {matchedCharacter && (
            <div>
              {/* TODO: ResultCard 컴포넌트 추가 */}
              {/* <ResultCard 
                character={matchedCharacter} 
                similarity={matchedCharacter.similarity}
                onRetry={handleRetry}
              /> */}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

import { detectFace, loadImage } from "@/lib/faceApi";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";
import type { FaceData } from "@/types/face";
import { Card } from "./ui/card";

const LoadingIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: spin 2s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const StatusText = styled.p`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 1rem 0;
`;

const ErrorText = styled.p`
  font-size: 1rem;
  color: #dc2626;
  margin-top: 1rem;
`;

const SuccessIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

interface FaceAnalyzerProps {
  image: string;
  onAnalysisComplete: (faceData: FaceData) => void;
}
/**
 * FaceAnalyzer 컴포넌트
 * - 역할: 업로드된 이미지에서 얼굴 분석
 * - 기능:
 *   1. Face-API.js로 얼굴 감지
 *   2. 얼굴 특징 추출 (랜드마크, 표정, 나이/성별)
 *   3. 분석 중 로딩 상태 표시
 *   4. 에러 처리
 * - Props:
 *   - image: 분석할 이미지 URL
 *   - onAnalysisComplete: 분석 완료 시 호출되는 콜백
 */
export default function FaceAnalyzer({
  image,
  onAnalysisComplete,
}: FaceAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const analyzeFace = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setProgress(10);

      // 1단계: 이미지 로딩
      console.log("Loading image...");
      const imageElement = await loadImage(image);
      setProgress(30);

      // 2단계: 얼굴 감지 및 특징 추출
      console.log("Detecting face...");
      const faceData = await detectFace(imageElement);
      setProgress(80);

      // 얼굴을 못찾는 경우
      if (!faceData) {
        setError("얼굴을 찾을 수 없습니다. 다른 이미지를 시도해주세요");
        setIsAnalyzing(false);
        return;
      }

      // 3단계 완료
      setProgress(100);
      console.log(`Analysis Complete!`, faceData);

      // 1초 후 부모 컴포넌트에 결과 전달
      setTimeout(() => {
        onAnalysisComplete(faceData);
      }, 1000);
    } catch (error) {
      console.error("Analysis error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "얼굴 분석에 실패했습니다. 다시 시도해주세요."
      );
      setIsAnalyzing(false);
    }
  };

  // 컴포넌트 마운트 시 얼굴 분석 시작
  useEffect(() => {
    const startAnalysis = async () => {
      await analyzeFace();
    };
    startAnalysis();
  }, [image]);

  return (
    <Card className="p-8 text-center">
      {error ? (
        // 에러 화면
        <>
          <ErrorText>⚠️</ErrorText>
          <StatusText>분석 실패</StatusText>
          <ErrorText>{error}</ErrorText>
        </>
      ) : progress === 100 ? (
        // 분석 완료 화면
        <>
          <SuccessIcon>✅</SuccessIcon>
          <StatusText>얼굴 분석 완료!</StatusText>
          <p className="text-gray-600">매칭 중입니다...</p>
        </>
      ) : (
        // 분석 중 화면
        <>
          <LoadingIcon>🔍</LoadingIcon>
          <StatusText>얼굴 분석 중...</StatusText>
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">{progress}%</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {progress < 30 && "이미지를 불러오는 중..."}
            {progress >= 30 && progress < 80 && "얼굴 특징을 분석하는 중..."}
            {progress >= 80 && "분석을 완료하는 중..."}
          </p>
        </>
      )}
    </Card>
  );
}

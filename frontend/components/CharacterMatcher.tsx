"use client";

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MatchResult } from "@/types/character";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingCard = styled(Card)`
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const LoadingIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: ${spin} 2s linear infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
`;

const StatusText = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 1rem 0;
`;

const SubText = styled.p`
  font-size: 1rem;
  color: #666;
  margin-top: 1rem;
  font-weight: 500;
`;

interface CharacterMatcherProps {
  uploadedImage: string;
  onMatchComplete: (result: MatchResult) => void;
}

async function matchCharacterAPI(imageUrl: string): Promise<MatchResult> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("file", blob, "user-photo.jpg");

    const apiResponse = await fetch("http://localhost:8000/api/match", {
      method: "POST",
      body: formData,
    });

    if (!apiResponse.ok) {
      throw new Error(`API 오류: ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    return result;
  } catch (error) {
    console.error("❌ 백엔드 API 호출 실패:", error);
    throw error;
  }
}

export default function CharacterMatcher({
  uploadedImage,
  onMatchComplete,
}: CharacterMatcherProps) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("AI 분석 준비 중...");

  useEffect(() => {
    const matchCharacter = async () => {
      try {
        setProgress(10);
        setStatusMessage("이미지를 백엔드로 전송 중...");

        await new Promise((resolve) => setTimeout(resolve, 500));

        setProgress(30);
        setStatusMessage("CLIP 임베딩 추출 중...");

        const result = await matchCharacterAPI(uploadedImage);

        setProgress(70);
        setStatusMessage("100개 캐릭터와 비교 중...");

        await new Promise((resolve) => setTimeout(resolve, 800));

        setProgress(100);
        setStatusMessage("매칭 완료!");

        console.log("✅ 매칭 결과:", result);

        setTimeout(() => {
          onMatchComplete(result);
        }, 300);
      } catch (error) {
        console.error("❌ 매칭 오류:", error);
        setStatusMessage("매칭 실패. 다시 시도해주세요.");
        alert(
          "캐릭터 매칭에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요."
        );
      }
    };

    matchCharacter();
  }, [uploadedImage, onMatchComplete]);

  return (
    <LoadingCard>
      <LoadingIcon>🔍</LoadingIcon>
      <StatusText>닮은 캐릭터 찾는 중...</StatusText>
      <div className="mt-6">
        <Progress value={progress} className="w-full h-3" />
        <p className="text-lg font-bold text-gray-700 mt-3">{progress}%</p>
      </div>
      <SubText>{statusMessage}</SubText>
    </LoadingCard>
  );
}

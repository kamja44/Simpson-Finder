"use client";

/**
 * CharacterMatcher 컴포넌트
 * - 역할: 사용자 이미지를 백엔드로 전송하여 닮은 심슨 캐릭터 찾기
 * - 기능: CLIP 임베딩 기반 매칭 (백엔드 API 사용)
 */

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MatchResult } from "@/types/character";

const LoadingIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 1s infinite;

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
`;

const StatusText = styled.p`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 1rem 0;
`;

interface CharacterMatcherProps {
  uploadedImage: string; // 이미지 URL (data URL 또는 blob URL)
  onMatchComplete: (result: MatchResult) => void;
}

/**
 * 백엔드 API 호출하여 캐릭터 매칭
 * - 엔드포인트: POST /api/match
 * - 입력: 이미지 파일
 * - 출력: { character: {...}, similarity: 0-100 }
 */
async function matchCharacterAPI(imageUrl: string): Promise<MatchResult> {
  try {
    // data URL 또는 blob URL을 Blob으로 변환
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // FormData 생성
    const formData = new FormData();
    formData.append("file", blob, "user-photo.jpg");

    // 백엔드 API 호출
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

        // 백엔드 API 호출
        setProgress(30);
        setStatusMessage("CLIP 임베딩 추출 중...");

        const result = await matchCharacterAPI(uploadedImage);

        setProgress(70);
        setStatusMessage("캐릭터 매칭 중...");

        // 애니메이션 효과를 위한 지연
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProgress(100);
        setStatusMessage("매칭 완료!");

        console.log("✅ 매칭 결과:", result);

        // 결과 전달
        setTimeout(() => {
          onMatchComplete(result);
        }, 300);
      } catch (error) {
        console.error("❌ 매칭 오류:", error);
        setStatusMessage("매칭 실패. 다시 시도해주세요.");

        // 에러 발생 시 사용자에게 알림
        alert(
          "캐릭터 매칭에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요."
        );
      }
    };

    matchCharacter();
  }, [uploadedImage, onMatchComplete]);

  return (
    <Card className="p-8 text-center">
      <LoadingIcon>🔍</LoadingIcon>
      <StatusText>닮은 캐릭터 찾는 중...</StatusText>
      <div className="mt-4">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-600 mt-2">{progress}%</p>
      </div>
      <p className="text-sm text-gray-500 mt-4">{statusMessage}</p>
    </Card>
  );
}

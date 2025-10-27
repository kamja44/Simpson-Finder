"use client";

/**
 * CharacterMatcher 컴포넌트
 * - 역할: 얼굴 데이터를 기반으로 닮은 심슨 캐릭터 찾기
 * - 기능: 표정 기반 랜덤 매칭
 */

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchAllCharacters } from "@/services/simpsonsApi";
import type { FaceData } from "@/types/face";
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
  faceData: FaceData;
  onMatchComplete: (result: MatchResult) => void;
}

export default function CharacterMatcher({
  faceData,
  onMatchComplete,
}: CharacterMatcherProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const matchCharacter = async () => {
      try {
        setProgress(10);

        // 1단계: 캐릭터 목록 가져오기
        console.log("Fetching characters...");
        const characters = await fetchAllCharacters();
        setProgress(40);

        // 2단계: 표정 분석
        const expressions = faceData.expressions;
        const expressionEntries = Object.entries(expressions);
        const dominantExpression = expressionEntries.reduce((prev, current) => {
          return current[1] > prev[1] ? current : prev;
        });

        console.log(
          "Dominant expression:",
          dominantExpression[0],
          dominantExpression[1]
        );
        setProgress(60);

        // 3단계: 랜덤 캐릭터 선택 (상위 20개 중)
        const randomIndex = Math.floor(
          Math.random() * Math.min(20, characters.length)
        );
        const matchedCharacter = characters[randomIndex];

        console.log("Matched character:", matchedCharacter.name);
        setProgress(80);

        // 4단계: 유사도 계산 (표정 신뢰도 기반)
        const expressionScore = dominantExpression[1]; // 0~1
        const randomFactor = Math.random() * 0.15 + 0.1; // 0.1~0.25
        const baseSimilarity = expressionScore * 0.6 + randomFactor;

        // 70~92% 범위로 조정
        const similarity = Math.round(
          Math.min(92, Math.max(70, baseSimilarity * 100))
        );

        console.log("Similarity:", similarity + "%");
        setProgress(100);

        // 1초 후 결과 전달
        setTimeout(() => {
          onMatchComplete({
            character: matchedCharacter,
            similarity,
          });
        }, 1000);
      } catch (error) {
        console.error("Matching error:", error);
      }
    };

    matchCharacter();
  }, [faceData, onMatchComplete]);

  return (
    <Card className="p-8 text-center">
      <LoadingIcon>🔍</LoadingIcon>
      <StatusText>닮은 캐릭터 찾는 중...</StatusText>
      <div className="mt-4">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-600 mt-2">{progress}%</p>
      </div>
      <p className="text-sm text-gray-500 mt-4">
        {progress < 40 && "캐릭터 데이터를 불러오는 중..."}
        {progress >= 40 && progress < 80 && "얼굴 특징을 분석하는 중..."}
        {progress >= 80 && "최적의 매칭 결과를 계산하는 중..."}
      </p>
    </Card>
  );
}

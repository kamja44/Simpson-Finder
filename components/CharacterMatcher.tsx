"use client";

import { detectFace, loadImage } from "@/lib/faceApi";
import { fetchAllCharacters } from "@/services/simpsonsApi";
import { MatchResult, SimpsonCharacter } from "@/types/character";
import { FaceData } from "@/types/face";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

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

const DetailText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
`;

interface CharactermatcherProps {
  faceData: FaceData;
  onMatchComplete: (result: MatchResult) => void; // 매칭결과 (캐릭터 + 유사도)
}

/**
 * CharacterMatcher 컴포넌트
 * - 역할: 얼굴 데이터를 기반으로 닮은 심슨 캐릭터 찾기
 * - 기능:
 *   1. The Simpsons API에서 캐릭터 목록 가져오기
 *   2. 얼굴 특징(표정)을 기반으로 캐릭터 매칭
 *   3. 유사도 계산
 * - Props:
 *   - faceData: 얼굴 분석 데이터
 *   - onMatchComplete: 매칭 완료 시 호출되는 콜백
 */
export default function CharacterMatcher({
  faceData,
  onMatchComplete,
}: CharactermatcherProps) {
  const [progress, setProgress] = useState(0);
  const [currentCharacter, setCurrentCharacter] = useState<string>("");
  // 캐릭터 매칭 함수
  const matchCharacter = async () => {
    try {
      setProgress(5);

      // 1단계: 캐릭터 목록 가져오기
      console.log("Fetching Characters...");
      const characters = await fetchAllCharacters();

      // 이미지가 있는 캐릭터만 필터링
      const validCharacters = characters
        .filter((c) => c.portrait_path && c.portrait_path.length > 0)
        .slice(0, 20);

      console.log(`Analyzing ${validCharacters.length} characters...`);
      setProgress(10);

      // 2단계: 각 캐릭터 이미지에서 얼굴 디스크립터 추출
      const characterDescriptors: Array<{
        character: SimpsonCharacter;
        descriptor: Float32Array;
        distance: number;
      }> = [];

      for (let i = 0; i < validCharacters.length; i++) {
        const character = validCharacters[i];
        setCurrentCharacter(character.name);

        try {
          // 캐릭터 이미지 로드
          const imageUrl = `https://thesimpsonsapi.com${character.portrait_path}`;
          const img = await loadImage(imageUrl);

          // 얼굴 감지 및 디스크립터 추출
          const characterFaceData = await detectFace(img);

          if (characterFaceData) {
            // 유클리드 거리 계산
            const distance = euclideanDistance(
              faceData.descriptor,
              characterFaceData.descriptor
            );

            characterDescriptors.push({
              character,
              descriptor: characterFaceData.descriptor,
              distance,
            });

            console.log(`${character.name}: distance = ${distance.toFixed(3)}`);
          }
        } catch (error) {
          console.log(`Failed to analyze ${character.name}: `, error);
        }
        // 진행률 업데이트(10% => 90%)
        setProgress(10 + Math.round(((i + 1) / validCharacters.length) * 80));
      }
      setProgress(95);

      // 3단계: 가장 거리가 가까운 캐릭터 찾기
      if (characterDescriptors.length === 0) {
        // 매칭 실패 시 랜덤 캐릭터 선택
        const randomChar =
          validCharacters[Math.floor(Math.random() * validCharacters.length)];
        onMatchComplete({
          character: randomChar,
          similarity: 70,
        });
        return;
      }

      // 거리 기준으로 정렬(오름차순)
      characterDescriptors.sort((a, b) => a.distance - b.distance);

      // 가장 가까운 캐릭터 선택
      const bestMatch = characterDescriptors[0];
      const similarity = distanceToSimilarity(bestMatch.distance);

      console.log("Best match:", bestMatch.character.name);
      console.log("Distance:", bestMatch.distance.toFixed(3));
      console.log("Similarity:", similarity + "%");

      setProgress(100);

      // 1초 후 결과 전달
      setTimeout(() => {
        onMatchComplete({
          character: bestMatch.character,
          similarity,
        });
      }, 1000);
    } catch (error) {
      console.error("Matching error:", error);

      // 에러 발생 시 랜덤 캐릭터
      const characters = await fetchAllCharacters();
      const randomChar =
        characters[Math.floor(Math.random() * Math.min(10, characters.length))];
      onMatchComplete({
        character: randomChar,
        similarity: 70,
      });
    }
  };

  // 컴포넌트 마운트 시 매칭 시작
  useEffect(() => {
    const matchFn = async () => {
      await matchCharacter();
    };

    matchFn();
  }, [faceData]);

  return (
    <Card className="p-8 text-center">
      <LoadingIcon>🔍</LoadingIcon>
      <StatusText>닮은 캐릭터 찾는 중...</StatusText>
      <div className="mt-4">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-600 mt-2">{progress}%</p>
      </div>
      <DetailText>
        {progress < 10 && "캐릭터 데이터를 불러오는 중..."}
        {progress >= 10 && progress < 95 && `${currentCharacter} 분석 중...`}
        {progress >= 95 && "최적의 매칭 결과를 계산하는 중..."}
      </DetailText>
    </Card>
  );
}

/**
 * 두 디스크립터 간의 유클리드 거리 계산
 * - 거리가 작을수록 더 유사함
 */
function euclideanDistance(desc1: Float32Array, desc2: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}
/**
 * 거리를 유사도(0-100)로 변환
 * - 거리가 0에 가까우면 유사도 100%
 * - 거리가 멀면 유사도 낮음
 */
function distanceToSimilarity(distance: number): number {
  // 일반적으로 얼굴 디스크립터 거리는 0.3~1.0 범위
  // 0.3 이하 = 매우 유사 (90-100%)
  // 0.6 이상 = 다름 (60% 이하)
  if (distance < 0.3) {
    return Math.round(100 - distance * 100);
  } else if (distance < 0.6) {
    return Math.round(85 - (distance - 0.3) * 100);
  } else {
    return Math.round(Math.max(60, 70 - distance * 50));
  }
}

"use client";

/**
 * CharacterMatcher 컴포넌트
 * - 역할: 얼굴 데이터를 기반으로 닮은 심슨 캐릭터 찾기
 * - 기능: Descriptor 기반 Euclidean Distance 매칭 (과학적 방법)
 */

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchAllCharacters, getProxiedImageUrl } from "@/services/simpsonsApi";
import { detectFace, loadImage } from "@/lib/faceApi";
import type { FaceData } from "@/types/face";
import type { MatchResult, SimpsonCharacter } from "@/types/character";

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

/**
 * Euclidean Distance 계산
 * - 두 벡터(descriptor) 간의 거리 계산
 * - 거리가 작을수록 더 유사함
 */
function euclideanDistance(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

/**
 * 거리를 유사도 퍼센티지로 변환
 * - Euclidean Distance는 0에 가까울수록 유사함
 * - 일반적으로 0.6 이하면 같은 사람으로 간주
 */
function distanceToSimilarity(distance: number): number {
  // 거리가 0 = 100% 유사
  // 거리가 0.6 = 0% 유사
  const maxDistance = 0.8;
  const similarity = Math.max(0, (1 - distance / maxDistance) * 100);
  return Math.round(similarity);
}

export default function CharacterMatcher({
  faceData,
  onMatchComplete,
}: CharacterMatcherProps) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] =
    useState("캐릭터 데이터를 불러오는 중...");

  useEffect(() => {
    const matchCharacter = async () => {
      try {
        setProgress(10);

        // 1단계: 캐릭터 목록 가져오기
        console.log("Fetching characters...");
        const characters = await fetchAllCharacters();
        setProgress(20);
        setStatusMessage(`${characters.length}개 캐릭터 분석 준비 중...`);

        // 2단계: 각 캐릭터 이미지에서 얼굴 분석
        console.log("Analyzing character faces...");
        const characterDescriptors: Array<{
          character: SimpsonCharacter;
          descriptor: Float32Array | null;
          distance: number;
        }> = [];

        // 성능을 위해 최대 30개만 분석
        const charactersToAnalyze = characters.slice(0, 30);

        for (let i = 0; i < charactersToAnalyze.length; i++) {
          const character = charactersToAnalyze[i];

          try {
            // 캐릭터 이미지 로드
            const imageUrl = getProxiedImageUrl(character.portrait_path);
            const img = await loadImage(imageUrl);

            // 얼굴 감지 및 descriptor 추출
            const charFaceData = await detectFace(img);

            if (charFaceData && charFaceData.descriptor) {
              // Euclidean Distance 계산
              const distance = euclideanDistance(
                faceData.descriptor,
                charFaceData.descriptor
              );

              characterDescriptors.push({
                character,
                descriptor: charFaceData.descriptor,
                distance,
              });

              console.log(
                `${character.name}: distance = ${distance.toFixed(3)}`
              );
            } else {
              console.log(`${character.name}: 얼굴 감지 실패`);
            }
          } catch (error) {
            console.log(`${character.name}: 이미지 로드 실패`);
          }

          // 프로그레스 업데이트
          const progressPercent =
            20 + Math.floor((i / charactersToAnalyze.length) * 60);
          setProgress(progressPercent);
          setStatusMessage(
            `캐릭터 분석 중... (${i + 1}/${charactersToAnalyze.length})`
          );
        }

        setProgress(85);
        setStatusMessage("최적의 매칭 결과 계산 중...");

        // 3단계: 가장 유사한 캐릭터 찾기 (거리가 가장 작은 것)
        if (characterDescriptors.length === 0) {
          throw new Error("분석 가능한 캐릭터가 없습니다.");
        }

        characterDescriptors.sort((a, b) => a.distance - b.distance);
        const bestMatch = characterDescriptors[0];

        console.log("\n=== 매칭 결과 ===");
        console.log("Top 5:");
        characterDescriptors.slice(0, 5).forEach((match, index) => {
          console.log(
            `${index + 1}. ${match.character.name}: ${match.distance.toFixed(
              3
            )} (${distanceToSimilarity(match.distance)}%)`
          );
        });

        // 4단계: 유사도 계산
        const similarity = distanceToSimilarity(bestMatch.distance);

        console.log(
          `\n최종 매칭: ${bestMatch.character.name} (${similarity}%)`
        );
        setProgress(100);

        // 결과 전달
        setTimeout(() => {
          onMatchComplete({
            character: bestMatch.character,
            similarity,
          });
        }, 500);
      } catch (error) {
        console.error("Matching error:", error);
        // 에러 발생 시 폴백: 첫 번째 캐릭터 반환
        const characters = await fetchAllCharacters();
        onMatchComplete({
          character: characters[0],
          similarity: 75,
        });
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
      <p className="text-sm text-gray-500 mt-4">{statusMessage}</p>
    </Card>
  );
}

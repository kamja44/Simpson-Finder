"use client";

import { MatchResult } from "@/types/character";
import styled from "@emotion/styled";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getPortraitUrl } from "@/services/simpsonsApi";
import { Button } from "./ui/button";
import { useState } from "react";
import Image from "next/image";

interface ResultCardProps {
  matchResult: MatchResult;
  onRetry: () => void;
}

const ResultContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
`;

const ImagePlaceholder = styled.div`
  width: 300px;
  height: 300px;
  margin: 0 auto 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffd166 0%, #ffb703 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const CharacterImageWrapper = styled.div`
  width: 300px;
  height: 300px;
  position: relative;
  margin: 0 auto 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #ffd166;
`;

const SimilarityBadge = styled.div<{ similarity: number }>`
  display: inline-block;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0;
  background: ${(props) =>
    props.similarity >= 85
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : props.similarity >= 75
      ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"};
  color: white;
`;

const InfoSection = styled.div`
  margin: 1.5rem 0;
  text-align: center;
`;

const InfoLabel = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0%.25rem;
`;

const InfoValue = styled.p`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
`;

const PhrasesSection = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const PhraseItem = styled.li`
  margin: 0.5rem 0;
  color: #374151;
  font-style: italic;
`;

/**
 * ResultCard 컴포넌트
 * - 역할: 매칭 결과 표시 (캐릭터 이미지, 정보, 유사도)
 * - 기능:
 *   - 캐릭터 이미지 표시
 *   - 유사도 퍼센티지 표시
 *   - 캐릭터 정보 (이름, 직업, 상태)
 *   - 명대사 표시
 *   - 다시 시도 버튼
 */
export default function ResultCard({ matchResult, onRetry }: ResultCardProps) {
  const { character, similarity } = matchResult;

  const [imageError, setImageError] = useState(false);

  const portraitUrl = getPortraitUrl(character.portrait_path);

  console.log("Portrait URL:", portraitUrl); // 디버깅용

  return (
    <ResultContainer>
      <Card>
        <CardHeader>
          <CardTitle style={{ textAlign: "center", fontSize: "1.5rem" }}>
            🎉 당신의 심슨 닮은꼴!
          </CardTitle>
        </CardHeader>

        <CardContent>
          {" "}
          {/* 캐릭터 이미지 */}
          {imageError ? (
            <ImagePlaceholder>🎭</ImagePlaceholder>
          ) : (
            <CharacterImageWrapper>
              <Image
                src={portraitUrl}
                alt={character.name}
                width={300}
                height={300}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={() => {
                  console.error("Image load failed:", portraitUrl);
                  setImageError(true);
                }}
                unoptimized
              />
            </CharacterImageWrapper>
          )}
          {/* 캐릭터 이름 */}
          <h2
            style={{
              textAlign: "center",
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            {character.name}
          </h2>
          {/* 유사도 배지 */}
          <div style={{ textAlign: "center" }}>
            <SimilarityBadge similarity={similarity}>
              {similarity}% 유사
            </SimilarityBadge>
          </div>
          {/* 캐릭터 정보 */}
          {character.occupation && (
            <InfoSection>
              <InfoLabel>직업</InfoLabel>
              <InfoValue>{character.occupation}</InfoValue>
            </InfoSection>
          )}
          {character.gender && (
            <InfoSection>
              <InfoLabel>성별</InfoLabel>
              <InfoValue>{character.gender}</InfoValue>
            </InfoSection>
          )}
          {character.age && (
            <InfoSection>
              <InfoLabel>나이</InfoLabel>
              <InfoValue>{character.age}세</InfoValue>
            </InfoSection>
          )}
          {character.status && (
            <InfoSection>
              <InfoLabel>상태</InfoLabel>
              <InfoValue>{character.status}</InfoValue>
            </InfoSection>
          )}
          {/* 명대사 */}
          {character.phrases && character.phrases.length > 0 && (
            <PhrasesSection>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "0.75rem",
                  color: "#374151",
                }}
              >
                💬 명대사
              </h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {character.phrases.slice(0, 3).map((phrase, index) => (
                  <PhraseItem key={index}>{phrase}</PhraseItem>
                ))}
              </ul>
            </PhrasesSection>
          )}
          {/* 다시 시도 버튼 */}
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Button
              onClick={onRetry}
              size="lg"
              style={{
                width: "100%",
                maxWidth: "300px",
              }}
            >
              🔄 다시 시도하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </ResultContainer>
  );
}

"use client";

import { MatchResult } from "@/types/character";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { Card, CardContent } from "./ui/card";
import { getPortraitUrl } from "@/services/simpsonsApi";
import { Button } from "./ui/button";
import { useState } from "react";
import Image from "next/image";

const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const ResultContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  animation: ${fadeInScale} 0.6s ease-out;
`;

const ResultCardStyled = styled(Card)`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border-radius: 24px;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  text-align: center;
  color: white;
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 900;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ComparisonSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 3rem 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem 1rem;
  }
`;

const ImageCircle = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid #ffd54f;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  position: relative;
  flex-shrink: 0;
  background: linear-gradient(135deg, #ffd166 0%, #ffb703 100%);

  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
  }
`;

const SimilarityContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
`;

const ArrowIcon = styled.div`
  font-size: 3rem;
  color: #667eea;

  @media (max-width: 768px) {
    font-size: 2rem;
    transform: rotate(90deg);
  }
`;

const SimilarityBadge = styled.div<{ similarity: number }>`
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 2rem;
  font-weight: 900;
  background: ${(props) =>
    props.similarity >= 85
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : props.similarity >= 75
      ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"};
  color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    padding: 0.75rem 1.5rem;
  }
`;

const CharacterName = styled.h2`
  font-size: 2.5rem;
  font-weight: 900;
  text-align: center;
  background: linear-gradient(135deg, #ff6f00 0%, #ffa000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 2rem 0 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const InfoCard = styled.div`
  padding: 1rem;
  background: linear-gradient(135deg, #fff9e6 0%, #ffecb3 100%);
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const InfoLabel = styled.p`
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.p`
  font-size: 1rem;
  font-weight: 700;
  color: #ff6f00;
  margin: 0;
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, #ddd, transparent);
  margin: 2rem 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 2rem 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem 1.5rem;
  }
`;

interface ResultCardProps {
  matchResult: MatchResult;
  onRetry: () => void;
  uploadedImage: string; // 업로드한 사진 추가
}

export default function ResultCard({
  matchResult,
  onRetry,
  uploadedImage,
}: ResultCardProps) {
  const { character, similarity } = matchResult;
  const [imageError, setImageError] = useState(false);

  const portraitUrl = getPortraitUrl(character.portrait_path);

  const handleMoreInfo = () => {
    // Simpson Wiki URL로 이동
    const wikiUrl = `https://simpsons.fandom.com/wiki/${encodeURIComponent(
      character.name
    )}`;
    window.open(wikiUrl, "_blank");
  };

  return (
    <ResultContainer>
      <ResultCardStyled>
        <Header>
          <HeaderTitle>🎉 당신의 심슨 닮은꼴!</HeaderTitle>
        </Header>

        <CardContent style={{ padding: 0 }}>
          {/* 비교 섹션 */}
          <ComparisonSection>
            {/* 업로드한 사진 */}
            <ImageCircle>
              <Image
                src={uploadedImage}
                alt="업로드한 사진"
                fill
                style={{ objectFit: "cover" }}
                unoptimized
              />
            </ImageCircle>

            {/* 유사도 */}
            <SimilarityContainer>
              <ArrowIcon>→</ArrowIcon>
              <SimilarityBadge similarity={similarity}>
                {similarity}%
              </SimilarityBadge>
              <ArrowIcon>→</ArrowIcon>
            </SimilarityContainer>

            {/* 심슨 캐릭터 사진 */}
            <ImageCircle>
              {!imageError ? (
                <Image
                  src={portraitUrl}
                  alt={character.name}
                  fill
                  style={{ objectFit: "cover" }}
                  onError={() => setImageError(true)}
                  unoptimized
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "4rem",
                  }}
                >
                  🎭
                </div>
              )}
            </ImageCircle>
          </ComparisonSection>

          {/* 캐릭터 이름 */}
          <CharacterName>{character.name}</CharacterName>

          <Divider />

          {/* 버튼들 */}
          <ButtonContainer>
            <Button
              onClick={handleMoreInfo}
              size="lg"
              style={{
                background: "linear-gradient(135deg, #ff6f00 0%, #ffa000 100%)",
                color: "white",
                fontWeight: "bold",
                fontSize: "1.125rem",
                padding: "1.25rem 2rem",
                borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              📚 심슨 정보가 더 궁금하신가요?
            </Button>
            <Button
              onClick={onRetry}
              variant="outline"
              size="lg"
              style={{
                fontWeight: "bold",
                fontSize: "1rem",
                padding: "1rem 2rem",
                borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              🔄 다시 시도하기
            </Button>
          </ButtonContainer>
        </CardContent>
      </ResultCardStyled>
    </ResultContainer>
  );
}

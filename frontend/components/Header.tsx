"use client";
import styled from "@emotion/styled";
/**
 * Header 컴포넌트
 * - 역할: 상단 헤더 (로고, 타이틀, 설명)
 * - 기능: 프로젝트 타이틀 및 간단한 설명 표시
 * - 스타일: Emotion을 사용한 커스텀 스타일링
 */

const HeaderContainer = styled.header`
  text-align: center;
  padding: 2rem 1rem;
  background: linear-gradient(135dev, #ffd700 0%, #ffed4e 100%);
  border-bottom: 4pxsolid #000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  color: #000;
  margin: 0;
  text-shadow: 3px 3px 0px rgba(255, 255, 255, 0.5);
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #333;
  margin-top: 0.5rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Icon = styled.span`
  font-size: 4rem;
  display: inline-block;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

export default function Header() {
  return (
    <HeaderContainer>
      <Icon>👨‍👩‍👧‍👦</Icon>
      <Title>SIMPSON FINDER</Title>
      <Subtitle>당신과 닮은 심슨 캐릭터를 찾아보세요!</Subtitle>
    </HeaderContainer>
  );
}

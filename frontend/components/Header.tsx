"use client";

import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const HeaderWrapper = styled.header`
  padding: 2rem 1rem;
  text-align: center;
  position: relative;
  z-index: 10;
`;

const Logo = styled.div`
  font-size: 4rem;
  margin-bottom: 0.5rem;
  animation: ${float} 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #fff176 0%, #ffd54f 50%, #ff6f00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0 1rem;
  }
`;

/**
 * Header 컴포넌트
 * - 역할: 상단 헤더 (로고, 타이틀, 설명)
 * - 기능: 프로젝트 소개 및 브랜딩
 */
export default function Header() {
  return (
    <HeaderWrapper>
      <Logo>🎨</Logo>
      <Title>Simpson Finder</Title>
      <Subtitle>
        당신의 사진을 업로드하면 AI가 닮은 심슨 캐릭터를 찾아드려요!
      </Subtitle>
    </HeaderWrapper>
  );
}

"use client";

import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { ChangeEvent, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const UploadCard = styled(Card)`
  max-width: 700px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }
`;

const UploadArea = styled.div<{ isDragging: boolean }>`
  border: 3px dashed ${(props) => (props.isDragging ? "#ff6f00" : "#ffd54f")};
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${(props) =>
    props.isDragging
      ? "linear-gradient(135deg, #fff9e6 0%, #ffecb3 100%)"
      : "linear-gradient(135deg, #fffef7 0%, #fff9e6 100%)"};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #ff6f00;
    background: linear-gradient(135deg, #fff9e6 0%, #ffecb3 100%);
  }
`;

const UploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const UploadIcon = styled.div<{ isDragging: boolean }>`
  font-size: 5rem;
  animation: ${(props) => (props.isDragging ? pulse : "none")} 1s infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
`;

const UploadText = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ff6f00 0%, #ffa000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

const UploadHint = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0;
  font-weight: 500;
`;

const PreviewContainer = styled.div`
  text-align: center;
  animation: ${keyframes`
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  `} 0.4s ease-out;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 500px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  margin-bottom: 1.5rem;
`;

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
}

/**
 * ImageUploader 컴포넌트
 * - 역할: 사용자 이미지 업로드 UI
 * - 기능:
 *   1. 드래그 앤 드롭으로 이미지 업로드
 *   2. 클릭으로 파일 선택
 *   3. 이미지 미리보기
 */
export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드가 가능합니다!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setPreviewUrl(imageUrl);
      onImageUpload(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <UploadCard className="p-8">
      {!previewUrl ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <UploadArea
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <UploadContent>
              <UploadIcon isDragging={isDragging}>📸</UploadIcon>
              <UploadText>사진을 업로드하세요</UploadText>
              <UploadHint>이미지를 드래그하거나 클릭해서 선택하세요</UploadHint>
              <Button
                size="lg"
                className="mt-4"
                style={{
                  background:
                    "linear-gradient(135deg, #ff6f00 0%, #ffa000 100%)",
                  color: "white",
                  fontWeight: "bold",
                  padding: "0.75rem 2rem",
                  fontSize: "1rem",
                  borderRadius: "20px",
                  cursor: "pointer",
                }}
              >
                📂 파일 선택
              </Button>
            </UploadContent>
          </UploadArea>
        </>
      ) : (
        <PreviewContainer>
          <PreviewImage src={previewUrl} alt="업로드된 이미지" />
          <Button onClick={handleReset} variant="outline" size="lg">
            🔄 다른 이미지 선택
          </Button>
        </PreviewContainer>
      )}
    </UploadCard>
  );
}

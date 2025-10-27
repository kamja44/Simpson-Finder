"use client";

import styled from "@emotion/styled";
import { ChangeEvent, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

/**
 * ImageUploader 컴포넌트
 * - 역할: 사용자 이미지 업로드 UI
 * - 기능:
 *   1. 드래그 앤 드롭으로 이미지 업로드
 *   2. 클릭으로 파일 선택
 *   3. 이미지 미리보기
 * - Props: onImageUpload (이미지 업로드 완료 시 호출되는 콜백)
 */

const UploadArea = styled.div<{ isDragging: boolean }>`
  border: 3px dashed ${(props) => (props.isDragging ? "#000" : "#999")};
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  background-color: ${(props) => (props.isDragging ? "#fff3cd" : "#fff")};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #000;
    background-color: #fff3cd;
  }
`;

const UploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const UploadIcon = styled.div`
  font-size: 4rem;
`;

const UploadText = styled.p`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const UploadHint = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
`;

const PreviewContainer = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
}

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

    // FileReader로 이미지 읽기
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
    <Card className="p-6">
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
              <UploadIcon>📸</UploadIcon>
              <UploadText>사진을 업로드하세요</UploadText>
              <UploadHint>이미지를 드래그하거나 클릭해서 선택하세요</UploadHint>
              <Button size="lg" className="mt-4">
                파일 선택
              </Button>
            </UploadContent>
          </UploadArea>
        </>
      ) : (
        <>
          <PreviewContainer>
            <PreviewImage src={previewUrl} alt="업로드된 이미지" />
            <div className="mt-4 space-x-4">
              <Button onClick={handleReset} variant="outline">
                다른 이미지 선택
              </Button>
            </div>
          </PreviewContainer>
        </>
      )}
    </Card>
  );
}

/**
 * Face-API.js 초기화 및 유틸 함수
 * - 브라우저에서만 실행 가능 (클라이언트 사이드 전용)
 */
import * as faceapi from "face-api.js";
import type { FaceData } from "@/types/face";

/**
 * 모델 로딩 상태
 * - 모델은 한 번만 로딩하면 됨
 */
let modelsLoaded = false;

/**
 * Face-API 모델 로딩
 * - 용도: public/models/ 폴더에서 학습된 모델 파일 로드
 * - 최초 1회만 실행 (약 2-3초 소요)
 */
export async function loadModels(): Promise<void> {
  // 이미 로딩되었으면 스킵
  if (modelsLoaded) {
    console.log("Models already loaded");
    return;
  }

  try {
    console.log("Loading Face Api Models...");
    const MODEL_URL = "/models";

    // 병렬로 모든 모델 로딩
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL), // 얼굴 감지
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL), // 랜드마크 (68 포인트)
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL), // 표정 인식
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL), // 나이/성별 예측
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL), // 얼굴 인식 (descriptor)
    ]);

    modelsLoaded = true;
    console.log(`All models loaded successfully!`);
  } catch (error) {
    console.error("error loading models: ", error);
    throw new Error("모델 로딩에 실패했습니다.");
  }
}

/**
 * 이미지에서 얼굴 감지 및 특징 추출
 * - 용도: 업로드된 이미지에서 얼굴을 찾고 특징을 분석
 * @param imageElement - 분석할 이미지 엘리먼트
 * @returns 얼굴 감지 결과 (FaceDetection 또는 null)
 */
export async function detectFace(
  imageElement: HTMLImageElement
): Promise<FaceData | null> {
  try {
    // 모델이 로딩되지 않았으면 먼저 로딩
    if (!modelsLoaded) {
      await loadModels();
    }
    console.log("Detecting face...");

    // 얼굴 감지 + 랜드마크 + 표정 + 나이/성별 + 디스크립터
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
      .withFaceDescriptor();

    // 얼굴을 못찾은 경우
    if (!detection) {
      console.log("No Face Detected");
      return null;
    }

    console.log("Face detected successfully!", detection);

    // 결과를 FaceDetection 타입으로 변환
    const faceData: FaceData = {
      landmarks: detection.landmarks,
      expressions: detection.expressions,
      gender: detection.gender as "male" | "female",
      age: Math.round(detection.age),
      descriptor: detection.descriptor,
    };
    return faceData;
  } catch (error) {
    console.error("Error detecting face:", error);
    throw new Error("얼굴 감지에 실패했습니다.");
  }
}

/**
 * 이미지 URL을 HTMLImageElement로 변환
 * - 용도: 이미지 URL을 Face-API가 처리할 수 있는 형태로 변환
 * @param imageUrl - 이미지 URL (data URL 또는 일반 URL)
 * @returns HTMLImageElement
 */
export async function loadImage(imageUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous"; // CORS 문제 방지
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = imageUrl;
  });
}

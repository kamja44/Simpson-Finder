/**
 * 얼굴 데이터 관련 타입 정의
 * - Face-API.js에서 추출한 얼굴 특징 데이터
 */

import * as faceapi from "face-api.js";

/**
 * 얼굴 감지 결과 타입
 * - Face-API.js가 반환하는 얼굴 감지 데이터
 */
export interface FaceData {
  /**
   * 얼굴 랜드마크 (68개 포인트)
   * - 용도: 눈, 코, 입 등의 위치
   */
  landmarks: faceapi.FaceLandmarks68;

  /**
   * 얼굴 표정
   * - 용도: 행복, 슬픔, 놀람 등의 감정 분석
   */
  expressions: faceapi.FaceExpressions;

  /**
   * 성별 예측
   * - 'male' 또는 'female'
   */
  gender: "male" | "female";

  /**
   * 나이 예측
   * - 예측된 나이 값
   */
  age: number;

  /**
   * 얼굴 디스크립터 (128차원 벡터)
   * - 용도: 얼굴 비교 및 매칭
   */
  descriptor: Float32Array;
}

/**
 * 얼굴 분석 결과 타입
 * - FaceAnalyzer 컴포넌트에서 사용
 */
export interface FaceAnalysisResult {
  /**
   * 얼굴 감지 성공 여부
   */
  success: boolean;

  /**
   * 감지된 얼굴 데이터 (감지 실패 시 null)
   */
  faceData: FaceData | null;

  /**
   * 에러 메시지 (에러 발생 시)
   */
  error?: string;
}

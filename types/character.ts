/**
 * The Simpsons 캐릭터 관련 타입 정의
 */

/**
 * 심슨 캐릭터 타입
 * - The Simpsons API에서 반환되는 캐릭터 데이터
 */
export interface SimpsonCharacter {
  /**
   * 캐릭터 ID
   */
  id: number;

  /**
   * 캐릭터 이름
   */
  name: string;

  /**
   * 초상화 경로 (상대 경로)
   * 예: "/character/1.webp"
   */
  portrait_path: string;

  /**
   * 나이
   */
  age?: number;

  /**
   * 성별
   */
  gender?: string;

  /**
   * 직업
   */
  occupation?: string;

  /**
   * 상태 (Alive, Dead 등)
   */
  status?: string;

  /**
   * 명대사
   */
  phrases?: string[];
}

/**
 * API 응답 타입
 */
export interface CharactersResponse {
  /**
   * 전체 캐릭터 수
   */
  count: number;

  /**
   * 다음 페이지 URL
   */
  next: string | null;

  /**
   * 이전 페이지 URL
   */
  prev: string | null;

  /**
   * 전체 페이지 수
   */
  pages: number;

  /**
   * 캐릭터 목록
   */
  results: SimpsonCharacter[];
}

/**
 * 매칭 결과 타입
 * - 얼굴 분석 결과와 매칭된 캐릭터 정보
 */
export interface MatchResult {
  /**
   * 매칭된 캐릭터
   */
  character: SimpsonCharacter;

  /**
   * 유사도 (0-100)
   * - 얼굴 특징과 캐릭터의 유사도
   */
  similarity: number;
}

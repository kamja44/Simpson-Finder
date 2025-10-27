/**
 * The Simpsons API 연동
 * - 공개 API에서 심슨 캐릭터 데이터 조회
 */

import type { CharactersResponse, SimpsonCharacter } from "@/types/character";

/**
 * API 엔드포인트
 */
const API_BASE_URL = "https://thesimpsonsapi.com";
const API_URL = `${API_BASE_URL}/api/characters`;

/**
 * 초상화 경로를 전체 URL로 변환
 */
export function getPortraitUrl(portraitPath: string): string {
  return `${API_BASE_URL}${portraitPath}`;
}

/**
 * 특정 페이지의 캐릭터 조회
 * - 용도: 페이지네이션을 사용해서 캐릭터 가져오기
 * @param page - 페이지 번호 (1부터 시작)
 * @returns 캐릭터 응답 (20개씩)
 */
export async function fetchCharactersByPage(
  page: number = 1
): Promise<CharactersResponse> {
  try {
    console.log(`Fetching page ${page}...`);

    const response = await fetch(`${API_URL}?page=${page}`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: CharactersResponse = await response.json();
    console.log(`Fetched ${data.results.length} characters from page ${page}`);

    return data;
  } catch (error) {
    console.error("Error fetching characters:", error);
    throw new Error("캐릭터 데이터를 불러오는데 실패했습니다.");
  }
}

/**
 * 여러 페이지의 캐릭터 조회
 * - 용도: 여러 페이지를 한 번에 가져오기
 * @param pages - 가져올 페이지 수
 * @returns 모든 캐릭터 배열
 */
export async function fetchMultiplePages(
  pages: number = 3
): Promise<SimpsonCharacter[]> {
  try {
    console.log(`Fetching ${pages} pages...`);

    const promises = [];
    for (let i = 1; i <= pages; i++) {
      promises.push(fetchCharactersByPage(i));
    }

    const responses = await Promise.all(promises);

    // 모든 페이지의 results를 합침
    const allCharacters = responses.flatMap((res) => res.results);

    console.log(`Total characters fetched: ${allCharacters.length}`);
    return allCharacters;
  } catch (error) {
    console.error("Error fetching multiple pages:", error);
    throw new Error("캐릭터 데이터를 불러오는데 실패했습니다.");
  }
}

/**
 * 모든 심슨 캐릭터 조회 (제한된 개수)
 * - 용도: 매칭에 사용할 캐릭터 목록 가져오기
 * @returns 캐릭터 배열 (60개 = 3페이지)
 */
export async function fetchAllCharacters(): Promise<SimpsonCharacter[]> {
  // 성능을 위해 3페이지만 가져오기 (60개)
  return fetchMultiplePages(3);
}
/**
 * 캐릭터 ID로 특정 캐릭터 조회
 * - 용도: 특정 캐릭터 상세 정보 가져오기
 * @param id - 캐릭터 ID
 * @returns 캐릭터 정보
 */
export async function fetchCharacterById(
  id: number
): Promise<SimpsonCharacter | null> {
  try {
    const characters = await fetchAllCharacters();
    const character = characters.find((char) => char.id === id);
    return character || null;
  } catch (error) {
    console.error("Error fetching character by ID: ", error);
    return null;
  }
}

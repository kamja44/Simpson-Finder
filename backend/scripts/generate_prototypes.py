"""
캐릭터 임베딩 생성 스크립트
- The Simpsons API에서 캐릭터 목록 조회
- 각 캐릭터 이미지를 CLIP으로 임베딩 추출
- data/prototypes.json에 저장
"""

import requests
import json
import os
import sys
from pathlib import Path

# 프로젝트 루트를 sys.path에 추가
sys.path.append(str(Path(__file__).parent.parent))

from services.clip_service import clip_service

def fetch_characters(max_pages=50):
    """
    The Simpsons API에서 캐릭터 목록 조회
    - 페이지네이션 방식 (페이지당 20개)
    """
    api_url = "https://thesimpsonsapi.com/api/characters"
    cdn_url = "https://cdn.thesimpsonsapi.com"
    
    print(f"🔄 캐릭터 목록 조회 중...")
    
    all_characters = []
    
    for page in range(1, max_pages + 1):
        try:
            print(f"  📄 페이지 {page} 조회 중...")
            response = requests.get(f"{api_url}?page={page}", timeout=10)
            response.raise_for_status()
            
            data = response.json()
            characters = data.get('results', [])
            
            # portrait_path를 전체 URL로 변환
            for char in characters:
                portrait_path = char.get('portrait_path')
                if portrait_path:
                    # "/character/1.webp" → "https://cdn.thesimpsonsapi.com/500/character/1.webp"
                    char['image_url'] = f"{cdn_url}/500{portrait_path}"
            
            all_characters.extend(characters)
            print(f"  ✅ {len(characters)}개 캐릭터 조회")
            
        except Exception as e:
            print(f"  ❌ 페이지 {page} 조회 실패: {str(e)}")
            break
    
    print(f"✅ 총 {len(all_characters)}개 캐릭터 조회 완료\n")
    return all_characters

def download_image(url: str) -> bytes:
    """
    이미지 URL에서 바이트 데이터 다운로드
    """
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return response.content

def generate_prototypes():
    """
    모든 캐릭터의 임베딩 생성 및 저장
    """
    # 캐릭터 목록 조회 (5페이지 = 100개)
    characters = fetch_characters(max_pages=50)
    
    prototypes = []
    success_count = 0
    fail_count = 0
    
    for idx, character in enumerate(characters, 1):
        try:
            name = character.get('name', 'Unknown')
            print(f"[{idx}/{len(characters)}] {name}")
            
            # 이미지 URL 가져오기
            image_url = character.get('image_url')
            
            if not image_url:
                print(f"  ⚠️ 이미지 URL 없음")
                fail_count += 1
                continue
            
            # 이미지 다운로드
            print(f"  📥 이미지 다운로드 중...")
            image_data = download_image(image_url)
            
            # CLIP 임베딩 추출
            print(f"  🔄 임베딩 추출 중...")
            embedding = clip_service.extract_embedding(image_data)
            
            # 결과 저장
            prototypes.append({
                "id": character.get('id'),
                "name": character.get('name'),
                "age": character.get('age'),
                "gender": character.get('gender'),
                "occupation": character.get('occupation'),
                "portrait_path": character.get('portrait_path'),
                "embedding": embedding.tolist()  # numpy → list 변환
            })
            
            success_count += 1
            print(f"  ✅ 성공\n")
        
        except Exception as e:
            print(f"  ❌ 실패: {str(e)}\n")
            fail_count += 1
    
    # data 폴더 생성
    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(exist_ok=True)
    
    # JSON 파일로 저장
    output_path = data_dir / "prototypes.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(prototypes, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'='*60}")
    print(f"✅ 총 {success_count}개 캐릭터 임베딩 생성 완료")
    print(f"❌ 실패: {fail_count}개")
    print(f"💾 저장 위치: {output_path}")
    print(f"{'='*60}")

if __name__ == "__main__":
    generate_prototypes()
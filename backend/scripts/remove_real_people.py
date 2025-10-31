"""
실제 사람 캐릭터 제거 스크립트
The Simpsons에 게스트로 출연한 실제 인물들을 제거합니다.
"""

import json
import re
from pathlib import Path

# 실제 사람 이름 패턴 (게스트 출연자들)
REAL_PEOPLE_PATTERNS = [
    # 정치인
    'Barack Obama', 'Michelle Obama', 'Donald Trump', 'Bill Clinton', 'Hillary Clinton',
    'George Bush', 'Gerald Ford', 'Jimmy Carter', 'Tony Blair', 'Arnold Schwarzenegger',

    # 배우/여배우
    'Meryl Streep', 'Tom Hanks', 'Anne Hathaway', 'Mark Hamill', 'Leonard Nimoy',
    'James Earl Jones', 'Patrick Stewart', 'Johnny Depp', 'Natalie Portman',
    'Scarlett Johansson', 'Jennifer Aniston', 'Brad Pitt', 'George Clooney',

    # 가수/음악가
    'Lady Gaga', 'Michael Jackson', 'Paul McCartney', 'Ringo Starr', 'Mick Jagger',
    'Elvis Presley', 'Johnny Cash', 'Bob Dylan', 'Elton John', 'Madonna',
    'Britney Spears', 'Justin Timberlake', 'Beyonce', 'Jay-Z', 'Kanye West',

    # 코미디언
    'John Mulaney', 'Jerry Seinfeld', 'Jon Stewart', 'Stephen Colbert', 'Conan O\'Brien',
    'Jimmy Fallon', 'Ellen DeGeneres', 'Dave Chappelle', 'Chris Rock',

    # 스포츠 선수
    'Tony Hawk', 'LeBron James', 'Tom Brady', 'David Beckham', 'Lionel Messi',
    'Mike Tyson', 'Muhammad Ali', 'Serena Williams', 'Tiger Woods',

    # 비즈니스/기술
    'Elon Musk', 'Mark Zuckerberg', 'Bill Gates', 'Steve Jobs', 'Jeff Bezos',
    'Warren Buffett', 'Richard Branson',

    # 작가/감독
    'Stephen King', 'J.K. Rowling', 'Stan Lee', 'George Lucas', 'Steven Spielberg',
    'Quentin Tarantino', 'Martin Scorsese', 'James Cameron',

    # 과학자/우주인
    'Stephen Hawking', 'Neil deGrasse Tyson', 'Bill Nye', 'Buzz Aldrin',
    'Neil Armstrong', 'Elon Musk',

    # 기타 유명인
    'Oprah Winfrey', 'Kim Kardashian', 'Paris Hilton', 'Simon Cowell',
]

# 실제 사람 이름이 포함된 패턴
REAL_NAME_INDICATORS = [
    r'\(himself\)',
    r'\(herself\)',
    r'\(as himself\)',
    r'\(as herself\)',
    r'\(voice\)',
    r'\(cameo\)',
]

def is_real_person(character_name: str) -> bool:
    """
    캐릭터 이름이 실제 사람인지 확인

    Args:
        character_name: 캐릭터 이름

    Returns:
        실제 사람이면 True, 아니면 False
    """
    name_lower = character_name.lower()

    # 실제 사람 이름 매칭
    for real_name in REAL_PEOPLE_PATTERNS:
        if real_name.lower() in name_lower:
            return True

    # 패턴 매칭 (himself, herself 등)
    for pattern in REAL_NAME_INDICATORS:
        if re.search(pattern, name_lower):
            return True

    return False

def remove_real_people():
    """
    prototypes.json에서 실제 사람 캐릭터 제거
    """
    # 파일 경로
    prototypes_path = Path(__file__).parent.parent / 'data' / 'prototypes.json'

    print("🔄 prototypes.json 로딩 중...")
    with open(prototypes_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_count = len(data)
    print(f"  ✅ 원본 캐릭터 수: {original_count}개\n")

    # 실제 사람 찾기
    print("🔍 실제 사람 캐릭터 검색 중...")
    real_people = []
    filtered_data = []

    for char in data:
        char_name = char.get('name', '')
        if is_real_person(char_name):
            real_people.append(char_name)
            print(f"  ❌ 제거: {char_name}")
        else:
            filtered_data.append(char)

    removed_count = len(real_people)
    final_count = len(filtered_data)

    print(f"\n📊 결과:")
    print(f"  - 원본 캐릭터: {original_count}개")
    print(f"  - 제거된 실제 사람: {removed_count}개")
    print(f"  - 최종 캐릭터: {final_count}개")

    # 백업 생성
    backup_path = prototypes_path.with_suffix('.json.backup')
    print(f"\n💾 원본 백업 중: {backup_path.name}")
    with open(backup_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # 필터링된 데이터 저장
    print(f"💾 필터링된 데이터 저장 중: {prototypes_path.name}")
    with open(prototypes_path, 'w', encoding='utf-8') as f:
        json.dump(filtered_data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 완료! {removed_count}개 실제 사람 제거됨")
    print(f"✅ 최종 심슨 캐릭터: {final_count}개")

if __name__ == '__main__':
    remove_real_people()

# Python 3.11 slim 이미지 (가볍고 빠름)
FROM python:3.11-slim

# user 생성 (Hugging Face Spaces 요구사항)
RUN useradd -m -u 1000 user

# 환경 변수 설정
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    HF_HOME=/home/user/.cache/huggingface \
    TRANSFORMERS_CACHE=/home/user/.cache/huggingface \
    TORCH_HOME=/home/user/.cache/torch

# 작업 디렉토리
WORKDIR /app

# 시스템 패키지 설치 (최소화)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# requirements.txt 복사 및 설치
COPY --chown=user:user requirements.txt .

# user로 전환
USER user

# pip 업그레이드 및 패키지 설치
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY --chown=user:user . .

# 포트 설정
EXPOSE 7860

# 실행 명령어 (main.py 실행)
CMD ["python", "main.py"]

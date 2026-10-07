# 동네서랍 — 월계1동 아이디어 수요 검증·기록

2026 KW해커톤 40조 **월계획** · 청년·지역 상생

모바일에서 동네 아이디어 카드를 오른쪽(관심) 또는 왼쪽(패스)으로 넘기며 생각을 남깁니다. 반응은 10C, 선택적인 이유 작성까지 하면 30C를 받아 가상의 동네 식당·카페 이용권으로 교환합니다. 팀은 별도 시연 예산을 충전해 참여 보상을 준비하며, 결론은 참여한 기기에 돌아갑니다. **이번 버전은 시연용이며 실제 결제·제휴 매장 사용을 지원하지 않습니다.**

현재 제품 방향과 크레딧 정책은 [MOBILE-CREDITS.md](docs/MOBILE-CREDITS.md)를 따릅니다.

## 현재 구현한 흐름

- 성사: 카드마다 목표 인원을 정하고, 오른쪽 스와이프(함께해요)가 목표에 닿으면 성사된다. 함께한 주민에게 성사와 일정 안내가 돌아가고, 성사되지 못한 아이디어는 서랍에서 다시 꺼낼 수 있다
- 하나의 모바일 화면(넓은 화면에서도 최대 480px), 카드 스와이프·버튼·키보드, 선택적인 이유 입력, 카드를 누르면 뒤집혀 상세 내용 표시
- 카드에 사진·영상 최대 4개 첨부(사진 10MB, 영상 50MB). 파일은 Spring이 `MEDIA_DIR`(Docker는 `dongnae-media` 볼륨)에 저장하고 Next가 그대로 스트리밍한다
- 로고·파비콘·홈 화면 아이콘은 `public/brand`의 SVG 원본 하나에서 나온다
- 팀 시연 충전 → 카드별 예산 배정 → 중복 없는 참여 보상 → 모집 마감·남은 예산 반환
- 팀 예산과 참여 보상 지갑 분리, 거래 기록, 가상 이용권 교환·사용 시연
- 스와이프 결과 공개, 결론·이어받기 알림(관심/패스 모두)

## 보존한 기존 검증 기능

- 자유 서술 → 수정 가능한 초안 → 유사 카드 확인 → 카드 게시(1~8주)
- 4단계 반응, 희망 가격, 응답자 구분, 월계1동 위치 확인(좌표 저장 없음)
- 찬성·반대·조건부 찬성 의견, 신고
- 검증 종료 후 제안자·운영자가 리포트 공개(5명 미만 비율 숨김)
- 진행·보류·중단 결론, 사유와 이력 보존, 응답자 앱 안 알림
- 보류·중단·정체 카드 이어받기, 변경점·원본 연결·재시작 알림
- 내 참여, 닉네임 변경, 알림 모두 읽음
- 운영 코드 진입, 신고 가리기·유지, 시연용 즉시 종료

화면은 Next.js, 데이터·권한·도메인 로직은 Spring Boot가 담당합니다. Next 서버가 기기 쿠키를 전달해 Spring API를 호출하며, 브라우저는 Spring을 직접 호출하지 않습니다. 이전 Next DB 구현은 제거했습니다.

## 한 번에 실행 (Docker)

```bash
cp .env.example .env
# .env의 POSTGRES_PASSWORD와 OPERATOR_CODE를 설정
# 모바일 크레딧 시연은 DEMO_CREDITS=true
# 발견 화면의 시연 아이디어 준비 버튼으로 가상 카드 3개를 준비 (실제 주민 응답은 생성하지 않음)
docker compose up --build -d
```

화면: http://localhost:3000 · 운영: http://localhost:3000/admin

Postgres 데이터는 `dongnae-data` 볼륨에 보존됩니다. API는 기본적으로 호스트의 localhost:8080에만 노출됩니다. 서버/도메인 배포는 [배포 안내](docs/DEPLOYMENT.md)를 따릅니다.

## 개별 개발 실행

필요 환경: Node.js 22, pnpm 9.15, Java 21, PostgreSQL 17.

```bash
cd backend
docker compose up -d
DEMO_CREDITS=true OPERATOR_CODE=local-demo ./gradlew bootRun
```

다른 터미널:

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

`SPRING_API_URL`은 Next **서버 전용** 환경변수입니다. 기본값은 `http://localhost:8080`입니다. DB 접속 정보와 운영 코드는 백엔드에만 설정합니다.

API 문서: http://localhost:8080/swagger-ui/index.html · 상태: http://localhost:8080/api/health

## 검증

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm start
cd backend
./gradlew test bootJar
```

백엔드 테스트는 전용 `dongnae_test` DB를 초기화합니다. 해당 이름이 아닌 DB에서는 초기화를 거부합니다. CI가 Java 21·Postgres 17에서 HTTP 통합 테스트와 웹 검사를 실행합니다.

## 문서

- [PRD](docs/PRD.md) · [기술 구현](docs/TRD.md)
- [장끼 UI 재사용](docs/UI-PORT.md) · [디자인 기준](DESIGN.md)
- [배포·기존 DB 이관](docs/DEPLOYMENT.md) · [검증 기록](docs/VERIFICATION.md)

| 이름 | 역할 |
|---|---|
| 임강현 | 기획 |
| 정재웅 | 디자인 |
| 김규석 | 프론트엔드 |
| 이세영 | 백엔드 |

반응과 리포트는 비공식 의견 조사로, 공식 결정이 아니며 대표성을 보장하지 않습니다. 공식 민원 접수나 법적 동의 절차를 대신하지 않습니다.

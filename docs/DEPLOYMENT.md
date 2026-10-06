# 배포와 기존 DB 이관

## 실행 구조

브라우저 → Next.js(화면·Server Actions) → Spring Boot(API·권한·도메인) → Postgres.

Next는 데이터를 직접 저장하지 않는다. `SPRING_API_URL`은 서버 전용이며, `dn_device` 쿠키만 API에 전달한다. 같은 데이터에 Next와 Spring의 이전 쓰기 경로를 동시에 사용하지 않는다.

## Docker Compose

저장소 루트에서 `.env.example`을 `.env`로 복사하고 DB 비밀번호와 운영 코드를 설정한다. `docker compose up --build -d`로 세 서비스를 시작한다.

- 브라우저: localhost:3000
- API 상태: `curl -f http://localhost:8080/api/health`
- API 문서: localhost:8080/swagger-ui/index.html
- 로그: `docker compose logs --tail 100 backend web`
- 종료: `docker compose down` (데이터 볼륨 유지)

공개 서버에서는 HTTPS 리버스 프록시가 web:3000을 연결하도록 한다. 프록시가 별도 머신에 있다면 `WEB_BIND_ADDRESS`를 해당 환경에 맞게 설정한다. DB 포트는 호스트에 노출하지 않는다. HTTPS 접속 시 Next 기기 쿠키는 Secure를 사용한다.

Docker 이미지의 실제 호스팅 배포는 서버/도메인을 지정한 뒤 실행한다. 이 저장소의 로컬 검증을 공개 배포로 표시하지 않는다.

## Vercel 화면 + 별도 Spring 서버

Next 루트를 Vercel에 연결하고 서버 환경변수 `SPRING_API_URL=https://<spring-api-host>`를 설정한다. Spring JAR/컨테이너와 Postgres는 별도 환경에서 실행한다. 프론트에 DB 비밀번호·운영 코드·AI 키를 설정하지 않는다.

Spring 환경변수:

| 변수 | 내용 |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://host:5432/db` (호스팅 DB가 요구하는 TLS 옵션 포함) |
| `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` | DB 인증 |
| `OPERATOR_CODE` | 운영자 진입 코드, 비어 있으면 진입 비활성 |
| `DEMO_SEED` | 기본 false, 빈 DB에서만 명확히 예시 표시된 카드 3개 생성 |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | 선택, 키가 없거나 요청 실패 시 규칙 기반 초안 |
| `SERVER_PORT` | 기본 8080 |

AI 공급자는 이전 Next의 OpenAI에서 조원 구현의 Anthropic으로 변경됐다. 기존 `OPENAI_API_KEY`는 사용하지 않는다. AI 없이 핵심 기능이 동작한다.

## 기존 Next Postgres 이관

기존 DB에 데이터가 없다면 새 DB로 시작하면 된다. 기존 주민 데이터가 있다면 다음 순서를 사용한다.

1. 기존 앱의 쓰기를 멈추고 `pg_dump`로 백업한다.
2. 먼저 복제 DB에서 같은 절차를 검증한다. 원본 테이블은 `backend/src/test/resources/legacy-next-schema.sql`과 일치해야 한다.
3. 해당 DB에 Flyway 이력이 없다면 **첫 이관에만** `SPRING_FLYWAY_BASELINE_ON_MIGRATE=true`를 설정한다. baseline version은 6이다.
4. Spring을 시작한다. V7이 enum 대소문자, `restart → TAKEOVER`, 신고 기본값을 바꾸고 결론 이력의 최신 값으로 `cards.latest_decision`을 채운다. 카드·의견·알림의 ID와 기기 키를 보존한다.
5. `/api/views/cards`, 기존 기기의 `/api/views/me`, 결론 이력·권한을 확인하고 baseline 환경변수를 제거한다.
6. Next의 `SPRING_API_URL`을 새 서버로 연결한다. 새 Next에는 이전 DB 쓰기 코드가 없다.

이 설정은 이미 동네서랍의 전체 Next 스키마가 있는 DB에만 사용한다. 새 DB는 기본 설정으로 V1~V7이 순서대로 실행된다. 이미 적용된 V1~V6 마이그레이션 파일은 수정하지 않는다.

PGlite 로컬 파일을 JDBC URL로 연결할 수는 없다. 이 경우 PostgreSQL로 별도 내보내기/복원이 필요하다.

## 시연 확인

카드 등록 → 다른 기기 반응·의견 → 운영자 즉시 종료 → 제안자 리포트 공개 → 보류 결론 → 응답자 알림 → 이어받기 → 재시작 알림을 확인한다. 5명 미만 비율 숨김, 공개 전 리포트 비노출, 가려진 카드 비노출도 확인한다.

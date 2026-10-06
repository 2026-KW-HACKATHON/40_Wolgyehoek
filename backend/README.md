# 동네서랍 백엔드 (Spring Boot)

월계1동 아이디어 수요 검증·기록 플랫폼 **동네서랍**의 백엔드입니다.

## 환경
| 항목 | 버전 |
|---|---|
| Java | **21** (Temurin 권장) |
| Spring Boot | 4.1.1 |
| Gradle | 9.7.1 (wrapper 포함, 설치 불필요) |
| DB | PostgreSQL 17 (Docker) |

## 실행
```bash
cd backend
docker compose up -d                    # DB (dongnae, dongnae_test 자동 생성)
OPERATOR_CODE=원하는값 ./gradlew bootRun  # http://localhost:8080
```
- API 문서: http://localhost:8080/swagger-ui/index.html
- 테스트: `./gradlew test` (테스트 전용 DB `dongnae_test`를 매번 비우고 실행, 개발 DB는 안 건드림)
- 로컬 5432 포트를 이미 쓰는 Postgres가 있으면 충돌하니 먼저 꺼 주세요

## 환경 변수
| 이름 | 필수 | 기본값 | 설명 |
|---|---|---|---|
| `OPERATOR_CODE` | 운영자 기능 쓸 때 | 없음 (비우면 운영자 기능 꺼짐) | 운영자 진입 코드. 실제 값은 따로 전달 |
| `ANTHROPIC_API_KEY` | 선택 | 없음 | 비우면 AI 대신 규칙 기반으로 카드 초안 생성 |
| `ANTHROPIC_MODEL` | 선택 | `claude-haiku-4-5-20251001` | 초안 생성 모델 |
| `SPRING_DATASOURCE_URL` | 배포 시 | `jdbc:postgresql://localhost:5432/dongnae` | DB 주소 |
| `SPRING_DATASOURCE_USERNAME` | 배포 시 | `dongnae` | |
| `SPRING_DATASOURCE_PASSWORD` | 배포 시 | `dongnae` | |

## 기능
카드 게시·조회, 기기 식별(`dn_device` 쿠키), 수요 반응(4단계·가격), 검증 리포트, 의견, 결론 기록 + 응답자 알림, 이어받기, 신고·운영자 가리기, 내 알림·참여, 유사 카드 검색, AI 카드 초안

## Next 연동 시 참고
- 쿠키 이름·형식이 Next의 `proxy.ts`와 같습니다 (`dn_device`, `d_` + 16자리). Next 서버에서 Spring을 부를 때 쿠키 값을 그대로 넘기면 같은 기기로 인식됩니다
- enum 값이 대문자입니다 (`PRO`, `HOLD`, `OPEN` 등)
- 아직 없는 API: 닉네임 변경, 알림 모두 읽음, 카드 검색·탭 필터 → 연동 작업 때 추가 예정
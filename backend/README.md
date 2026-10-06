# 동네서랍 Spring 백엔드

Java 21, Spring Boot 4.1.1, Gradle wrapper 9.7.1, PostgreSQL 17을 사용한다. 프로젝트 루트의 [README](../README.md)와 [배포 문서](../docs/DEPLOYMENT.md)를 기준으로 Next와 함께 실행한다.

```sh
# backend 디렉터리에서, PostgreSQL 실행 후
./gradlew bootRun
# 테스트 전용 dongnae_test DB 설정 후
./gradlew test bootJar
```

`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`로 DB를 지정한다. 테스트는 이름이 `dongnae_test`인 DB만 초기화한다. 개발/운영 DB를 테스트 URL로 지정하면 중단한다.

`OPERATOR_CODE`는 운영자 진입 코드이며 비어 있으면 운영자 기능을 끈다. `ANTHROPIC_API_KEY`는 선택 사항이고 없으면 규칙 기반 초안 생성으로 동작한다. `DEMO_SEED=true`는 빈 DB에만 반응 없는 예시 카드 세 개를 만든다. 실제 서비스에서는 false를 사용한다.

- API 문서: `/swagger-ui/index.html`
- DB 연결 확인: `/api/health`
- 화면 읽기 API: `/api/views/cards`, `/api/views/cards/{id}`, `/api/views/me`
- 닉네임: `PATCH /api/me/nickname`
- 알림 모두 읽음: `POST /api/me/notices/read-all`
- 카드/반응/의견/리포트/결론/이어받기/운영 API는 OpenAPI 참고.

Next 서버가 유효한 `dn_device` 쿠키를 전달한다. enum은 대문자이고 Next의 읽기 모델 변환에서 화면 도메인 값으로 바꾼다. V1–V6을 수정하지 않고 V7에서 기존 Next 데이터를 정규화한다. 이전 절차는 배포 문서에 명시되어 있다.

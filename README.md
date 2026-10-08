<div align="center">

<img src="public/brand/mark.svg" width="96" alt="" />

# 동네서랍

**아이디어 전에, 문제부터**

지역 문제의 **정책·예산·이해관계인·선례**를 대신 찾아 주는 지역 문제 조사 에이전트

[![Next.js 16](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-087ea4?logo=react&logoColor=white)](https://react.dev)
[![Spring Boot 4](https://img.shields.io/badge/Spring%20Boot-4-6db33f?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java 21](https://img.shields.io/badge/Java-21-f89820?logo=openjdk&logoColor=white)](https://openjdk.org)
[![PostgreSQL 17](https://img.shields.io/badge/PostgreSQL-17-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![MCP](https://img.shields.io/badge/MCP-connector-ff6f0f)](https://modelcontextprotocol.io)

[서비스 열기](https://dongne-seorap.vercel.app) · [팀별 리포트](https://dongne-seorap.vercel.app/teams) · [커넥터 연결](https://dongne-seorap.vercel.app/connect) · [컨셉 문서](docs/CONCEPT.md)

2026 KW해커톤 40조 **월계획** · 청년·지역 상생

</div>

---

## 무엇을 푸나

지역사회 문제는 아이디어보다 먼저 네 가지가 얽혀 있습니다. **정책**(무엇이 이미 있나), **예산**(돈이 어디서 나오나), **이해관계인**(누가 쥐고 있나), **선례**(다른 동네는 어떻게 했나). 이 네 가지가 구청 공지, 구의회 회의록, 주민참여예산 공고, 기사에 흩어져 있어 한 번에 보는 방법이 없습니다.

월계1동과 노원구의 공개 기록 **160건**을 원문으로 확인해 모았더니, 멈춘 이유가 남은 기록은 **20건**뿐이었고 그중 **17건**은 구의회 회의록 속 답변에 묻혀 있었습니다. 그래서 매년 같은 아이디어가 같은 이유로 다시 멈춥니다.

동네서랍은 문제 한 줄을 받아 그 네 가지를 찾아 오고, 멈춘 이유에서 **다음에 확인할 것**과 **물어볼 부서**까지 정리합니다.

## 에이전트가 하는 일

| 단계 | 하는 일 | 화면 |
|---|---|---|
| 분해 | 문제를 니즈·장소·대상·멈춘 이유 속성으로 쪼갬 | `/new` |
| 조회 | 같은 속성 조합의 정책·행정·시도·선례를 찾음 | `/new`, `/problems/[id]` |
| 정리 | 멈춘 이유 → 확인거리, 주체 → 물어볼 곳으로 변환 | `/new`, `/problems/[id]`, `/teams/[no]` |
| 확장 | 지역 전체 반복 문제와 빈칸을 리포트로 | `/report` |
| 연결 | 쓰던 AI에서 같은 도구를 그대로 호출 | `/api/mcp` |

속성으로 쌓기 때문에 지역 이름이 달라도 이어집니다. 월계동 홀몸 어르신 안부 문제를 넣으면 전주의 AI 안부전화 시범사업(1년 뒤 중단)과 광주 북구 우유 배달 사례가 같은 문제로 묶입니다.

## 시스템 구조

```
브라우저 ──▶ Next.js 16 (App Router, RSC)
                │  서버에서만 Spring 호출 · 기기 쿠키 전달 · 5분 그래프 캐시
                ├──▶ /api/mcp  ── Claude · ChatGPT · Cursor · Claude Code · Codex
                ▼
          Spring Boot 4 (Java 21)
                │  온톨로지 분류 · 그래프 스코어링 · 권한 · 결론 이력
                ▼
          PostgreSQL 17 (Flyway V1~V17)
                └── 공개 기록 아카이브 160건 + 등록 카드
```

- 브라우저는 Spring을 직접 호출하지 않습니다. 모든 도메인 로직과 권한은 백엔드에 있습니다.
- 온톨로지(니즈 20 · 장소 15 · 대상 · 멈춘 이유)는 `backend/.../IdeaTaxonomy.java`와 `Ontology.java`가 단일 기준입니다.
- 같은 문제 판정은 `IdeaGraphService.score()` 한 곳에서만 합니다. 화면·MCP·팀 리포트가 모두 이 결과를 씁니다.

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프론트엔드 | Next.js 16(App Router, Server Components), React 19, TypeScript 5, Tailwind CSS 4, Radix UI, Motion, react-force-graph-3d |
| 백엔드 | Spring Boot 4, Java 21, Spring Data JPA, Flyway, springdoc-openapi |
| 데이터 | PostgreSQL 17 · 공개 기록 JSON 아카이브(`backend/src/main/resources/ideas`) |
| AI 연동 | Model Context Protocol 서버(`/api/mcp`) · 도구 6종(`search_problems`, `get_problem`, `find_similar_attempts`, `get_region_report`, `list_precedents`, `list_vocabulary`) |
| 국제화 | 서버 사이드 ko/en 사전(`lib/i18n`), 쿠키 기반 전환 |
| 테스트 | Vitest 69, JUnit + Spring Boot Test 123, ESLint, tsc |
| 배포 | Vercel(프론트) · Render(백엔드) · Supabase Postgres + pg_cron 깨우기 |

## 바로 써 보기

- 서비스: <https://dongne-seorap.vercel.app>
- 쓰던 AI에 연결: 설정 → 커넥터 → 사용자 지정 커넥터에 `https://dongne-seorap.vercel.app/api/mcp` (로그인·API 키 없음)
- 이 해커톤 참가 37팀 리포트: <https://dongne-seorap.vercel.app/teams>

```bash
# MCP 도구 직접 호출
curl -s https://dongne-seorap.vercel.app/api/mcp \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"find_similar_attempts","arguments":{"idea":"월계1동 홀몸 어르신 안부 확인"}}}'
```

## 로컬 실행

필요 환경: Node.js 22, pnpm 9.15, Java 21, PostgreSQL 17.

```bash
# 한 번에
cp .env.example .env            # POSTGRES_PASSWORD, OPERATOR_CODE 설정
docker compose up --build -d    # http://localhost:3000
```

```bash
# 나눠서
cd backend && docker compose up -d && OPERATOR_CODE=local-demo ./gradlew bootRun
pnpm install && cp .env.example .env.local && pnpm dev
```

`SPRING_API_URL`은 Next **서버 전용** 환경변수입니다(기본 `http://localhost:8080`). DB 접속 정보와 운영 코드는 백엔드에만 둡니다.
API 문서 <http://localhost:8080/swagger-ui/index.html> · 상태 <http://localhost:8080/api/health>

## 검증

```bash
pnpm test && pnpm typecheck && pnpm lint && pnpm build
cd backend && ./gradlew test bootJar
```

백엔드 테스트는 전용 `dongnae_test` DB만 초기화합니다(다른 이름이면 거부). CI가 Java 21 · Postgres 17에서 HTTP 통합 테스트까지 실행합니다.

## 데이터와 한계

- 공개 기록 160건(정책 57 · 행정 25 · 시도 78)과 국내외 선례 20건은 출처 60곳의 원문을 사람이 직접 확인해 모았습니다. 수집 메모는 [docs/research](docs/research), 분석은 [NOWON-ANALYSIS.md](docs/research/NOWON-ANALYSIS.md).
- 멈춘 이유 20건은 아직 작은 표본입니다. 정기 자동 수집은 다음 단계입니다.
- 반응과 리포트는 비공식 의견 조사로, 공식 결정이나 민원 접수를 대신하지 않습니다.

## 문서

[컨셉](docs/CONCEPT.md) · [PRD](docs/PRD.md) · [기술 구현](docs/TRD.md) · [온톨로지](docs/ONTOLOGY.md) · [선례 모음](docs/PRECEDENTS.md) · [배포](docs/DEPLOYMENT.md) · [검증 기록](docs/VERIFICATION.md) · [디자인 기준](DESIGN.md)

## 팀 월계획

| 이름 | 역할 |
|---|---|
| 임강현 | 기획 |
| 정재웅 | 디자인 |
| 김규석 | 프론트엔드 |
| 이세영 | 백엔드 |

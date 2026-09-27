# 동네서랍 TRD (Technical Requirements Document)

- 팀: 40조 월계획 (2026 광운대학교 KW해커톤)
- 역할: 임강현(기획) · 정재웅(디자인) · 김규석(프론트엔드, 팀장) · 이세영(백엔드)
- 기준 문서: 매니패스트 PRD, 요구사항 7개, 기능 11개, 스펙 5개, 정책 5개(2026-09-27 기획 확정)
- 범위: 해커톤 중간발표(9/28)~본선(10/8~9)~전시(10/11~13)까지의 MVP

## 1. 목표와 범위

### 1.1 제품 목표
월계1동의 지역 문제 해결 아이디어가 짧은 기간 안에 주민 수요를 확인하고, 결론을 응답자에게 돌려주며, 다음 시도가 이전 결과를 이어받게 한다. MVP의 성공 기준은 **실제 주민 응답이 담긴 검증 리포트 1건 이상 발행 → 결론 기록 → 응답자 회신**을 한 번 완주하는 것이다.

### 1.2 MVP 포함 (요구사항 → 기능)

| 요구사항 | 기능 | MVP |
|---|---|---|
| R-HKQZNI 검증 카드 등록 | F-BPZEKV 정리 초안으로 검증 카드 게시 | 포함 |
| R-TAKFRA 주민 반응·의견 수집 | F-NGONHW 단계형 반응(+가격, 위치 확인) · F-ZTRJVA 입장 의견 | 포함 |
| R-IRBBQP 검증 리포트 발행 | F-DOBJPR 리포트 생성·확인 후 공개 | 포함 |
| R-MTHBIS 결론 기록과 회신 | F-JJOHSZ 결론 기록 · F-HTJZAL 회신·내 참여 | 포함 |
| R-KTBZGZ 과거 기록·이어받기 | F-NAZBNJ 유사 카드·검색 · F-SEQQDK 이어받기 | 포함 |
| R-TGTXZT 운영과 신뢰 | F-BSWMMM 신고·임시조치 · F-OJJTCM 운영자 시연 도구 | 포함 |
| R-LDEQMS 이유가 남는 투표 | F-YMZPSW 쟁점 카드·이유 태그 투표 | **제외(전시 이후)** |

### 1.3 MVP 제외
카카오 로그인, 외부 알림(알림톡·이메일), 이유가 남는 투표, 다기관 권한, 네이티브 앱.

## 2. 아키텍처

```
[브라우저 (모바일 웹 우선)]
   │  Server Components 렌더 + Server Actions(폼 제출)
   ▼
[Next.js 16 App Router (Node runtime)]
   ├─ app/            화면 (홈, 카드 작성, 카드 상세, 내 참여, 운영자)
   ├─ lib/domain/     순수 도메인 로직 (상태 판정, 리포트 집계, 유사도, 위치 판정, 정리 초안)
   ├─ lib/db/         Drizzle ORM 스키마·쿼리
   └─ lib/ai/         LLM 어댑터 (키 없으면 규칙 기반)
   ▼
[PostgreSQL]  로컬: PGlite(내장, ./.data) · 배포: DATABASE_URL(Postgres)
```

- 단일 Next.js 앱이 화면과 서버 로직을 함께 가진다(해커톤 규모에서 별도 API 서버를 두지 않는다).
- 쓰기 작업은 Server Actions, 읽기는 Server Components에서 DB를 직접 조회한다.
- 도메인 규칙은 `lib/domain`의 순수 함수로 분리해 단위 테스트한다.

## 3. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Next.js 16 (App Router, Turbopack), React 19, TypeScript strict | 화면+서버를 한 저장소에서 빠르게, Vercel 배포 |
| 스타일 | Tailwind CSS v4 + CSS 변수(DESIGN.md 토큰) | Vercel 스타일 토큰을 그대로 옮기기 쉬움 |
| 글꼴 | Geist Sans/Mono(라틴) + Pretendard(한글) | Vercel 톤 유지, 한글 가독성 |
| DB | PostgreSQL / Drizzle ORM | 스키마 타입 안전, 로컬·배포 동일 SQL |
| 로컬 DB | PGlite (`@electric-sql/pglite`) | 설치 없이 `pnpm dev`만으로 실행 |
| 배포 DB | Postgres (`DATABASE_URL`, postgres.js 드라이버) | Vercel 서버리스에서 영속 저장 |
| AI | OpenAI 호환 Chat Completions(선택) | `OPENAI_API_KEY` 없으면 규칙 기반 정리로 대체(정책: AI 사용 원칙) |
| 지도 판정 | 월계1동 행정경계 GeoJSON(admdongkor 2026-07-01) + point-in-polygon | 좌표 저장 없이 안/밖만 판정 |
| 테스트 | Vitest | 도메인 로직 단위 테스트 |
| 패키지 | pnpm | |
| 배포 | Vercel | 팀장 계정 연결 |

## 4. 데이터 모델

모든 시간은 `timestamptz`(UTC 저장, KST 표시). ID는 `nanoid(12)`.

### devices — 기기 기반 참여자 (정책: 응답 자격과 중복 방지)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | text PK | 쿠키 `dn_device`에 저장되는 기기 키 |
| nickname | text | 기본값 "주민 ####" |
| is_operator | boolean | 운영 코드 입력 시 true |
| created_at | timestamptz | |

### cards — 검증 카드
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | text PK | |
| title | text | 필수, 2~60자 |
| body | text | 원문(자유 서술), 필수, 10~2000자 |
| target | text | 대상 |
| place | text | 장소 |
| effect | text | 기대 효과 |
| proposer_id | text FK devices | |
| proposer_name | text | 게시 시점 닉네임 |
| starts_at / ends_at | timestamptz | 기간 1~8주, 기본 2주 |
| parent_id | text FK cards null | 이어받은 원본 |
| takeover_note | text null | 이어받을 때 필수: 멈춘 사유에 대한 변경점 |
| is_seed | boolean | 과거 공개 아이디어(운영자 등록) |
| hidden | boolean | 신고 처리로 가림 |
| report_published_at | timestamptz null | 리포트 공개 시각 |
| report_summary | text null | 사람이 확인한 의견 요약 |
| created_at | timestamptz | |

### reactions — 단계형 반응 (unique: card_id + device_id)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | text PK | |
| card_id / device_id | text FK | 기기당 카드 1개, 수정 가능 |
| step | smallint | 1 괜찮다 · 2 써볼 것 같다 · 3 이 가격이면 쓰겠다 · 4 알림 신청 |
| price | integer null | step 3일 때만, 0~1,000,000원 |
| respondent_type | text | resident · work_study · visitor |
| geo_inside | boolean null | 위치 확인 결과만(좌표 저장 금지) |
| created_at / updated_at | timestamptz | |

### opinions — 입장 의견
id, card_id, device_id, author_name, stance(pro·con·conditional), body(필수), condition(conditional일 때 필수), hidden, created_at

### conclusions — 결론 이력 (덮어쓰지 않고 쌓음)
id, card_id, decision(go·hold·stop), reason_tags(text[]), reason(text), decided_by, created_at
- 사유 태그: 운영 주체 없음, 예산·공간 부족, 수요 부족, 규제·허가, 기타
- hold/stop은 태그 1개 이상 + 서술 사유 필수

### notices — 앱 안 알림
id, device_id, card_id, kind(conclusion·restart), created_at, read_at

### flags / moderation_logs — 신고와 처리 이력
flags: id, target_type(card·opinion), target_id, device_id, reason, status(open·hidden·kept), created_at, handled_at, note
moderation_logs: id, actor_device_id, action(close_now·hide·keep·seed), target, reason, created_at

## 5. 도메인 규칙 (lib/domain, 단위 테스트 대상)

| 함수 | 규칙 | 근거 |
|---|---|---|
| `cardStatus(card, latestConclusion, now)` | 검증 중 → 검증 종료 → 진행/보류/중단, 종료 후 28일 무결론이면 정체 | 정책 PL-INUSMJ |
| `canTakeOver(status)` | 보류·중단·정체만 가능 | 기능 F-SEQQDK |
| `aggregateReport(reactions, opinions)` | 단계별 인원·비율, 가격 중앙값·최소·최대, 구분별 인원, 위치 확인 인원, 입장별 의견 수. 응답 5명 미만이면 비율 숨김 | 스펙 S-UBSNOW, 정책 PL-CXJFCO |
| `similarCards(draft, cards)` | 글자 2-gram 자카드 ≥ 0.2, 상위 3개, 가려진 카드 제외 | 스펙 S-BOKMEN |
| `isInsideWolgye1(lat, lng)` | 행정경계 폴리곤 내부 판정 | 스펙 S-SICGTO |
| `validatePrice(v)` | 0 ≤ 정수 ≤ 1,000,000 | 스펙 S-KYXCWV |
| `validateConclusion(input)` | hold/stop은 태그+사유 필수 | 스펙 S-AAKOJS |
| `draftFromText(text)` | 대상·장소·기대효과 추출(규칙 기반, LLM 선택) | 기능 F-BPZEKV, 정책 PL-UBIZED |

## 6. 화면과 라우트

| 경로 | 화면 | 주요 동작 |
|---|---|---|
| `/` | 홈 | 카드 목록(검증 중/결론/전체 탭), 검색, 비공식 고지 |
| `/new` | 카드 작성 | 자유 서술 → 정리 초안(수정 가능) → 유사 카드 → 기간 선택 → 게시 |
| `/cards/[id]` | 카드 상세 | 반응 4단계(+가격), 응답자 구분·위치 확인, 의견, 리포트, 결론, 이어받기, 신고 |
| `/cards/[id]/takeover` | 이어받기 | 원본 요약 + 변경점 필수 입력 → 새 카드 |
| `/me` | 내 참여 | 닉네임, 내가 올린 카드, 참여한 카드와 결론, 확인하지 않은 알림 |
| `/admin` | 운영자 | 운영 코드 입력, 신고 처리, 검증 즉시 종료, 과거 아이디어 등록 |

## 7. 서버 액션

| 액션 | 입력 검증 | 부수 효과 |
|---|---|---|
| `createDraft(text)` | 10~2000자 | LLM 또는 규칙 기반 초안 반환 |
| `publishCard(form)` | 제목·원문 필수, 기간 1~8주 | 카드 생성 |
| `upsertReaction(cardId, step, price, type, geoInside)` | 검증 중만, 가격 규칙 | 기기당 1개 upsert |
| `addOpinion(cardId, stance, body, condition)` | 조건부는 조건 필수 | |
| `publishReport(cardId, summary)` | 제안자·운영자, 검증 종료 후 | report_published_at 기록 |
| `recordConclusion(cardId, decision, tags, reason)` | 제안자·운영자, 사유 규칙 | 응답자 전원 notices(conclusion) 생성 |
| `takeOver(cardId, form)` | 원본이 보류·중단·정체, 변경점 필수 | 새 카드(parent_id), 원본 응답자 notices(restart) |
| `flagTarget(type, id, reason)` | 같은 기기 중복 신고 1건 | |
| `moderate(flagId, action, note)` | 운영자만 | hidden 처리, 로그 |
| `closeNow(cardId)` | 운영자만 | ends_at = now, 로그 |
| `enterOperator(code)` | `OPERATOR_CODE` 환경 변수와 일치 | devices.is_operator = true |

## 8. 보안·개인정보

- 연락처·좌표·소유 여부를 저장하지 않는다(정책 PL-JTKFUK). 위치는 브라우저에서 판정 후 안/밖 결과만 전송한다.
- 기기 키 쿠키는 `httpOnly`, `sameSite=lax`, 1년 만료.
- 운영 코드는 환경 변수 `OPERATOR_CODE`로만 관리하고 저장소에 커밋하지 않는다(`.env.example`만 제공).
- 모든 입력은 서버 액션에서 zod로 검증한다. 출력은 React 기본 이스케이프를 사용한다.
- 모든 결과 화면에 "비공식 의견 조사로, 공식 결정이 아니며 대표성을 보장하지 않음"과 참여 규모를 표시한다.

## 9. 비기능 요구사항

- 모바일 375px 기준 레이아웃 우선, 데스크톱 1280px 확장.
- 첫 화면 서버 렌더, 상호작용은 폼 제출 중심(자바스크립트 최소화).
- 접근성: 키보드 포커스 링, 대비 WCAG AA, 버튼 44px 터치 영역.
- 시드 데이터(과거 월계1동 공개 아이디어 예시)는 "예시" 표시.

## 10. 환경 변수

| 변수 | 필수 | 설명 |
|---|---|---|
| `DATABASE_URL` | 배포 시 | 없으면 로컬 PGlite(`./.data/pglite`) 사용 |
| `OPERATOR_CODE` | 권장 | 운영자 모드 코드 (기본값 없음 → 운영자 모드 비활성) |
| `OPENAI_API_KEY` | 선택 | 있으면 LLM 정리 초안, 없으면 규칙 기반 |
| `OPENAI_BASE_URL`, `OPENAI_MODEL` | 선택 | OpenAI 호환 엔드포인트·모델 |

## 11. 개발·검증

- `pnpm dev` 로컬 실행(첫 실행 시 스키마 생성·시드 자동 적용).
- `pnpm test` 도메인 단위 테스트, `pnpm build` 타입 검사 포함 빌드.
- 핵심 흐름 수동 검증: 카드 게시 → 반응(가격·위치) → 의견 → 운영자 즉시 종료 → 리포트 공개 → 보류 결론 → 응답자 알림 확인 → 이어받기 → 재시작 알림.
- 브랜치: `main` 보호 없이 해커톤 진행, 커밋 메시지 `feat:/fix:/docs:` 접두사 + 한국어 본문.

## 12. 일정 (본선까지)

| 날짜 | 목표 | 담당 |
|---|---|---|
| 9/28 | 중간발표: 기획 문서·MVP 핵심 흐름 시연 | 전원 |
| ~10/3 | 멘토링 반영, 지역 주체 인터뷰, 문구·정책 보완 | 임강현 |
| ~10/5 | 화면 다듬기, 전시용 태블릿 화면 | 정재웅 · 김규석 |
| ~10/6 | 배포 DB·운영자 도구·시드 데이터 | 이세영 |
| 10/8~9 | 본선 시연 | 전원 |
| 10/11~13 | 전시 현장 실사용 운영 | 전원 |

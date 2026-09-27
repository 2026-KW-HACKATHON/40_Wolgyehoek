# 동네서랍 Design System (Vercel 스타일)

## 0. Research Log

- Embedded refs: 사용자가 "Vercel 스타일"을 지정했다. Layer A `taste-skill` + Layer B `vercel.md`(Geist 디자인 시스템)를 골랐다. 운영형 제품 화면이라 과한 연출보다 절제된 정밀함이 맞기 때문이다.
- Lazyweb / Imagen: 생략했다. 명시된 브랜드 레퍼런스가 있고, 중간발표 마감(9/28 07:00) 때문이다.
- 화면 구조 참고: 매니패스트 와이어프레임 7종(홈, 초안 확인, 카드 상세, 리포트, 결론 기록, 내 참여, 이어받기 카드).

## 1. Atmosphere & Identity

흰 캔버스 위의 정밀한 기록 보관소. 동네 사람들의 반응이 숫자와 선으로 조용히 쌓인다. 장식은 하지 않고, 구조와 여백으로 신뢰를 만든다. 시그니처는 **shadow-as-border 카드와 4단계 반응 파이프라인**이다. 반응의 강도(괜찮다 → 써볼 것 같다 → 이 가격이면 쓰겠다 → 알림 신청)가 Vercel의 Develop → Preview → Ship처럼 단계 색으로만 표시된다.

## 2. Color

### Palette

| Role | Token | Value | Usage |
|---|---|---|---|
| Surface/primary | `--surface` | `#ffffff` | 페이지 배경 |
| Surface/subtle | `--surface-subtle` | `#fafafa` | 섹션 틴트, 카드 안쪽 하이라이트 |
| Text/primary | `--text` | `#171717` | 제목, 본문 강조 |
| Text/secondary | `--text-2` | `#4d4d4d` | 설명 |
| Text/tertiary | `--text-3` | `#666666` | 메타 정보 |
| Text/disabled | `--text-4` | `#808080` | 비활성, 플레이스홀더 |
| Border/ring | `--ring` | `rgba(0,0,0,0.08)` | shadow-as-border |
| Border/divider | `--divider` | `#ebebeb` | 구분선 |
| Accent/primary | `--primary` | `#171717` | 주요 버튼 배경(흑색) |
| Link | `--link` | `#0072f5` | 링크 |
| Focus | `--focus` | `hsla(212,100%,48%,1)` | 포커스 링 |
| Badge/info bg·fg | `--badge-bg` / `--badge-fg` | `#ebf5ff` / `#0068d6` | 검증 중 배지 |
| Status/go | `--go` | `#0a7f3f` on `#e9f8ef` | 진행 결론 배지 |
| Status/hold | `--hold` | `#8a5a00` on `#fff4d6` | 보류 결론 배지 |
| Status/stop | `--stop` | `#c42b1c` on `#fdecea` | 중단 결론 배지, 오류 |
| Step 1 괜찮다 | `--step-1` | `#808080` | 반응 단계 색(기능 전용) |
| Step 2 써볼 것 같다 | `--step-2` | `#0a72ef` | Develop Blue |
| Step 3 이 가격이면 | `--step-3` | `#de1d8d` | Preview Pink |
| Step 4 알림 신청 | `--step-4` | `#ff5b4f` | Ship Red |

### Rules
- UI 크롬은 무채색이다. 색은 **상태 배지와 반응 단계**에만 쓰며, 장식으로 쓰지 않는다.
- 주요 행동 버튼은 흑색(`--primary`) 배경에 흰 글자다. 보조 행동은 흰 배경에 shadow-border를 쓴다.
- 표에 없는 색은 쓰지 않는다. 필요하면 먼저 이 표에 추가한다.

## 3. Typography

### Font Stack
- Sans: `Geist, Pretendard, -apple-system, system-ui, sans-serif`. 라틴과 숫자는 Geist, 한글은 Pretendard가 맡는다.
- Mono: `Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace`. 수치, 라벨, 기간 표시에 쓴다.
- `font-feature-settings: "liga"` 전역, 수치에는 `"tnum"`.

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|
| Display | 40px (모바일 32px) | 600 | 1.1 | -0.04em | 홈 헤드라인 |
| H1 | 32px (모바일 26px) | 600 | 1.2 | -0.03em | 페이지 제목, 카드 제목 |
| H2 | 24px | 600 | 1.3 | -0.02em | 섹션 제목 |
| H3 | 18px | 600 | 1.4 | -0.01em | 카드 목록 제목 |
| Body | 16px | 400 | 1.6 | 0 | 본문 |
| Body/sm | 14px | 400 | 1.5 | 0 | 보조 설명, 버튼 |
| Caption | 12px | 500 | 1.4 | 0 | 메타, 배지 |
| Mono label | 12px | 500 | 1.3 | 0.02em | 기간, 응답 수, 기술 라벨(대문자 영문) |

### Rules
- 굵기는 400 / 500 / 600만 쓴다. 700은 쓰지 않는다.
- 한글 제목도 음의 자간을 쓰되 -0.04em을 넘지 않는다(한글 가독성).
- 본문은 14px 미만으로 쓰지 않는다. `word-break: keep-all`.

## 4. Spacing & Layout

- Base unit 8px. 스케일: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- 콘텐츠 최대 폭 720px(모바일 우선, 단일 칼럼). 홈 카드 목록만 데스크톱에서 2열(최대 1040px).
- 페이지 좌우 여백: 모바일 16px, 태블릿 24px, 데스크톱 32px.
- 섹션 간 간격 48px(모바일 32px). 카드 안쪽 여백 20px(모바일 16px).
- 상단 내비: 높이 56px, sticky, 하단 ring 그림자.
- Radius: 6px(버튼, 입력), 8px(카드), 12px(강조 카드), 9999px(배지만).

## 5. Components

| Primitive | Anatomy | States |
|---|---|---|
| Button/primary | 흑색 배경, 흰 글자 14px/500, 6px radius, 높이 40px(모바일 44px) | default, hover(`#383838`), focus(파란 링), disabled(`#ebebeb`/`#808080`), pending(스피너 + 문구) |
| Button/secondary | 흰 배경, shadow-border, `#171717` 글자 | default, hover(`#fafafa`), focus, disabled |
| Card | 흰 배경, card stack 그림자(ring + 2px + inner `#fafafa`), 8px radius | default, hover(그림자 약간 진하게), hidden(가려진 글 안내) |
| Badge | 9999px pill, 12px/500, 틴트 배경 | 검증 중 · 검증 종료 · 진행 · 보류 · 중단 · 정체 · 예시 |
| StepButton | 4개 가로 배열(모바일 2×2), 단계 색 점 + 이름 + 인원 | default, selected(검정 테두리 2px + 단계 색 점 강조), disabled(검증 종료) |
| Input / Textarea | 흰 배경, shadow-border, 6px radius, 14~16px | default, focus(파란 링), error(`--stop` 링 + 안내 문구) |
| Segmented | 응답자 구분 3개(거주 / 직장·학교 / 방문) | default, selected |
| Bar | 리포트 단계 막대, 트랙 `#ebebeb`, 채움 단계 색 | 비율 숨김(응답 5명 미만 시 인원만) |
| Notice | 비공식 의견 조사 고지, `#fafafa` 배경 + mono 캡션 | 항상 노출 |
| Toast/inline message | 성공(흑색), 오류(`--stop`) | 3초 |

## 6. Motion & Interaction

- 전환은 150~200ms `cubic-bezier(0.2, 0.8, 0.2, 1)`, opacity와 transform만 쓴다.
- 버튼 hover 150ms 배경 전환. 반응 선택 시 막대가 400ms에 걸쳐 차오른다.
- `prefers-reduced-motion`이면 모든 전환을 0ms로 한다.
- 의미 없는 장식 애니메이션은 넣지 않는다.

## 7. Depth & Elevation

| Level | Shadow | Use |
|---|---|---|
| 0 | 없음 | 페이지, 텍스트 |
| 1 Ring | `0 0 0 1px rgba(0,0,0,0.08)` | 입력, 보조 버튼, 구분 |
| 2 Card | Ring + `0 2px 2px rgba(0,0,0,0.04)` + `0 0 0 1px #fafafa` inset 느낌 | 카드 |
| 3 Featured | Level 2 + `0 8px 8px -8px rgba(0,0,0,0.04)` | 리포트 요약 카드, 모달 |
| Focus | `outline: 2px solid var(--focus); outline-offset: 2px` | 모든 상호작용 요소 |

## 8. Accessibility & Accepted Debt

- 글자 대비 WCAG AA 이상. `--text-3 #666666`이 흰 바탕에서 5.7:1이다.
- 모든 버튼과 입력은 키보드로 조작할 수 있고, 포커스 링이 보인다. 터치 영역은 44px 이상이다.
- 상태는 색만으로 전달하지 않고 배지 텍스트를 함께 쓴다.
- 수용한 부채:
  - 다크 모드는 해커톤 범위에서 제외한다.
  - Primitive Showcase 단계와 Lighthouse 측정은 마감 때문에 본선 전으로 미룬다.
  - Geist에는 한글 글리프가 없어서 한글은 Pretendard로 대체된다.

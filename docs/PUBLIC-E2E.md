# 동네서랍 본선 최소 공개 E2E — 2026-10-07

## 이번 검증의 완료 기준

**공개 HTTPS 카드 1개에 실제 월계1동 주민 1명 이상이 자기 휴대폰으로 응답하고, 마감 후 공개 리포트·결론을 같은 주민 브라우저에서 확인한다.** 기능 통합, 로컬 테스트, Tailscale 접속은 이 완료 기준의 대체 증거가 아니다. 10/7 현장 운영 여부는 아직 확인되지 않았다. 실제 수집 시각을 기록하고 계획 날짜를 실적으로 표시하지 않는다.

본선은 사용자 제공 일정 기준 10/8~9. 중간발표 문서는 10/7까지 첫 현장 검증, 본선에서 실제 주민 응답 리포트와 결론 회신을 계획했다. 문서의 Drizzle/Vercel 표기는 이전 구조다. 현재는 브라우저 → Next → Spring → PostgreSQL이다.

근거:
- [중간발표보고서 v3](https://drive.google.com/file/d/1EPWN8AnLuYBSnY7CQPWYglrVwE0mYKaR/view)
- [PR #1](https://github.com/2026-KW-HACKATHON/40_Wolgyehoek/pull/1): 10/6 병합, main `9740d1b3014cba08f920d6032ef13c4d78900002`. 전체 통합과 이전 검증 94개/19개, 공개 서버·도메인 미지정.
- [PR #2](https://github.com/2026-KW-HACKATHON/40_Wolgyehoek/pull/2): 확인 시 open, head `c2c5090e258ec7d89b44c1acf3e905bbb1e1d9ec`. 주민 UI 보완, Tailscale 검증과 로컬 참여 데이터. 이번 패치는 이 head 위의 `fix/public-validation-e2e`에 있다. PR #2를 병합해도 이 패치는 별도 반영해야 한다.

## 범위: 한 카드의 다섯 단계

| 단계 | 실제 화면과 행동 | 통과 증거 |
|---|---|---|
| 카드 게시 | 진행자 브라우저 `/new`: 규칙 기반 초안 → 확인/수정 → 게시. 주민에게 검증할 단일 질문·장소·대상·가격 가설 제시 | 공개 `/cards/<id>` URL, 게시 시각, 예시 카드 아님 |
| 주민 반응 | 별도 휴대폰의 LTE/5G, Tailscale/VPN 없이 공개 URL. 주민 유형, 1~4단계 중 하나, 3단계는 희망가. 의견은 선택 | 저장 성공, 새로고침 뒤 자기 반응 유지, 실제 주민 응답 수 증가 |
| 마감 | 진행자가 `/admin`에서 운영 코드 입력 후 카드 상세의 `[운영자] 검증 즉시 종료` | 검증 종료 상태, 이후 반응 저장 거부 |
| 리포트 | 제안자 또는 운영자가 상세의 리포트 공개. 먼저 주민에게 비공개 상태임을 확인 | 다른 브라우저에도 리포트 표시, 실제 인원·가격·의견과 일치 |
| 결론/알림 | 제안자/운영자가 진행·보류·중단 및 사유 기록. 주민이 같은 브라우저 `/me` 새로고침 | 결론 소식·카드 링크·사유 확인, 모두 읽음 이후 미읽음 감소 |

기존 `weeks`는 1~8주이므로 본선까지 자동 종료를 기다리지 않는다. 운영 코드 없이는 조기 마감을 할 수 없다. 운영자 진입은 기기 쿠키에 연결되므로 진행자 브라우저를 보존한다.

알림은 앱 안의 `/me` 소식이다. 문자·이메일·웹 푸시가 아니다. 주민에게 같은 브라우저의 소식 화면을 다시 열도록 안내한다. 시크릿 모드 종료·쿠키 삭제·다른 도메인으로 이동하면 참여와 알림 연결이 끊긴다. 진행자 자신은 결론 알림 대상에서 제외되므로 주민 기기를 따로 사용한다.

새 기능, 이어받기, 과거 카드 추가, AI 외부 호출, 다중 서버 운영은 이번 필수 범위에서 제외한다. 본선에서는 실제 응답 수와 한계에 맞춰 결론을 낸다. 1명도 흐름 검증에는 충분하지만 지역 전체 수요의 근거가 되지는 않는다. 5명 미만이면 비율은 기존 정책대로 숨긴다. 기기별 응답은 고유 주민 인증이 아니며 자기 신고 주민 유형·위치 확인 수를 구분한다.

## 발견한 공개 배포 문제와 패치

| 근거 | 문제 | 조치 |
|---|---|---|
| `compose.yaml`, `docs/DEPLOYMENT.md` | loopback 3000/8080만 있고 실행 가능한 공개 TLS 입구가 없음 | `compose.public.yaml`과 `deploy/Caddyfile` 추가. 80/443 → Caddy → web:3000, Spring/DB는 내부 경로 |
| `proxy.ts` | Secure가 내부 요청 URL의 HTTPS 여부에만 의존 | 공개 web 환경 `COOKIE_SECURE=true`로 TLS 종료 뒤 HTTP upstream에서도 Secure 보장. 실제 NextRequest 회귀 테스트 |
| `OPERATOR_CODE` 기본 공백, `weeks` 최소 1 | 빈 코드로 배포하면 본선 전 조기 마감 불가 | 공개 설정에서 필수 코드 지정, 미지정이면 Compose 실패 |
| `DEMO_SEED`, 기존 로컬 검증 데이터 | 예시/테스트 참여가 주민 실적으로 섞일 위험 | 공개 설정은 seed false 고정. 신규 전용 프로젝트·빈 볼륨으로 출발. 기존 DB는 변경·삭제하지 않음 |
| Next Server Actions | 프록시가 내부 host를 전달하면 공개 Origin 불일치로 쓰기 거부 가능 | Caddy 기본 Host 및 X-Forwarded-Host 전달 유지. 임의 Host 재작성·`allowedOrigins=*` 추가 금지 |

공개 web의 3000 바인딩은 환경변수 `WEB_BIND_ADDRESS=0.0.0.0`가 있어도 loopback으로 덮어쓴다. API 8080은 기존 loopback, DB는 호스트 포트 없음. 공개 `/api/health`로 Spring을 노출하지 않는다.

Caddy의 도메인 기반 인증서 발급에는 DNS와 외부 80/443 접근이 필요하다. [자동 HTTPS](https://caddyserver.com/docs/automatic-https), [프록시 헤더](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy). 추가 CDN/프록시 없이 DNS가 서버를 직접 가리키는 구성을 우선한다.

## 외부 권한 보유자가 채워야 할 값

| 값/권한 | 정확한 요구 |
|---|---|
| 배포 서버 | 외부에서 접근 가능한 Linux 서버, SSH/배포 실행 권한, Docker Engine + Compose 2.24.4 이상(`!override` 사용). 다른 앱과 80/443 충돌 여부 확인. 비용·서버 신규 생성은 담당자 결정 |
| `PUBLIC_DOMAIN` | 서버 공인 IP를 가리키는 소유 도메인/서브도메인의 bare hostname. `https://`·경로·포트 없이 입력 |
| DNS | A = 공인 IPv4. AAAA는 실제 IPv6 경로가 열려 있을 때만. 기존 서비스를 덮어쓰지 않는 서브도메인 사용 |
| 네트워크 | 해당 서버에 TCP 80/443 인바운드, 이미지/의존성/ACME 발급을 위한 아웃바운드 허용. 3000/8080/5432는 외부 차단 |
| `ACME_EMAIL` | 인증서 발급 연락을 받을 실제 담당자 이메일 |
| `POSTGRES_PASSWORD` | 새 전용 DB의 강한 임의 비밀번호. 최소 32바이트 난수 권장, Git/문서/채팅에 올리지 않음 |
| `OPERATOR_CODE` | 강한 별도 임의 운영 코드, 진행자만 보유. 필수이며 DB 비밀번호와 별도 |
| 저장 공간/백업 | `dongnae-live` 프로젝트 DB 볼륨, Caddy 인증서 볼륨 지속 보존, 백업 저장 위치와 접근자 지정 |

Compose가 `SPRING_API_URL=http://backend:8080`과 DB URL/사용자를 주입한다. 브라우저용 `NEXT_PUBLIC_SPRING_API_URL`은 필요 없다. AI 키는 빈 값으로 충분하다. TLS용 쿠키 설정은 공개 overlay가 주입한다. DB 비밀번호 변경만으로 이미 생성된 볼륨의 DB 암호가 바뀌지는 않으므로 처음부터 정확히 설정한다.

## 배포 순서 (아직 실행하지 않은 외부 작업)

1. 패치를 반영한 체크아웃을 서버에 준비하고 승인된 커밋 SHA를 기록한다. `main` 또는 PR #2만 배포하면 이번 공개 구성이 포함되지 않는다. 최신 PR 병합 상태는 배포 직전에 다시 확인한다.
2. 서버에서 저장소 루트에 `.env.example` → `.env` 복사. 위 필수값을 실제 값으로 채우고 `chmod 600 .env`. 기본 `change-this-local-password`를 사용하지 않는다. `DEMO_SEED=false`, AI 키 공백. 비밀값이 든 `docker compose config` 출력을 공유하지 않는다.
3. DNS A/AAAA, 서버 방화벽, 기존 80/443 사용 여부를 확인한다. 첫 검증은 신규 `dongnae-live` 프로젝트의 빈 DB를 사용한다. 로컬 검증 DB 복사·개발 DB 재사용·Flyway baseline 활성화는 하지 않는다. 이미 live 프로젝트가 있으면 담당자가 데이터 유무를 먼저 확인한다.
4. 아래 설정 검사 후 빌드·시작. Caddy 인증서 볼륨을 삭제하지 않는다.

```sh
docker compose version
docker compose -p dongnae-live -f compose.yaml -f compose.public.yaml config --quiet
docker compose -p dongnae-live -f compose.yaml -f compose.public.yaml up --build -d
docker compose -p dongnae-live -f compose.yaml -f compose.public.yaml ps
curl --retry 30 --retry-delay 2 --retry-connrefused --retry-all-errors --fail http://127.0.0.1:8080/api/health
```

5. 공개 도메인의 HTTP → HTTPS 이동과 정상 인증서 확인. 새 쿠키 검사에서 `dn_device`가 `Secure; HttpOnly; SameSite=Lax`인지 확인. 실제 랜딩 내용도 확인한다. HTTP 200만으로 서버 정상·E2E 완료를 판정하지 않는다.

```sh
# 아래 hostname은 실제 도메인으로 바꾼다.
curl -I http://YOUR_PUBLIC_DOMAIN/
curl --fail --show-error https://YOUR_PUBLIC_DOMAIN/ -o /tmp/dongnae-home.html
curl -sS -D - -o /dev/null https://YOUR_PUBLIC_DOMAIN/ | sed -n '/[Ss]et-[Cc]ookie/p'
```

6. 아래 합격 검사를 모두 통과한 뒤 카드 URL을 QR로 현장 배포한다. 테스트는 별도 제목에 `[사전 점검]`을 붙이고 주민 실적 카드와 분리한다. 실적 보고는 지정한 실제 카드 ID만 기준으로 한다. 사전 점검 카드도 홈 집계에는 포함되므로 홈 전체 수를 주민 실적으로 인용하지 않는다. 실제 주민 카드에 진행자 테스트 반응을 넣지 않는다.
7. 수집 시작/종료 시각을 공지하고 모집·응답·리포트·결론의 증거를 저장한다. 10/7 운영이 지연되면 실제 시작 시각 그대로 표시한다. 현장 1회 검증 종료 후 백업하고 본선 동안 서비스를 유지한다.

## 공개 환경 합격 검사

- [ ] 휴대폰 Wi-Fi/VPN/Tailscale을 끄고 LTE/5G에서 인증·로그인 없이 정상 HTTPS 화면 접근.
- [ ] 진행자와 주민이 서로 다른 기기. 최초 요청부터 기기 쿠키 생성, 새로고침 뒤 같은 참여 유지.
- [ ] 공개 도메인에서 게시·반응·의견을 실제 화면으로 저장: Server Actions Origin 오류 없음. 별도 화면에서 저장된 값 확인.
- [ ] 동일 주민 기기 반응을 수정해도 참여자 수가 중복 증가하지 않음. 빈 희망가 거부, 명시적 무료 0 허용.
- [ ] 위치 요청은 HTTPS에서 작동. 위치 권한 거부/실패 시 미확인으로 참여 가능. 위치 인증을 주민 신원 인증으로 표시하지 않음.
- [ ] 운영자 진입과 즉시 종료 성공, 종료 후 반응 거부.
- [ ] 공개 전 주민에게 리포트 비노출, 공개 후 표시. 5명 미만 비율 숨김과 실제 가격 응답 확인.
- [ ] 보류·중단은 사유 태그와 문장 필요. 저장 후 같은 주민 `/me`에 결론 소식과 링크 확인.
- [ ] 제3 기기에는 타인의 소식 미노출. 주민 모두 읽음 후 표시 갱신.
- [ ] web/backend 재시작 후 카드·반응·리포트·소식 지속. 외부에서 3000/8080/5432 접근 불가.

마지막 재시작 검사는 사전 점검 때 수행한다:

```sh
docker compose -p dongnae-live -f compose.yaml -f compose.public.yaml restart web backend
```

서버 시작 실패: `docker compose ... logs --tail 100 backend web caddy`를 서버 담당자만 확인한다. DB/API가 정상이면 DNS·TLS → Caddy Host 전달 → Secure 쿠키 → Next 쓰기 순서로 확인한다. Origin mismatch는 Host/X-Forwarded-Host 전달을 바로잡는다. 공개 비율/소식이 다르면 카드 ID·기기·리포트 공개 시각부터 확인한다.

## 증거와 본선 표현

다음 한 줄 기록을 실제 값으로 채운다: 배포 커밋 / 공개 카드 URL / 외부망 확인 시각 / 모집 장소·방식 / 실제 수집 기간 / 반응 기기 수 / 주민 자기 신고 수 / 위치 확인 수 / 가격 응답 수 / 마감 시각 / 리포트 공개 시각 / 결론·사유 / 주민 소식 확인 시각.

주민 동의 없이 개인 사진·위치 좌표·쿠키·기기 ID를 캡처하지 않는다. 화면 증거는 카드 내용·집계·결론 소식 정도로 제한한다. 예: “월계1동 현장에서 주민으로 응답한 N개 기기의 비공식 의견을 수집했고, 종료 뒤 리포트와 결론을 공개하여 참여 브라우저에서 확인했다.” 이 문장은 해당 검사가 실제 완료된 뒤에만 사용한다.

## 이번 패치 검증 상태

- Secure 쿠키 회귀: 수정 전 HTTP upstream에서 실패 재현, 수정 후 통과. 로컬 HTTP와 기존 기기 유지 포함.
- 프론트 테스트 22개, 타입 검사, 린트, 운영 빌드 통과.
- 공개 Compose 미지정 운영 코드 거부 확인. 설정 렌더링에서 loopback web/API, DB 비공개, seed false, Secure true, 80/443 입구 확인.
- Caddy `2-alpine` 실제 컨테이너의 `caddy validate` 통과(공개 포트 미게시). 인증서 발급·DNS·외부 접속 성공을 이 검사로 대신하지 않는다.
- Spring 94개와 기존 전체 브라우저 E2E는 PR #1의 이전 검증 근거이며 이번 실행 결과가 아니다. 이번 패치는 Spring 코드/스키마를 변경하지 않는다.
- **공개 서버 배포·실제 주민 응답·공개 환경 다섯 단계는 미완료**: 지정된 서버/도메인/권한이 아직 없다. 완결된 배포 절차를 제공한 상태이며 주민 실적을 만들지 않았다.

## 백업과 되돌리기

```sh
# 서버의 접근 제한된 디렉터리에서 실행. 출력 파일에는 참여 자료가 포함된다.
umask 077
docker compose -p dongnae-live -f compose.yaml -f compose.public.yaml exec -T postgres pg_dump -U dongnae -d dongnae > dongnae-live-backup.sql
# 공개 서비스 중단이 필요할 때 (볼륨 보존)
docker compose -p dongnae-live -f compose.yaml -f compose.public.yaml stop caddy web backend
```

복구는 같은 `dongnae-live` 프로젝트·DB 볼륨을 보존하고 검증한 커밋으로 빌드·재시작한다. `down -v` 또는 볼륨 삭제를 실행하지 않는다. 비밀값·백업·원시 응답은 reader에 넣지 않는다. 이 문서는 설정값의 이름과 절차만 담는다.

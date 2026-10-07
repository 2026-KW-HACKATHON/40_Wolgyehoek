# 동네서랍 지난 아이디어 기록 (공개 자료)

`backend/src/main/resources/ideas/archive.json`의 근거다. 서버가 시작할 때(`ARCHIVE_SEED`, 기본 true) 같은 id로 한 번만 카드와 결론을 넣는다. 적재본은 원본의 `MOBILITY`를 안전, `CULTURE`를 이웃 분야로 옮기고, `UNKNOWN` 결과는 결론 없이(정체) 둔다.

검증일: 2026-10-07. 총 **36건**, 고유 출처 URL **10개**, 연도 **2019~2026**. 저장 위치: `backend/src/main/resources/ideas/archive.json`. 월계1동을 우선하고 영축산·광운로·광운대·석계역 및 월계동의 관련 기록을 포함했다. 노원구 전체에만 해당하는 사업은 넣지 않았다.

## 주제별 건수

| topic | 건수 |
|---|---:|
| CARE | 8 |
| COMMERCE | 6 |
| SAFETY | 3 |
| ENVIRONMENT | 3 |
| YOUTH | 2 |
| NEIGHBOR | 7 |
| MOBILITY | 2 |
| CULTURE | 5 |

## 결과별 건수

| outcome | 건수 |
|---|---:|
| GO | 23 |
| HOLD | 0 |
| STOP | 0 |
| UNKNOWN | 13 |

GO는 선정·예산 확보·착수·운영·완료 중 원문에서 확인된 상태를 뜻하며, 모두 완료됐다는 의미는 아니다. 각 항목의 outcomeNote에 확인된 수준을 적었다. 주민총회 상정만 확인된 6건과 대학 수상 과제 6건은 시행 여부가 불명확해 UNKNOWN으로 처리했다. 2025년 달빛야시장은 개최 예고 기사만 확인했으므로 UNKNOWN이다. HOLD·STOP을 뒷받침하는 자료는 확보하지 못했다. 중단·보류 사유를 추정하지 않았으므로 모든 outcomeReasonTags는 빈 배열이다.

## 반복 주제 → 항목 ID

- **주민 참여 마켓·동네 축제 (2019·2021·2022·2024)** → `arc_flea19`, `arc_show21`, `arc_flea22`, `arc_fest24`
- **광운로·월계 상권 활성화 (2020·2021·2024·2025)** → `arc_random20`, `arc_smart20`, `arc_login20`, `arc_sign21`, `arc_night24`, `arc_night25`
- **어르신 활력·고립 예방 (2020·2024·2026)** → `arc_senior20`, `arc_meal24`, `arc_knock24`, `arc_plug24`, `arc_shop24`, `arc_ai24`, `arc_match24`, `arc_rest26`
- **주민 공유·참여 공간 (2020·2021·2024)** → `arc_garden20`, `arc_jang21`, `arc_play21`, `arc_fab21`, `arc_startup21`, `arc_maru24`
- **동네 문화·야외 공간 활용 (2019·2020·2021·2024)** → `arc_trail19`, `arc_flower20`, `arc_walk21`, `arc_show21`, `arc_music24`, `arc_class24`
- **동네 안전·환경 개선 (2021·2024)** → `arc_pest21`, `arc_clean24`, `arc_heat24`, `arc_snow24`, `arc_drain24`

주제 묶음은 검색·비교용 분류이며 같은 사업의 재제안이나 이전 사업의 실패·승계를 입증하지 않는다. 2019·2022년 캠퍼스타운 축제와 2024년 한마음축제는 각각 별도 연도·행사의 기록이다. 2024년 돌봄 서비스들도 전화·방문, 전력·조도 확인, 자동전화, 장보기, 반찬 배달, 대학생 교류라는 별도 수단을 가진 사업으로 구분했다. 축제의 부스·버스킹·ICT 체험은 같은 행사의 일부이므로 개별 항목으로 쪼개지 않았다.

## 검증한 출처

- [지역 언론·지역연합신문 (2021, assembly)](https://www.yonhap21.com/detail.php?number=22818&thread=22r07r02) — 6건
- [광운대 캠퍼스타운 (2020, capstone)](https://www.kw.ac.kr/ko/life/newsletter.jsp?BoardMode=view&DUID=35391) — 6건
- [노원구의회 행정사무감사 (2024, council)](https://council.nowon.kr/record/recordView.do?key=a719da7597d5130db9eff8b8b1308db476b2e335d83be479c5d718fd0e10b6007c47b58616851a8e) — 14건
- [광운대 캠퍼스타운 (2019, fest19)](https://www.kw.ac.kr/ko/life/newsletter.jsp?BoardMode=view&DUID=2330) — 1건
- [광운대 캠퍼스타운 (2022, fest22)](https://www.kw.ac.kr/ko/life/newsletter.jsp?BoardMode=view&DUID=40932) — 1건
- [언론·아주경제 (2024, night24)](https://www.ajunews.com/view/20240922121959134) — 1건
- [언론·연합뉴스 (2025, night25)](https://www.yna.co.kr/amp/view/AKR20250915089100004) — 1건
- [언론·뉴스핌 (2026, elder)](https://www.newspim.com/news/view/20260319001318) — 1건
- [광운대 캠퍼스타운 (2021, campus)](https://www.kw.ac.kr/ko/life/newsletter.jsp?BoardMode=view&DUID=37197) — 4건
- [지역 언론·시사프리신문 (2019, trail)](https://sisanews.org/articles/221503831377) — 1건

모든 사용 URL을 실제 조회했다. 지역연합신문은 webfetch에서 한글이 깨져 직접 HTTP 조회 후 EUC-KR로 해독했다(HTTP 200). 저장한 evidence 36개 모두 조회 원문과 공백을 정규화해 대조했다. 2024년 회의록의 월계1동 보고 부분만 사용했고, 뒤에 이어지는 중계4동 기록은 제외했다. 회의록의 ‘플프마켓’ 표기는 원문의 오기 그대로 evidence에 보존했다.

## 사용하지 못한 자료·검색 한계

- [광운대역 승강시설 기사·뉴스1](https://www.news1.kr/society/general-society/4494350): 실제 조회는 됐지만 본문 추출 결과가 날짜·소제목·사진에 그쳐 요구·착공·준공의 상세 근거를 확보하지 못했다. 항목에서 제외했다.
- 월계동 안심귀갓길·조명 검색에서 나온 [2025년 구의회 회의록](https://council.nowon.kr/record/recordView.do?key=2d8d427badde96ce7571ae8f6d8d8bab8473cd9324997890b5c8ff3d19c9153d3a91f6df7f752acc)은 검색 단계에서 공릉동 사업으로 드러나 월계동 사례로 채택하지 않았다. 이 링크는 본문을 직접 검증한 사용 출처가 아니라 제외한 검색 후보이다.
- 주민총회·참여예산 검색에는 인천 연수구 동춘동 자료가 섞였다. 월계동과 무관하므로 제외했고 원문을 추가 조회하지 않았다.
- 최종 사용한 10개 URL 중 접근 불가 자료는 없었다. 지역연합신문의 문자 인코딩 문제는 해독으로 해결했다.

## 해석 시 주의

- 36건 중 2024년 월계1동 행정사무감사 한 자료에 14건이 집중돼 있다. 전체 제안 모집단이나 연도별 수요를 대표하지 않는다. 2018년 기록은 넣지 않았으며 연도별 균형을 맞추려고 항목을 추가하지 않았다.
- year는 제안·수업·행사·확인된 운영의 연도이다. 2020년 지역연계수업 기사 게시 시점은 2021년이지만 과제 연도는 2020년이다. 2021년 창업공간·팹랩·가로개선 항목은 인터뷰에서 확인한 운영 연도이며 최초 개설·착공 연도라는 의미가 아니다.
- 장소가 특정되지 않은 지역연계 과제는 요청한 기본값 ‘월계1동’을 사용했다. 그 과제가 월계1동의 특정 부지에서 시행됐다는 뜻은 아니다. ‘우이천 자전거 도로’·‘쿠팡 터미널’도 원문 수준의 장소명이고 주소·좌표는 확인하지 않았다.
- problem은 원문에 나온 목적·사업명에서 최소한으로 요약했다. 예컨대 놀이터·장독대의 시설 부족이나 주민 불만을 입증하는 별도 조사 자료는 없다.
- GO는 원문 시점의 진행·실행 확인이다. 유지 운영, 효과, 후속 변화는 추가 확인하지 않았다. 예고·발표·수상을 시행으로 바꾸거나 사업 실패 이유를 만들어 넣지 않았다.
- 경춘선숲길 플리마켓, 원룸촌 분리배출, 어르신 디지털 교육 등은 월계 지역에 직접 연결되는 검증 자료를 충분히 확보하지 못해 수록하지 않았다. 대학 일반 창업기업의 제품도 월계 지역문제와 직접 연결되지 않으면 제외했다.
- 개인 주민·학생 이름은 수록하지 않았다. 저장소를 수정하지 않았고 요청한 두 출력 파일만 /tmp/wg-archive/에 작성했다.


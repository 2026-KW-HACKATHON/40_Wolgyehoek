# 장끼 UI 재사용 기록

원본: `/Users/supia/Developer/GitHub/Jangkki/Jangkki`, 커밋 `6ee4d7f7f2948b76917d14cd5f08ab627843bab4` (2026-10-06 확인).
원본 저장소는 수정하지 않았다.

- `src/components/ui/{Button,Input,Textarea,Badge,Card,Tabs}.tsx`의 실제 구현을 `components/ui/`에 이식했다. `cn` 유틸리티와 Radix/CVA 기반 variant도 재사용한다.
- 프로젝트 전용 설명과 샘플·불량·반품 배지 variant는 제외했다. 주민 참여를 위해 44px 이상 터치 버튼을 사용하며, 내부 헤더와 필터는 32px 컨트롤을 사용한다.
- `PageHeaderBar`의 64px 헤더, 32px 헤더 컨트롤, 별도 필터행 구조를 도메인 의존성 없이 이식했다. 모바일 거터는 16px이다.
- `globals.css`에서 장끼의 중립색, 표면·입력·상태 토큰, Pretendard, 작은 radius와 그림자 없는 카드 규칙을 가져왔다.
- 장끼 기본 강조색 #0c8599는 흰 작은 글씨의 대비를 높이려고 #0b7688로 조정했다. UI 색은 CSS 토큰으로 정의한다.
- 탭의 키보드 동작은 Radix, 선택 표시 애니메이션은 기존 구현을 사용하며 감소된 모션 설정을 따른다.
- 셸은 장끼의 회색 프레임/흰 본문 구성을 동네서랍에 맞게 조정했다. 모바일에서는 하단 메뉴를 사용한다.

제품 범위는 기존 동네서랍 MVP다. POS·ERP 업무 화면과 장끼의 인증·데이터 코드는 가져오지 않았다.

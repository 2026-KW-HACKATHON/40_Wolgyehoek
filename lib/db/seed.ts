import { count } from "drizzle-orm";
import type { Db } from "./index";
import * as schema from "./schema";

const DAY = 24 * 60 * 60 * 1000;


// 과거 월계1동 공개 아이디어를 예시 카드로 등록한다(정책: 콜드 스타트 대응, "예시" 표시).
export async function seed(db: Db) {
  const [{ n }] = await db.select({ n: count() }).from(schema.cards);
  if (Number(n) > 0) return;
  const now = Date.now();
  const op = "seed-operator";
  await db.insert(schema.devices).values({ id: op, nickname: "동네서랍 운영", isOperator: true }).onConflictDoNothing();
  const residents = Array.from({ length: 9 }, (_, i) => ({ id: `seed-r${i}`, nickname: `주민 ${1000 + i * 37}` }));
  await db.insert(schema.devices).values(residents).onConflictDoNothing();

  const mk = (id: string, title: string, body: string, target: string, place: string, effect: string, startDaysAgo: number, weeks: number, extra: Partial<typeof schema.cards.$inferInsert> = {}) => ({
    id, title, body, target, place, effect, proposerId: op, proposerName: "동네서랍 운영", isSeed: true,
    startsAt: new Date(now - startDaysAgo * DAY), endsAt: new Date(now - startDaysAgo * DAY + weeks * 7 * DAY), ...extra,
  });
  await db.insert(schema.cards).values([
    mk("seed-flea", "광운로 주말 플리마켓", "광운로 공터에서 매달 둘째 주말에 주민 셀러가 여는 플리마켓을 열면 좋겠습니다. 안 쓰는 물건도 나누고 이웃도 만날 수 있을 것 같아요.", "월계1동 주민", "광운로, 공터", "골목 상권에 사람이 모인다", 40, 4, { reportPublishedAt: new Date(now - 11 * DAY), reportSummary: "참여 의사는 높지만 '누가 운영하느냐'는 조건부 의견이 많았다." }),
    mk("seed-light", "경춘선숲길 야간 산책로 조명", "경춘선숲길 월계 구간이 밤에 너무 어두워서 산책하기 무섭습니다. 걷는 길을 따라 낮은 조명을 설치하면 좋겠어요.", "월계1동 주민", "경춘선숲길", "밤길 안전이 좋아진다", 3, 2),
    mk("seed-kitchen", "골목 공유 주방", "1인 가구가 많은데 요리하기가 어렵습니다. 주민센터 근처에 함께 쓰는 공유 주방이 있으면 좋겠습니다.", "1인 가구", "월계1동 주민센터", "이웃 간 교류가 늘어난다", 5, 3),
    mk("seed-bench", "석계역 앞 쉼터 벤치", "석계역 앞에서 버스를 기다리는 어르신들이 앉을 곳이 없습니다. 그늘 벤치를 두면 좋겠어요.", "어르신", "석계역, 버스정류장", "이동 약자의 접근성이 좋아진다", 1, 2),
  ]);
  const steps = [1, 2, 3, 4, 2, 3, 1, 4, 2];
  const types = ["resident", "resident", "work_study", "resident", "visitor", "resident", "work_study", "resident", "resident"] as const;
  const prices = [null, null, 5000, null, null, 3000, null, null, null];
  await db.insert(schema.reactions).values(residents.map((r, i) => ({ id: `seed-re${i}`, cardId: "seed-flea", deviceId: r.id, step: steps[i], price: steps[i] === 3 ? prices[i] ?? 5000 : null, respondentType: types[i], geoInside: i % 3 !== 2 })));
  await db.insert(schema.reactions).values(residents.slice(0, 4).map((r, i) => ({ id: `seed-rl${i}`, cardId: "seed-light", deviceId: r.id, step: [2, 4, 1, 2][i], price: null, respondentType: "resident", geoInside: true })));
  await db.insert(schema.opinions).values([
    { id: "seed-o1", cardId: "seed-flea", deviceId: "seed-r0", authorName: "주민 1000", stance: "pro", body: "아이랑 같이 가 보고 싶어요." },
    { id: "seed-o2", cardId: "seed-flea", deviceId: "seed-r1", authorName: "주민 1037", stance: "conditional", body: "좋은데 운영할 사람이 있어야 할 것 같아요.", condition: "운영 주체와 쓰레기 처리 계획이 있으면 찬성" },
    { id: "seed-o3", cardId: "seed-flea", deviceId: "seed-r2", authorName: "주민 1074", stance: "con", body: "주말에 주차 문제가 생길까 걱정돼요." },
  ]);
  await db.insert(schema.conclusions).values({ id: "seed-c1", cardId: "seed-flea", decision: "hold", reasonTags: ["운영 주체 없음"], reason: "참여 의사는 확인했지만 매달 운영을 맡을 주체를 찾지 못했다.", decidedBy: op, createdAt: new Date(now - 10 * DAY) });
}

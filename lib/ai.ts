import "server-only";
import { draftFromText, type Draft } from "./domain/draft";

// AI 사용 원칙: 결과는 초안이며, 키가 없거나 실패하면 규칙 기반으로 계속 진행한다.
export async function makeDraft(text: string): Promise<Draft> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return draftFromText(text);
  try {
    const res = await fetch(`${process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "주민이 쓴 동네 아이디어를 검증 카드 초안으로 정리한다. JSON {title(40자 이내), target, place, effect}만 한국어로 답한다. 원문에 없는 사실은 만들지 않는다." },
          { role: "user", content: text },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const j = await res.json();
    const d = JSON.parse(j.choices?.[0]?.message?.content ?? "{}");
    const fb = draftFromText(text);
    return { title: d.title || fb.title, target: d.target || fb.target, place: d.place || fb.place, effect: d.effect || fb.effect, source: "llm" };
  } catch {
    return draftFromText(text);
  }
}

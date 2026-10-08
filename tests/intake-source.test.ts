import { describe, expect, it } from "vitest";
import { extractPageText, FILE_LIMIT, readIntakeFile, TEXT_LIMIT } from "@/components/intake/source";

describe("등록 자료 추출", () => {
  it("제목·메타 설명과 본문을 추출하고 스크립트는 버린다", () => {
    const text = extractPageText('<html><head><title>안부 &amp; 돌봄</title><meta content="지역 &#xC0AC;례" name="description"></head><body><style>.hidden{}</style><script>alert("ignore")</script><p>어르신   안부 확인</p><!-- 숨김 --></body></html>');
    expect(text).toContain("안부 & 돌봄");
    expect(text).toContain("지역 사례");
    expect(text).toContain("어르신 안부 확인");
    expect(text).not.toContain("alert");
    expect(text).not.toContain(".hidden");
    expect(text).not.toContain("숨김");
  });
  it("긴 페이지는 6000자까지만 추출한다", () => {
    expect(extractPageText(`<p>${"가".repeat(7000)}</p>`)).toHaveLength(TEXT_LIMIT);
  });
  it("TXT와 MD 파일을 텍스트로 읽는다", async () => {
    const text = "홀몸 어르신 안부 확인 기획서입니다.";
    for (const extension of ["txt", "md"]) {
      expect(await readIntakeFile(new File([text], `plan.${extension}`))).toBe(text);
    }
  });
  it("5MB 초과·지원하지 않는 확장자·빈 파일을 거절한다", async () => {
    await expect(readIntakeFile(new File([new Uint8Array(FILE_LIMIT + 1)], "large.txt"))).rejects.toThrow();
    await expect(readIntakeFile(new File(["기획서 내용"], "plan.exe"))).rejects.toThrow();
    await expect(readIntakeFile(new File([""], "empty.pdf"))).rejects.toThrow();
  });
  it("PDF의 텍스트를 unpdf로 추출한다", async () => {
    const contents = "BT /F1 12 Tf 50 700 Td (Intake planning for seniors) Tj ET";
    const pdf = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n5 0 obj << /Length ${contents.length} >> stream\n${contents}\nendstream endobj\ntrailer << /Root 1 0 R >>\n%%EOF`;
    expect(await readIntakeFile(new File([pdf], "plan.pdf"))).toContain("Intake planning for seniors");
  });
});

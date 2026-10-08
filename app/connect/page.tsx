import type { Metadata } from "next";
import { toolCatalog } from "@/lib/mcp/catalog";
import { CopyUrl } from "./copy-url";

export const metadata: Metadata = {
  title: "AI 앱에서 동네서랍 쓰기",
  description: "Claude와 ChatGPT에 동네서랍을 연결해 지난 시도와 국내외 선례를 찾아보세요.",
};

const connectorUrl = "https://dongne-seorap.vercel.app/api/mcp";
const examples = [
  "월계동 홀몸 어르신 안부 확인 관련 지난 시도를 찾아줘.",
  "월계1동 홀몸 어르신 안부를 매일 확인하는 서비스와 비슷한 시도가 있었는지, 왜 멈췄는지 알려줘.",
  "월계동의 주요 문제와 다른 지역·해외의 선례를 출처와 함께 정리해줘.",
];

export default function ConnectPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AI 앱에서 동네서랍 쓰기</h1>
        <p className="mt-4 text-muted-foreground">지난 시도와 멈춘 이유, 다른 지역의 선례를 대화로 찾아보세요.</p>
      </header>

      <section aria-labelledby="connector-heading" className="rounded-[18px] bg-muted p-6">
        <h2 id="connector-heading" className="mb-4 text-lg font-bold">커넥터 URL</h2>
        <CopyUrl url={connectorUrl} />
        <p className="text-sm text-muted-foreground">공개 기록 조회 전용입니다. 동네서랍 로그인은 필요하지 않습니다.</p>
      </section>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section aria-labelledby="claude-heading">
          <h2 id="claude-heading" className="text-xl font-bold">Claude에 연결</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 leading-7">
            <li>설정(Settings)에서 커넥터(Connectors) 메뉴를 찾습니다.</li>
            <li>사용자 지정 커넥터 추가(Add custom connector)를 선택합니다.</li>
            <li>위 URL을 붙여 넣고 연결한 뒤 대화에서 동네서랍을 사용합니다.</li>
          </ol>
        </section>
        <section aria-labelledby="chatgpt-heading">
          <h2 id="chatgpt-heading" className="text-xl font-bold">ChatGPT에 연결</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 leading-7">
            <li>설정(Settings)의 앱·커넥터(Apps &amp; Connectors) 관련 메뉴를 찾습니다.</li>
            <li>필요하면 개발자 모드에서 사용자 지정 커넥터를 만듭니다.</li>
            <li>위 URL로 연결하고, 인증 방식 선택이 있다면 인증 없음을 선택합니다.</li>
          </ol>
        </section>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">메뉴 이름과 지원 여부는 앱 버전·계정에 따라 다를 수 있습니다.</p>

      <section aria-labelledby="tools-heading" className="mt-10">
        <h2 id="tools-heading" className="text-xl font-bold">사용할 수 있는 도구</h2>
        <dl className="mt-4 divide-y divide-border">
          {toolCatalog.map(tool => (
            <div key={tool.name} className="grid gap-2 py-4 md:grid-cols-[240px_1fr] md:gap-6">
              <dt className="break-all font-semibold">{tool.name}</dt>
              <dd className="leading-6 text-muted-foreground">{tool.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="examples-heading" className="mt-10">
        <h2 id="examples-heading" className="text-xl font-bold">이렇게 물어보세요</h2>
        <ul className="mt-4 space-y-3">
          {examples.map(prompt => <li key={prompt} className="rounded-[18px] bg-muted px-5 py-4 leading-7">{prompt}</li>)}
        </ul>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getProjectSlugs,
  getPublishedProjects,
} from "@/content/projects";
import { RunEmbed } from "@/components/detail/RunEmbed";
import { LedgerMotion } from "@/components/detail/LedgerMotion";
import { AppFrame } from "@/components/shell/AppFrame";
import "@/styles/detail.css";

/**
 * 프로젝트 상세 — 결정 대장 (docs/07).
 *
 * 기능 목록이 아니라 **버린 선택지**로 짜여 있습니다.
 * 기능은 저장소를 열면 보이지만, 무엇을 버렸고 왜 버렸는지는 만든 사람만 압니다.
 *
 * 여기가 링크 공유의 목적지입니다. 채용 담당자가 동료에게 보낼 주소가
 * /projects/yutnori 처럼 존재해야 포트폴리오가 제 역할을 합니다.
 *
 * 화면은 모니터 안 바탕화면 위에 뜹니다. 창틀은 다음 단계(S-05)에서 붙습니다.
 */

/**
 * 빌드 시 slug 목록을 수집합니다.
 * DB 로 이관한 뒤에는 접속이 실패할 수 있으므로, 그때 빈 배열을 반환하도록 감쌉니다.
 * 빌드를 깨뜨리느니 첫 방문을 느리게 만드는 편이 낫습니다 (docs/03 §3.1).
 */
export async function generateStaticParams() {
  try {
    const slugs = await getProjectSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

/** 목록에 없는 slug 도 런타임에 한 번 생성해 봅니다. */
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "찾을 수 없는 프로젝트" };

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} — you4ranghe`,
      description: project.summary,
      url: `/projects/${project.slug}`,
      type: "article",
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  // 비공개(또는 없는) 프로젝트는 404. 403 은 "그게 존재한다"를 흘립니다 (docs/01 UC-PUB-03)
  if (!project) notFound();

  const all = await getPublishedProjects();
  const index = all.findIndex((p) => p.slug === project.slug);
  // 저장소가 하나뿐이면 이전/다음은 자기 자신입니다. 그럴 때는 아예 내립니다.
  const prev = all.length > 1 ? all[(index - 1 + all.length) % all.length] : null;
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;

  /* 그 사이트의 옷을 입힙니다 (docs/07 §5).
     색을 CSS 에 두지 않고 여기서 넣는 이유: 프로젝트가 늘 때마다
     스타일시트를 고치는 게 아니라 projects.ts 한 곳만 채우면 되게 하려고요. */
  const t = project.theme;
  const skin = {
    "--bg": t.bg,
    "--surface": t.surface,
    "--sunken": t.sunken,
    "--fg": t.fg,
    "--mid": t.mid,
    "--dim": t.dim,
    "--line": t.line,
    "--take": t.accent,
    "--on-take": t.onAccent,
    "--drop": t.drop,
    "--radius": t.radius,
  } as React.CSSProperties;

  return (
    <AppFrame
      title={project.title}
      icon={project.icon ?? "globe"}
      path={`/projects/${project.slug}`}
      iconId={project.slug}
    >
      <div
        className="led"
        style={skin}
        data-mode={t.mode}
        data-display={t.display}
        data-hero={project.hero.kind}
      >
        <LedgerMotion />

      <div className="led__wrap">
        <header className="led__top">
          <span>{project.no} · {project.year}</span>
          <nav aria-label="바깥 링크">
            <a
              href={`https://github.com/${project.repo}`}
              target="_blank"
              rel="noopener"
            >
              저장소 ↗
            </a>
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener">
                운영 사이트 ↗
              </a>
            )}
          </nav>
        </header>

        {/* ── 히어로 (docs/07 §3) ── */}
        <section className="led__hero">
          <p className="led__eyebrow">
            {project.repo} · {project.year}
          </p>
          {/* 수치형은 숫자가 제목 자리를 차지하고 문장이 자막이 됩니다 */}
          {project.hero.kind === "number" && (
            <p className="led__bigNum">
              <b>{project.hero.value}</b>
              <span>{project.hero.unit}</span>
            </p>
          )}

          <h1 className="led__h1">
            {project.hero.lead}
            <em>{project.hero.em}</em>
          </h1>

          {/* 대비형은 명제 아래에 바뀌기 전과 후를 나란히 놓습니다 */}
          {project.hero.kind === "contrast" && (
            <div className="led__swap">
              <div className="led__swapRow led__swapRow--before">
                <span>{project.hero.before.k}</span>
                <b>{project.hero.before.v}</b>
              </div>
              <span className="led__swapArrow" aria-hidden="true" />
              <div className="led__swapRow led__swapRow--after">
                <span>{project.hero.after.k}</span>
                <b>{project.hero.after.v}</b>
              </div>
            </div>
          )}

          {/* 도해형은 흐름을 옆으로 늘어놓습니다 */}
          {project.hero.kind === "flow" && (
            <div className="led__flow">
              {project.hero.steps.map((step, i) => (
                <Fragment key={step.k}>
                  {i > 0 && (
                    <span className="led__flowArrow" aria-hidden="true" />
                  )}
                  <div
                    className="led__step"
                    data-faded={String(Boolean(step.faded))}
                  >
                    <em>{step.k}</em>
                    <b>{step.v}</b>
                    {step.note && <small>{step.note}</small>}
                  </div>
                </Fragment>
              ))}
            </div>
          )}

          <p className="led__sub">{project.summary}</p>

          <dl className="led__facts">
            {project.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>
                  {fact.value}
                  {fact.note && <small>{fact.note}</small>}
                </dd>
              </div>
            ))}
          </dl>

          <p className="led__colophon">
            {project.period} · {project.role} · {project.tags.join(" · ")}
          </p>
        </section>

        {/* ── 증거 (docs/07 §4) ── */}
        {project.evidence.kind === "run" && (
          <section className="led__sec rise">
            <p className="led__k">RUN IT</p>
            <h2 className="led__h2">읽기 전에 직접 열어 보세요.</h2>
            <p className="led__lede">
              스크린샷 대신 진짜입니다. 누르면 그 자리에서 운영 중인 사이트가
              뜹니다. 누르기 전에는 아무것도 불러오지 않습니다.
            </p>
            <RunEmbed url={project.evidence.url} note={project.evidence.note} />
          </section>
        )}

        {project.evidence.kind === "code" && (
          <section className="led__sec rise">
            <p className="led__k">THE CODE</p>
            <h2 className="led__h2">설계가 드러나는 몇 줄</h2>
            <p className="led__lede">
              저장소에 실제로 있는 코드입니다. 이 조각 하나가 이 프로젝트의 접근
              제어 전부입니다.
            </p>
            <div className="led__code">
              <div className="led__codeTop">
                <b>{project.evidence.caption}</b>
                <span>{project.evidence.lang}</span>
              </div>
              <pre>
                <code>{project.evidence.code}</code>
              </pre>
            </div>
            {project.evidence.note && (
              <p className="led__runNote">{project.evidence.note}</p>
            )}
          </section>
        )}

        {project.evidence.kind === "diagram" && (
          <section className="led__sec rise">
            <p className="led__k">HOW IT WORKS</p>
            <h2 className="led__h2">붙여넣은 다음에 벌어지는 일</h2>
            <p className="led__lede">
              로그인 뒤에서 도는 화면이라 열어 보여 드릴 수 없습니다. 대신 안에서
              무슨 순서로 무엇이 도는지를 적습니다.
            </p>
            <ol className="led__pipe">
              {project.evidence.nodes.map((node) => (
                <li key={node.k}>
                  <em>{node.k}</em>
                  <b>{node.v}</b>
                  {node.note && <small>{node.note}</small>}
                </li>
              ))}
            </ol>
            {project.evidence.note && (
              <p className="led__runNote">{project.evidence.note}</p>
            )}
          </section>
        )}

        {/* ══ 결정 대장 ══ */}
        <section className="led__sec">
          <p className="led__k">DECISIONS · {project.decisions.length}</p>
          <h2 className="led__h2">
            {project.decisions.length}번 갈렸고, 그때마다 왼쪽을 버렸습니다.
          </h2>
          <p className="led__lede">
            가운데 이어진 선이 실제로 걸어간 길입니다. 왼쪽은 진지하게
            고려했다가 버린 쪽이고, 버린 이유까지 적어 뒀습니다.
          </p>

          <div className="led__forks">
            {project.decisions.map((decision, i) => (
              <article className="led__fork rise" key={decision.ask}>
                <h3 className="led__ask">
                  <span>DECISION {String(i + 1).padStart(2, "0")}</span>
                  {decision.ask}
                </h3>
                <div className="led__side led__side--drop">
                  <p className="led__sideK">버린 길</p>
                  <p className="led__sideT">{decision.dropped.title}</p>
                  <p className="led__sideP">{decision.dropped.why}</p>
                </div>
                <span className="led__dot" aria-hidden="true" />
                <div className="led__side led__side--take">
                  <p className="led__sideK">택한 길</p>
                  <p className="led__sideT">{decision.taken.title}</p>
                  <p className="led__sideP">{decision.taken.why}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── 만든 것 ── */}
        <section className="led__sec rise">
          <p className="led__k">WHAT&apos;S IN IT</p>
          <h2 className="led__h2">만든 것</h2>
          <ul className="led__built">
            {project.built.map((item) => (
              <li key={item.title}>
                <b>{item.title}</b>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 마무리 ── */}
        <section className="led__sec rise">
          <div className="led__pair">
            <section>
              <h3>배운 것</h3>
              <p>{project.learned}</p>
            </section>
            <section className="led__pair--limits">
              <h3>아직 못 한 것</h3>
              <ul>
                {project.limits.map((limit) => (
                  <li key={limit}>{limit}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="led__cta">
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener">
                직접 써보기 ↗
              </a>
            )}
            <a
              className="ghost"
              href={`https://github.com/${project.repo}`}
              target="_blank"
              rel="noopener"
            >
              저장소 보기 ↗
            </a>
          </div>
        </section>

        {prev && next && (
          <nav className="led__pager" aria-label="다른 프로젝트">
            <Link href={`/projects/${prev.slug}`}>
              <span>← 이전</span>
              <b>{prev.title}</b>
            </Link>
            <Link href={`/projects/${next.slug}`}>
              <span>다음 →</span>
              <b>{next.title}</b>
            </Link>
          </nav>
        )}

        <footer className="led__foot">
          <span>you4ranghe · Seoul · 2026</span>
          <a href="mailto:you4ranghe@gmail.com">you4ranghe@gmail.com</a>
        </footer>
        </div>
      </div>
    </AppFrame>
  );
}

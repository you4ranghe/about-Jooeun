import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjectSlugs, getPublishedProjects } from "@/content/projects";
import "@/styles/gallery.css";

/**
 * 프로젝트 상세.
 *
 * 여기가 링크 공유의 목적지입니다. 채용 담당자가 동료에게 보낼 주소가
 * /projects/yutnori 처럼 존재해야 포트폴리오가 제 역할을 합니다.
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
  const prev = all[(index - 1 + all.length) % all.length];
  const next = all[(index + 1) % all.length];

  const color = { "--c": project.color } as React.CSSProperties;

  return (
    <div className="gal" style={color}>
      <header className="gal__top">
        <Link className="gal__home" href="/projects">
          ← 전체 목록
        </Link>
        <nav className="gal__links" aria-label="주요">
          <Link href="/">작업실</Link>
          <a href={`https://github.com/${project.repo}`} target="_blank" rel="noopener">
            GitHub ↗
          </a>
        </nav>
      </header>

      <main>
        <section className="det__hero" style={color}>
          <p className="det__cat">
            {project.no} · {project.year}
          </p>
          <h1 className="det__h1">{project.title}</h1>
          <p className="det__sum">{project.summary}</p>
        </section>

        {/* GitHub 메타데이터 — 2단계에서 RepositoryProvider 가 채웁니다 */}
        <dl className="gh" style={color}>
          <div>
            <dt>Repository</dt>
            <dd>{project.repo}</dd>
          </div>
          <div>
            <dt>Language</dt>
            <dd>
              <span className="gh__dot" />
              {project.meta.language}
            </dd>
          </div>
          <div>
            <dt>Stars</dt>
            <dd>★ {project.meta.stars}</dd>
          </div>
          <div>
            <dt>Forks</dt>
            <dd>⑂ {project.meta.forks}</dd>
          </div>
          <div>
            <dt>Commits</dt>
            <dd>{project.meta.commits}</dd>
          </div>
          <div>
            <dt>Last commit</dt>
            <dd>{project.meta.lastCommit}</dd>
          </div>
          <div>
            <dt>License</dt>
            <dd>{project.meta.license}</dd>
          </div>
        </dl>

        <div className="det__body">
          <div>
            <section className="sec">
              <h2 className="sec__k">화면</h2>
              {/* TODO: 스프린트 3 에서 실제 스크린샷으로 교체 */}
              <div className="shot">SCREENSHOT</div>
              <div className="shot">SCREENSHOT</div>
            </section>

            <section className="sec">
              <h2 className="sec__k">어떤 문제였나</h2>
              {project.overview.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>

            <section className="sec">
              <h2 className="sec__k">무엇을 했나</h2>
              <ul>
                {project.did.map((line, i) => (
                  // 저장소 안의 신뢰된 문자열이며 <b> 만 씁니다
                  <li key={i} dangerouslySetInnerHTML={{ __html: line }} />
                ))}
              </ul>
            </section>

            <section className="sec">
              <h2 className="sec__k">판단이 갈렸던 지점</h2>
              {project.questions.map((qa) => (
                <div className="qa" key={qa.question}>
                  <h3 className="qa__q">{qa.question}</h3>
                  <p className="qa__a">{qa.answer}</p>
                </div>
              ))}
            </section>

            <section className="sec">
              <h2 className="sec__k">배운 것</h2>
              <p>{project.learned}</p>
            </section>

            {/* 잘한 것만 적힌 포트폴리오보다 한계를 아는 사람이 더 믿음직합니다 */}
            <section className="sec">
              <h2 className="sec__k">아쉬운 것</h2>
              <p>{project.regret}</p>
            </section>
          </div>

          <aside>
            <div className="aside__box">
              <h2 className="aside__k">개요</h2>
              <dl className="meta">
                <dt>기간</dt>
                <dd>{project.period}</dd>
                <dt>역할</dt>
                <dd>{project.role}</dd>
              </dl>
            </div>
            <div className="aside__box">
              <h2 className="aside__k">기술</h2>
              <ul className="stack">
                {project.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="cta">
              <a href={`https://github.com/${project.repo}`} target="_blank" rel="noopener">
                GitHub 저장소 ↗
              </a>
              {project.live && (
                <a className="ghost" href={project.live} target="_blank" rel="noopener">
                  배포된 사이트 ↗
                </a>
              )}
            </div>
          </aside>
        </div>

        <nav className="pager" aria-label="다른 프로젝트">
          <Link href={`/projects/${prev.slug}`}>
            <span className="pager__k">← 이전</span>
            <span className="pager__t">{prev.title}</span>
          </Link>
          <Link href={`/projects/${next.slug}`}>
            <span className="pager__k">다음 →</span>
            <span className="pager__t">{next.title}</span>
          </Link>
        </nav>
      </main>

      <footer className="gal__foot">
        <div>
          <p className="gal__footH">이 프로젝트가 궁금하시면</p>
          <a href="mailto:you4ranghe@gmail.com">you4ranghe@gmail.com</a>
        </div>
        <div className="gal__footM">
          github.com/you4ranghe
          <br />
          Seoul, KR · 2026
        </div>
      </footer>
    </div>
  );
}

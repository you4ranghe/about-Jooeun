import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProjects, getProjectStats, getTagsByFrequency } from "@/content/projects";
import { ProjectBands } from "@/components/gallery/ProjectBands";
import "@/styles/gallery.css";

/**
 * 프로젝트 갤러리 목록.
 *
 * 정적으로 생성됩니다. 방문자 요청 시 함수 호출 0회, DB 접근 0회 (docs/03 §3.1).
 */
export const metadata: Metadata = {
  title: "프로젝트 갤러리",
  description:
    "저장소 12개. 무엇을 왜 그렇게 만들었고, 그때 어떤 판단을 했고 무엇이 아쉬웠는지까지 적어 뒀습니다.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const [projects, stats, tags] = await Promise.all([
    getPublishedProjects(),
    getProjectStats(),
    getTagsByFrequency(),
  ]);

  return (
    <div className="gal">
      <header className="gal__top">
        <Link className="gal__home" href="/">
          ← 작업실로
        </Link>
        <nav className="gal__links" aria-label="주요">
          <a href="https://github.com/you4ranghe" target="_blank" rel="noopener">
            GitHub ↗
          </a>
          <a href="mailto:you4ranghe@gmail.com">Contact</a>
        </nav>
      </header>

      <main>
        <section className="gal__head">
          <p className="gal__eyebrow">Repositories · 2020—2026</p>
          <h1 className="gal__h1">
            만든 것들을
            <br />
            <em>전부 열어 뒀습니다.</em>
          </h1>
          <p className="gal__sub">
            저장소 {stats.count}개. 각 항목을 누르면 무엇을 왜 그렇게 만들었는지, 그때 어떤 판단을
            했고 무엇이 아쉬웠는지까지 적어 뒀습니다.
          </p>
        </section>

        <dl className="gal__stats">
          <div>
            <dt>저장소</dt>
            <dd>
              {stats.count}
              <small>개</small>
            </dd>
          </div>
          <div>
            <dt>주력 언어</dt>
            <dd>
              Java<small>17</small>
            </dd>
          </div>
          <div>
            <dt>쓰는 언어</dt>
            <dd>
              {stats.languages.length}
              <small>종</small>
            </dd>
          </div>
          <div>
            <dt>최근 커밋</dt>
            <dd>
              3<small>일 전</small>
            </dd>
          </div>
        </dl>

        <ProjectBands projects={projects} tags={tags} />
      </main>

      <footer className="gal__foot">
        <div>
          <p className="gal__footH">같이 일해요 →</p>
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

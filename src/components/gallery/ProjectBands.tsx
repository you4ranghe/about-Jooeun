"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Project } from "@/content/types";

/**
 * 태그 필터 + 밴드 목록.
 *
 * 필터는 클라이언트에서만 처리합니다. searchParams 를 서버에서 읽으면
 * 페이지가 동적 렌더링으로 강등돼 정적화의 이점(함수 호출 0, DB 무관 가용성)이
 * 통째로 사라집니다 (docs/03 §3.1). 프로젝트가 12개라 전량을 내려도 수십 KB 입니다.
 *
 * 필터 상태를 URL 에 넣지 않은 것은 의도입니다.
 * 공유해야 하는 주소는 개별 프로젝트(/projects/[slug])이고, 필터는 훑는 도구입니다.
 */
export function ProjectBands({ projects, tags }: { projects: Project[]; tags: string[] }) {
  const [active, setActive] = useState<string>("all");

  const shown = useMemo(
    () => (active === "all" ? projects : projects.filter((p) => p.tags.includes(active))),
    [projects, active],
  );

  return (
    <>
      <div className="gal__filter">
        <span className="gal__filterK">Stack</span>
        <div className="gal__chips" role="group" aria-label="기술 태그 필터">
          <button
            type="button"
            className="gal__chip"
            aria-pressed={active === "all"}
            onClick={() => setActive("all")}
          >
            전체
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="gal__chip"
              aria-pressed={active === tag}
              onClick={() => setActive(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <span className="gal__count" aria-live="polite">
          {shown.length}개
        </span>
      </div>

      <div className="gal__bands">
        {shown.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="band"
            style={{ "--c": p.color } as React.CSSProperties}
          >
            <div className="band__in">
              <span className="band__no">{p.no}</span>
              <div>
                <h2 className="band__t">{p.title}</h2>
                <span className="band__repo">{p.repo}</span>
                <p className="band__s">{p.summary}</p>
                <ul className="band__tags">
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="band__r">
                <b>{p.year}</b>★ {p.meta.stars}
                <span className="band__go" aria-hidden="true">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

import { ImageResponse } from "next/og";
import { getProjectBySlug, getProjectSlugs } from "@/content/projects";
import { ogFonts } from "@/lib/og";

/**
 * 프로젝트 하나를 공유했을 때 뜨는 그림.
 *
 * `/projects/yutnori` 주소를 그대로 보내는 것이 이 포트폴리오의 쓰임새입니다
 * (docs/07). 그때 뜨는 카드가 **그 프로젝트의 색을 입고** 있어야
 * 링크를 받은 사람이 열기 전부터 무엇인지 압니다.
 *
 * 색을 새로 정할 필요가 없습니다 — `projects.ts` 의 theme 이 이미
 * 그 사이트의 팔레트를 들고 있습니다. 상세페이지와 같은 옷을 입힙니다.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  try {
    const slugs = await getProjectSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

/* ⚠️ 이 버전에서 params 는 **Promise** 입니다. 페이지와 같습니다.
   그냥 params.slug 로 읽으면 undefined 가 되어 조용히 "못 찾음" 그림이
   나갑니다 — 빌드도 타입 검사도 통과하므로 눈으로 봐야 잡힙니다.
   실제로 처음 만들 때 그렇게 나갔습니다. */
type Props = { params: Promise<{ slug: string }> };

export default async function ProjectOg({ params }: Props) {
  const { slug } = await params;
  const [project, fonts] = await Promise.all([
    getProjectBySlug(slug),
    ogFonts(),
  ]);

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0E1216",
            color: "#EAEFF4",
            fontSize: 40,
          }}
        >
          you4ranghe
        </div>
      ),
      { ...size, fonts },
    );
  }

  const t = project.theme;
  /* 폰트를 못 받아왔으면 한글이 네모로 나옵니다. 그때는 로마자만 남깁니다 */
  const korean = Boolean(fonts);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 66,
          background: t.bg,
          color: t.fg,
          fontFamily: "Pretendard",
        }}
      >
        {/* 강조색 띠 — 이 프로젝트가 무엇인지 색만으로 먼저 말합니다 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 16,
            display: "flex",
            background: t.accent,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 25,
              letterSpacing: 2,
              color: t.accent,
            }}
          >
            {project.repo}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 26,
              fontSize: 62,
              lineHeight: 1.14,
              letterSpacing: -2,
            }}
          >
            <div style={{ display: "flex" }}>
              {korean ? project.hero.lead : project.title}
            </div>
            {korean && (
              <div style={{ display: "flex", color: t.accent }}>
                {project.hero.em}
              </div>
            )}
          </div>

          {/* 명제만 있으면 무슨 프로젝트인지 모릅니다.
              "70%까지 만든 걸 갈아엎었습니다" 를 보고 인터페이퍼를 떠올릴
              사람은 만든 사람뿐입니다. */}
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 27,
              color: t.mid,
            }}
          >
            {korean ? project.title : project.repo}
          </div>
        </div>

        {/* 아래에는 수치 셋. 지어낸 값이 아니라 저장소에서 잰 것들입니다 */}
        <div style={{ display: "flex", gap: 46 }}>
          {project.facts.slice(0, 3).map((f) => (
            <div
              key={f.label}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", fontSize: 19, color: t.dim }}>
                {korean ? f.label : ""}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 34,
                  marginTop: 6,
                  color: t.fg,
                }}
              >
                {f.value}
                {f.note && korean ? ` ${f.note}` : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

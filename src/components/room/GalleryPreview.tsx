import type { Project } from "@/content/types";

/**
 * 모니터 화면 안에 보이는 갤러리 미리보기.
 *
 * iframe 을 쓰지 않습니다. 진짜 /projects 라우트가 따로 있고(URL 공유·SEO),
 * 모니터에는 같은 데이터로 그린 축소판을 넣습니다.
 * 고정 폭(PREVIEW_WIDTH)으로 그린 뒤 부모가 scale() 로 줄입니다.
 */
export const PREVIEW_WIDTH = 1280;

export function GalleryPreview({ projects }: { projects: Project[] }) {
  return (
    <div
      aria-hidden="true"
      style={{ width: PREVIEW_WIDTH, fontFamily: "var(--font-body)", color: "#16161A", background: "#F6F6F3" }}
    >
      {/* 상단 바 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "13px 44px",
          borderBottom: "1px solid rgba(22,22,26,.13)",
          fontFamily: "var(--font-mono)",
          fontSize: 12.5,
        }}
      >
        <span style={{ fontWeight: 600 }}>
          you4ranghe <span style={{ color: "rgba(22,22,26,.45)" }}>/ 프로젝트 갤러리</span>
        </span>
        <span style={{ color: "rgba(22,22,26,.45)" }}>목록 · GitHub ↗ · Contact</span>
      </div>

      {/* 표제 */}
      <div style={{ padding: "44px 44px 22px" }}>
        <p
          style={{
            margin: "0 0 14px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: ".18em",
            color: "rgba(22,22,26,.45)",
          }}
        >
          REPOSITORIES · 2020—2026
        </p>
        <h2
          style={{
            fontFamily: "var(--font-heavy)",
            fontSize: 62,
            lineHeight: 0.96,
            margin: 0,
            letterSpacing: "-.015em",
          }}
        >
          만든 것들을
          <br />
          <span style={{ color: "#0B4F4A" }}>전부 열어 뒀습니다.</span>
        </h2>
      </div>

      {/* 밴드 목록 — 미리보기라 앞의 다섯 개만 */}
      <div style={{ borderTop: "2px solid #16161A" }}>
        {projects.slice(0, 5).map((p) => (
          <div
            key={p.slug}
            style={{
              display: "grid",
              gridTemplateColumns: "58px 1fr auto",
              gap: 30,
              alignItems: "start",
              padding: "24px 44px",
              borderBottom: "1px solid rgba(22,22,26,.13)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12.5,
                fontWeight: 600,
                color: "rgba(22,22,26,.45)",
                paddingTop: 6,
              }}
            >
              {p.no}
            </span>
            <span>
              <span
                style={{
                  fontFamily: "var(--font-heavy)",
                  fontSize: 34,
                  lineHeight: 1.04,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {p.title}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "rgba(22,22,26,.45)",
                  display: "block",
                  marginBottom: 10,
                }}
              >
                {p.repo}
              </span>
              <span style={{ fontSize: 15, lineHeight: 1.6, display: "block", maxWidth: "62ch" }}>
                {p.summary}
              </span>
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                color: "rgba(22,22,26,.45)",
                textAlign: "right",
                paddingTop: 6,
                whiteSpace: "nowrap",
              }}
            >
              <b style={{ display: "block", marginBottom: 4 }}>{p.year}</b>★ {p.meta.stars}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

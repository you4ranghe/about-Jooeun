import type { Metadata } from "next";

/**
 * 모니터에 줌인한 상태 — 창이 하나도 열려 있지 않은 바탕화면.
 *
 * 화면에 보이는 것은 전부 레이아웃(`ProjectsLayout` → `DesktopScreen`)이 그립니다.
 * 그래서 이 페이지가 반환할 것이 없습니다. 그게 맞습니다 —
 * 여기서 무언가를 그리면 창을 닫았을 때 바탕화면이 두 겹이 됩니다.
 *
 * 화면 속 내용은 `/` 와 완전히 같고 다른 것은 카메라 위치뿐입니다.
 * 그 위치는 RoomShell 이 pathname 을 보고 결정합니다.
 */
export const metadata: Metadata = {
  title: "바탕화면",
  description:
    "모니터 안 바탕화면. 아이콘을 두 번 누르면 그 프로젝트가 창으로 열립니다.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return null;
}

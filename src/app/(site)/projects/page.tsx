import type { Metadata } from "next";
import { DesktopScreen } from "@/components/desktop/DesktopScreen";

/**
 * 모니터에 줌인한 상태.
 *
 * 화면 속 내용은 `/` 와 완전히 같습니다. 다른 것은 카메라 위치뿐이고,
 * 그 위치는 RoomShell 이 pathname 을 보고 결정합니다.
 *
 * 여기서부터 바탕화면 아이콘을 누를 수 있습니다 —
 * 잠금은 `.mon__stage` 의 pointer-events 가 `data-screen` 을 보고 처리합니다.
 */
export const metadata: Metadata = {
  title: "바탕화면",
  description:
    "모니터 안 바탕화면. 아이콘을 두 번 누르면 그 프로젝트가 창으로 열립니다.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return <DesktopScreen />;
}

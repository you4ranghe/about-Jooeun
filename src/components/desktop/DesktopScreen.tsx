import { getDesktopShortcuts } from "@/content/desktop";
import { DesktopIcons } from "./DesktopIcons";
import { Taskbar } from "./Taskbar";
import "@/styles/desktop.css";

/**
 * 모니터 화면 안에 켜져 있는 컴퓨터 (docs/06 P8).
 *
 * ── 세 주소가 같은 이 화면을 그립니다 ──
 *   /                 방 전체가 보이는 상태. 조작은 안 되고 켜져 있는 그림입니다
 *   /projects         모니터에 줌인한 상태. 여기서부터 아이콘을 누를 수 있습니다
 *   /projects/[slug]  이 바탕화면 **위에** 창이 하나 열립니다
 *
 * 세 곳이 같은 마크업을 그리므로 오갈 때 바뀌는 것은 카메라와 창뿐입니다.
 * `/` 와 `/projects` 가 같은 갤러리를 그려 왔던 구조를 그대로 이어받은 것입니다.
 *
 * ── 조작 잠금은 CSS 가 이미 하고 있습니다 ──
 * `.mon__stage` 는 `pointer-events: none` 이고 방이 줌인 상태
 * (`.room[data-screen="on"]`)일 때만 풀립니다. 그래서 방에서 보이는 바탕화면은
 * 눌리지 않습니다. 여기서 따로 막을 필요가 없습니다.
 *
 * 이미지 파일은 쓰지 않습니다. 벽지도 아이콘도 CSS·SVG 입니다(docs/04).
 */
export async function DesktopScreen({
  children,
}: {
  /** 열려 있는 창. 없으면 바탕화면만 보입니다 */
  children?: React.ReactNode;
}) {
  const shortcuts = await getDesktopShortcuts();

  return (
    <div className="dt">
      <div className="dt__paper" aria-hidden="true">
        <span className="dt__bloom" />
        <span className="dt__ray" />
        <span className="dt__ray" />
        <span className="dt__grain" />
      </div>

      <DesktopIcons items={shortcuts} />

      {/* 열려 있는 창. 없으면 바탕화면만 보입니다 */}
      {children}

      {/* 작업표시줄은 창보다 위에 있습니다. 최대화해도 가려지지 않습니다 */}
      <Taskbar apps={shortcuts} />
    </div>
  );
}

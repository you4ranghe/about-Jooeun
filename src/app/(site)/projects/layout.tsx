import { DesktopScreen } from "@/components/desktop/DesktopScreen";

/**
 * 바탕화면을 레이아웃에 둡니다.
 *
 * 이게 창이 뜨는 방식의 전부입니다. 레이아웃은 `/projects` ↔ `/projects/[slug]` 를
 * 오갈 때 다시 그려지지 않으므로, **바탕화면은 그대로 있고 그 위에 창만 생겼다 사라집니다.**
 *
 * RoomShell 이 방을 레이아웃에 두어 `/` ↔ `/projects` 사이에서 방이 살아 있게 한 것과
 * 정확히 같은 수법이고, 그 안쪽에 한 겹 더 두른 것입니다.
 *
 *   RoomShell(방)  →  이 레이아웃(바탕화면)  →  page(창)
 *
 * 아이콘이 살아 있으므로 창은 자기를 연 아이콘 자리를 DOM 에서 찾아
 * 그 자리에서 자라나고 그 자리로 사라집니다(BrowserWindow).
 */
export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DesktopScreen>{children}</DesktopScreen>;
}

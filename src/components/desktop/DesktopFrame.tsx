"use client";

import type { DesktopShortcut } from "@/content/desktop";
import { useIsPhone } from "@/components/phone/useIsPhone";
import { DesktopIcons } from "./DesktopIcons";
import { Taskbar } from "./Taskbar";

/**
 * 바탕화면을 그릴지 말지 정합니다.
 *
 * ── 왜 필요한가 ──
 * 바탕화면은 `/projects` 레이아웃에 있습니다. 레이아웃은 화면을 가리지 않으므로
 * **폰에서도 돌았습니다.** 그래서 아이폰 앱 안에 Windows 바탕화면이 통째로 들어가,
 * 윷놀이를 눌렀는데 PC 바탕화면이 뜨는 일이 있었습니다.
 *
 * 폰에는 "바탕화면" 이라는 층이 아예 없습니다(docs/08).
 * 홈 화면에서 앱이 바로 열리므로 여기서는 내용만 통과시킵니다.
 *
 * ── 왜 서버에서 못 가르나 ──
 * 서버는 화면 크기를 모릅니다. 알아내려면 요청마다 판단해야 하고
 * 그 순간 이 아래 라우트가 전부 동적 렌더링으로 강등됩니다(docs/03 §3.1).
 */
export function DesktopFrame({
  shortcuts,
  children,
}: {
  shortcuts: DesktopShortcut[];
  children?: React.ReactNode;
}) {
  const phone = useIsPhone();

  // 폰 — 바탕화면 없이 내용만. 껍데기는 PhoneShell 이 두릅니다
  if (phone) return <>{children}</>;

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

"use client";

import type { IconArtKey } from "@/content/types";
import { BrowserWindow } from "@/components/desktop/BrowserWindow";
import { useIsPhone } from "@/components/phone/useIsPhone";

/**
 * 프로젝트 상세를 감싸는 껍데기 — 화면에 따라 갈아 끼웁니다 (docs/08 §2).
 *
 *   넓은 화면 → 바탕화면 위의 **브라우저 창** (탭 · 주소 표시줄 · 창 버튼)
 *   좁은 화면 → **전체화면 앱**. 껍데기는 `PhoneApp` 이 이미 두르고 있으므로
 *              여기서는 내용만 내보냅니다
 *
 * 상세페이지 자체는 한 줄도 바뀌지 않습니다. 창틀만 다릅니다.
 *
 * ── 왜 폰에서는 브라우저 창이 아닌가 ──
 * 데스크톱에서는 "바탕화면 → 브라우저 → 사이트" 라는 층이 말이 됩니다.
 * 폰에서는 홈 화면에서 앱이 바로 열립니다. 주소 표시줄을 한 겹 더 두면
 * 좁은 화면을 먹으면서 아이폰답지도 않습니다.
 */
export function AppFrame({
  title,
  icon,
  path,
  iconId,
  children,
}: {
  title: string;
  icon: IconArtKey;
  path: string;
  iconId: string;
  children: React.ReactNode;
}) {
  const phone = useIsPhone();

  if (phone) return <>{children}</>;

  return (
    <BrowserWindow title={title} icon={icon} path={path} iconId={iconId}>
      {children}
    </BrowserWindow>
  );
}

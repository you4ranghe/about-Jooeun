"use client";

import { useSyncExternalStore } from "react";
import { WIDE, TALL, type RoomLayout } from "@/content/layout";

/**
 * 지금 화면에 맞는 무대를 고릅니다 (content/layout.ts).
 *
 * ── 왜 CSS 가 아니라 JS 로 고르나 ──
 * 물건 좌표는 인라인 스타일로 들어갑니다. 인라인은 CSS 규칙보다 세서
 * 미디어 쿼리로 덮으려면 전부 `!important` 를 붙여야 합니다.
 * 좌표는 한 파일에만 둔다는 규칙(docs/06 §1.5)과도 어긋납니다.
 *
 * ── 왜 useSyncExternalStore 인가 ──
 * 서버는 화면 크기를 모릅니다. `useState` + `useEffect` 로 하면
 * "렌더 → 효과에서 setState → 다시 렌더" 가 되어 경고가 나고 한 프레임이 낭비됩니다.
 * 이 훅은 서버 스냅샷을 따로 받으므로 하이드레이션 불일치 없이 한 번에 넘어갑니다.
 *
 * ── 기준 ──
 * 세로이면서 좁을 때만 세로 무대입니다.
 * 태블릿을 가로로 들면 가로 무대가 맞고, 데스크톱 창을 세로로 길게 늘여도
 * 폭이 넉넉하면 가로 무대가 낫습니다.
 */
const QUERY = "(orientation: portrait) and (max-width: 900px)";

let mql: MediaQueryList | null = null;
const media = () => {
  if (!mql) mql = window.matchMedia(QUERY);
  return mql;
};

function subscribe(onChange: () => void) {
  const m = media();
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
}

/** 서버에는 화면이 없습니다. 가로를 기본으로 그리고 브라우저에서 바로잡습니다 */
const serverSnapshot = () => false;

export function useRoomLayout(): RoomLayout {
  const tall = useSyncExternalStore(
    subscribe,
    () => media().matches,
    serverSnapshot,
  );
  return tall ? TALL : WIDE;
}

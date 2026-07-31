"use client";

import { useSyncExternalStore } from "react";

/**
 * 좁은 화면인가 — 서재 대신 아이폰 홈 화면을 그릴 것인가 (docs/08).
 *
 * ── 기준 ──
 * 폭 900px 이하. 세로/가로를 따지지 않습니다.
 * 폰을 눕혀도 방을 보여줄 만큼 넓어지지는 않고, 눕힌 폰에서 홈 화면은 자연스럽습니다.
 *
 * ── 왜 useSyncExternalStore 인가 ──
 * 서버는 화면 크기를 모릅니다. `useState` + `useEffect` 로 하면
 * "렌더 → 효과에서 setState → 다시 렌더" 가 되어 경고가 나고 한 프레임이 낭비됩니다.
 * 이 훅은 서버 스냅샷을 따로 받으므로 하이드레이션 불일치 없이 넘어갑니다.
 *
 * ── 첫 프레임은 CSS 가 가립니다 ──
 * 서버는 서재를 그립니다. 그대로 두면 폰에서 방이 한 번 번쩍하고 바뀝니다.
 * `app/layout.tsx` 의 인라인 스크립트가 **그리기 전에** html[data-shell] 을 심고,
 * CSS 가 맞지 않는 셸을 숨깁니다. 여기서 값이 바뀌는 것은 그 뒤의 일입니다.
 */
export const PHONE_QUERY = "(max-width: 900px)";

let mql: MediaQueryList | null = null;
const media = () => {
  if (!mql) mql = window.matchMedia(PHONE_QUERY);
  return mql;
};

function subscribe(onChange: () => void) {
  const m = media();
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
}

/** 서버에는 화면이 없습니다. 서재를 기본으로 두고 브라우저에서 바로잡습니다 */
const serverSnapshot = () => false;

export function useIsPhone(): boolean {
  return useSyncExternalStore(subscribe, () => media().matches, serverSnapshot);
}

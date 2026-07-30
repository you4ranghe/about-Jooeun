"use client";

import { useEffect } from "react";

/**
 * 결정 대장의 움직임.
 *
 * 두 가지만 합니다.
 *   1. `.rise` 가 화면에 들어오면 떠오릅니다
 *   2. 결정 목록에 닿으면 가운데 세로선이 위에서 아래로 자랍니다
 *      — 그 선이 "실제로 걸어간 길" 이라 스크롤을 따라 그려져야 의미가 있습니다
 *
 * ── 왜 컴포넌트가 화면을 안 그리나 ──
 * 상세페이지는 정적 렌더링을 유지해야 합니다(docs/03 §3.1).
 * 페이지 전체를 클라이언트 컴포넌트로 만들면 본문까지 브라우저 몫이 되므로,
 * 움직임만 담당하는 빈 컴포넌트를 하나 얹었습니다.
 *
 * 이 컴포넌트가 아예 없어도 페이지는 그대로 읽힙니다.
 * CSS 기본값이 "보이는 상태" 이고, JS 는 숨겼다가 보여 주는 게 아니라
 * 이미 보이는 것을 한 번 더 띄우는 일만 합니다.
 */
export function LedgerMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.querySelector<HTMLElement>(".led");
    if (!root) return;
    root.dataset.motion = "on";

    /* 이 페이지는 뷰포트가 아니라 **브라우저 창 안**에서 스크롤됩니다.
       (창이 없던 시절에는 모니터 화면이 스크롤 상자였습니다.)
       실제로 굴러가는 상자를 기준으로 잡아야 "화면에 들어왔다"가 맞습니다. */
    const scroller = root.closest<HTMLElement>(".win__body, .mon__stage");

    const rises = root.querySelectorAll<HTMLElement>(".rise");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      },
      { root: scroller, rootMargin: "0px 0px -12% 0px" },
    );
    rises.forEach((el) => io.observe(el));

    const forks = root.querySelector<HTMLElement>(".led__forks");
    let io2: IntersectionObserver | null = null;
    if (forks) {
      io2 = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          forks.style.setProperty("--grow", "1");
          io2?.disconnect();
        },
        { root: scroller, rootMargin: "0px 0px -20% 0px" },
      );
      io2.observe(forks);
    }

    return () => {
      io.disconnect();
      io2?.disconnect();
    };
  }, []);

  return null;
}

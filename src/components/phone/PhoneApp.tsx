"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * 전체화면 앱 (docs/08 §4).
 *
 * ── 아이콘 자리에서 자랍니다 ──
 * 홈 화면이 뒤에 그대로 살아 있으므로 아이콘을 DOM 에서 찾으면 됩니다.
 * 데스크톱 브라우저 창과 같은 수법이고, iOS 가 앱을 여는 방식이기도 합니다.
 *
 * ── 닫는 길 두 개 ──
 * 아래 홈 인디케이터를 누르거나 위로 쓸어올립니다.
 * 안드로이드 뒤로가기는 주소가 바뀌므로 저절로 닫힙니다.
 */

const EASE = "cubic-bezier(.16,.84,.28,1)";
const OPEN_MS = 380;
const CLOSE_MS = 240;
/** 아이콘에서 자라날 때 시작 크기. 실제 비율(0.15)로 하면 내용이 안 보입니다 */
const SEED = 0.4;

export function PhoneApp({
  id,
  title,
  onClose,
  tone = "light",
  children,
}: {
  /** 어느 아이콘에서 자라날지. 홈 화면의 `data-appicon` 과 맞춥니다 */
  id: string;
  title: string;
  /**
   * 닫는 방법은 앱마다 다릅니다.
   *   주소가 있는 앱(프로젝트·캘린더) → 홈 주소로 이동
   *   주소가 없는 앱(이력서·소개)     → 상태를 내림
   * 그래서 닫는 일은 부모가 정합니다.
   */
  onClose: () => void;
  /**
   * 앱 안 내용이 밝은가 어두운가.
   * 위쪽 막대가 내용 위에 얹히므로 글자색이 반대여야 읽힙니다.
   * 프로젝트 상세는 그 사이트의 옷을 입으므로 밝은 것도 어두운 것도 있습니다.
   */
  tone?: "light" | "dark";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const touchY = useRef<number | null>(null);

  const flip = (el: HTMLElement) => {
    const spot = document.querySelector<HTMLElement>(
      `[data-appicon="${id}"]`,
    );
    if (!spot) return null;
    const a = spot.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    if (!a.width || !b.width) return null;
    return {
      dx: a.left + a.width / 2 - (b.left + b.width / 2),
      dy: a.top + a.height / 2 - (b.top + b.height / 2),
    };
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const d = flip(el);
    if (!d) return;
    el.animate(
      [
        {
          transform: `translate(${d.dx.toFixed(1)}px,${d.dy.toFixed(1)}px) scale(${SEED})`,
          opacity: 0,
          borderRadius: "22%",
        },
        { transform: "none", opacity: 1, borderRadius: "0px" },
      ],
      { duration: OPEN_MS, easing: EASE },
    );
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    if (closing.current) return;
    closing.current = true;

    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = el && !reduce ? flip(el) : null;

    if (!el || !d) {
      onClose();
      return;
    }
    const anim = el.animate(
      [
        { transform: "none", opacity: 1, borderRadius: "0px" },
        {
          transform: `translate(${d.dx.toFixed(1)}px,${d.dy.toFixed(1)}px) scale(${SEED})`,
          opacity: 0,
          borderRadius: "22%",
        },
      ],
      { duration: CLOSE_MS, easing: "cubic-bezier(.4,0,.7,.2)", fill: "forwards" },
    );
    anim.onfinish = onClose;
  };

  return (
    <div
      className="phApp"
      ref={ref}
      data-tone={tone}
      /* 위로 쓸어올려 닫기. 아래에서 시작한 짧은 스와이프만 받습니다 —
         본문을 읽으려고 굴리는 손짓과 헷갈리면 안 됩니다. */
      onTouchStart={(e) => {
        const y = e.touches[0]?.clientY ?? 0;
        touchY.current = y > window.innerHeight - 90 ? y : null;
      }}
      onTouchEnd={(e) => {
        const from = touchY.current;
        touchY.current = null;
        if (from === null) return;
        const to = e.changedTouches[0]?.clientY ?? from;
        if (from - to > 40) close();
      }}
    >
      {/* ── 위쪽 막대 ──
          쓸어올려 닫는 손짓 하나만 두면, 그게 기기 자체의 손짓
          (홈으로 나가기 · 앱 전환)과 겹칩니다. 잘못 쓸면 사이트 밖으로
          나가 버리므로 **눌러서 닫는 길이 반드시 있어야 합니다.** */}
      <div className="phApp__bar">
        <button type="button" onClick={close} aria-label={`${title} 닫기`}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M12.5 4L6.5 10l6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          뒤로
        </button>
        <span className="phApp__title">{title}</span>
      </div>

      <div className="phApp__body">{children}</div>

      <button
        type="button"
        className="phApp__home"
        onClick={close}
        aria-label={`${title} 닫기`}
      >
        <span />
      </button>
    </div>
  );
}

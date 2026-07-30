"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { IconArtKey } from "@/content/types";
import { SITE_HOST } from "@/content/site";
import { IconArt } from "./IconArt";
import "@/styles/window.css";

/**
 * 바탕화면 위에 열리는 브라우저 창 (docs/06 P8, S-05·S-06).
 *
 * ── 왜 창인가 ──
 * 모니터에 줌인하면 컴퓨터가 켜져 있고, 아이콘을 두 번 누르면 브라우저가 뜹니다.
 * 그 브라우저 안에 프로젝트 상세가 들어갑니다. 창틀이 없으면 아이콘을 눌렀을 때
 * 바탕화면이 통째로 다른 화면으로 바뀌어 버려서, 컴퓨터가 아니라 그냥 링크가 됩니다.
 *
 * ── 뜨고 지는 자리 ──
 * 창은 **자기를 연 아이콘 자리에서** 자라나고, 닫으면 그 자리로 되돌아갑니다.
 * 아이콘은 바탕화면(레이아웃)에 그대로 살아 있으므로 DOM 에서 찾으면 됩니다 —
 * 좌표를 따로 들고 다닐 필요가 없습니다.
 *
 * ── 버튼은 전부 실제로 동작합니다 ──
 * 뒤로·앞으로·새로고침은 브라우저 히스토리를 그대로 씁니다.
 * 최소화 버튼은 **일부러 없습니다.** 최소화하면 주소는 이 페이지인데 화면에는
 * 아무것도 없는 상태가 되고, 그때 뒤로가기가 무엇을 뜻하는지 설명할 수 없습니다.
 * 누를 수 있어 보이는데 말이 안 되는 버튼을 두느니 없는 편이 낫습니다.
 */

const EASE = "cubic-bezier(.16,.84,.28,1)";
const OPEN_MS = 420;
const CLOSE_MS = 260;
/** 아이콘에서 자라날 때의 시작 크기. 실제 아이콘 비율(0.03)로 하면 내용이 안 보입니다 */
const SEED = 0.32;

export function BrowserWindow({
  title,
  icon,
  path,
  iconId,
  children,
}: {
  title: string;
  icon: IconArtKey;
  /** 창 안에 열려 있는 주소. 주소 표시줄에 그대로 보입니다 */
  path: string;
  /** 이 창을 연 바탕화면 아이콘. 뜨고 지는 자리를 여기서 찾습니다 */
  iconId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const winRef = useRef<HTMLDivElement>(null);
  const [max, setMax] = useState(false);
  const closing = useRef(false);

  /** 아이콘과 창의 화면상 자리를 재서 둘 사이의 이동량을 구합니다 */
  const flip = (el: HTMLElement) => {
    const spot = document.querySelector<HTMLElement>(
      `[data-icon="${iconId}"]`,
    );
    if (!spot) return null;
    const a = spot.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    if (!b.width || !a.width) return null;

    /* 이 창은 축소된 무대(모니터 화면) 안에 있습니다.
       화면에서 잰 거리를 그대로 쓰면 무대 배율만큼 어긋나므로 되돌려 놓습니다. */
    const s = b.width / el.offsetWidth || 1;
    return {
      dx: (a.left + a.width / 2 - (b.left + b.width / 2)) / s,
      dy: (a.top + a.height / 2 - (b.top + b.height / 2)) / s,
    };
  };

  useLayoutEffect(() => {
    const el = winRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const d = flip(el);
    if (!d) return;
    el.animate(
      [
        {
          transform: `translate(${d.dx.toFixed(1)}px,${d.dy.toFixed(1)}px) scale(${SEED})`,
          opacity: 0,
        },
        { transform: "none", opacity: 1 },
      ],
      { duration: OPEN_MS, easing: EASE },
    );
    // 아이콘이 바뀔 일은 없습니다. 창이 새로 뜰 때 한 번만 돕니다.
  }, [iconId]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    if (closing.current) return;
    closing.current = true;

    const el = winRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = el && !reduce ? flip(el) : null;

    if (!el || !d) {
      router.push("/projects");
      return;
    }

    const anim = el.animate(
      [
        { transform: "none", opacity: 1 },
        {
          transform: `translate(${d.dx.toFixed(1)}px,${d.dy.toFixed(1)}px) scale(${SEED})`,
          opacity: 0,
        },
      ],
      { duration: CLOSE_MS, easing: "cubic-bezier(.4,0,.7,.2)", fill: "forwards" },
    );
    anim.onfinish = () => router.push("/projects");
  };

  return (
    <div className="win" ref={winRef} data-max={String(max)}>
      {/* ── 제목 표시줄 ── */}
      <div className="win__bar">
        <div className="win__tab">
          <span className="win__favicon">
            <IconArt art={icon} />
          </span>
          <span className="win__tabName">{title}</span>
        </div>

        <div className="win__ctrl">
          <button
            type="button"
            onClick={() => setMax((m) => !m)}
            aria-label={max ? "창 크기로 되돌리기" : "최대화"}
            title={max ? "창 크기로" : "최대화"}
          >
            <svg viewBox="0 0 12 12" aria-hidden="true">
              {max ? (
                <>
                  <rect
                    x="2.5"
                    y="0.5"
                    width="9"
                    height="9"
                    rx="1"
                    fill="none"
                    stroke="currentColor"
                  />
                  <rect
                    x="0.5"
                    y="2.5"
                    width="9"
                    height="9"
                    rx="1"
                    fill="var(--win-bar)"
                    stroke="currentColor"
                  />
                </>
              ) : (
                <rect
                  x="0.5"
                  y="0.5"
                  width="11"
                  height="11"
                  rx="1"
                  fill="none"
                  stroke="currentColor"
                />
              )}
            </svg>
          </button>
          <button
            type="button"
            className="win__x"
            onClick={close}
            aria-label="창 닫기"
            title="닫기"
          >
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.3"
                fill="none"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── 주소 표시줄 ── */}
      <div className="win__nav">
        <button type="button" onClick={() => router.back()} aria-label="뒤로">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M12.5 4L6.5 10l6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => router.forward()}
          aria-label="앞으로"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M7.5 4l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => router.refresh()}
          aria-label="새로고침"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M15.5 6.5A6.5 6.5 0 1 0 16 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path d="M16 3.4V7h-3.6" fill="currentColor" opacity="0" />
            <path
              d="M16.2 3.6V7.2H12.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 주소는 보여주기만 합니다. 입력란처럼 보이지 않도록 버튼이 아닙니다 */}
        <span className="win__url">
          <svg viewBox="0 0 14 14" aria-hidden="true" className="win__lock">
            <rect
              x="2.5"
              y="6"
              width="9"
              height="6.5"
              rx="1.4"
              fill="currentColor"
            />
            <path
              d="M4.6 6V4.4a2.4 2.4 0 0 1 4.8 0V6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
          <b>{SITE_HOST}</b>
          {path}
        </span>
      </div>

      {/* ── 창 안 ── */}
      <div className="win__body">{children}</div>
    </div>
  );
}

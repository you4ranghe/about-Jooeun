"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "@/styles/book.css";

/**
 * 책꽂이의 그 한 권을 펼치면 뜨는 화면.
 *
 * ── 왜 책인가 ──
 * 인터페이퍼는 **책을 다루는 사이트**입니다(아버지가 쓴 책 여섯 권을 위한 서재).
 * 서재의 책이 책 사이트로 이어지는 것이 이 방에서 가장 자연스러운 연결입니다.
 *
 * ── 이미 다른 길이 있습니다 ──
 * 모니터 → 바탕화면 → 창 → `/projects/interpaper` 로도 갈 수 있습니다.
 * 문이 둘인 셈인데 일부러 그렇게 뒀습니다 — 하나는 "프로젝트를 훑다가",
 * 하나는 "방을 둘러보다 발견하는" 다른 길입니다.
 * 대신 여기서는 사이트를 바로 보여주고, 만든 이야기는 상세페이지로 넘깁니다.
 *
 * ── 펼쳐지는 모션 ──
 * 두 페이지가 가운데 등에서 `rotateY` 로 벌어집니다. 원근(`perspective`)이 없으면
 * 회전이 그냥 납작해지는 것으로 보여서, 바깥 상자에 원근을 겁니다.
 *
 * iframe 은 **다 펼쳐진 뒤에** 붙입니다. 회전하는 동안 로드하면
 * 브라우저가 애니메이션을 버리고 뚝뚝 끊깁니다.
 */

const SITE = "https://inter-papper.vercel.app";
const OPEN_MS = 720;

export function BookModal({ onClose }: { onClose: () => void }) {
  const [spread, setSpread] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setSpread(true);
      return;
    }
    const t = setTimeout(() => setSpread(true), OPEN_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="book"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="book__stage" data-spread={String(spread)}>
        {/* 표지 두 짝. 펼쳐지고 나면 뒤로 물러납니다 */}
        <span className="book__cover book__cover--l" aria-hidden="true" />
        <span className="book__cover book__cover--r" aria-hidden="true" />

        <div className="book__paper">
          <div className="book__top">
            <div>
              <p className="book__k">인터페이퍼</p>
              <h2 className="book__h">바우치 서재</h2>
            </div>
            <button
              type="button"
              className="book__x"
              onClick={onClose}
              aria-label="책 덮기"
            >
              ×
            </button>
          </div>

          <div className="book__screen">
            {spread ? (
              <iframe
                src={SITE}
                title="바우치 서재 — 운영 중인 사이트"
                loading="lazy"
              />
            ) : (
              <span className="book__loading">펼치는 중…</span>
            )}
          </div>

          <div className="book__foot">
            <Link href="/projects/interpaper" onClick={onClose}>
              어떻게 만들었는지 보기 →
            </Link>
            <a href={SITE} target="_blank" rel="noopener">
              새 탭에서 열기 ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

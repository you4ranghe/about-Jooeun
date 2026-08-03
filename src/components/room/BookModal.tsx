"use client";

import { useEffect, useRef, useState } from "react";
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
 *
 * ── 왜 <dialog> 인가 ──
 * `LoginNotice` · `PhoneNotice` 와 같은 이유입니다. 여기만 평범한 `<div>` 였습니다.
 * `showModal()` 이라야 셋이 한꺼번에 붙습니다 — 포커스가 안에 갇히고,
 * 바깥이 `inert` 가 되고, 덮을 때 **눌렀던 책등으로 포커스가 돌아갑니다.**
 * 속에 든 것이 남의 사이트(iframe)라 더 중요합니다. 갇혀 있지 않으면 Tab 이
 * 방 뒤편의 서랍·모니터로 새어 나가는데, 화면에는 책만 보이니 어디를 짚고 있는지
 * 알 수 없게 됩니다.
 *
 * 닫기는 **반드시 `close()` 를 거칩니다.** 부모의 `onClose` 를 먼저 불러 버리면
 * React 가 열려 있는 dialog 를 그대로 떼어 내고, 그러면 브라우저가 포커스를
 * 되돌릴 곳을 잃습니다. `close()` → `close` 이벤트 → `onClose` 순서라야 합니다.
 */

const SITE = "https://inter-papper.vercel.app";
const OPEN_MS = 720;

export function BookModal({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [spread, setSpread] = useState(false);

  /* 이 컴포넌트는 열릴 때만 마운트되므로 붙자마자 엽니다.
     `open` 속성만 주면 그냥 보이기만 할 뿐 모달이 아닙니다. */
  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setSpread(true);
      return;
    }
    const t = setTimeout(() => setSpread(true), OPEN_MS);
    return () => clearTimeout(t);
  }, []);

  /** 닫는 길은 이 하나뿐입니다 (윗주석 참조) */
  const dismiss = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      className="book"
      aria-labelledby="bookTitle"
      onClose={onClose}
      // 여백(책 바깥)을 눌렀을 때만 덮습니다. 속지 안쪽 클릭은 통과시키지 않습니다.
      onClick={(e) => {
        if (e.target === ref.current) dismiss();
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
              <h2 className="book__h" id="bookTitle">
                바우치 서재
              </h2>
            </div>
            <button
              type="button"
              className="book__x"
              onClick={dismiss}
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
            <Link href="/projects/interpaper" onClick={dismiss}>
              어떻게 만들었는지 보기 →
            </Link>
            <a href={SITE} target="_blank" rel="noopener">
              새 탭에서 열기 ↗
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}

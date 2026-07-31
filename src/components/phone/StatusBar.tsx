"use client";

import { useEffect, useState } from "react";

/**
 * 상태 표시줄 — 시각 · 신호 · 배터리.
 *
 * 시각은 **진짜 한국 시각**입니다. 책상 위 탁상시계와 같은 시간대이고,
 * 초가 필요 없으므로 다음 분까지만 기다립니다(작업표시줄 시계와 같은 방식).
 *
 * 신호와 배터리는 그림입니다. 방문자의 진짜 배터리를 읽는 API 가 있지만
 * 남의 기기 상태를 캐낼 이유가 없고, 브라우저 대부분이 이미 막아 두었습니다.
 */
function readKstTime() {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("hour").padStart(2, "0")}:${get("minute").padStart(2, "0")}`;
}

export function StatusBar() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(readKstTime());
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setTime(readKstTime());
      timer = setTimeout(tick, 60_000 - (Date.now() % 60_000));
    };
    timer = setTimeout(tick, 60_000 - (Date.now() % 60_000));

    const resync = () => {
      if (!document.hidden) setTime(readKstTime());
    };
    document.addEventListener("visibilitychange", resync);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", resync);
    };
  }, []);

  return (
    <div className="phBar">
      {/* 서버는 "지금"을 모릅니다. 자리만 잡아 두고 브라우저가 채웁니다 */}
      <span className="phBar__time">{time ?? "--:--"}</span>

      <span className="phBar__right" aria-hidden="true">
        <svg viewBox="0 0 18 12" className="phBar__signal">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0.5" width="3" height="11.5" rx="1" opacity="0.35" />
        </svg>
        <svg viewBox="0 0 26 12" className="phBar__batt">
          <rect
            x="0.6"
            y="0.6"
            width="21"
            height="10.8"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="1.2"
          />
          <rect x="2.4" y="2.4" width="15" height="7.2" rx="1.8" />
          <path
            d="M23.4 4.2v3.6a2.2 2.2 0 0 0 0-3.6z"
            fillOpacity="0.5"
          />
        </svg>
      </span>
    </div>
  );
}

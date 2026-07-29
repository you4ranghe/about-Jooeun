"use client";

import { useEffect, useState } from "react";

/**
 * 작업표시줄.
 *
 * 가운데 정렬 · 우하단 시계. 형태만 흉내 내고 상표는 쓰지 않습니다.
 *
 * ── 왜 시작 버튼이 눌리지 않는가 ──
 * 시작 메뉴를 만들면 그 안을 또 채워야 하고, 채우지 않으면 눌렀을 때 아무 일도
 * 일어나지 않습니다. **누를 수 있어 보이는데 아무 일도 안 나는 것**이
 * 그냥 그림인 것보다 나쁩니다. 그래서 버튼이 아니라 그림으로 둡니다.
 * 포커스도 받지 않으므로 Tab 으로 훑을 때 걸리지 않습니다.
 *
 * ── 시계는 진짜입니다 ──
 * 책상 위 탁상시계(`DeskClock`)와 같은 한국 시각입니다.
 * 다만 이쪽은 초를 보여주지 않으므로 1초가 아니라 **다음 분까지만** 기다립니다.
 * 화면 안에서 초침이 돌 이유가 없고, 재렌더도 60분의 1로 줄어듭니다.
 */

const KST = "Asia/Seoul";

function readKst() {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    time: `${get("hour").padStart(2, "0")}:${get("minute").padStart(2, "0")}`,
    date: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

export function Taskbar() {
  const [now, setNow] = useState<ReturnType<typeof readKst> | null>(null);

  useEffect(() => {
    setNow(readKst());

    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(readKst());
      timer = setTimeout(tick, 60_000 - (Date.now() % 60_000));
    };
    timer = setTimeout(tick, 60_000 - (Date.now() % 60_000));

    // 절전에서 깨어나면 분이 여러 번 지나 있습니다
    const resync = () => {
      if (!document.hidden) setNow(readKst());
    };
    document.addEventListener("visibilitychange", resync);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", resync);
    };
  }, []);

  return (
    <div className="dtBar">
      <div className="dtBar__mid" aria-hidden="true">
        <span className="dtBar__start">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>

      <div className="dtBar__tray">
        <svg
          className="dtBar__sound"
          viewBox="0 0 24 24"
          role="presentation"
          aria-hidden="true"
        >
          <path d="M4 9.5h3.6L12 5.4v13.2L7.6 14.5H4z" fill="currentColor" />
          <path
            d="M15.4 9a4.2 4.2 0 0 1 0 6M18 6.4a7.9 7.9 0 0 1 0 11.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>

        <span className="dtBar__clock">
          {/* 서버는 "지금"을 모릅니다. 자리만 잡아 두고 브라우저가 채웁니다 */}
          <b>{now?.time ?? "--:--"}</b>
          <small>{now?.date ?? " "}</small>
        </span>
      </div>
    </div>
  );
}

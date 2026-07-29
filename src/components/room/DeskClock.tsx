"use client";

import { useEffect, useState } from "react";

/**
 * 책상 위 탁상시계. 한국 표준시(KST)를 초 단위로 보여줍니다.
 *
 * 서버에서 렌더링한 시각과 브라우저의 시각은 반드시 다릅니다.
 * 그대로 두면 하이드레이션 경고가 나므로, 서버에서는 자리만 잡아 두고
 * 시간은 브라우저에서 처음 그릴 때부터 채웁니다.
 *
 * 보는 사람의 시스템 시간대와 무관하게 항상 KST 입니다.
 * 서울에 있는 사람의 책상 위 시계이지, 방문자의 시계가 아니기 때문입니다.
 */

const KST = "Asia/Seoul";

function readKst() {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    hh: get("hour").padStart(2, "0"),
    mm: get("minute").padStart(2, "0"),
    ss: get("second").padStart(2, "0"),
    date: `${get("month")}월 ${get("day")}일 ${get("weekday")}`,
  };
}

export function DeskClock() {
  const [now, setNow] = useState<ReturnType<typeof readKst> | null>(null);

  useEffect(() => {
    setNow(readKst());

    // setInterval(1000) 은 절전이나 탭 비활성 뒤 조금씩 밀립니다.
    // 다음 "정각 초"까지 남은 시간만큼만 기다리도록 매번 다시 잡습니다.
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(readKst());
      timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    timer = setTimeout(tick, 1000 - (Date.now() % 1000));

    // 절전에서 깨어나거나 탭으로 돌아왔을 때 즉시 맞춥니다
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
    <div className="clock" aria-label={now ? `현재 한국 시각 ${now.hh}시 ${now.mm}분` : "시계"}>
      <div className="clock__body">
        <div className="clock__face">
          <span className="clock__time">
            {/* 서버에서는 빈 자리로 두어 하이드레이션 불일치를 피합니다 */}
            <b>{now?.hh ?? "--"}</b>
            <i className="clock__colon">:</i>
            <b>{now?.mm ?? "--"}</b>
            <small>{now?.ss ?? "--"}</small>
          </span>
          <span className="clock__date">{now?.date ?? " "}</span>
          <span className="clock__zone">KST</span>
        </div>
      </div>
      <span className="clock__stand" />
    </div>
  );
}

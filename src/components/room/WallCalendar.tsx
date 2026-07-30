"use client";

import { useEffect, useState } from "react";
import { useRoomLayout } from "./useRoomLayout";

/**
 * 벽에 걸린 종이 달력. 실제 이번 달(KST)을 보여주고 오늘에 표시가 붙습니다.
 *
 * 이 페이지는 빌드 시점에 정적으로 만들어집니다. 그래서 서버에서 날짜를 그리면
 * **배포한 날짜가 그대로 굳어 버립니다.** 달이 바뀌어도 지난달이 걸려 있게 됩니다.
 * 그래서 날짜는 반드시 브라우저에서 계산합니다.
 * 서버에서는 격자 뼈대만 그려 두어 레이아웃이 흔들리지 않게 했습니다.
 *
 * 지금은 보는 용도입니다. 누르면 일정을 관리하는 기능은 docs/06 의 P4 이고,
 * 비공개 일정이라 로그인과 DB 가 필요합니다.
 */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

interface Month {
  year: number;
  month: number; // 1-12
  today: number;
  /** 1일 앞에 비워 둘 칸 수 (0=일요일) */
  lead: number;
  days: number;
}

function readKstMonth(): Month {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);

  const year = get("year");
  const month = get("month");
  const today = get("day");

  // 달력상의 요일은 시간대와 무관합니다. UTC 로 계산해도 같은 값이 나옵니다.
  const lead = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return { year, month, today, lead, days };
}

export function WallCalendar({
  onOpen,
  surfaceRef,
  stageRef,
  zoomed,
  children,
}: {
  onOpen?: () => void;
  /** 카메라가 겨냥할 종이 면 */
  surfaceRef?: React.Ref<HTMLDivElement>;
  /** 확대됐을 때 내용이 사는 무대. 모니터와 같은 방식으로 축척을 맞춥니다. */
  stageRef?: React.Ref<HTMLDivElement>;
  zoomed?: boolean;
  children?: React.ReactNode;
}) {
  const L = useRoomLayout();
  const [m, setM] = useState<Month | null>(null);

  useEffect(() => {
    setM(readKstMonth());

    // 자정을 넘기면 오늘 표시가 옮겨가야 합니다.
    // 탭을 오래 열어두는 경우가 있어 돌아올 때마다 다시 읽습니다.
    const resync = () => {
      if (!document.hidden) setM(readKstMonth());
    };
    document.addEventListener("visibilitychange", resync);
    const hourly = setInterval(resync, 60 * 60 * 1000);
    return () => {
      document.removeEventListener("visibilitychange", resync);
      clearInterval(hourly);
    };
  }, []);

  // 6줄 × 7칸 고정. 날짜가 없는 칸은 비워 둡니다.
  const cells: (number | null)[] = Array.from({ length: 42 }, (_, i) => {
    if (!m) return null;
    const d = i - m.lead + 1;
    return d >= 1 && d <= m.days ? d : null;
  });

  return (
    // box() 를 써야 폭·높이가 함께 들어갑니다.
    // {x,y,w,h} 를 그대로 펼치면 x·w 가 CSS 속성이 아니라 무시되어 크기가 0 이 됩니다.
    <div className="cal" style={L.box(L.calendar)}>
      {/* 벽에 박힌 못과 걸린 고리 */}
      <span className="cal__nail" />
      <span className="cal__hook" />

      {onOpen && (
        <button type="button" className="cal__hit" onClick={onOpen} aria-label="벽걸이 캘린더 — 일정 열기">
          <span className="thing__tip">캘린더 · 일정 관리</span>
        </button>
      )}

      <div className="cal__paper" ref={surfaceRef}>
        {/* 확대됐을 때 여기에 일정 화면이 뜹니다.
            모니터와 같은 방식 — 뷰포트 크기로 그린 뒤 종이 크기에 맞게 줄여 두고,
            카메라가 그만큼 확대하면 최종 배율이 1 이 되어 글자가 또렷합니다. */}
        <div className="cal__stage" ref={stageRef} data-on={zoomed ? "true" : "false"}>
          {children}
        </div>

        {/* 스프링 제본 */}
        <span className="cal__spiral">
          {Array.from({ length: 9 }, (_, i) => (
            <i key={i} />
          ))}
        </span>

        <div className="cal__head">
          <span className="cal__month">{m ? `${m.month}월` : " "}</span>
          <span className="cal__year">{m ? m.year : " "}</span>
        </div>

        <div className="cal__grid">
          {WEEKDAYS.map((w, i) => (
            <span key={w} className="cal__wd" data-wd={i === 0 ? "sun" : i === 6 ? "sat" : ""}>
              {w}
            </span>
          ))}
          {cells.map((d, i) => (
            <span
              key={i}
              className="cal__day"
              data-wd={i % 7 === 0 ? "sun" : i % 7 === 6 ? "sat" : ""}
              data-today={m && d === m.today ? "true" : "false"}
            >
              {d ?? ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

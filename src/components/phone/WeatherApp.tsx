"use client";

import { CONDITION_LABEL, toCondition } from "@/lib/sky";
import type { Sky } from "@/components/room/useSky";

/**
 * 이번 주 서울 날씨.
 *
 * ── 위젯과 같은 값입니다 ──
 * 따로 부르지 않습니다. `/api/weather` 한 번에 "지금" 과 이레치를 같이 받아
 * `useSky` 가 둘 다 들고 있습니다. 따로 불렀다면 위젯의 온도와 이 화면의
 * 오늘 칸이 서로 다른 시각의 값이 되어, 오늘만 어긋나 보였을 겁니다.
 *
 * ── 막대의 뜻 ──
 * 이레 중 가장 낮은 기온과 가장 높은 기온을 양 끝으로 두고, 그 안에서
 * 하루의 최저~최고가 어디쯤인지 표시합니다. 숫자만 늘어놓는 것보다
 * "이번 주에 오늘이 더운 편인가" 가 한눈에 보입니다.
 */

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** "2026-07-31" → 요일. UTC 로 계산해도 요일은 같습니다 */
function weekdayOf(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return "";
  return WEEKDAY[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

function dayNumber(date: string): string {
  return String(Number(date.split("-")[2] ?? 0));
}

export function WeatherApp({ sky }: { sky: Sky }) {
  const days = sky.days;

  if (!days.length) {
    return (
      <div className="phDoc phWx">
        <header className="phDoc__top">
          <p className="phDoc__k">WEATHER</p>
          <h1 className="phDoc__h1">서울</h1>
        </header>
        <p className="phWx__empty">
          날씨를 불러오지 못했습니다. 사내망이나 프록시에 막혔거나 잠시 응답이
          없는 상태입니다. 잠시 뒤 다시 열어 보세요.
        </p>
      </div>
    );
  }

  /* 이레 전체의 최저·최고. 막대의 양 끝이 됩니다 */
  const lows = days.map((d) => d.min).filter((n): n is number => n !== null);
  const highs = days.map((d) => d.max).filter((n): n is number => n !== null);
  const floor = Math.min(...lows);
  const ceil = Math.max(...highs);
  const span = Math.max(ceil - floor, 1);

  return (
    <div className="phDoc phWx">
      <header className="phDoc__top">
        <p className="phDoc__k">WEATHER · 서울</p>
        <h1 className="phDoc__h1">
          {sky.tempC !== null ? `${Math.round(sky.tempC)}°` : "—"}
        </h1>
        <p className="phDoc__lede">
          {sky.label || "지금 날씨를 못 불러왔어요"}
        </p>
      </header>

      <ul className="phWx__list">
        {days.map((d, i) => {
          const cond = toCondition(d.code, null);
          const left = d.min !== null ? ((d.min - floor) / span) * 100 : 0;
          const width =
            d.min !== null && d.max !== null
              ? Math.max(((d.max - d.min) / span) * 100, 6)
              : 0;

          return (
            <li key={d.date}>
              <span className="phWx__day">
                {i === 0 ? "오늘" : weekdayOf(d.date)}
                <small>{dayNumber(d.date)}일</small>
              </span>

              <span className="phWx__cond">{CONDITION_LABEL[cond]}</span>

              <span className="phWx__min">
                {d.min !== null ? `${Math.round(d.min)}°` : "—"}
              </span>
              <span className="phWx__bar" aria-hidden="true">
                <i style={{ left: `${left}%`, width: `${width}%` }} />
              </span>
              <span className="phWx__max">
                {d.max !== null ? `${Math.round(d.max)}°` : "—"}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="phWx__note">
        Open-Meteo · 시간당 한 번 받아옵니다. 홈 화면 위젯과 같은 값입니다.
      </p>
    </div>
  );
}

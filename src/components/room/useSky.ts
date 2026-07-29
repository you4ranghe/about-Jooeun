"use client";

import { useEffect, useState } from "react";
import {
  CONDITION_LABEL,
  FALLBACK,
  bodyPosition,
  fallbackSun,
  hhmmToMinutes,
  kstMinutesOfDay,
  kstMonth,
  toCondition,
  toPhase,
  toSeason,
  type Condition,
  type Phase,
  type Season,
  type WeatherPayload,
} from "@/lib/sky";

/**
 * 창밖 상태.
 *
 * ── 두 개의 주기 ──
 *   날씨는 **1시간**마다 서버에서 받아옵니다. 분 단위로 바뀌지 않으니까요.
 *   해·달의 자리와 낮/밤은 **1분**마다 브라우저 시계로만 다시 계산합니다.
 *   여기엔 통신이 없어서 공짜입니다.
 *
 * ── 하이드레이션 ──
 * 서버는 "지금"을 모릅니다. 빌드 시각으로 하늘을 그려 두면 배포한 날 낮에
 * 굳어 버립니다. 그래서 첫 렌더는 ready:false 인 기본 하늘이고,
 * 브라우저에서만 실제 시각으로 채웁니다. 시계(DeskClock)와 같은 방식입니다.
 */

export interface Sky {
  /** 브라우저에서 실제 시각으로 채워졌는가 */
  ready: boolean;
  /** 날씨를 실제로 받아왔는가. false 면 월별 평균 일출·일몰로 그립니다 */
  live: boolean;
  phase: Phase;
  condition: Condition;
  season: Season;
  tempC: number | null;
  /** 해 또는 달의 자리 (창 크기 대비 %) */
  bodyX: number;
  bodyY: number;
  /** "흐림 30°" 같은 표시용. 받아오지 못했으면 빈 문자열 */
  label: string;
}

const INITIAL: Sky = {
  ready: false,
  live: false,
  phase: "day",
  condition: "clear",
  season: "summer",
  tempC: null,
  bodyX: 46,
  bodyY: 34,
  label: "",
};

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

function compute(w: WeatherPayload, now = new Date()): Sky {
  const month = kstMonth(now);
  const minutes = kstMinutesOfDay(now);

  const fb = fallbackSun(month);
  const sunrise = hhmmToMinutes(w.sunrise) ?? fb.sunrise;
  const sunset = hhmmToMinutes(w.sunset) ?? fb.sunset;

  const condition = toCondition(w.code, w.cloud);
  const pos = bodyPosition(minutes, sunrise, sunset);

  return {
    ready: true,
    live: w.ok,
    phase: toPhase(minutes, sunrise, sunset),
    condition,
    season: toSeason(month),
    tempC: w.tempC,
    bodyX: pos.x,
    bodyY: pos.y,
    label: w.ok
      ? `${CONDITION_LABEL[condition]}${w.tempC === null ? "" : ` ${Math.round(w.tempC)}°`}`
      : "",
  };
}

export function useSky(): Sky {
  const [sky, setSky] = useState<Sky>(INITIAL);

  useEffect(() => {
    let dead = false;
    // 받아온 날씨를 들고 있다가 1분 갱신 때 다시 씁니다
    let weather: WeatherPayload = FALLBACK;

    const paint = () => !dead && setSky(compute(weather));

    const pull = async () => {
      try {
        const res = await fetch("/api/weather");
        if (res.ok) weather = (await res.json()) as WeatherPayload;
      } catch {
        // 못 받아오면 기본 하늘 그대로 둡니다
      }
      paint();
    };

    void pull();
    const slow = setInterval(pull, HOUR_MS);
    const fast = setInterval(paint, MINUTE_MS);

    /* 노트북을 덮어 두면 타이머가 밀립니다. 돌아올 때 한 번 맞춥니다. */
    const onWake = () => document.visibilityState === "visible" && paint();
    document.addEventListener("visibilitychange", onWake);

    return () => {
      dead = true;
      clearInterval(slow);
      clearInterval(fast);
      document.removeEventListener("visibilitychange", onWake);
    };
  }, []);

  return sky;
}

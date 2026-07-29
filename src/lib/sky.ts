/**
 * 창밖을 정하는 값들 — 시각 · 날씨 · 계절.
 *
 * ── 왜 Open-Meteo 인가 ──
 * **API 키가 없습니다.** 가입도, 키 발급도, 키를 숨길 곳도 필요 없습니다.
 * 비영리 사용은 무료이고 하루 10,000회까지 부릅니다.
 *
 * OpenWeatherMap 같은 곳은 키가 필요한데, 브라우저에서 부르면 키가 그대로 노출되고
 * 숨기려면 서버를 거쳐야 합니다. 키가 아예 없는 쪽이 새어 나갈 것도 없습니다.
 * 기상청 API 는 키도 필요하고 응답 형식도 훨씬 번거롭습니다.
 *
 * ── 좌표는 서울 고정입니다 ──
 * 방문자 위치를 묻지 않습니다. 이 방은 **주인의 방**이라 서울 날씨가 맞고,
 * 위치 권한을 묻는 것은 포트폴리오가 방문자에게 요구할 일이 아닙니다.
 */

export const SEOUL = { lat: 37.5665, lon: 126.978 } as const;

export type Phase = "dawn" | "day" | "dusk" | "night";
export type Condition =
  "clear" | "cloudy" | "overcast" | "fog" | "rain" | "snow" | "thunder";
export type Season = "spring" | "summer" | "autumn" | "winter";

/** /api/weather 가 돌려주는 것 */
export interface WeatherPayload {
  ok: boolean;
  tempC: number | null;
  code: number | null;
  cloud: number | null;
  /** "05:33" — 이미 KST 입니다 (요청할 때 timezone=Asia/Seoul) */
  sunrise: string | null;
  sunset: string | null;
}

export const FALLBACK: WeatherPayload = {
  ok: false,
  tempC: null,
  code: null,
  cloud: null,
  sunrise: null,
  sunset: null,
};

/**
 * WMO 기상 코드 → 우리가 그릴 수 있는 일곱 가지.
 *
 * 코드는 100가지 가까이 되는데 그림은 일곱 개뿐이라 뭉칩니다.
 * 이슬비와 폭우를 나누어 그릴 수 있는 것도 아니니 둘 다 "비" 입니다.
 */
export function toCondition(
  code: number | null,
  cloud: number | null,
): Condition {
  if (code === null) return "clear";
  if (code >= 95) return "thunder";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code === 45 || code === 48) return "fog";
  if (code === 3) return "overcast";
  if (code === 1 || code === 2) return "cloudy";
  // 코드상 맑아도 구름이 많으면 맑다고 그리지 않습니다
  if ((cloud ?? 0) > 60) return "cloudy";
  return "clear";
}

export const CONDITION_LABEL: Record<Condition, string> = {
  clear: "맑음",
  cloudy: "구름",
  overcast: "흐림",
  fog: "안개",
  rain: "비",
  snow: "눈",
  thunder: "천둥번개",
};

/** 기상학 기준(3~5 봄)입니다. 달력 계절보다 창밖 나무와 잘 맞습니다. */
export function toSeason(month: number): Season {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

/* ── KST 시간 ────────────────────────────────────────────
   서버가 어느 시간대에 있든 상관없이 항상 한국 시각입니다.
   한국은 서머타임이 없어 UTC+9 로 고정해도 안전합니다. */

const KST_OFFSET = 9 * 60;

/** 자정부터 몇 분 지났는가 (KST) */
export function kstMinutesOfDay(now = new Date()): number {
  return (now.getUTCHours() * 60 + now.getUTCMinutes() + KST_OFFSET) % 1440;
}

/** KST 기준 월 (1~12) */
export function kstMonth(now = new Date()): number {
  return new Date(now.getTime() + KST_OFFSET * 60_000).getUTCMonth() + 1;
}

/** "2026-07-29T05:33" 또는 "05:33" → 333 */
export function hhmmToMinutes(s: string | null): number | null {
  if (!s) return null;
  const m = /(\d{1,2}):(\d{2})/.exec(s);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/* ── 해가 뜨고 지는 시각 ────────────────────────────────
   날씨를 못 받아왔을 때 쓰는 대략값입니다.
   서울은 여름 해가 길고 겨울이 짧아 그 정도만 흉내 냅니다. */
export function fallbackSun(month: number) {
  //        1    2    3    4    5    6    7    8    9   10   11   12
  const rise = [7.7, 7.2, 6.5, 5.7, 5.2, 5.1, 5.3, 5.8, 6.2, 6.7, 7.2, 7.6];
  const set = [
    17.5, 18.1, 18.6, 19.1, 19.5, 19.9, 19.8, 19.3, 18.6, 17.9, 17.3, 17.2,
  ];
  const i = Math.min(11, Math.max(0, month - 1));
  return { sunrise: Math.round(rise[i] * 60), sunset: Math.round(set[i] * 60) };
}

/**
 * 시각 → 하루 중 어느 때인가.
 *
 * 해뜨기 40분 전부터 뜬 뒤 40분까지가 새벽,
 * 해지기 60분 전부터 진 뒤 40분까지가 노을입니다.
 * 그 사이가 낮, 나머지가 밤.
 */
export function toPhase(
  minutes: number,
  sunrise: number,
  sunset: number,
): Phase {
  if (minutes >= sunrise - 40 && minutes <= sunrise + 40) return "dawn";
  if (minutes >= sunset - 60 && minutes <= sunset + 40) return "dusk";
  if (minutes > sunrise + 40 && minutes < sunset - 60) return "day";
  return "night";
}

/**
 * 해(낮) 또는 달(밤)이 창 안 어디쯤 있는가. 창 크기 대비 % 입니다.
 *
 * 뜨는 곳에서 지는 곳까지 가로로 흐르고, 높이는 한가운데가 가장 높은 활입니다.
 * 실제 태양 고도를 계산하지는 않습니다 — 창 한 칸에 담기는 그림이라
 * 정확한 천문값보다 "정오에 높고 아침저녁에 낮다"가 더 중요합니다.
 */
export function bodyPosition(minutes: number, sunrise: number, sunset: number) {
  const daytime = minutes >= sunrise && minutes <= sunset;

  let t: number;
  if (daytime) {
    t = (minutes - sunrise) / Math.max(1, sunset - sunrise);
  } else {
    // 밤은 자정을 넘어가므로 하루를 이어 붙여 계산합니다
    const nightLength = 1440 - (sunset - sunrise);
    const since =
      minutes > sunset ? minutes - sunset : minutes + (1440 - sunset);
    t = since / Math.max(1, nightLength);
  }
  t = Math.min(1, Math.max(0, t));

  return {
    daytime,
    x: 8 + t * 84,
    y: 74 - Math.sin(t * Math.PI) * 58,
  };
}

import { SEOUL, FALLBACK, type WeatherPayload } from "@/lib/sky";

/**
 * 서울 날씨 한 덩이.
 *
 * ── 왜 브라우저에서 직접 부르지 않는가 ──
 * Open-Meteo 는 키가 없어서 브라우저에서 불러도 새어 나갈 게 없습니다.
 * 그런데도 서버를 거치는 이유는 **호출 횟수** 때문입니다.
 * 방문자마다 직접 부르면 사람 수만큼 호출이 나가지만,
 * 여기서 한 번 받아 1시간 캐시하면 방문자가 몇 명이든 시간당 한 번입니다.
 * 무료 한도(하루 10,000회) 안에서 놀려면 이쪽이 안전합니다.
 *
 * ── 1시간인 이유 ──
 * 날씨는 분 단위로 바뀌지 않고, Open-Meteo 자체도 15분 간격으로 갱신합니다.
 * 해·달의 움직임은 브라우저가 시계만 보고 계산하므로 이 캐시와 무관하게 부드럽습니다.
 *
 * ── 캐시를 거는 방법 (이 버전의 Next 에서 막힌 두 길) ──
 * 1. `export const revalidate = HOUR` → 빌드가 "Invalid segment configuration" 으로 멈춥니다.
 *    세그먼트 설정은 상수 참조가 아니라 리터럴이어야 합니다.
 * 2. `use cache` + `cacheLife` → next.config 에 `cacheComponents` 플래그가 필요합니다.
 *    날씨 하나 때문에 켜기엔 프로젝트 전체의 캐시 동작이 바뀝니다.
 *    지금 정적으로 유지되는 / · /projects 까지 영향을 받습니다.
 *
 * 그래서 두 겹으로 막습니다.
 *   - fetch 의 `next.revalidate` → Next 데이터 캐시가 1시간 들고 있습니다
 *   - 응답의 `Cache-Control` → CDN 이 1시간 들고 있어 함수 호출 자체가 대부분 없습니다
 * 둘 중 하나만 들어도 Open-Meteo 로 나가는 호출은 시간당 한 번입니다.
 *
 * ── 실패해도 화면은 안 깨집니다 ──
 * 사내망·프록시·API 장애 어느 쪽이든 ok:false 를 돌려주고,
 * 화면은 월별 평균 일출·일몰로 계산한 기본 하늘을 그립니다.
 */

const ENDPOINT =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${SEOUL.lat}&longitude=${SEOUL.lon}` +
  `&current=temperature_2m,weather_code,cloud_cover` +
  `&daily=sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min` +
  `&timezone=Asia%2FSeoul&forecast_days=7`;

/* 하루치에서 이레치로 늘렸습니다.
   호출은 여전히 한 번이고 캐시도 그대로라 비용은 같습니다.
   **따로 부르지 않는 것이 중요합니다** — 위젯의 "지금" 과 주간 예보가
   다른 시각의 값이면 오늘 칸만 위젯과 어긋나 보입니다. */

interface OpenMeteo {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    cloud_cover?: number;
  };
  daily?: {
    time?: string[];
    sunrise?: string[];
    sunset?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}

async function readWeather(): Promise<WeatherPayload> {
  try {
    const res = await fetch(ENDPOINT, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return FALLBACK;

    const d = (await res.json()) as OpenMeteo;
    return {
      ok: true,
      tempC: d.current?.temperature_2m ?? null,
      code: d.current?.weather_code ?? null,
      cloud: d.current?.cloud_cover ?? null,
      sunrise: d.daily?.sunrise?.[0] ?? null,
      sunset: d.daily?.sunset?.[0] ?? null,
      days: (d.daily?.time ?? []).map((date, i) => ({
        date,
        code: d.daily?.weather_code?.[i] ?? null,
        max: d.daily?.temperature_2m_max?.[i] ?? null,
        min: d.daily?.temperature_2m_min?.[i] ?? null,
      })),
    };
  } catch {
    // 그대로 FALLBACK. 창밖은 기본 하늘로 그려집니다.
    return FALLBACK;
  }
}

export async function GET() {
  return Response.json(await readWeather(), {
    headers: {
      // CDN 도 1시간 들고 있다가, 만료돼도 새로 받아오는 동안은 옛 값을 내줍니다.
      // 그래서 방문자가 기다리는 일이 없습니다.
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

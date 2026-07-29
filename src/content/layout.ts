/**
 * 서재의 좌표계.
 *
 * 방을 1600×900 고정 무대(artboard) 안에 그리고, 그 무대를 통째로 확대·축소해
 * 화면에 맞춥니다. 그래서 어떤 화면 비율에서도 물건이 가구 위 같은 자리에 있습니다.
 *
 * 이전 방식(가로는 폭의 %, 세로는 높이의 %)은 화면 비율이 바뀌면
 * 가구와 물건이 서로 다른 방향으로 움직여 배치가 무너졌습니다.
 *
 * 여기의 모든 숫자는 무대 좌표(px)입니다. 화면 픽셀이 아닙니다.
 */

export const STAGE = { w: 1600, h: 900 } as const;

/** 벽과 바닥이 만나는 높이 */
export const FLOOR_Y = 604;

/** 책상 상판 윗면. 책상에 놓이는 물건의 바닥이 이 값에 닿습니다. */
export const DESK_TOP = 596;

/** 주요 가구의 자리 */
export const FURNITURE = {
  /** 왼쪽 벽면을 채우는 책장 */
  bookcase: { x: 54, y: 96, w: 396, h: 508 },
  /** 창 — 오른쪽 벽 */
  window: { x: 1044, y: 66, w: 486, h: 392 },
  /** 벽걸이 캘린더 */
  calendar: { x: 596, y: 84, w: 268, h: 208 },
  /** 액자 — 캘린더 옆 */
  frame: { x: 908, y: 96, w: 104, h: 128 },
  /** 책상 상판 */
  desk: { x: 470, y: DESK_TOP, w: 1090, h: 30 },
} as const;

/**
 * 사물의 자리.
 *
 * x/y 는 사물의 **왼쪽 위** 모서리, w 는 폭입니다.
 * 높이는 그림의 종횡비가 정하므로 적지 않습니다.
 * 그래서 "책상에 놓인다"를 맞추려면 y + 높이 ≈ DESK_TOP 이 되도록 잡아야 합니다.
 * 각 항목의 주석에 어디에 놓인 물건인지 적어 두었습니다.
 */
export const SPOTS: Record<string, { x: number; y: number; w: number }> = {
  // ── 책장 선반 위 ─────────────────────────────
  profile: { x: 916, y: 104, w: 88 }, // 벽 — 액자 안
  values: { x: 88, y: 150, w: 150 }, // 책장 1층 — 윷 네 짝
  collaboration: { x: 268, y: 138, w: 62 }, // 책장 1층 — 종
  principles: { x: 348, y: 140, w: 58 }, // 책장 1층 — 자물쇠
  personal: { x: 96, y: 268, w: 96 }, // 책장 2층 — 화분
  certification: { x: 246, y: 300, w: 108 }, // 책장 2층 — 쿠폰

  // ── 책상 위 ──────────────────────────────────
  education: { x: 500, y: 520, w: 118 }, // 책 더미 + 머그
  "how-i-work": { x: 660, y: 540, w: 80 }, // 러버덕
  strength: { x: 1188, y: 528, w: 78 }, // 돋보기
  career: { x: 1290, y: 528, w: 72 }, // 동전 탑

  // ── 바닥 ─────────────────────────────────────
  skills: { x: 372, y: 662, w: 74 }, // 책상 아래 서버 랙
  contact: { x: 1264, y: 690, w: 116 }, // 택배 상자
};

/** 클릭 대상이 아닌 소품 */
export const PROPS = {
  lamp: { x: 486, y: 452, w: 96 }, // 책상 왼쪽 스탠드
  clock: { x: 1112, y: 540, w: 74 }, // 탁상시계
  turntable: { x: 800, y: 500, w: 150 }, // LP 턴테이블 (P3 에서 사용)
  papers: { x: 1024, y: 566, w: 108 }, // 흩어진 서류
  keyboard: { x: 736, y: 574, w: 260 }, // 키보드
  mouse: { x: 1020, y: 578, w: 34 }, // 마우스
  mat: { x: 700, y: 566, w: 420 }, // 데스크 매트
  rug: { x: 420, y: 762, w: 780 }, // 러그
} as const;

/** 모니터는 화면 안으로 들어가는 문이라 따로 둡니다 */
export const MONITOR = { x: 754, y: 348, w: 360 } as const;

/** 무대 좌표를 CSS 인라인 스타일로 바꿉니다 */
export function place(spot: { x: number; y: number; w: number }) {
  return { left: `${spot.x}px`, top: `${spot.y}px`, width: `${spot.w}px` };
}

export function box(spot: { x: number; y: number; w: number; h: number }) {
  return { left: `${spot.x}px`, top: `${spot.y}px`, width: `${spot.w}px`, height: `${spot.h}px` };
}

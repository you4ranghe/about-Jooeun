/**
 * 서재의 좌표계.
 *
 * 방을 1600×900 고정 무대(artboard) 안에 그리고, 그 무대를 통째로 확대·축소해
 * 화면에 맞춥니다. 그래서 어떤 화면 비율에서도 물건이 가구 위 같은 자리에 있습니다.
 *
 * 여기의 모든 숫자는 무대 좌표(px)입니다. 화면 픽셀이 아닙니다.
 * 배치를 고칠 일이 생기면 **이 파일만** 보면 됩니다.
 *
 * ── 시점 ──
 * 책상 앞에 앉아 정면을 보는 시점입니다. 바닥은 보이지 않고,
 * 상판 아래는 책상 앞면과 서랍이 화면 아래까지 채웁니다.
 */

export const STAGE = { w: 1600, h: 900 } as const;

/** 책상 상판 윗면. 책상에 놓이는 물건의 **바닥**이 이 값에 닿습니다. */
export const DESK_TOP = 618;

/** 주요 가구의 자리 */
export const FURNITURE = {
  /** 창 — 오른쪽 벽 */
  window: { x: 1052, y: 58, w: 468, h: 372 },
  /** 벽걸이 캘린더 */
  calendar: { x: 214, y: 96, w: 288, h: 236 },
  /** 책상 상판. 화면 좌우를 넘어가도록 두어 방이 잘린 느낌을 없앱니다. */
  desk: { x: -40, y: DESK_TOP, w: 1680, h: 34 },
} as const;

/**
 * 책상 위 물건.
 *
 * y 는 물건의 **위쪽** 좌표입니다. 그림의 높이는 종횡비가 정하므로,
 * "상판에 놓인다"를 맞추려면 y + 높이 ≈ DESK_TOP 이 되어야 합니다.
 * 각 항목 주석에 계산된 높이를 적어 두었습니다.
 */
export const PROPS = {
  /** 책꽂이 — 책상 왼쪽. 책장을 없애고 이걸로 대신합니다 */
  bookshelf: { x: 96, y: 424, w: 340, h: 194 },
  /** 탁상시계 — 모니터 오른쪽 */
  clock: { x: 1174, y: 522, w: 132 },
  /** 스탠드 — 오른쪽 끝 */
  lamp: { x: 1376, y: 452, w: 148 },
  /** 키보드 — 상판 앞쪽에 눕혀 둔 상태 */
  keyboard: { x: 660, y: 596, w: 300 },
  /** 마우스 — 장식입니다. 누르는 기능 없음 */
  mouse: { x: 992, y: 596, w: 40 },
  /** 흩어진 서류 */
  papers: { x: 486, y: 586, w: 128 },
  /** 머그 */
  mug: { x: 566, y: 552, w: 66 },
} as const;

/** 모니터는 화면 안으로 들어가는 문이라 따로 둡니다 */
export const MONITOR = { x: 636, y: 268, w: 452 } as const;

/**
 * 이력서 사물의 자리.
 *
 * 지금은 비어 있습니다. 방을 정리하면서 물건 12개를 전부 내렸고,
 * 이력서 내용은 content/resume.ts 에 그대로 있으며 상단 "전체 보기"로 들어갑니다.
 * 어떤 물건으로 다시 꺼낼지는 docs/06 의 TODO 로 남겨 두었습니다.
 *
 * 여기에 { id: {x, y, w} } 를 넣으면 그 물건이 다시 방에 나타납니다.
 * 한 번에 하나씩 넣고 확인하는 방식으로 진행합니다.
 */
export const SPOTS: Record<string, { x: number; y: number; w: number }> = {};

/** 무대 좌표를 CSS 인라인 스타일로 바꿉니다 */
export function place(spot: { x: number; y: number; w: number }) {
  return { left: `${spot.x}px`, top: `${spot.y}px`, width: `${spot.w}px` };
}

export function box(spot: { x: number; y: number; w: number; h: number }) {
  return { left: `${spot.x}px`, top: `${spot.y}px`, width: `${spot.w}px`, height: `${spot.h}px` };
}

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
 *
 * ── 왜 y 가 아니라 bottom 인가 ──
 * "책상에 놓인다" 는 **바닥**에 대한 조건입니다.
 * 위쪽(y)으로 고정하면 물건 높이가 바뀔 때마다 떠오르거나 파묻힙니다.
 * 특히 모니터는 화면 종횡비에 따라 높이가 달라져서, y 로 두면
 * 21:9 모니터에서는 책상 위로 떠 버립니다. 실제로 그렇게 떠 있었습니다.
 */

export const STAGE = { w: 1600, h: 900 } as const;

/** 책상 상판 윗면 */
export const DESK_TOP = 618;

/** 무대 바닥에서 상판까지의 거리. 책상 위 물건은 이 값을 bottom 으로 씁니다. */
export const DESK_BOTTOM = STAGE.h - DESK_TOP;

/** 주요 가구 */
export const FURNITURE = {
  /** 창 — 오른쪽 벽 */
  window: { x: 1052, y: 58, w: 468, h: 372 },
  /**
   * 벽걸이 캘린더.
   *
   * 벽걸이 LP 를 걷어내면서(→ 아이패드로 옮김) 왼쪽 벽이 통째로 비었습니다.
   * 창(1052~) 왼쪽 벽면의 가운데쯤으로 옮겨 균형을 맞춥니다.
   */
  calendar: { x: 372, y: 70, w: 288, h: 236 },
  /** 책상 상판. 화면 좌우를 넘어가도록 두어 방이 잘린 느낌을 없앱니다. */
  desk: { x: -40, y: DESK_TOP, w: 1680, h: 34 },
} as const;

/**
 * 책상 위 물건 — 왼쪽에서 오른쪽 순.
 *
 * bottom 을 적지 않으면 상판(DESK_BOTTOM)에 바로 놓입니다.
 * 모니터만 목받침과 받침대 높이(56)만큼 띄웁니다.
 */
export const PROPS = {
  /**
   * 스탠드 — 책상 왼쪽 끝.
   *
   * 원래 오른쪽 끝(1372)에 있었는데 그 자리를 아이패드에 내줬습니다.
   * 책상 오른쪽 320px 안에 스탠드와 아이패드가 같이 들어가지 않습니다.
   * 왼쪽으로 옮기면 책꽂이 앞에 조금 걸치는데, 책상 위 스탠드로는 자연스럽습니다.
   */
  lamp: { x: -6, w: 128 },
  /** 책꽂이 */
  bookshelf: { x: 96, w: 320, h: 194 },
  /** 흩어진 서류 */
  papers: { x: 448, w: 112 },
  /** 머그 */
  mug: { x: 484, w: 62 },
  /** 키보드 */
  keyboard: { x: 662, w: 288 },
  /** 마우스 — 장식입니다. 누르는 기능 없음 */
  mouse: { x: 984, w: 38 },
  /** 탁상시계 — 모니터 오른쪽 */
  clock: { x: 1150, w: 130 },
} as const;

/**
 * 아이패드 — 책상 오른쪽 끝.
 *
 * 화면 안에 유튜브 플레이어가 들어갑니다.
 * 감추지 않고 기기 모양 그대로 두면, 플레이어가 온전히 보이면서
 * "책상에 세워 둔 아이패드로 음악을 튼다"는 장면이 됩니다.
 *
 * 화면은 4:3 입니다. 아이패드로 읽히는 비율이고,
 * iframe 이 화면을 정확히 채우므로 어색한 여백이 생기지 않습니다.
 */
export const PAD = {
  x: 1292,
  w: 288,
  /** 테두리 두께. 이만큼이 곧 클릭해서 확대하는 자리입니다 */
  bezel: 14,
  /** 거치대에 얹혀 상판에서 살짝 떠 있습니다 */
  lift: 4,
} as const;

/** 화면 = 본체 − 좌우 테두리. 높이는 4:3 으로 따라옵니다. */
export const PAD_SCREEN = {
  w: PAD.w - PAD.bezel * 2,
  h: ((PAD.w - PAD.bezel * 2) * 3) / 4,
} as const;

/**
 * 벽에 붙인 메모.
 *
 * 화면 위에 떠 있던 HUD(이름표·이력서 버튼·진행·날씨·밝기)를 방 안으로 들였습니다.
 * 떠 있는 알약 모양 칩은 장면 위에 얹힌 웹 UI 였고, 벽에 붙은 종이는 방의 일부입니다.
 *
 * 캘린더(372~660) 를 가운데 두고 좌우로 나눠 붙입니다.
 * 한쪽에 몰면 무거워지고, 캘린더와 창 사이 벽이 비어 보입니다.
 *
 * 기울기(deg)는 손으로 붙인 티를 내는 값입니다. 전부 반듯하면 인쇄물처럼 보입니다.
 */
export const NOTES = {
  /** 이름표 — 캘린더 왼쪽 위. 가장 크고 가장 먼저 읽힙니다 */
  brand: { x: 40, y: 92, w: 276, h: 128, deg: -2.4 },
  /** 이력서 — 캘린더 왼쪽 아래. 누르면 열립니다 */
  resume: { x: 88, y: 246, w: 168, h: 162, deg: 2.8 },
  /** 창밖 — 캘린더와 창 사이, 모니터 위쪽 벽. 날씨와 밝기 */
  sky: { x: 742, y: 92, w: 176, h: 176, deg: -3.6 },
} as const;

/**
 * 모니터.
 *
 * 목받침(44) + 받침대(12) 만큼 상판에서 띄웁니다.
 * 화면 높이는 뷰포트 종횡비를 따라 달라지므로 위쪽을 고정할 수 없습니다.
 */
export const MONITOR = { x: 628, w: 442, lift: 56 } as const;

/**
 * 이력서 사물의 자리.
 *
 * 지금은 비어 있습니다. 이력서 내용은 content/resume.ts 에 그대로 있고
 * 상단 "이력서 보기" 로 들어갑니다.
 * 여기에 { id: {x, w} } 를 넣으면 그 물건만 방에 다시 나타납니다.
 */
export const SPOTS: Record<string, { x: number; w: number; bottom?: number }> =
  {};

/* ── CSS 로 바꾸는 helper ───────────────────────────────── */

/** 벽에 붙는 것 — 위쪽 기준 */
export function box(spot: { x: number; y: number; w: number; h: number }) {
  return {
    left: `${spot.x}px`,
    top: `${spot.y}px`,
    width: `${spot.w}px`,
    height: `${spot.h}px`,
  };
}

/** 책상에 놓이는 것 — 바닥 기준. 높이는 내용이 정합니다. */
export function onDesk(spot: {
  x: number;
  w: number;
  h?: number;
  bottom?: number;
}) {
  return {
    left: `${spot.x}px`,
    bottom: `${spot.bottom ?? DESK_BOTTOM}px`,
    width: `${spot.w}px`,
    ...(spot.h ? { height: `${spot.h}px` } : {}),
  };
}

/** 모니터 — 받침대 높이만큼 띄웁니다 */
export function monitorBox() {
  return {
    left: `${MONITOR.x}px`,
    bottom: `${DESK_BOTTOM + MONITOR.lift}px`,
    width: `${MONITOR.w}px`,
  };
}

/** 아이패드 — 거치대 높이만큼 띄웁니다. 높이는 화면 4:3 + 테두리로 정해집니다. */
export function padBox() {
  return {
    left: `${PAD.x}px`,
    bottom: `${DESK_BOTTOM + PAD.lift}px`,
    width: `${PAD.w}px`,
    height: `${PAD_SCREEN.h + PAD.bezel * 2}px`,
  };
}

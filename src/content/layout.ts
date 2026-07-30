/**
 * 서재의 좌표계.
 *
 * 방을 **고정 무대(artboard)** 안에 그리고, 그 무대를 통째로 확대·축소해
 * 화면에 맞춥니다. 그래서 어떤 화면에서도 물건이 가구 위 같은 자리에 있습니다.
 *
 * ── 무대가 둘입니다 (2026-07-30) ──
 * 가로(1600×900)와 세로(820×1440) 두 벌입니다. `useRoomLayout()` 이 화면을 보고 고릅니다.
 *
 * 처음에는 한 벌로 버텨 보려 했습니다. 무대를 통째로 축소하니 세로 화면에서도
 * "깨지지는" 않았지만, cover 로 채우면 **폭이 잘려 모니터만 남습니다.**
 * 세로 화면(390×844)에서 보이는 것은 1600 중 가운데 665 뿐입니다 —
 * 창도 캘린더도 아이패드도 잘려 나갑니다. 값을 조정해서 될 문제가 아니었습니다.
 *
 * ── 세로 무대의 안전 영역 ──
 * cover 는 **높이를 채우고 폭을 자릅니다.** 세로가 긴 화면일수록 더 잘립니다.
 * 820 폭 무대에서 실제로 보이는 것은 대략 **x 90 ~ 730** 입니다.
 * 그 바깥은 잘려도 되는 여백으로만 씁니다.
 *
 * ── 왜 y 가 아니라 bottom 인가 ──
 * "책상에 놓인다" 는 **바닥**에 대한 조건입니다.
 * 위쪽(y)으로 고정하면 물건 높이가 바뀔 때마다 떠오르거나 파묻힙니다.
 * 특히 모니터는 화면 종횡비에 따라 높이가 달라집니다 —
 * 세로 화면에서는 모니터도 세로로 길어집니다.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Spot {
  x: number;
  w: number;
  h?: number;
  bottom?: number;
}
export interface Note extends Box {
  /** 손으로 붙인 티를 내는 기울기. 전부 반듯하면 인쇄물처럼 보입니다 */
  deg: number;
}

/** 책상 위 물건. 세로 무대에서는 없는 것이 있으므로 전부 선택입니다 */
export type PropKey =
  | "lamp"
  | "bookshelf"
  | "papers"
  | "mug"
  | "keyboard"
  | "mouse"
  | "clock";

interface LayoutSpec {
  stage: { w: number; h: number };
  deskTop: number;
  window: Box;
  calendar: Box;
  desk: Box;
  /** 서랍을 상판 좌우 끝에서 얼마나 안쪽에 둘지 */
  drawerInset: number;
  /** 창에 딸린 것들 — 창틀 · 커튼 폭 · 빛줄기 길이 */
  windowTrim: { sill: number; curtain: number; rays: number };
  props: Partial<Record<PropKey, Spot>>;
  pad: { x: number; w: number; bezel: number; lift: number };
  notes: { brand: Note; resume: Note; sky: Note };
  monitor: { x: number; w: number; lift: number };
  /** 줌인했을 때 캘린더·아이패드가 화면의 몇 할을 차지할지 */
  zoom: { cal: number; pad: number };
}

export interface RoomLayout extends LayoutSpec {
  id: "wide" | "tall";
  /** 무대 바닥에서 상판까지. 책상 위 물건이 bottom 으로 씁니다 */
  deskBottom: number;
  /** 화면 = 본체 − 좌우 테두리. 높이는 4:3 으로 따라옵니다 */
  padScreen: { w: number; h: number };
  /** 벽에 붙는 것 — 위쪽 기준 */
  box(s: Box): Record<string, string>;
  /** 책상에 놓이는 것 — 바닥 기준. 높이는 내용이 정합니다 */
  onDesk(s: Spot): Record<string, string>;
  /** 모니터 — 받침대 높이만큼 띄웁니다 */
  monitorBox(): Record<string, string>;
  /** 아이패드 — 거치대 높이만큼 띄웁니다 */
  padBox(): Record<string, string>;
}

function build(id: "wide" | "tall", spec: LayoutSpec): RoomLayout {
  const deskBottom = spec.stage.h - spec.deskTop;
  const screenW = spec.pad.w - spec.pad.bezel * 2;

  return {
    ...spec,
    id,
    deskBottom,
    padScreen: { w: screenW, h: (screenW * 3) / 4 },

    box: (s) => ({
      left: `${s.x}px`,
      top: `${s.y}px`,
      width: `${s.w}px`,
      height: `${s.h}px`,
    }),

    onDesk: (s) => ({
      left: `${s.x}px`,
      bottom: `${s.bottom ?? deskBottom}px`,
      width: `${s.w}px`,
      ...(s.h ? { height: `${s.h}px` } : {}),
    }),

    monitorBox: () => ({
      left: `${spec.monitor.x}px`,
      bottom: `${deskBottom + spec.monitor.lift}px`,
      width: `${spec.monitor.w}px`,
    }),

    padBox: () => ({
      left: `${spec.pad.x}px`,
      bottom: `${deskBottom + spec.pad.lift}px`,
      width: `${spec.pad.w}px`,
      height: `${(screenW * 3) / 4 + spec.pad.bezel * 2}px`,
    }),
  };
}

/* ══════════════════════════════════════════════════════════
   가로 — 책상 앞에 앉아 정면을 보는 시점.
   바닥은 보이지 않고 상판 아래는 서랍이 화면 아래까지 채웁니다.
   ══════════════════════════════════════════════════════════ */
export const WIDE = build("wide", {
  stage: { w: 1600, h: 900 },
  deskTop: 618,

  window: { x: 1052, y: 58, w: 468, h: 372 },
  calendar: { x: 372, y: 70, w: 288, h: 236 },
  /** 상판이 화면 좌우를 넘어가도록 두어 방이 잘린 느낌을 없앱니다 */
  desk: { x: -40, y: 618, w: 1680, h: 34 },
  drawerInset: 200,
  windowTrim: { sill: 18, curtain: 68, rays: 240 },

  props: {
    /** 스탠드 — 왼쪽 끝. 오른쪽 끝은 아이패드에 내줬습니다 */
    lamp: { x: -6, w: 128 },
    bookshelf: { x: 96, w: 320, h: 194 },
    papers: { x: 448, w: 112 },
    mug: { x: 484, w: 62 },
    keyboard: { x: 662, w: 288 },
    /** 마우스는 장식입니다. 누르는 기능이 없습니다 */
    mouse: { x: 984, w: 38 },
    clock: { x: 1150, w: 130 },
  },

  pad: { x: 1292, w: 288, bezel: 14, lift: 4 },

  notes: {
    brand: { x: 40, y: 92, w: 276, h: 128, deg: -2.4 },
    resume: { x: 88, y: 246, w: 168, h: 162, deg: 2.8 },
    sky: { x: 742, y: 92, w: 176, h: 176, deg: -3.6 },
  },

  monitor: { x: 628, w: 442, lift: 56 },
  zoom: { cal: 0.52, pad: 0.62 },
});

/* ══════════════════════════════════════════════════════════
   세로 — 같은 방을 세워 놓은 것입니다.

   가장 크게 달라지는 것은 **모니터**입니다.
   모니터 화면은 뷰포트와 같은 비율이라야 줌인했을 때 딱 맞습니다
   (RoomShell 의 --vp-aspect). 세로 화면에서는 그 비율이 세로로 길어지므로
   모니터도 세로로 서고, 벽의 절반 이상을 차지합니다.

   그래서 벽에 걸린 것들을 모니터 **위와 양옆**으로 흩었습니다.
   창은 위로 넓게, 캘린더와 메모는 좌우 기둥에 나눠 붙였습니다.

   책상 위는 넷만 남겼습니다 — 모니터 · 키보드 · 탁상시계 · 아이패드.
   책꽂이 · 스탠드 · 서류 · 마우스는 세로에서 내렸습니다.
   640px 안에 아홉 개를 늘어놓으면 물건이 아니라 얼룩으로 보입니다.
   ══════════════════════════════════════════════════════════ */
export const TALL = build("tall", {
  stage: { w: 820, h: 1440 },
  deskTop: 1080,

  /** 창은 모니터 위로 넓게. 세로에서 가장 먼저 눈에 드는 자리입니다 */
  window: { x: 148, y: 86, w: 524, h: 248 },
  /** 캘린더는 왼쪽 기둥 */
  calendar: { x: 92, y: 392, w: 162, h: 134 },
  desk: { x: -40, y: 1080, w: 900, h: 30 },
  drawerInset: 96,
  /** 창이 작아진 만큼 딸린 것도 같이 줄입니다 */
  windowTrim: { sill: 12, curtain: 40, rays: 120 },

  props: {
    clock: { x: 92, w: 110 },
    keyboard: { x: 240, w: 300 },
  },

  /** lift 는 목받침(44)+받침대(12) 로 CSS 고정값입니다. 가로와 같아야 발이 상판에 닿습니다 */
  pad: { x: 570, w: 150, bezel: 9, lift: 4 },

  notes: {
    /** 이름표 — 오른쪽 기둥 위. 모니터 오른쪽 끝(560)을 피해 578 부터 */
    brand: { x: 578, y: 372, w: 150, h: 106, deg: -2.4 },
    /** 이력서 — 왼쪽 기둥, 캘린더 아래 */
    resume: { x: 94, y: 552, w: 158, h: 150, deg: 2.8 },
    /** 창밖(날씨·밝기) — 오른쪽 기둥, 이름표 아래 */
    sky: { x: 578, y: 496, w: 148, h: 148, deg: -3.6 },
  },

  monitor: { x: 260, w: 300, lift: 56 },
  /** 세로에서는 줌인 대상이 화면을 거의 채워야 읽힙니다 */
  zoom: { cal: 0.9, pad: 0.9 },
});

/**
 * 이력서 사물의 자리.
 *
 * 지금은 비어 있습니다. 이력서 내용은 content/resume.ts 에 그대로 있고
 * 벽에 붙은 노란 메모로 들어갑니다.
 * 여기에 { id: {x, w} } 를 넣으면 그 물건만 방에 다시 나타납니다.
 */
export const SPOTS: Record<string, Spot> = {};

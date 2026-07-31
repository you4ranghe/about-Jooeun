/**
 * 서재의 좌표계.
 *
 * 방을 **고정 무대(artboard)** 안에 그리고, 그 무대를 통째로 확대·축소해
 * 화면에 맞춥니다. 그래서 어떤 화면에서도 물건이 가구 위 같은 자리에 있습니다.
 *
 * ── 무대는 하나입니다 ──
 * 1600×900 가로 한 벌뿐입니다. **좁은 화면은 방을 그리지 않습니다.**
 *
 * 2026-07-30 에 세로 무대(820×1440)를 만들어 방을 세워 봤지만
 * 시계·모니터·벽이 전부 틀어졌습니다. 좌표를 고쳐도 남는 문제가 둘이었습니다.
 * 모니터 화면은 뷰포트와 같은 비율이라야 줌인이 맞는데 세로에서는 그 비율이
 * 0.46 이라 모니터가 벽의 절반을 차지했고, 손가락으로는 카메라를 다룰 수 없었습니다.
 *
 * 그래서 세로 무대를 지우고 **폰에는 아이폰 홈 화면**을 따로 만들었습니다(docs/08).
 * 좌표를 두 벌 들고 있으면 물건을 옮길 때마다 두 번 고치게 됩니다.
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
   책상 앞에 앉아 정면을 보는 시점.
   바닥은 보이지 않고 상판 아래는 서랍이 화면 아래까지 채웁니다.
   ══════════════════════════════════════════════════════════ */
export const ROOM = build("wide", {
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

/**
 * 이력서 사물의 자리.
 *
 * 지금은 비어 있습니다. 이력서 내용은 content/resume.ts 에 그대로 있고
 * 벽에 붙은 노란 메모로 들어갑니다.
 * 여기에 { id: {x, w} } 를 넣으면 그 물건만 방에 다시 나타납니다.
 */
export const SPOTS: Record<string, Spot> = {};

"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ResumeItem } from "@/content/types";
import { SPOTS } from "@/content/layout";
import { useRoomLayout } from "./useRoomLayout";
import { ObjectArt } from "@/components/art/ObjectArt";
import { DeskClock } from "./DeskClock";
import { DeskShelf } from "./DeskShelf";
import { WallCalendar } from "./WallCalendar";
import { DeskPad } from "./DeskPad";
import { MusicProvider } from "@/components/music/MusicProvider";
import { LoginNotice } from "./LoginNotice";
import { useViewerIsAdmin } from "./useViewerIsAdmin";
import { useSky } from "./useSky";
import { WindowWeather } from "./WindowWeather";
import { WallNotes } from "./WallNotes";
import { RoomStageProvider } from "./RoomStage";
import "@/styles/scene.css";
import "@/styles/shell.css";

/**
 * 서재 = 지속되는 껍데기.
 *
 * 이 컴포넌트는 레이아웃에 있으므로 / ↔ /projects 를 오가도 언마운트되지 않습니다.
 * 라우트의 내용(children)은 모니터 화면 안에 들어가고,
 * 카메라 위치는 오직 pathname 이 결정합니다. 그래서 뒤로가기가 곧 줌아웃입니다.
 *
 * ── 좌표계 ──
 * 방은 1600×900 고정 무대 안에 그려집니다(content/layout.ts).
 * 카메라 transform 하나가 "무대를 화면에 맞추는 배율"과 "줌"을 함께 담당하므로,
 * 중립 상태도 identity 가 아니라 계산된 값입니다.
 *
 * ── 지금 방에 있는 것 ──
 * 책상 · 모니터 · 탁상시계 · 키보드 · 마우스(장식) · 서류 · 머그 · 스탠드 · 창.
 * 이력서 사물은 전부 내렸습니다. 내용은 resume.ts 에 그대로 있고 "전체 보기"로 들어갑니다.
 * 어떤 물건으로 다시 꺼낼지는 docs/06 의 TODO 입니다.
 */

/** 줌인했을 때 모니터 화면이 차지하는 뷰포트 비율. 나머지 여백에 테두리가 남습니다. */
const FILL = 0.92;
const EASE = "cubic-bezier(.45,.02,.18,1)";

/** 밝기 버튼이 무엇을 하는지 — 아이콘만으로는 알 수 없어서 붙입니다 */
const LIGHT_LABEL = {
  auto: "밝기: 실제 시각을 따름 — 눌러서 낮 고정",
  day: "밝기: 낮 고정 — 눌러서 밤 고정",
  night: "밝기: 밤 고정 — 눌러서 자동",
} as const;

/** 사물을 눌렀을 때: 화면 어디에 둘지(비율)와 기본 배율의 몇 배로 볼지 */
const ITEM_AIM = [0.29, 0.46] as const;
const ITEM_MAG = 2.3;

interface Shot {
  ox: number;
  oy: number;
  s: number;
  tx: number;
  ty: number;
}

const css = (s: Shot) =>
  `translate(${s.tx.toFixed(2)}px,${s.ty.toFixed(2)}px) scale(${s.s.toFixed(4)})`;

/** 서버와 브라우저가 같은 문자열을 그리도록 자릿수를 미리 굳힌 별 좌표 */
const STARS = Array.from({ length: 34 }, (_, i) => {
  const frac = (n: number) => n - Math.floor(n);
  const a = frac(Math.sin(i * 12.9898) * 43758.5453);
  const b = frac(Math.sin(i * 78.233) * 12345.6789);
  const c = frac(Math.sin(i * 39.425) * 24634.6345);
  return {
    left: `${(3 + a * 94).toFixed(3)}%`,
    top: `${(3 + b * 62).toFixed(3)}%`,
    size: c < 0.25 ? "3.5px" : "2px",
    dur: `${(2.6 + a * 3.4).toFixed(2)}s`,
    delay: `${(b * 4).toFixed(2)}s`,
  };
});

export function RoomShell({
  items,
  children,
}: {
  items: ResumeItem[];
  children: React.ReactNode;
}) {
  /**
   * 지금 화면에 맞는 무대. 가로(1600×900)와 세로(820×1440) 두 벌입니다.
   * 카메라 계산이 전부 이 값을 쓰므로 화면을 돌리면 무대째 바뀝니다.
   */
  const L = useRoomLayout();
  /** 화면을 가리는 용도일 뿐입니다. 진짜 방어선은 RLS 입니다. */
  const isAdmin = useViewerIsAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const inScreen = pathname.startsWith("/projects");
  const inCalendar = pathname.startsWith("/calendar");
  const inMusic = pathname.startsWith("/music");
  /** 무언가에 줌인해 있는가. 나가기 버튼 · HUD · Esc 가 모두 이걸 봅니다.
      음악이 빠져 있어 /music 에서는 나가기 버튼이 안 보였습니다. */
  const zoomedIn = inScreen || inCalendar || inMusic;

  const roomRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const calSurfaceRef = useRef<HTMLDivElement>(null);
  const calStageRef = useRef<HTMLDivElement>(null);
  const padSurfaceRef = useRef<HTMLDivElement>(null);
  const padScreenRef = useRef<HTMLDivElement>(null);
  const padStageRef = useRef<HTMLDivElement>(null);
  const camAnim = useRef<Animation | null>(null);
  const lastShot = useRef<Shot | null>(null);
  const settled = useRef(false);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fittedTo = useRef({ w: 0, h: 0 });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [shownId, setShownId] = useState<string | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  /** 밝기: auto = 실제 KST 시각을 따름, day/night = 직접 고정 */
  const [lightMode, setLightMode] = useState<"auto" | "day" | "night">("auto");
  const [listOpen, setListOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  /** 캘린더 오른쪽 패널이 열려 있는가. 카메라가 가운데/왼쪽을 정하는 데 씁니다. */
  const [sidePanel, setSidePanel] = useState(false);

  /* 창밖 — 실제 서울 날씨와 KST 시각. 1시간마다 받아오고 1분마다 다시 계산합니다. */
  const sky = useSky();
  const night =
    lightMode === "auto" ? sky.phase === "night" : lightMode === "night";

  useEffect(() => {
    document.body.dataset.night = String(night);
  }, [night]);

  /* ── 무대를 화면에 맞추는 기본 배율 ────────────
     cover — 화면을 꽉 채우고 넘치는 쪽은 잘립니다.
     contain 이면 위아래에 검은 띠가 생겨 방이 액자 속 그림처럼 보입니다. */
  const baseScale = () =>
    Math.max(window.innerWidth / L.stage.w, window.innerHeight / L.stage.h);

  const baseShot = (): Shot => {
    const s = baseScale();
    return {
      ox: L.stage.w / 2,
      oy: L.stage.h / 2,
      s,
      tx: (window.innerWidth - L.stage.w * s) / 2,
      ty: (window.innerHeight - L.stage.h * s) / 2,
    };
  };

  /** 무대 좌표 기준 중심. offsetLeft 는 transform 의 영향을 받지 않습니다. */
  const centerIn = (el: HTMLElement) => {
    let x = 0;
    let y = 0;
    let n: HTMLElement | null = el;
    while (n && n !== sceneRef.current) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent as HTMLElement | null;
    }
    return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
  };

  /** 무대 위 한 점을 화면의 (aimRX, aimRY) 자리에 배율 scale 로 가져다 놓습니다 */
  const shotFor = (
    el: HTMLElement,
    aimRX: number,
    aimRY: number,
    scale: number,
  ): Shot => {
    const c = centerIn(el);
    return {
      ox: c.x,
      oy: c.y,
      s: scale,
      tx: window.innerWidth * aimRX - c.x * scale,
      ty: window.innerHeight * aimRY - c.y * scale,
    };
  };

  const screenShot = (): Shot | null => {
    const screen = screenRef.current;
    if (!screen?.offsetWidth) return null;
    return shotFor(
      screen,
      0.5,
      0.5,
      (window.innerWidth * FILL) / screen.offsetWidth,
    );
  };

  /**
   * 캘린더로 들어갈 때의 카메라 값.
   *
   * 모니터와 달리 화면을 꽉 채우지 않습니다.
   * 크기는 고정하고 **자리만** 옮깁니다.
   *   패널이 닫혀 있으면 화면 가운데
   *   패널이 열리면 왼쪽으로 밀어 오른쪽을 비웁니다
   *
   * 크기까지 바꾸면 무대 축척을 다시 잡아야 해서 글자가 한 번 튑니다.
   * 자리만 옮기면 transform 하나로 부드럽게 이어집니다.
   */
  const calTarget = () => {
    const paper = calSurfaceRef.current;
    if (!paper?.offsetWidth) return null;
    const aspect = paper.offsetWidth / paper.offsetHeight;
    const h = Math.min(
      window.innerHeight * 0.86,
      (window.innerWidth * L.zoom.cal) / aspect,
    );
    return { w: h * aspect, h, paper };
  };

  const calendarShot = (panelOpen: boolean): Shot | null => {
    const t = calTarget();
    if (!t) return null;
    return shotFor(
      t.paper,
      panelOpen ? 0.31 : 0.5,
      0.5,
      t.w / t.paper.offsetWidth,
    );
  };

  /**
   * 아이패드로 들어갈 때.
   *
   * 캘린더처럼 화면 가운데에 세웁니다. 옆으로 밀 이유가 없습니다 —
   * 재생목록이 밖에 뜨지 않고 **아이패드 화면 안에** 들어가기 때문입니다.
   */
  const padTarget = () => {
    const body = padSurfaceRef.current;
    if (!body?.offsetWidth) return null;
    const aspect = body.offsetWidth / body.offsetHeight;
    const h = Math.min(
      window.innerHeight * 0.84,
      (window.innerWidth * L.zoom.pad) / aspect,
    );
    return { w: h * aspect, h, body };
  };

  const padShot = (): Shot | null => {
    const t = padTarget();
    if (!t) return null;
    return shotFor(t.body, 0.5, 0.5, t.w / t.body.offsetWidth);
  };

  /* ── 모니터 화면 안 무대 크기 맞추기 ──────────
     화면 안 내용을 뷰포트의 FILL 크기로 그린 뒤 화면에 맞게 줄여 둡니다.
     카메라가 그만큼 확대하면 최종 배율이 정확히 1 이 되어 글자가 또렷합니다. */
  const fit = useCallback(() => {
    const room = roomRef.current;
    const screen = screenRef.current;
    const stage = stageRef.current;
    if (!room || !screen || !stage) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    room.style.setProperty("--vp-aspect", String(vw / vh));

    const stageW = Math.round(vw * FILL);
    stage.style.width = `${stageW}px`;
    stage.style.height = `${Math.round(vh * FILL)}px`;
    stage.style.transform = `scale(${screen.offsetWidth / stageW})`;

    // 캘린더 무대도 같은 방식으로 맞춥니다
    const calStage = calStageRef.current;
    const t = calTarget();
    if (calStage && t) {
      calStage.style.width = `${Math.round(t.w)}px`;
      calStage.style.height = `${Math.round(t.h)}px`;
      calStage.style.transform = `scale(${t.paper.offsetWidth / t.w})`;
    }

    /* 아이패드 화면 무대.
       확대했을 때의 실제 화면 크기로 내용을 그린 뒤 그만큼 줄여 둡니다.
       카메라가 다시 키우면 배율이 1 이 되어 글자가 또렷합니다.

       덤: iframe 의 CSS 크기가 늘 "확대했을 때 크기" 라서
       유튜브가 요구하는 최소 200×200 을 방 화면에서도 자연히 넘깁니다. */
    const padStage = padStageRef.current;
    const padScreen = padScreenRef.current;
    const pt = padTarget();
    if (padStage && padScreen && pt) {
      const mag = pt.w / pt.body.offsetWidth;
      padStage.style.width = `${Math.round(padScreen.offsetWidth * mag)}px`;
      padStage.style.height = `${Math.round(padScreen.offsetHeight * mag)}px`;
      padStage.style.transform = `scale(${1 / mag})`;
    }

    fittedTo.current = { w: vw, h: vh };
    // 무대가 바뀌면(가로 ↔ 세로) 캘린더·아이패드의 목표 크기도 달라집니다
  }, [L]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (screenRef.current) ro.observe(screenRef.current);
    return () => ro.disconnect();
  }, [fit]);

  /* ── 화면을 돌렸을 때 ──────────────────────────
     세로/가로가 바뀌면 **무대 자체가 교체**됩니다(820×1440 ↔ 1600×900).
     좌표계가 통째로 달라지므로 축척과 카메라를 새 무대 기준으로 다시 잡습니다.
     크기 변화만 처리하는 아래 resize 핸들러로는 부족합니다 —
     무대 교체는 렌더 결과라 이벤트보다 먼저 일어날 수 있습니다. */
  useLayoutEffect(() => {
    if (!settled.current) return;
    fit();
    const shot = inCalendar
      ? calendarShot(sidePanel)
      : inMusic
        ? padShot()
        : inScreen
          ? screenShot()
          : baseShot();
    if (shot) {
      move(css(shot), null, 0);
      lastShot.current = zoomedIn ? shot : null;
    }
  }, [L.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 카메라 ─────────────────────────────── */
  const move = (target: string, via: string | null, duration: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const computed = getComputedStyle(scene).transform;
    const from = !computed || computed === "none" ? css(baseShot()) : computed;
    camAnim.current?.cancel();
    camAnim.current = null;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      duration === 0
    ) {
      scene.style.transform = target;
      return;
    }
    const frames: Keyframe[] = via
      ? [
          { transform: from },
          { transform: via, offset: 0.5 },
          { transform: target },
        ]
      : [{ transform: from }, { transform: target }];
    const anim = scene.animate(frames, {
      duration,
      easing: EASE,
      fill: "forwards",
    });
    camAnim.current = anim;
    anim.onfinish = () => {
      scene.style.transform = target;
      anim.cancel();
      if (camAnim.current === anim) camAnim.current = null;
    };
  };

  /* ── 주소가 카메라를 결정한다 ─────────────── */
  useLayoutEffect(() => {
    if (!sceneRef.current) return;
    const duration = settled.current ? 1050 : 0;

    if (inScreen || inCalendar || inMusic) {
      setActiveId(null);
      setShownId(null);
      const shot = inCalendar
        ? calendarShot(sidePanel)
        : inMusic
          ? padShot()
          : screenShot();
      if (shot) {
        move(css(shot), null, duration);
        lastShot.current = shot;
      }
    } else if (!activeId) {
      move(css(baseShot()), null, duration);
      lastShot.current = null;
    }
    settled.current = true;
  }, [inScreen, inCalendar, inMusic]); // eslint-disable-line react-hooks/exhaustive-deps

  /** 사물을 눌렀을 때. SPOTS 에 자리가 있는 항목만 방에 있습니다. */
  const openItem = (id: string) => {
    setSeen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    const el = roomRef.current?.querySelector<HTMLElement>(
      `[data-thing="${id}"]`,
    );

    // 방에 놓이지 않은 항목은 카메라를 움직이지 않고 카드만 엽니다
    if (!el || !sceneRef.current) {
      setShownId(id);
      return;
    }

    const shot = shotFor(el, ITEM_AIM[0], ITEM_AIM[1], baseScale() * ITEM_MAG);
    const switching = activeId !== null && activeId !== id;

    let via: string | null = null;
    let duration = 950;
    if (switching && lastShot.current) {
      // 한 번 물러섰다가 건너가서 다시 다가간다
      const prev = lastShot.current;
      const midS = Math.max(baseScale(), Math.min(prev.s, shot.s) * 0.55);
      const mox = (prev.ox + shot.ox) / 2;
      const moy = (prev.oy + shot.oy) / 2;
      via = `translate(${(window.innerWidth * ITEM_AIM[0] - mox * midS).toFixed(2)}px,${(
        window.innerHeight * ITEM_AIM[1] -
        moy * midS
      ).toFixed(2)}px) scale(${midS.toFixed(4)})`;
      duration =
        1000 +
        Math.min(
          Math.hypot(shot.ox - prev.ox, shot.oy - prev.oy) / L.stage.w,
          1,
        ) *
          500;
    }

    move(css(shot), via, duration);
    lastShot.current = shot;
    setActiveId(id);

    if (swapTimer.current) clearTimeout(swapTimer.current);
    if (switching) {
      swapTimer.current = setTimeout(
        () => setShownId(id),
        Math.round(duration * 0.42),
      );
    } else {
      setShownId(id);
    }
  };

  const closeItem = useCallback(() => {
    if (swapTimer.current) clearTimeout(swapTimer.current);
    move(css(baseShot()), null, 820);
    lastShot.current = null;
    setActiveId(null);
    setShownId(null);
  }, []);

  /* ── 키보드 ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (listOpen) setListOpen(false);
        else if (zoomedIn) router.push("/");
        else closeItem();
        return;
      }
      if (!shownId || zoomedIn) return;
      const i = items.findIndex((it) => it.id === shownId);
      if (i < 0) return;
      if (e.key === "ArrowRight") openItem(items[(i + 1) % items.length].id);
      if (e.key === "ArrowLeft")
        openItem(items[(i - 1 + items.length) % items.length].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* 창 크기 변화. 모바일 주소창이 접히며 나는 높이 변화는 무시합니다. */
  useEffect(() => {
    const onResize = () => {
      if (!sceneRef.current) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const was = fittedTo.current;
      if (vw === was.w && Math.abs(vh - was.h) < 160) return;

      fit();
      if (inCalendar || inMusic) {
        const shot = inMusic ? padShot() : calendarShot(sidePanel);
        if (shot) {
          move(css(shot), null, 0);
          lastShot.current = shot;
        }
      } else if (inScreen) {
        const shot = screenShot();
        if (shot) {
          move(css(shot), null, 0);
          lastShot.current = shot;
        }
      } else if (activeId) {
        const el = roomRef.current?.querySelector<HTMLElement>(
          `[data-thing="${activeId}"]`,
        );
        if (el) {
          const shot = shotFor(
            el,
            ITEM_AIM[0],
            ITEM_AIM[1],
            baseScale() * ITEM_MAG,
          );
          move(css(shot), null, 0);
          lastShot.current = shot;
        }
      } else {
        move(css(baseShot()), null, 0);
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [inScreen, inCalendar, inMusic, sidePanel, activeId, fit]);

  /* 패널이 열리고 닫힐 때 캘린더를 가운데 ↔ 왼쪽으로 부드럽게 옮깁니다.
     주소가 바뀌는 게 아니라 자리만 바뀌므로 조금 짧게 움직입니다. */
  useEffect(() => {
    if (!inCalendar || !settled.current) return;
    const shot = calendarShot(sidePanel);
    if (shot) {
      move(css(shot), null, 720);
      lastShot.current = shot;
    }
  }, [sidePanel]); // eslint-disable-line react-hooks/exhaustive-deps

  /* 캘린더를 벗어나면 패널 상태도 초기화합니다.
     음악은 더 이상 옆 패널을 쓰지 않습니다 — 재생목록이 아이패드 화면 안으로 들어갔습니다. */
  useEffect(() => {
    if (!inCalendar) setSidePanel(false);
  }, [inCalendar]);

  useEffect(() => {
    router.prefetch("/projects");
  }, [router]);

  const shown = items.find((it) => it.id === shownId) ?? null;
  const readCount = items.filter((it) => seen.has(it.id)).length;

  return (
    <MusicProvider>
      <div
        ref={roomRef}
        className="room"
        data-zoom={activeId ? "on" : "off"}
        data-screen={inScreen ? "on" : "off"}
        data-cal={inCalendar ? "on" : "off"}
        data-music={inMusic ? "on" : "off"}
        data-night={String(night)}
        data-phase={lightMode === "auto" ? sky.phase : lightMode}
        data-cond={sky.condition}
        data-season={sky.season}
      >
        <div ref={sceneRef} className="scene">
          {/* ── 벽 · 창 ── */}
          <div className="layer l-sky">
            <div className="wall">
              <span className="wall__paper" />
              <span className="wall__bounce" />
              <span className="wall__light" />
              <span className="wall__rail" />
            </div>

            <div className="win" style={L.box(L.window)}>
              <span className="win__day" />
              <span className="win__night">
                {STARS.map((s, i) => (
                  <span
                    key={i}
                    className="win__star"
                    style={{
                      left: s.left,
                      top: s.top,
                      width: s.size,
                      height: s.size,
                      animationDuration: s.dur,
                      animationDelay: s.delay,
                    }}
                  />
                ))}
              </span>
              {/* 흐린 날 하늘을 눌러 앉히는 층. 해·달보다 뒤에 있어야 가리지 않습니다. */}
              <span className="win__sky-dim" />
              {/* 해와 달은 실제 일출·일몰에 맞춰 창을 가로지릅니다.
                  ready 전에는 CSS 기본 자리에 둡니다 — 서버는 "지금"을 모릅니다. */}
              <span
                className="win__sun"
                style={
                  sky.ready
                    ? { left: `${sky.bodyX}%`, top: `${sky.bodyY}%` }
                    : undefined
                }
              />
              <span
                className="win__moon"
                style={
                  sky.ready
                    ? { left: `${sky.bodyX}%`, top: `${sky.bodyY}%` }
                    : undefined
                }
              />
              <span className="win__shoot" />
              <span className="win__shoot" />
              <span className="win__hill" />
              <span className="win__hill win__hill--back" />
              <span className="win__cloud" />
              <span className="win__cloud" />
              <span className="win__cloud" />
              {[1.7, 2].map((w, i) => (
                <span className="win__bird" key={i}>
                  <svg viewBox="0 0 24 12" role="presentation">
                    <path
                      d="M2 8c3.5-6 6-1.5 10-3.5 3.5 2 6-2.5 10 3.5"
                      fill="none"
                      stroke="#4A3550"
                      strokeWidth={w}
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              ))}
              <WindowWeather />
              <span className="win__bar-v" />
              <span className="win__bar-v" />
              <span className="win__bar-h" />
              <span className="win__glass" />
            </div>
            <div
              className="win__sill"
              style={{
                left: L.window.x - L.windowTrim.sill,
                top: L.window.y + L.window.h + 14,
                width: L.window.w + L.windowTrim.sill * 2,
                height: 16,
              }}
            />
            <div
              className="curtain"
              style={{
                left: L.window.x - L.windowTrim.curtain - 6,
                top: L.window.y - 16,
                width: L.windowTrim.curtain,
                height: L.window.h + 56,
              }}
            />
            <div
              className="rays"
              style={{
                left: L.window.x - L.windowTrim.rays,
                top: L.window.y,
                width: L.window.w + L.windowTrim.rays,
                height: L.stage.h * 0.6,
              }}
            />
          </div>

          {/* ── 벽에 걸린 것 ──
            캘린더를 숨기지 않고 벽에 남겨 둡니다. 비로그인이면 안내를 띄웁니다.
            장면의 일부로 남으면서 "여긴 주인 것" 이라고 정직하게 말하는 쪽입니다. */}
          <div className="layer l-wall">
            {/* 화면에 떠 있던 HUD 를 벽으로 옮긴 것들 */}
            <WallNotes
              readCount={readCount}
              total={items.length}
              onOpenResume={() => setListOpen(true)}
              sky={sky}
              lightMode={lightMode}
              onCycleLight={() =>
                setLightMode((m) =>
                  m === "auto" ? "day" : m === "day" ? "night" : "auto",
                )
              }
              lightLabel={LIGHT_LABEL[lightMode]}
            />

            <WallCalendar
              onOpen={() =>
                isAdmin ? router.push("/calendar") : setNoticeOpen(true)
              }
              surfaceRef={calSurfaceRef}
              stageRef={calStageRef}
              zoomed={inCalendar}
            >
              {inCalendar ? (
                <RoomStageProvider value={{ setSidePanel }}>
                  {children}
                </RoomStageProvider>
              ) : null}
            </WallCalendar>
          </div>

          {/* ── 책상 ──
            상판이 화면 좌우를 넘어가고 아래는 서랍이 바닥까지 채웁니다.
            바닥을 보여주지 않으므로 책상 앞에 앉은 시점이 됩니다. */}
          <div className="layer l-desk">
            <div className="desk" style={L.box(L.desk)}>
              <span className="desk__edge" />
              <span className="desk__grain" />
              <span className="desk__pool" />
            </div>
            <div
              className="deskFront"
              style={{ top: L.desk.y + L.desk.h }}
            >
              <span
                className="deskFront__drawer"
                style={{ left: L.drawerInset }}
              >
                <i />
                <i />
              </span>
              <span
                className="deskFront__drawer"
                style={{ right: L.drawerInset }}
              >
                <i />
                <i />
              </span>
            </div>

            {/* 책상 왼쪽 책꽂이 — 바닥이 상판에 닿습니다 */}
            <DeskShelf />

            {/* 아래 물건들은 **세로 무대에 없는 것이 있습니다.**
                좁은 화면에 아홉 개를 늘어놓으면 물건이 아니라 얼룩이 됩니다.
                무엇이 놓이는지는 content/layout.ts 의 props 가 정합니다. */}
            {L.props.keyboard && (
              <div className="keyboard" style={L.onDesk(L.props.keyboard)} />
            )}
            {/* 마우스는 장식입니다. 누르는 기능이 없습니다. */}
            {L.props.mouse && (
              <div
                className="mouse"
                style={L.onDesk(L.props.mouse)}
                aria-hidden="true"
              />
            )}
            {L.props.papers && (
              <div className="papers" style={L.onDesk(L.props.papers)}>
                <i />
                <i />
                <i />
              </div>
            )}
            {L.props.mug && (
              <div className="mug" style={L.onDesk(L.props.mug)}>
                <span className="mug__body" />
                <span className="mug__handle" />
              </div>
            )}

            {L.props.lamp && (
            <div className="lamp" style={L.onDesk(L.props.lamp)}>
              <span className="lamp__glow" />
              <svg viewBox="0 0 90 118" role="presentation">
                <path
                  d="M22 112h44"
                  stroke="#3D3229"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <ellipse
                  cx="44"
                  cy="110"
                  rx="24"
                  ry="6"
                  fill="#5A4636"
                  stroke="#3D3229"
                  strokeWidth="2.4"
                />
                <path
                  d="M44 106V58"
                  stroke="#5A4636"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M44 58L70 30"
                  stroke="#5A4636"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M44 16h34l10 30H52z"
                  fill="#B8944E"
                  stroke="#8A6A31"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                />
                <circle cx="70" cy="45" r="5" fill="#FFF3C4" />
              </svg>
            </div>
            )}

            {/* 탁상시계 — 실제 KST 를 초 단위로 */}
            {L.props.clock && (
              <div className="clockSpot" style={L.onDesk(L.props.clock)}>
                <DeskClock />
              </div>
            )}

            {/* 책상 오른쪽 끝 아이패드. 화면 안이 유튜브 플레이어입니다. */}
            <DeskPad
              onOpen={() => router.push("/music")}
              zoomed={inMusic}
              surfaceRef={padSurfaceRef}
              screenRef={padScreenRef}
              stageRef={padStageRef}
            >
              {inMusic ? children : null}
            </DeskPad>
          </div>

          {/* ── 모니터 + (있다면) 이력서 사물 ── */}
          <div className="layer l-things">
            <div
              className="mon"
              style={L.monitorBox()}
              data-active={inScreen ? "true" : "false"}
            >
              <span className="mon__glow" />
              <span className="mon__bezel">
                <span ref={screenRef} className="mon__screen">
                  {/* 캘린더로 들어가 있을 때는 내용이 그쪽으로 갑니다 */}
                  <div ref={stageRef} className="mon__stage">
                    {inCalendar || inMusic ? null : children}
                  </div>
                  <span className="mon__glare" />
                </span>
              </span>
              <span className="mon__neck" />
              <span className="mon__foot" />
              {!inScreen && (
                <button
                  type="button"
                  className="mon__hit"
                  onClick={() => router.push("/projects")}
                  aria-label="모니터 — 켜져 있는 컴퓨터 화면 보기"
                />
              )}
              <span className="thing__tip">모니터 · 컴퓨터가 켜져 있음 →</span>
            </div>

            {/* SPOTS 에 자리가 있는 항목만 방에 나타납니다. 지금은 비어 있습니다. */}
            {items.map((item) => {
              const spot = SPOTS[item.id];
              if (!spot) return null;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="thing"
                  data-thing={item.id}
                  data-seen={String(seen.has(item.id))}
                  data-active={String(activeId === item.id)}
                  style={L.onDesk(spot)}
                  onClick={() => openItem(item.id)}
                  aria-label={`${item.category} — ${item.title}`}
                  aria-expanded={activeId === item.id}
                  tabIndex={zoomedIn ? -1 : 0}
                >
                  <ObjectArt art={item.art} />
                  <span className="thing__tip">{item.tip}</span>
                </button>
              );
            })}
          </div>

          <span className="nightwash" />
        </div>
        <span className="vignette" />

        {/* ── 화면에서 나가기 ── */}
        <button
          type="button"
          className="exit"
          onClick={() => router.push("/")}
          data-on={zoomedIn ? "true" : "false"}
          tabIndex={zoomedIn ? 0 : -1}
        >
          ← 작업실로 나가기
        </button>

        <LoginNotice open={noticeOpen} onClose={() => setNoticeOpen(false)} />

        <p
          className="guide"
          data-on={
            !shownId && !zoomedIn && !listOpen && !noticeOpen ? "true" : "false"
          }
        >
          <span className="guide__dot" />
          모니터를 누르면 컴퓨터 화면 · 이력서는 벽에 붙은 메모에서
        </p>

        {/* ── 이력서 카드 ──
          12개를 모두 마크업에 남기고 활성 항목만 보여 줍니다. */}
        <aside
          className="card-panel"
          data-open={shown ? "true" : "false"}
          aria-hidden={!shown}
          inert={!shown}
        >
          <button
            type="button"
            className="card-panel__close"
            onClick={closeItem}
            aria-label="닫기"
          >
            ×
          </button>
          {items.map((item) => (
            <article
              key={item.id}
              hidden={item.id !== shownId}
              className="card"
            >
              <div className="card__obj">
                <ObjectArt art={item.art} />
              </div>
              <p className="card__cat">{item.category}</p>
              <h2 className="card__h">{item.title}</h2>
              <p className="card__lead">{item.lead}</p>

              {item.rows && (
                <dl className="card__rows">
                  {item.rows.map((row) => (
                    <div className="card__row" key={row.label + row.value}>
                      <dt>{row.label}</dt>
                      <dd>
                        <b>{row.value}</b>
                        {row.note && <small>{row.note}</small>}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {item.chips && (
                <ul className="card__chips">
                  {item.chips.map((chip) => (
                    <li key={chip.name} data-hot={chip.hot ? "true" : "false"}>
                      {chip.name}
                    </li>
                  ))}
                </ul>
              )}

              <div className="card__body">
                {item.body.map((paragraph, i) => (
                  // 저장소 안의 신뢰된 문자열이며 <strong> 만 씁니다
                  <p key={i} dangerouslySetInnerHTML={{ __html: paragraph }} />
                ))}
              </div>

              <div className="card__nav">
                <button
                  type="button"
                  onClick={() => {
                    const i = items.findIndex((it) => it.id === item.id);
                    openItem(items[(i - 1 + items.length) % items.length].id);
                  }}
                >
                  ← 이전
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const i = items.findIndex((it) => it.id === item.id);
                    openItem(items[(i + 1) % items.length].id);
                  }}
                >
                  다음 →
                </button>
              </div>

              {item.links && (
                <div className="card__links">
                  {item.links.map((link) => (
                    <a
                      key={link.href + link.label}
                      href={link.href}
                      data-ghost={link.ghost ? "true" : "false"}
                      {...(link.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener" }
                        : {})}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </article>
          ))}
        </aside>

        {/* ── 이력서 목록 ── */}
        {listOpen && (
          <div
            className="sheet"
            onClick={(e) => {
              if (e.target === e.currentTarget) setListOpen(false);
            }}
          >
            <button
              type="button"
              className="sheet__close"
              onClick={() => setListOpen(false)}
              aria-label="닫기"
            >
              ×
            </button>
            <div className="sheet__in">
              <h2>이력서</h2>
              <p>
                12개 항목입니다. 프로젝트는 책상 위 모니터 안에 따로 있습니다.
              </p>
              <ul className="sheet__list">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setListOpen(false);
                        openItem(item.id);
                      }}
                    >
                      <span className="sheet__art">
                        <ObjectArt art={item.art} />
                      </span>
                      <span className="sheet__t">{item.title}</span>
                      <span className="sheet__s">{item.short}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="sheet__gal"
                onClick={() => {
                  setListOpen(false);
                  router.push("/projects");
                }}
              >
                <span className="sheet__art">
                  <svg viewBox="0 0 100 80" role="presentation">
                    <rect
                      x="2"
                      y="2"
                      width="96"
                      height="60"
                      rx="9"
                      fill="#3D3229"
                    />
                    <rect
                      x="8"
                      y="8"
                      width="84"
                      height="48"
                      rx="4"
                      fill="#8FB8C4"
                    />
                    <rect
                      x="29"
                      y="70"
                      width="42"
                      height="8"
                      rx="4"
                      fill="#3D3229"
                    />
                    <rect x="42" y="62" width="16" height="9" fill="#2B231C" />
                  </svg>
                </span>
                <span>
                  <b>컴퓨터 화면 열기</b>
                  <small>바탕화면에서 프로젝트를 엽니다 · /projects</small>
                </span>
                <span className="sheet__s">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </MusicProvider>
  );
}

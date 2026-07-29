"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ResumeItem } from "@/content/types";
import { STAGE, FURNITURE, SPOTS, PROPS, MONITOR, place, box } from "@/content/layout";
import { ObjectArt } from "@/components/art/ObjectArt";
import { DeskClock } from "./DeskClock";
import { Bookcase } from "./Bookcase";
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
 * 카메라 transform 하나가 "무대를 화면에 맞추는 배율"과 "줌"을 함께 담당합니다.
 * 그래서 중립 상태도 identity 가 아니라 계산된 값입니다.
 */

/** 줌인했을 때 모니터 화면이 차지하는 뷰포트 비율. 나머지 여백에 테두리가 남습니다. */
const FILL = 0.92;
const EASE = "cubic-bezier(.45,.02,.18,1)";

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

export function RoomShell({ items, children }: { items: ResumeItem[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const inScreen = pathname.startsWith("/projects");

  const roomRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const camAnim = useRef<Animation | null>(null);
  const lastShot = useRef<Shot | null>(null);
  const settled = useRef(false);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fittedTo = useRef({ w: 0, h: 0 });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [shownId, setShownId] = useState<string | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [night, setNight] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.night = String(night);
  }, [night]);

  /* ── 무대를 화면에 맞추는 기본 배율 ────────────
     cover — 화면을 꽉 채우고 넘치는 쪽은 잘립니다.
     contain 으로 하면 위아래에 검은 띠가 생겨 방이 액자 속 그림처럼 보입니다. */
  const baseScale = () => Math.max(window.innerWidth / STAGE.w, window.innerHeight / STAGE.h);

  const baseShot = (): Shot => {
    const s = baseScale();
    return {
      ox: STAGE.w / 2,
      oy: STAGE.h / 2,
      s,
      tx: (window.innerWidth - STAGE.w * s) / 2,
      ty: (window.innerHeight - STAGE.h * s) / 2,
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
  const shotFor = (el: HTMLElement, aimRX: number, aimRY: number, scale: number): Shot => {
    const c = centerIn(el);
    const aimX = window.innerWidth * aimRX;
    const aimY = window.innerHeight * aimRY;
    return { ox: c.x, oy: c.y, s: scale, tx: aimX - c.x * scale, ty: aimY - c.y * scale };
  };

  /** 모니터 화면이 뷰포트를 FILL 만큼 차지하도록 하는 카메라 값 */
  const screenShot = (): Shot | null => {
    const screen = screenRef.current;
    if (!screen?.offsetWidth) return null;
    return shotFor(screen, 0.5, 0.5, (window.innerWidth * FILL) / screen.offsetWidth);
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
    fittedTo.current = { w: vw, h: vh };
  }, []);

  useLayoutEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (screenRef.current) ro.observe(screenRef.current);
    return () => ro.disconnect();
  }, [fit]);

  /* ── 카메라 ─────────────────────────────── */
  const move = (target: string, via: string | null, duration: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const computed = getComputedStyle(scene).transform;
    const from = !computed || computed === "none" ? css(baseShot()) : computed;
    camAnim.current?.cancel();
    camAnim.current = null;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || duration === 0) {
      scene.style.transform = target;
      return;
    }
    const frames: Keyframe[] = via
      ? [{ transform: from }, { transform: via, offset: 0.5 }, { transform: target }]
      : [{ transform: from }, { transform: target }];
    const anim = scene.animate(frames, { duration, easing: EASE, fill: "forwards" });
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

    if (inScreen) {
      setActiveId(null);
      setShownId(null);
      const shot = screenShot();
      if (shot) {
        move(css(shot), null, duration);
        lastShot.current = shot;
      }
    } else if (!activeId) {
      move(css(baseShot()), null, duration);
      lastShot.current = null;
    }
    settled.current = true;
  }, [inScreen]); // eslint-disable-line react-hooks/exhaustive-deps

  const openItem = (id: string) => {
    setSeen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    const el = roomRef.current?.querySelector<HTMLElement>(`[data-thing="${id}"]`);
    if (!el || !sceneRef.current) return;

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
      const aimX = window.innerWidth * ITEM_AIM[0];
      const aimY = window.innerHeight * ITEM_AIM[1];
      via = `translate(${(aimX - mox * midS).toFixed(2)}px,${(aimY - moy * midS).toFixed(2)}px) scale(${midS.toFixed(4)})`;
      duration = 1000 + Math.min(Math.hypot(shot.ox - prev.ox, shot.oy - prev.oy) / STAGE.w, 1) * 500;
    }

    move(css(shot), via, duration);
    lastShot.current = shot;
    setActiveId(id);

    if (swapTimer.current) clearTimeout(swapTimer.current);
    if (switching) {
      swapTimer.current = setTimeout(() => setShownId(id), Math.round(duration * 0.42));
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
        else if (inScreen) router.push("/");
        else closeItem();
        return;
      }
      if (!activeId || inScreen) return;
      const i = items.findIndex((it) => it.id === activeId);
      if (i < 0) return;
      if (e.key === "ArrowRight") openItem(items[(i + 1) % items.length].id);
      if (e.key === "ArrowLeft") openItem(items[(i - 1 + items.length) % items.length].id);
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
      if (inScreen) {
        const shot = screenShot();
        if (shot) {
          move(css(shot), null, 0);
          lastShot.current = shot;
        }
      } else if (activeId) {
        const el = roomRef.current?.querySelector<HTMLElement>(`[data-thing="${activeId}"]`);
        if (el) {
          const shot = shotFor(el, ITEM_AIM[0], ITEM_AIM[1], baseScale() * ITEM_MAG);
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
  }, [inScreen, activeId, fit]);

  useEffect(() => {
    router.prefetch("/projects");
  }, [router]);

  const shown = items.find((it) => it.id === shownId) ?? null;
  const readCount = items.filter((it) => seen.has(it.id)).length;

  return (
    <div
      ref={roomRef}
      className="room"
      data-zoom={activeId ? "on" : "off"}
      data-screen={inScreen ? "on" : "off"}
      data-night={String(night)}
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

          <div className="win" style={box(FURNITURE.window)}>
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
            <span className="win__sun" />
            <span className="win__moon" />
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
            <span className="win__bar-v" />
            <span className="win__bar-v" />
            <span className="win__bar-h" />
            <span className="win__glass" />
          </div>
          <div
            className="win__sill"
            style={{
              left: FURNITURE.window.x - 18,
              top: FURNITURE.window.y + FURNITURE.window.h + 14,
              width: FURNITURE.window.w + 36,
              height: 16,
            }}
          />
          <div
            className="curtain"
            style={{
              left: FURNITURE.window.x - 66,
              top: FURNITURE.window.y - 16,
              width: 72,
              height: FURNITURE.window.h + 60,
            }}
          />
          <div
            className="rays"
            style={{
              left: FURNITURE.window.x - 220,
              top: FURNITURE.window.y,
              width: FURNITURE.window.w + 220,
              height: 560,
            }}
          />
        </div>

        {/* ── 벽 장식 ── */}
        <div className="layer l-wall">
          <div className="frameBox" style={box(FURNITURE.frame)} />
        </div>

        {/* ── 가구 ── */}
        <div className="layer l-furniture">
          <Bookcase />
        </div>

        {/* ── 책상 ── */}
        <div className="layer l-desk">
          <div className="desk" style={box(FURNITURE.desk)}>
            <span className="desk__edge" />
            <span className="desk__grain" />
            <span className="desk__pool" />
            <span className="desk__leg" style={{ left: 26 }} />
            <span className="desk__leg" style={{ right: 26 }} />
            <span className="desk__drawer" style={{ right: 90 }}>
              <i />
              <i />
            </span>
          </div>

          <div className="mat" style={{ left: PROPS.mat.x, top: PROPS.mat.y, width: PROPS.mat.w }} />
          <div
            className="keyboard"
            style={{ left: PROPS.keyboard.x, top: PROPS.keyboard.y, width: PROPS.keyboard.w }}
          />
          <div
            className="mouse"
            style={{ left: PROPS.mouse.x, top: PROPS.mouse.y, width: PROPS.mouse.w }}
          />
          <div
            className="papers"
            style={{ left: PROPS.papers.x, top: PROPS.papers.y, width: PROPS.papers.w }}
          >
            <i />
            <i />
            <i />
          </div>

          <div className="lamp" style={place(PROPS.lamp)}>
            <span className="lamp__glow" />
            <svg viewBox="0 0 90 118" role="presentation">
              <path d="M22 112h44" stroke="#3D3229" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="44" cy="110" rx="24" ry="6" fill="#5A4636" stroke="#3D3229" strokeWidth="2.4" />
              <path d="M44 106V58" stroke="#5A4636" strokeWidth="6" strokeLinecap="round" />
              <path d="M44 58L70 30" stroke="#5A4636" strokeWidth="6" strokeLinecap="round" />
              <path d="M44 16h34l10 30H52z" fill="#B8944E" stroke="#8A6A31" strokeWidth="2.6" strokeLinejoin="round" />
              <circle cx="70" cy="45" r="5" fill="#FFF3C4" />
            </svg>
          </div>

          {/* 탁상시계 — 실제 KST 를 초 단위로 */}
          <div style={{ position: "absolute", ...place(PROPS.clock) }}>
            <DeskClock />
          </div>
        </div>

        {/* ── 사물 + 모니터 ── */}
        <div className="layer l-things">
          <div className="mon" style={place(MONITOR)} data-active={inScreen ? "true" : "false"}>
            <span className="mon__glow" />
            <span className="mon__bezel">
              <span ref={screenRef} className="mon__screen">
                <div ref={stageRef} className="mon__stage">
                  {children}
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
                aria-label="모니터 — 프로젝트 갤러리 12개 보기"
              />
            )}
            <span className="thing__tip">모니터 · 프로젝트 갤러리 12개 →</span>
          </div>

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
                style={place(spot)}
                onClick={() => openItem(item.id)}
                aria-label={`${item.category} — ${item.title}`}
                aria-expanded={activeId === item.id}
                tabIndex={inScreen ? -1 : 0}
              >
                <ObjectArt art={item.art} />
                <span className="thing__tip">{item.tip}</span>
              </button>
            );
          })}
        </div>

        {/* ── 바닥 ── */}
        <div className="layer l-near">
          <div className="floor">
            <span className="floor__planks" />
          </div>
          <span className="baseboard" />
          <div
            className="rug"
            style={{ left: PROPS.rug.x, top: PROPS.rug.y, width: PROPS.rug.w, height: 108 }}
          />
        </div>

        <span className="nightwash" />
      </div>
      <span className="vignette" />

      {/* ── 화면에서 나가기 ── */}
      <button
        type="button"
        className="exit"
        onClick={() => router.push("/")}
        data-on={inScreen ? "true" : "false"}
        tabIndex={inScreen ? 0 : -1}
      >
        ← 작업실로 나가기
      </button>

      {/* ── HUD ── */}
      <div className="hud" data-on={inScreen ? "false" : "true"}>
        <div className="hud__brand">
          <h1>you4ranghe의 작업실</h1>
          <p>backend engineer · 4 yrs · seoul</p>
        </div>
        <div className="hud__right">
          <span className="hud__pill hud__progress">
            <span className="hud__bar" style={{ width: `${(readCount / items.length) * 100}%` }} />
            <span>
              <b>{readCount}</b> / {items.length} 읽음
            </span>
          </span>
          <button type="button" className="hud__pill" onClick={() => setListOpen(true)} tabIndex={inScreen ? -1 : 0}>
            전체 보기
          </button>
          <button
            type="button"
            className="hud__pill hud__icon"
            onClick={() => setNight((v) => !v)}
            aria-label={night ? "낮으로 바꾸기" : "밤으로 바꾸기"}
            title={night ? "낮으로 되돌리기" : "밤으로 — 물건들이 깨어납니다"}
            tabIndex={inScreen ? -1 : 0}
          >
            {night ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <p className="guide" data-on={!activeId && !inScreen && !listOpen ? "true" : "false"}>
        <span className="guide__dot" />
        물건을 누르면 제 이야기가 · 모니터는 프로젝트 12개 · 밤에는 좀 다릅니다 🌙
      </p>

      {/* ── 이력서 카드 ──
          12개를 모두 마크업에 남기고 활성 항목만 보여 줍니다. */}
      <aside className="card-panel" data-open={shown ? "true" : "false"} aria-hidden={!shown} inert={!shown}>
        <button type="button" className="card-panel__close" onClick={closeItem} aria-label="닫기">
          ×
        </button>
        {items.map((item) => (
          <article key={item.id} hidden={item.id !== shownId} className="card">
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
                    {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
      </aside>

      {/* ── 전체 목록 ── */}
      {listOpen && (
        <div
          className="sheet"
          onClick={(e) => {
            if (e.target === e.currentTarget) setListOpen(false);
          }}
        >
          <button type="button" className="sheet__close" onClick={() => setListOpen(false)} aria-label="닫기">
            ×
          </button>
          <div className="sheet__in">
            <h2>이 방에 있는 것들</h2>
            <p>물건 12개는 저에 대한 이야기입니다. 프로젝트는 모니터 안에 따로 있습니다.</p>
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
                  <rect x="2" y="2" width="96" height="60" rx="9" fill="#3D3229" />
                  <rect x="8" y="8" width="84" height="48" rx="4" fill="#8FB8C4" />
                  <rect x="29" y="70" width="42" height="8" rx="4" fill="#3D3229" />
                  <rect x="42" y="62" width="16" height="9" fill="#2B231C" />
                </svg>
              </span>
              <span>
                <b>프로젝트 갤러리 열기</b>
                <small>저장소 12개를 자세히 · /projects</small>
              </span>
              <span className="sheet__s">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

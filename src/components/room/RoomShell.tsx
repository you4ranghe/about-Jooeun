"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ResumeItem } from "@/content/types";
import { ObjectArt } from "@/components/art/ObjectArt";
import "@/styles/scene.css";
import "@/styles/shell.css";

/**
 * 방 = 지속되는 껍데기.
 *
 * 핵심: 이 컴포넌트는 레이아웃에 있으므로 / ↔ /projects 를 오가도 언마운트되지 않습니다.
 * 라우트의 내용(children)은 모니터 화면 안에 들어가고,
 * 카메라 위치는 오직 pathname 이 결정합니다.
 *
 *   /            → 카메라 중립. 모니터가 책상 위에 작게 보임
 *   /projects*   → 카메라가 모니터 화면을 채움. 테두리는 화면 가장자리에 남음
 *
 * 그래서 "이동"이 따로 없습니다. 주소가 바뀌면 카메라가 움직일 뿐이라
 * 뒤로가기도 자동으로 줌아웃이 됩니다.
 *
 * 화면 안 내용의 크기 맞추기:
 *   무대(stage)를 뷰포트의 FILL 배만 한 논리 크기로 그린 뒤 화면 크기에 맞게 축소해 둡니다.
 *   카메라가 그만큼 확대하면 최종 배율이 정확히 1 이 되어 글자가 원래 크기로 또렷하게 보입니다.
 */

/** 줌인했을 때 화면이 차지하는 뷰포트 비율. 나머지 여백에 모니터 테두리가 남습니다. */
const FILL = 0.92;
/** 이 폭 미만에서는 카메라를 쓰지 않습니다 */
const DESKTOP_MIN = 861;
const EASE = "cubic-bezier(.45,.02,.18,1)";

interface Shot {
  ox: number;
  oy: number;
  s: number;
  tx: number;
  ty: number;
}

const css = (s: Shot) =>
  `translate(${s.tx.toFixed(2)}px,${s.ty.toFixed(2)}px) scale(${s.s.toFixed(4)})`;

const NEUTRAL = "translate(0px,0px) scale(1)";

/**
 * 별 좌표.
 *
 * 값 자체는 결정적이지만, 자릿수를 미리 잘라 **문자열로** 굳혀 둡니다.
 * 소수를 그대로 넘기면 서버와 브라우저가 반올림 자릿수를 다르게 직렬화해
 * 하이드레이션 불일치 경고가 납니다(8.37851% vs 8.378507919551339%).
 */
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
  const settled = useRef(false); // 첫 그림은 애니메이션 없이
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [shownId, setShownId] = useState<string | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [night, setNight] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  /* 밤/낮은 body 에도 걸어야 카드·목록의 얼굴까지 함께 켜집니다 */
  useEffect(() => {
    document.body.dataset.night = String(night);
  }, [night]);

  /* ── 무대 크기 맞추기 ─────────────────────────
     화면(screen)의 종횡비를 뷰포트와 같게 만들면
     줌인했을 때 모니터 화면이 곧 브라우저 창이 됩니다. */
  const fit = useCallback(() => {
    const room = roomRef.current;
    const screen = screenRef.current;
    const stage = stageRef.current;
    if (!room || !screen || !stage) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    room.style.setProperty("--vp-aspect", String(vw / vh));

    const stageW = Math.round(vw * FILL);
    const stageH = Math.round(vh * FILL);
    stage.style.width = `${stageW}px`;
    stage.style.height = `${stageH}px`;

    // 화면 안에 딱 맞도록 미리 줄여 둔다. 카메라가 1/이 값 만큼 확대하면 배율 1.
    const shrink = screen.offsetWidth / stageW;
    stage.style.transform = `scale(${shrink})`;
    room.style.setProperty("--stage-shrink", String(shrink));
  }, []);

  useLayoutEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (screenRef.current) ro.observe(screenRef.current);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [fit]);

  /* ── 카메라 ──────────────────────────────── */
  const isDesktop = () => window.innerWidth >= DESKTOP_MIN;

  /** scene 기준 중심 좌표. offsetLeft 는 transform 의 영향을 받지 않습니다. */
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

  const shotFor = (el: HTMLElement, aimRX: number, aimRY: number, scale: number): Shot => {
    const scene = sceneRef.current!;
    const c = centerIn(el);
    const aimX = scene.offsetWidth * aimRX;
    const aimY = scene.offsetHeight * aimRY;
    return { ox: c.x, oy: c.y, s: scale, tx: aimX - c.x * scale, ty: aimY - c.y * scale };
  };

  /** 모니터 화면이 뷰포트의 FILL 만큼을 차지하도록 하는 카메라 값 */
  const screenShot = (): Shot | null => {
    const screen = screenRef.current;
    if (!screen || !screen.offsetWidth) return null;
    const scale = (window.innerWidth * FILL) / screen.offsetWidth;
    return shotFor(screen, 0.5, 0.5, scale);
  };

  const move = (target: string, via: string | null, duration: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const computed = getComputedStyle(scene).transform;
    const from = !computed || computed === "none" ? NEUTRAL : computed;
    camAnim.current?.cancel();
    camAnim.current = null;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || duration === 0) {
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

  /* ── 주소가 카메라를 결정한다 ────────────────
     이 효과 하나가 "모니터 클릭 → 들어감" 과
     "뒤로가기 → 나옴" 을 동시에 처리합니다. */
  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (!isDesktop()) {
      scene.style.transform = "none";
      settled.current = true;
      return;
    }

    // 첫 그림은 애니메이션 없이 자리를 잡습니다.
    // /projects 로 직접 들어온 경우 방에서 날아오는 연출이 나오면 어색합니다.
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
      move(NEUTRAL, null, duration);
      lastShot.current = null;
    }
    settled.current = true;
  }, [inScreen]); // eslint-disable-line react-hooks/exhaustive-deps

  /** 사물 하나로 카메라를 옮기고 카드를 엽니다. (방에 있을 때만) */
  const openItem = (id: string) => {
    setSeen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

    const el = roomRef.current?.querySelector<HTMLElement>(`[data-thing="${id}"]`);
    if (!el || !sceneRef.current) return;

    if (!isDesktop()) {
      setActiveId(id);
      setShownId(id);
      return;
    }

    const shot = shotFor(el, 0.29, 0.46, 2.4);
    const switching = activeId !== null && activeId !== id;

    let via: string | null = null;
    let duration = 950;
    if (switching && lastShot.current) {
      // 한 번 물러섰다가 건너가서 다시 다가간다
      const prev = lastShot.current;
      const midS = Math.max(1.12, Math.min(prev.s, shot.s) * 0.5);
      const mox = (prev.ox + shot.ox) / 2;
      const moy = (prev.oy + shot.oy) / 2;
      const scene = sceneRef.current;
      const aimX = scene.offsetWidth * 0.29;
      const aimY = scene.offsetHeight * 0.46;
      via = `translate(${(aimX - mox * midS).toFixed(2)}px,${(aimY - moy * midS).toFixed(2)}px) scale(${midS.toFixed(4)})`;
      const gap = Math.hypot(shot.ox - prev.ox, shot.oy - prev.oy) / scene.offsetWidth;
      duration = 1000 + Math.min(gap, 1) * 500;
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

  /** 방 전경으로 되돌립니다. */
  const closeItem = useCallback(() => {
    if (swapTimer.current) clearTimeout(swapTimer.current);
    if (sceneRef.current && window.innerWidth >= DESKTOP_MIN) move(NEUTRAL, null, 820);
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
      if (!activeId || inScreen || window.innerWidth < DESKTOP_MIN) return;
      const i = items.findIndex((it) => it.id === activeId);
      if (i < 0) return;
      if (e.key === "ArrowRight") openItem(items[(i + 1) % items.length].id);
      if (e.key === "ArrowLeft") openItem(items[(i - 1 + items.length) % items.length].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* 창 크기가 바뀌면 애니메이션 없이 다시 맞춥니다 */
  useEffect(() => {
    const onResize = () => {
      if (!sceneRef.current) return;
      if (window.innerWidth < DESKTOP_MIN) {
        sceneRef.current.style.transform = "none";
        return;
      }
      if (inScreen) {
        const shot = screenShot();
        if (shot) {
          move(css(shot), null, 0);
          lastShot.current = shot;
        }
      } else if (activeId) {
        const el = roomRef.current?.querySelector<HTMLElement>(`[data-thing="${activeId}"]`);
        if (el) {
          const shot = shotFor(el, 0.29, 0.46, 2.4);
          move(css(shot), null, 0);
          lastShot.current = shot;
        }
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [inScreen, activeId]);

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
        {/* 벽 + 창 */}
        <div className="layer l-sky">
          <div className="wall">
            <span className="wall__paper" />
            <span className="wall__bounce" />
            <span className="wall__light" />
          </div>
          <div className="win">
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
          <div className="win__sill" />
          <div className="curtain" />
          <div className="rays" />
        </div>

        {/* 벽 장식 */}
        <div className="layer l-wall">
          <div className="clock">
            <i className="clock__h" />
            <i className="clock__m" />
          </div>
          <div className="cork" />
        </div>

        {/* 선반 + 소품 */}
        <div className="layer l-mid">
          <div className="shelf">
            <i />
            <i />
          </div>
          <div className="prop" style={{ left: "43%", top: "21.5%", width: "4.2%" }}>
            <svg viewBox="0 0 40 56" role="presentation">
              <path d="M14 54V22a6 6 0 0112 0v32z" fill="#3FBFA8" stroke="#2C7A5E" strokeWidth="2.2" />
              <path d="M14 34H8a5 5 0 01-5-5v-4" fill="none" stroke="#2C7A5E" strokeWidth="4.6" strokeLinecap="round" />
              <path d="M26 30h6a5 5 0 005-5v-6" fill="none" stroke="#2C7A5E" strokeWidth="4.6" strokeLinecap="round" />
              <rect x="7" y="46" width="26" height="9" rx="3" fill="#C97F52" stroke="#8A5527" strokeWidth="2" />
            </svg>
          </div>
          <div className="prop" style={{ left: "47%", top: "23.8%", width: "3.4%" }}>
            <svg viewBox="0 0 34 30" role="presentation">
              <g stroke="#46304F" strokeWidth="1.8">
                <rect x="2" y="19" width="30" height="9" rx="2" fill="#FF9E8C" />
                <rect x="4" y="11" width="26" height="8" rx="2" fill="#6FC3F0" />
                <rect x="3" y="3" width="28" height="8" rx="2" fill="#FFC93C" />
              </g>
              <g fill="#46304F">
                <circle cx="12" cy="7" r="1.6" />
                <circle cx="22" cy="7" r="1.6" />
              </g>
            </svg>
          </div>
        </div>

        {/* 책상 */}
        <div className="layer l-desk">
          <div className="desk">
            <span className="desk__grain" />
            <span className="desk__pool" />
            <span className="desk__leg desk__leg--l" />
            <span className="desk__leg desk__leg--r" />
          </div>
          <div className="mat" />
          <div className="keyboard" />
          <div className="mouse" />
          <div className="papers">
            <i />
            <i />
            <i />
          </div>
          <div className="lamp">
            <span className="lamp__glow" />
            <svg viewBox="0 0 90 118" role="presentation">
              <path d="M22 112h44" stroke="#46304F" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="44" cy="110" rx="24" ry="6" fill="#7B5AA6" stroke="#4C3670" strokeWidth="2.4" />
              <path d="M44 106V58" stroke="#7B5AA6" strokeWidth="6" strokeLinecap="round" />
              <path d="M44 58L70 30" stroke="#7B5AA6" strokeWidth="6" strokeLinecap="round" />
              <path d="M44 16h34l10 30H52z" fill="#FFC93C" stroke="#C99A17" strokeWidth="2.6" strokeLinejoin="round" />
              <circle cx="70" cy="45" r="5" fill="#FFF3C4" />
            </svg>
          </div>
        </div>

        {/* 사물 + 모니터 */}
        <div className="layer l-things">
          <div className="mon" data-active={inScreen ? "true" : "false"}>
            <span className="mon__glow" />
            <span className="mon__bezel">
              <span ref={screenRef} className="mon__screen">
                {/* 라우트의 내용이 여기 들어옵니다. 카메라가 이 안으로 밀고 들어갑니다. */}
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

          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="thing"
              data-thing={item.id}
              data-seen={String(seen.has(item.id))}
              data-active={String(activeId === item.id)}
              style={{ left: item.pos.left, top: item.pos.top, width: item.pos.width }}
              onClick={() => openItem(item.id)}
              aria-label={`${item.category} — ${item.title}`}
              aria-expanded={activeId === item.id}
              tabIndex={inScreen ? -1 : 0}
            >
              <ObjectArt art={item.art} />
              <span className="thing__tip">{item.tip}</span>
            </button>
          ))}
        </div>

        {/* 바닥 */}
        <div className="layer l-near">
          <div className="floor">
            <span className="baseboard" />
          </div>
          <div className="rug" />
          <div className="strip">
            <i />
            <i />
            <i />
          </div>
        </div>

        {/* 전경 */}
        <div className="layer l-fore">
          <div className="frond frond--l">
            <svg viewBox="0 0 200 200" role="presentation">
              <g fill="#2C7A5E">
                <path d="M0 200C10 120 60 60 130 34c-30 46-46 96-52 166z" />
                <path d="M0 200C34 140 96 108 168 106c-46 26-84 58-108 94z" opacity=".85" />
              </g>
            </svg>
          </div>
          <div className="frond frond--r">
            <svg viewBox="0 0 200 200" role="presentation">
              <g fill="#245F4A">
                <path d="M0 200C6 128 52 66 122 40c-28 48-44 94-50 160z" />
                <path d="M0 200C40 148 100 118 176 118c-50 24-92 52-118 82z" opacity=".85" />
              </g>
            </svg>
          </div>
        </div>

        <span className="nightwash" />
        <span className="vignette" />
      </div>

      {/* ── 화면 안에 있을 때만 뜨는 나가기 버튼 ── */}
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
          12개를 모두 마크업에 남기고 활성 항목만 보여 줍니다.
          이래야 본문이 HTML 소스에 들어가 검색에 걸립니다. */}
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
                  <rect x="2" y="2" width="96" height="60" rx="9" fill="#46304F" />
                  <rect x="8" y="8" width="84" height="48" rx="4" fill="#6FC3F0" />
                  <rect x="29" y="70" width="42" height="8" rx="4" fill="#46304F" />
                  <rect x="42" y="62" width="16" height="9" fill="#3B2942" />
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

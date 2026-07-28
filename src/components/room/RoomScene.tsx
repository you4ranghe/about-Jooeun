"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ResumeItem } from "@/content/types";
import { ObjectArt } from "@/components/art/ObjectArt";
import { PREVIEW_WIDTH } from "./GalleryPreview";
import "@/styles/scene.css";

/**
 * 방 장면 + 카메라.
 *
 * 'use client' 이지만 서버에서도 한 번 렌더링됩니다(App Router 기본).
 * 그래서 이력서 12항목의 본문이 HTML 소스에 그대로 들어가 검색에 걸립니다.
 * 비활성 카드는 hidden 으로 두어 마크업에는 남기고 화면에서만 감춥니다.
 *
 * 카메라는 transform-origin 을 0 0 에 고정하고 translate + scale 만 계산합니다.
 * 원점을 바꾸면 사물에서 사물로 옮길 때 장면이 튑니다.
 */

/** 모바일에서는 카메라를 움직이지 않습니다 (작은 화면에서 줌은 의미가 없고 blur 가 무겁습니다) */
const DESKTOP_MIN = 861;
const EASE = "cubic-bezier(.48,.02,.2,1)";

interface Shot {
  ox: number;
  oy: number;
  s: number;
  aimX: number;
  aimY: number;
  tx: number;
  ty: number;
}

function shotCss(shot: Shot) {
  return `translate(${shot.tx.toFixed(2)}px,${shot.ty.toFixed(2)}px) scale(${shot.s.toFixed(4)})`;
}

const STARS = Array.from({ length: 34 }, (_, i) => {
  // 결정적 난수 — 서버와 클라이언트가 같은 값을 그려야 하이드레이션 경고가 안 납니다
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  const c = Math.sin(i * 39.425) * 24634.6345;
  const frac = (n: number) => n - Math.floor(n);
  return {
    left: 3 + frac(a) * 94,
    top: 3 + frac(b) * 62,
    size: frac(c) < 0.25 ? 3.5 : 2,
    duration: 2.6 + frac(a) * 3.4,
    delay: frac(b) * 4,
  };
});

export function RoomScene({
  items,
  preview,
}: {
  items: ResumeItem[];
  preview: React.ReactNode;
}) {
  const router = useRouter();

  const roomRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const monRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLSpanElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const camAnim = useRef<Animation | null>(null);
  const lastShot = useRef<Shot | null>(null);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [shownId, setShownId] = useState<string | null>(null); // 카드에 실제로 보이는 항목
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [night, setNight] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [screenMode, setScreenMode] = useState(false);

  /* ── 밤/낮: body 에도 걸어야 카드·목록의 얼굴까지 함께 켜집니다 ── */
  useEffect(() => {
    document.body.dataset.night = String(night);
    return () => {
      delete document.body.dataset.night;
    };
  }, [night]);

  /* ── 모니터 미리보기 축척 ── */
  const fitPreview = useCallback(() => {
    const screen = screenRef.current;
    const inner = previewRef.current;
    if (!screen || !inner) return;
    inner.style.transform = `scale(${screen.offsetWidth / PREVIEW_WIDTH})`;
  }, []);

  useLayoutEffect(() => {
    fitPreview();
    const ro = new ResizeObserver(fitPreview);
    if (screenRef.current) ro.observe(screenRef.current);
    return () => ro.disconnect();
  }, [fitPreview]);

  /* ── 카메라 ── */
  const isDesktop = () => window.innerWidth >= DESKTOP_MIN;

  const centerIn = (el: HTMLElement) => {
    let x = 0;
    let y = 0;
    let node: HTMLElement | null = el;
    while (node && node !== sceneRef.current) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
  };

  const shotFor = (el: HTMLElement, aimRX: number, aimRY: number, scale: number): Shot => {
    const scene = sceneRef.current!;
    const c = centerIn(el);
    const aimX = scene.offsetWidth * aimRX;
    const aimY = scene.offsetHeight * aimRY;
    return { ox: c.x, oy: c.y, s: scale, aimX, aimY, tx: aimX - c.x * scale, ty: aimY - c.y * scale };
  };

  const moveCamera = (target: string, via: string | null, duration: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    // 취소하기 전에 지금 그려지고 있는 값을 읽어야 이동 중 끊고 들어와도 이어집니다
    const computed = getComputedStyle(scene).transform;
    const from = !computed || computed === "none" ? "translate(0px,0px) scale(1)" : computed;
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

  const markSeen = (id: string) =>
    setSeen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  /** 사물 하나로 카메라를 옮기고 카드를 엽니다. */
  const openItem = (id: string) => {
    markSeen(id);
    if (screenMode) setScreenMode(false);

    const el = roomRef.current?.querySelector<HTMLElement>(`[data-thing="${id}"]`);
    if (!el || !sceneRef.current) return;

    if (!isDesktop()) {
      // 모바일: 장면은 그대로 두고 바텀 시트만 올립니다
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
      via = `translate(${(shot.aimX - mox * midS).toFixed(2)}px,${(shot.aimY - moy * midS).toFixed(2)}px) scale(${midS.toFixed(4)})`;
      const gap = Math.hypot(shot.ox - prev.ox, shot.oy - prev.oy) / sceneRef.current.offsetWidth;
      duration = 1000 + Math.min(gap, 1) * 500;
    }

    moveCamera(shotCss(shot), via, duration);
    lastShot.current = shot;
    setActiveId(id);

    // 카드 내용은 카메라가 닿을 즈음 바꿉니다
    if (swapTimer.current) clearTimeout(swapTimer.current);
    if (switching) {
      swapTimer.current = setTimeout(() => setShownId(id), Math.round(duration * 0.42));
    } else {
      setShownId(id);
    }
  };

  /** 방 전경으로 되돌립니다. */
  const closeAll = useCallback(() => {
    if (swapTimer.current) clearTimeout(swapTimer.current);
    if (sceneRef.current && window.innerWidth >= DESKTOP_MIN) {
      moveCamera("translate(0px,0px) scale(1)", null, 820);
    }
    lastShot.current = null;
    setActiveId(null);
    setShownId(null);
    setScreenMode(false);
  }, []);

  /** 모니터 화면으로 밀고 들어간 뒤 /projects 로 넘어갑니다. */
  const enterGallery = () => {
    markSeen("__gallery");
    setActiveId(null);
    setShownId(null);

    const screen = screenRef.current;
    if (!screen || !sceneRef.current || !isDesktop()) {
      router.push("/projects");
      return;
    }

    // 화면이 뷰포트를 거의 채울 배율
    const s = Math.min(
      (window.innerWidth * 0.94) / screen.offsetWidth,
      (window.innerHeight * 0.94) / screen.offsetHeight,
    );
    const shot = shotFor(screen, 0.5, 0.5, Math.max(1.6, s));
    const midS = Math.max(1.05, shot.s * 0.32);
    const via = `translate(${(shot.aimX - shot.ox * midS).toFixed(2)}px,${(shot.aimY - shot.oy * midS).toFixed(2)}px) scale(${midS.toFixed(4)})`;

    setScreenMode(true);
    moveCamera(shotCss(shot), via, 900);
    // 카메라가 화면을 채운 뒤 실제 이동 — 주소가 바뀌므로 링크 공유가 됩니다
    setTimeout(() => router.push("/projects"), 760);
  };

  /* ── 키보드 ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (listOpen) setListOpen(false);
        else closeAll();
        return;
      }
      if (!activeId || !window.matchMedia(`(min-width:${DESKTOP_MIN}px)`).matches) return;
      const i = items.findIndex((it) => it.id === activeId);
      if (i < 0) return;
      if (e.key === "ArrowRight") openItem(items[(i + 1) % items.length].id);
      if (e.key === "ArrowLeft") openItem(items[(i - 1 + items.length) % items.length].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ── 창 크기 변화: 애니메이션 없이 즉시 재정렬 ── */
  useEffect(() => {
    const onResize = () => {
      fitPreview();
      if (!activeId || !sceneRef.current) return;
      if (window.innerWidth < DESKTOP_MIN) {
        sceneRef.current.style.transform = "none";
        return;
      }
      const el = roomRef.current?.querySelector<HTMLElement>(`[data-thing="${activeId}"]`);
      if (el) {
        const shot = shotFor(el, 0.29, 0.46, 2.4);
        moveCamera(shotCss(shot), null, 0);
        lastShot.current = shot;
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeId, fitPreview]);

  /* /projects 를 미리 받아 둡니다 — 화면으로 들어갈 때 끊기지 않게 */
  useEffect(() => {
    router.prefetch("/projects");
  }, [router]);

  const shown = items.find((it) => it.id === shownId) ?? null;
  const readCount = items.filter((it) => seen.has(it.id)).length;

  return (
    <div
      ref={roomRef}
      className="room"
      data-zoom={activeId || screenMode ? "on" : "off"}
      data-night={String(night)}
      data-screen={screenMode ? "on" : "off"}
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
                    left: `${s.left}%`,
                    top: `${s.top}%`,
                    width: s.size,
                    height: s.size,
                    animationDuration: `${s.duration}s`,
                    animationDelay: `${s.delay}s`,
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
            <span className="win__bird">
              <svg viewBox="0 0 24 12" role="presentation">
                <path
                  d="M2 8c3.5-6 6-1.5 10-3.5 3.5 2 6-2.5 10 3.5"
                  fill="none"
                  stroke="#4A3550"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="win__bird">
              <svg viewBox="0 0 24 12" role="presentation">
                <path
                  d="M2 8c3.5-6 6-1.5 10-3.5 3.5 2 6-2.5 10 3.5"
                  fill="none"
                  stroke="#4A3550"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
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
              <path
                d="M14 34H8a5 5 0 01-5-5v-4"
                fill="none"
                stroke="#2C7A5E"
                strokeWidth="4.6"
                strokeLinecap="round"
              />
              <path
                d="M26 30h6a5 5 0 005-5v-6"
                fill="none"
                stroke="#2C7A5E"
                strokeWidth="4.6"
                strokeLinecap="round"
              />
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
              <path
                d="M44 16h34l10 30H52z"
                fill="#FFC93C"
                stroke="#C99A17"
                strokeWidth="2.6"
                strokeLinejoin="round"
              />
              <circle cx="70" cy="45" r="5" fill="#FFF3C4" />
            </svg>
          </div>
        </div>

        {/* 사물 + 모니터 */}
        <div className="layer l-things">
          <div ref={monRef} className="mon" data-active={screenMode ? "true" : "false"}>
            <span className="mon__glow" />
            <span className="mon__bezel">
              <span ref={screenRef} className="mon__screen">
                <div ref={previewRef} className="mon__preview">
                  {preview}
                </div>
                <span className="mon__glare" />
              </span>
            </span>
            <span className="mon__neck" />
            <span className="mon__foot" />
            <button
              type="button"
              className="mon__hit"
              onClick={enterGallery}
              aria-label="모니터 — 프로젝트 갤러리 12개 보기"
            />
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

      {/* ── HUD ── */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 transition-opacity duration-500 sm:p-5"
        style={{ opacity: screenMode ? 0 : 1 }}
      >
        <div className="pointer-events-auto rounded-2xl bg-[rgba(255,247,234,.88)] px-4 py-2.5 shadow-[0_12px_30px_rgba(88,52,72,.22)] backdrop-blur">
          <h1 className="m-0 text-base leading-tight sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            you4ranghe의 작업실
          </h1>
          <p
            className="m-0 mt-0.5 text-[10.5px] text-[rgba(70,48,79,.44)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            backend engineer · 4 yrs · seoul
          </p>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
          <span
            className="relative overflow-hidden rounded-full bg-[rgba(255,247,234,.88)] px-4 py-2.5 text-[11.5px] shadow-[0_12px_30px_rgba(88,52,72,.22)] backdrop-blur"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span
              className="absolute inset-y-0 left-0 bg-[rgba(123,90,166,.18)] transition-[width] duration-500"
              style={{ width: `${(readCount / items.length) * 100}%` }}
            />
            <span className="relative">
              <b className="text-[#7B5AA6]">{readCount}</b> / {items.length} 읽음
            </span>
          </span>
          <button
            type="button"
            onClick={() => setListOpen(true)}
            className="cursor-pointer rounded-full bg-[rgba(255,247,234,.88)] px-4 py-2.5 text-[11.5px] shadow-[0_12px_30px_rgba(88,52,72,.22)] backdrop-blur transition hover:-translate-y-px hover:bg-white"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            전체 보기
          </button>
          <button
            type="button"
            onClick={() => setNight((v) => !v)}
            className="grid size-10 cursor-pointer place-items-center rounded-full bg-[rgba(255,247,234,.88)] text-base shadow-[0_12px_30px_rgba(88,52,72,.22)] backdrop-blur transition hover:-translate-y-px hover:bg-white"
            aria-label={night ? "낮으로 바꾸기" : "밤으로 바꾸기"}
            title={night ? "낮으로 되돌리기" : "밤으로 — 물건들이 깨어납니다"}
          >
            {night ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* 안내 */}
      <div
        className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-[rgba(70,48,79,.9)] px-4 py-2.5 text-[11px] text-[#FFF7EA] shadow-[0_14px_32px_rgba(0,0,0,.32)] transition-all duration-500 sm:px-5 sm:text-xs"
        style={{
          fontFamily: "var(--font-mono)",
          opacity: activeId || screenMode || listOpen ? 0 : 1,
          pointerEvents: "none",
        }}
      >
        <span className="size-[7px] rounded-full bg-[#FFC93C]" />
        물건을 누르면 제 이야기가 · 모니터는 프로젝트 12개 · 밤에는 좀 다릅니다 🌙
      </div>

      {/* ── 이력서 카드 ──
          12개를 모두 마크업에 남기고 활성 항목만 보여 줍니다.
          이래야 본문이 HTML 소스에 들어가 검색에 걸립니다. */}
      <aside
        className="card-panel fixed inset-x-0 bottom-0 z-40 flex h-[64%] flex-col gap-3 overflow-y-auto rounded-t-3xl bg-[rgba(255,247,234,.96)] p-6 shadow-[0_-22px_54px_rgba(88,52,72,.36)] backdrop-blur-lg sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-[min(440px,42vw)] sm:rounded-none sm:p-8 sm:shadow-[-26px_0_64px_rgba(88,52,72,.32)]"
        data-open={shown ? "true" : "false"}
        aria-hidden={!shown}
        /* 닫혀 있을 때 안쪽 버튼이 탭 순서에 남지 않도록 */
        inert={!shown}
      >
        <button
          type="button"
          onClick={closeAll}
          className="absolute top-3.5 right-3.5 grid size-10 cursor-pointer place-items-center rounded-full text-xl shadow-[inset_0_0_0_1px_rgba(70,48,79,.2)] transition hover:bg-[#7B5AA6] hover:text-[#FFF7EA]"
          aria-label="닫기"
        >
          ×
        </button>

        {items.map((item) => (
          <article key={item.id} hidden={item.id !== shownId} className="flex flex-1 flex-col gap-3">
            <div className="flex size-[100px] shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[rgba(123,90,166,.14)] to-[rgba(255,201,60,.14)] p-3.5">
              <ObjectArt art={item.art} />
            </div>
            <p
              className="m-0 text-[11px] tracking-[.16em] text-[#7B5AA6]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {item.category}
            </p>
            <h2
              className="m-0 text-2xl leading-snug sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {item.title}
            </h2>
            <p className="m-0 text-[15px] leading-relaxed text-[#46304F]">{item.lead}</p>

            {item.rows && (
              <dl className="m-0 text-sm">
                {item.rows.map((row) => (
                  <div
                    key={row.label + row.value}
                    className="grid grid-cols-[76px_minmax(0,1fr)] gap-3 border-t border-[rgba(70,48,79,.12)] py-2.5 first:border-t-0 first:pt-0"
                  >
                    <span
                      className="pt-0.5 text-[11px] text-[rgba(70,48,79,.44)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {row.label}
                    </span>
                    <span className="leading-relaxed">
                      <b className="block font-medium">{row.value}</b>
                      {row.note && (
                        <small className="mt-0.5 block text-[12.5px] text-[rgba(70,48,79,.72)]">
                          {row.note}
                        </small>
                      )}
                    </span>
                  </div>
                ))}
              </dl>
            )}

            {item.chips && (
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {item.chips.map((chip) => (
                  <li
                    key={chip.name}
                    className={
                      chip.hot
                        ? "rounded-full bg-[rgba(123,90,166,.16)] px-2.5 py-1.5 text-[11px] text-[#5B3E82]"
                        : "rounded-full bg-[rgba(70,48,79,.09)] px-2.5 py-1.5 text-[11px]"
                    }
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {chip.name}
                  </li>
                ))}
              </ul>
            )}

            <div className="text-[14.5px] leading-[1.85] text-[rgba(70,48,79,.72)]">
              {item.body.map((paragraph, i) => (
                // 본문에는 <strong> 만 쓰므로 저장소 안의 신뢰된 문자열입니다
                <p key={i} className="mb-3 last:mb-0" dangerouslySetInnerHTML={{ __html: paragraph }} />
              ))}
            </div>

            <div className="flex gap-2">
              {(["prev", "next"] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => {
                    const i = items.findIndex((it) => it.id === item.id);
                    const next = dir === "next" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
                    openItem(items[next].id);
                  }}
                  className="cursor-pointer rounded-full px-3.5 py-2 text-xs shadow-[inset_0_0_0_1px_rgba(70,48,79,.2)] transition hover:bg-[rgba(70,48,79,.08)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {dir === "prev" ? "← 이전" : "다음 →"}
                </button>
              ))}
            </div>

            {item.links && (
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                {item.links.map((link) => (
                  <a
                    key={link.href + link.label}
                    href={link.href}
                    {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
                    className={
                      link.ghost
                        ? "rounded-full px-4.5 py-3 text-[12.5px] no-underline shadow-[inset_0_0_0_1px_rgba(70,48,79,.25)] transition hover:-translate-y-0.5"
                        : "rounded-full bg-[#7B5AA6] px-4.5 py-3 text-[12.5px] text-[#FFF7EA] no-underline transition hover:-translate-y-0.5"
                    }
                    style={{ fontFamily: "var(--font-mono)" }}
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
          className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(36,26,44,.92)] p-5 backdrop-blur-lg sm:p-14"
          onClick={(e) => {
            if (e.target === e.currentTarget) setListOpen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setListOpen(false)}
            className="absolute top-5 right-5 grid size-11 cursor-pointer place-items-center rounded-full text-[22px] text-[#FFF7EA] shadow-[inset_0_0_0_1px_rgba(255,247,234,.3)]"
            aria-label="닫기"
          >
            ×
          </button>
          <div className="mx-auto max-w-[900px]">
            <h2 className="m-0 mb-1.5 text-2xl text-[#FFF7EA]" style={{ fontFamily: "var(--font-display)" }}>
              이 방에 있는 것들
            </h2>
            <p className="m-0 mb-6 text-sm text-[rgba(255,247,234,.6)]">
              물건 12개는 저에 대한 이야기입니다. 프로젝트는 모니터 안에 따로 있습니다.
            </p>
            <ul className="m-0 mb-6 grid list-none gap-2 p-0 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setListOpen(false);
                      openItem(item.id);
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-[rgba(255,247,234,.08)] p-4 text-left text-[#FFF7EA] transition hover:translate-x-0.5 hover:bg-[rgba(255,247,234,.18)]"
                  >
                    <span className="grid size-9 shrink-0 place-items-center">
                      <ObjectArt art={item.art} />
                    </span>
                    <span className="text-[15.5px] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                      {item.title}
                    </span>
                    <span
                      className="ml-auto shrink-0 text-[10.5px] text-[rgba(255,247,234,.5)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.short}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setListOpen(false);
                enterGallery();
              }}
              className="flex w-full cursor-pointer items-center gap-3.5 rounded-2xl bg-gradient-to-r from-[rgba(111,195,240,.22)] to-[rgba(123,90,166,.22)] p-5 text-left text-[#FFF7EA] shadow-[inset_0_0_0_1px_rgba(140,205,255,.34)] transition hover:-translate-y-0.5"
            >
              <span className="grid size-9 shrink-0 place-items-center">
                <svg viewBox="0 0 100 80" role="presentation">
                  <rect x="2" y="2" width="96" height="60" rx="9" fill="#46304F" />
                  <rect x="8" y="8" width="84" height="48" rx="4" fill="#6FC3F0" />
                  <rect x="29" y="70" width="42" height="8" rx="4" fill="#46304F" />
                  <rect x="42" y="62" width="16" height="9" fill="#3B2942" />
                </svg>
              </span>
              <span>
                <span className="block text-[17px]" style={{ fontFamily: "var(--font-display)" }}>
                  프로젝트 갤러리 열기
                </span>
                <span
                  className="block text-[10.5px] text-[rgba(255,247,234,.5)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  저장소 12개를 자세히 · /projects
                </span>
              </span>
              <span className="ml-auto text-[rgba(255,247,234,.5)]">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

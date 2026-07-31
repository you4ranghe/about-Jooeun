"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ResumeItem } from "@/content/types";
import { PHONE_DOCK, type PhoneAppItem } from "@/content/phone";
import type { Sky } from "@/components/room/useSky";
import { IconArt } from "@/components/desktop/IconArt";
import { MusicWidget } from "./MusicWidget";

/**
 * 홈 화면 — 위젯 둘, 앱 아이콘, 독 (docs/08 §3).
 *
 * ── 왜 시계와 날씨는 앱이 아니라 위젯인가 ──
 * 이 둘이 하는 일은 "이 사이트가 살아 있다" 를 첫 화면에서 보여주는 것입니다.
 * 눌러야 보이면 그 일을 못 합니다. 아이폰에서도 시계·날씨는 위젯 자리입니다.
 *
 * ── 한 번 누르면 열립니다 ──
 * 바탕화면(데스크톱)은 한 번 고르고 두 번 열지만, 폰에서는 한 번입니다.
 * 아이폰이 그렇고, 손가락으로 더블탭하면 확대 제스처와 부딪칩니다.
 */

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"] as const;

function readKst() {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    hh: get("hour").padStart(2, "0"),
    mm: get("minute").padStart(2, "0"),
    date: `${get("weekday")}요일, ${get("month")}월 ${get("day")}일`.replace(
      /([일월화수목금토])요일요일/,
      "$1요일",
    ),
  };
}

const PHASE_WORD: Record<Sky["phase"], string> = {
  dawn: "동트는 중",
  day: "한낮",
  dusk: "해질녘",
  night: "밤",
};

export function PhoneHome({
  apps,
  sky,
  items,
  isAdmin,
  onOpenSheet,
  onLocked,
}: {
  apps: PhoneAppItem[];
  sky: Sky;
  items: ResumeItem[];
  isAdmin: boolean;
  /** 주소가 없는 앱 — 이력서·소개·날씨 */
  onOpenSheet: (s: "resume" | "about" | "weather" | "timeline") => void;
  /** 관리자 전용 앱을 눌렀을 때 */
  onLocked: (title: string) => void;
}) {
  const router = useRouter();
  const [now, setNow] = useState<ReturnType<typeof readKst> | null>(null);

  useEffect(() => {
    setNow(readKst());
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(readKst());
      timer = setTimeout(tick, 60_000 - (Date.now() % 60_000));
    };
    timer = setTimeout(tick, 60_000 - (Date.now() % 60_000));
    const resync = () => {
      if (!document.hidden) setNow(readKst());
    };
    document.addEventListener("visibilitychange", resync);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", resync);
    };
  }, []);

  return (
    <div className="phHome">
      {/* 굴러가는 영역. 독은 이 바깥이라 늘 아래에 붙어 있습니다 */}
      <div className="phHome__scroll">
      {/* ── 위젯 둘 ── */}
      <div className="phWidgets">
        {/* 시계를 누르면 "만든 시간" — 저장소를 언제 얼마나 걸려 만들었는지.
            알람·타이머를 흉내 내면 전부 가짜가 되므로, 이 사이트에 진짜로
            있는 시간 데이터를 보여줍니다 */}
        <button
          type="button"
          className="phW phW--clock"
          data-appicon="timeline"
          onClick={() => onOpenSheet("timeline")}
          aria-label="만든 시간 보기"
        >
          <span className="phW__k">서울</span>
          <span className="phW__time">
            {now ? `${now.hh}:${now.mm}` : "--:--"}
          </span>
          <span className="phW__sub">{now?.date ?? " "}</span>
          <span className="phW__phase">만든 시간 →</span>
        </button>

        {/* 날씨는 눌러서 이번 주를 봅니다 */}
        <button
          type="button"
          className="phW phW--sky"
          data-appicon="weather"
          onClick={() => onOpenSheet("weather")}
          aria-label="이번 주 서울 날씨 보기"
        >
          <span className="phW__k">오늘 서울</span>
          {sky.label ? (
            <>
              <span className="phW__temp">
                {sky.tempC !== null ? `${Math.round(sky.tempC)}°` : "—"}
              </span>
              <span className="phW__sub">{sky.label}</span>
            </>
          ) : (
            <>
              <span className="phW__temp">—</span>
              <span className="phW__sub">날씨를 못 불러왔어요</span>
            </>
          )}
          <span className="phW__phase">{PHASE_WORD[sky.phase]} · 이번 주 →</span>
        </button>
      </div>

      {/* ── 앱 ── */}
      <div className="phGrid">
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            className="phIcon"
            data-appicon={app.id}
            /* 관리자 전용 앱은 보내기 전에 막습니다.
               그냥 보내면 미들웨어가 로그인 페이지로 튕겨 냅니다 */
            onClick={() =>
              app.guard === "admin" && !isAdmin
                ? onLocked(app.title)
                : router.push(app.href)
            }
            aria-label={`${app.title} 열기`}
          >
            <span className="phIcon__art">
              <IconArt art={app.art} />
            </span>
            <span className="phIcon__label">{app.label}</span>
          </button>
        ))}

        {/* 주소 없이 열리는 앱 둘. 격자에서는 다른 아이콘과 같아 보입니다 */}
        <button
          type="button"
          className="phIcon"
          data-appicon="resume"
          onClick={() => onOpenSheet("resume")}
          aria-label={`이력서 열기 — ${items.length}가지`}
        >
          <span className="phIcon__art">
            <IconArt art="doc" />
          </span>
          <span className="phIcon__label">이력서</span>
        </button>

        <button
          type="button"
          className="phIcon"
          data-appicon="about"
          onClick={() => onOpenSheet("about")}
          aria-label="소개 열기"
        >
          <span className="phIcon__art">
            <IconArt art="card" />
          </span>
          <span className="phIcon__label">소개</span>
        </button>
      </div>

      {/* ── 재생 중 ──
          앱이 아니라 위젯입니다. 플레이어를 옮기면 음악이 끊깁니다 */}
      <MusicWidget />

      <span className="phDots" aria-hidden="true">
        <i data-on="true" />
      </span>
      </div>

      {/* ── 독 ── */}
      <div className="phDock">
        {PHONE_DOCK.map((d) => (
          <a
            key={d.id}
            className="phIcon phIcon--dock"
            href={d.href}
            {...(d.href.startsWith("http")
              ? { target: "_blank", rel: "noopener" }
              : {})}
            aria-label={d.label}
          >
            <span className="phIcon__art">
              <IconArt art={d.art} />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ResumeItem } from "@/content/types";
import { PHONE_DOCK, type PhoneAppItem } from "@/content/phone";
import type { Sky } from "@/components/room/useSky";
import { IconArt } from "@/components/desktop/IconArt";

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
}: {
  apps: PhoneAppItem[];
  sky: Sky;
  items: ResumeItem[];
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
      {/* ── 위젯 둘 ── */}
      <div className="phWidgets">
        <div className="phW phW--clock">
          <span className="phW__k">서울</span>
          <span className="phW__time">
            {now ? `${now.hh}:${now.mm}` : "--:--"}
          </span>
          <span className="phW__sub">{now?.date ?? " "}</span>
        </div>

        <div className="phW phW--sky">
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
          <span className="phW__phase">{PHASE_WORD[sky.phase]}</span>
        </div>
      </div>

      {/* ── 앱 ── */}
      <div className="phGrid">
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            className="phIcon"
            data-appicon={app.id}
            onClick={() => router.push(app.href)}
            aria-label={`${app.title} 열기`}
          >
            <span className="phIcon__art">
              <IconArt art={app.art} />
            </span>
            <span className="phIcon__label">{app.label}</span>
          </button>
        ))}
      </div>

      {/* 이력서는 다음 단계에서 앱이 됩니다. 그때까지는 이 줄이 유일한 입구입니다 */}
      <p className="phHome__note">
        저장소 {apps.length - 1}개 · 이력서 {items.length}가지는 준비 중입니다
      </p>

      <span className="phDots" aria-hidden="true">
        <i data-on="true" />
      </span>

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

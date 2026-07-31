"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ResumeItem } from "@/content/types";
import type { Profile } from "@/content/resume";
import type { PhoneAppItem } from "@/content/phone";
import { useSky } from "@/components/room/useSky";
import { useViewerIsAdmin } from "@/components/room/useViewerIsAdmin";
import { MusicProvider } from "@/components/music/MusicProvider";
import { PhoneNotice } from "./PhoneNotice";
import { StatusBar } from "./StatusBar";
import { PhoneHome } from "./PhoneHome";
import { PhoneApp } from "./PhoneApp";
import { ResumeApp } from "./ResumeApp";
import { AboutApp } from "./AboutApp";
import { WeatherApp } from "./WeatherApp";
import { TimelineApp } from "./TimelineApp";
import "@/styles/phone.css";

/**
 * 폰에서의 껍데기 — 아이폰 홈 화면 (docs/08).
 *
 * ── 서재를 대신합니다 ──
 * `RoomShell` 과 형제입니다. 한 번에 하나만 그립니다(`SiteShell`).
 * 둘 다 그려 놓고 CSS 로 숨기는 방법은 못 씁니다 — 유튜브 iframe 이 둘이 되고,
 * DOM 에서 옮기면 음악이 끊깁니다(docs/06 M-07).
 *
 * ── 앱이 두 종류입니다 ──
 * **주소가 있는 것** — 프로젝트·캘린더. pathname 이 곧 열린 앱이라
 * 안드로이드 뒤로가기로 저절로 닫힙니다. 서재에서 주소가 카메라를 정했던 것과 같습니다.
 *
 * **주소가 없는 것** — 이력서·소개. 공유할 주소가 아니라 새 라우트를 만들지
 * 않기로 했습니다(docs/08 §5 Q1). 대신 열 때 히스토리 항목을 하나 넣어
 * 뒤로가기로도 닫히게 합니다. 주소는 그대로라 리액트 라우터는 관여하지 않습니다.
 *
 * ── 배경 ──
 * 방의 창밖과 같은 `useSky` 를 씁니다. 실제 서울 시각과 날씨를 따라
 * 새벽·한낮·해질녘·밤이 바뀝니다. 사진 파일은 쓰지 않습니다(docs/04).
 */

type Sheet = "resume" | "about" | "weather" | "timeline";

const SHEET_TITLE: Record<Sheet, string> = {
  resume: "이력서",
  about: "소개",
  weather: "서울 날씨",
  timeline: "만든 시간",
};

export function PhoneShell({
  items,
  profile,
  apps,
  children,
}: {
  items: ResumeItem[];
  profile: Profile;
  apps: PhoneAppItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const sky = useSky();
  /** 화면을 가리는 용도일 뿐입니다. 진짜 방어선은 미들웨어와 RLS 입니다 */
  const isAdmin = useViewerIsAdmin();

  /** 관리자 전용 앱을 눌렀을 때 뜨는 안내 */
  const [locked, setLocked] = useState<string | null>(null);

  /** 주소가 있는 앱 */
  const routed = apps.find(
    (a) => pathname === a.href || pathname.startsWith(`${a.href}/`),
  );
  /** 주소가 없는 앱 */
  const [sheet, setSheet] = useState<Sheet | null>(null);

  /* 뒤로가기로도 닫히게 합니다.
     주소를 바꾸지 않고 히스토리 항목만 하나 쌓습니다 — 라우터는 그대로입니다. */
  const openSheet = useCallback((s: Sheet) => {
    setSheet(s);
    window.history.pushState({ phoneSheet: s }, "");
  }, []);

  const closeSheet = useCallback(() => {
    setSheet(null);
    // 우리가 넣은 항목을 되돌립니다. 이미 뒤로가기로 닫혔으면 아무 일도 없습니다
    if (window.history.state?.phoneSheet) window.history.back();
  }, []);

  useEffect(() => {
    const onPop = () => setSheet(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* 주소가 있는 앱으로 넘어가면 열려 있던 이력서·소개는 닫습니다.
     둘이 겹쳐 뜨면 어느 것을 닫는 손짓인지 알 수 없습니다. */
  useEffect(() => {
    setSheet(null);
  }, [pathname]);

  const open = Boolean(routed || sheet);

  return (
    <MusicProvider>
      <div
        className="ph"
        data-phase={sky.phase}
        data-cond={sky.condition}
        data-open={open ? "true" : "false"}
      >
        <span className="ph__paper" aria-hidden="true" />
        <span className="ph__bloom" aria-hidden="true" />

        <StatusBar />

        <PhoneHome
          apps={apps}
          sky={sky}
          items={items}
          isAdmin={isAdmin}
          onOpenSheet={openSheet}
          onLocked={setLocked}
        />

        {locked && (
          <PhoneNotice title={locked} onClose={() => setLocked(null)} />
        )}

        {routed && (
          <PhoneApp
            id={routed.id}
            title={routed.title}
            tone={routed.tone}
            onClose={() => router.push("/")}
          >
            {children}
          </PhoneApp>
        )}

        {!routed && sheet && (
          <PhoneApp
            id={sheet}
            title={SHEET_TITLE[sheet]}
            onClose={closeSheet}
          >
            {sheet === "resume" && (
              <ResumeApp items={items} isAdmin={isAdmin} />
            )}
            {sheet === "about" && (
              <AboutApp
                profile={profile}
                projects={apps.length - 1}
                resumeCount={items.length}
                isAdmin={isAdmin}
              />
            )}
            {sheet === "weather" && <WeatherApp sky={sky} />}
            {sheet === "timeline" && <TimelineApp apps={apps} />}
          </PhoneApp>
        )}
      </div>
    </MusicProvider>
  );
}

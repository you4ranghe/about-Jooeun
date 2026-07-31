"use client";

import { usePathname } from "next/navigation";
import type { ResumeItem } from "@/content/types";
import type { PhoneAppItem } from "@/content/phone";
import { useSky } from "@/components/room/useSky";
import { MusicProvider } from "@/components/music/MusicProvider";
import { StatusBar } from "./StatusBar";
import { PhoneHome } from "./PhoneHome";
import { PhoneApp } from "./PhoneApp";
import "@/styles/phone.css";

/**
 * 폰에서의 껍데기 — 아이폰 홈 화면 (docs/08).
 *
 * ── 서재를 대신합니다 ──
 * `RoomShell` 과 형제입니다. 한 번에 하나만 그립니다(`SiteShell`).
 * 둘 다 그려 놓고 CSS 로 숨기는 방법은 못 씁니다 — 유튜브 iframe 이 둘이 되고,
 * DOM 에서 옮기면 음악이 끊깁니다(docs/06 M-07).
 *
 * ── 주소가 화면을 정합니다 ──
 * 서재에서 pathname 이 카메라를 정했던 것과 같습니다.
 *   /                 홈 화면
 *   /projects         홈 화면 (폰에는 "바탕화면" 이라는 층이 없습니다)
 *   /projects/[slug]  그 프로젝트 앱
 *   /calendar         캘린더 앱
 * 그래서 뒤로가기가 곧 앱 닫기입니다.
 *
 * ── 배경 ──
 * 방의 창밖과 같은 `useSky` 를 씁니다. 실제 서울 시각과 날씨를 따라
 * 새벽·한낮·해질녘·밤이 바뀝니다. 사진 파일은 쓰지 않습니다(docs/04).
 */
export function PhoneShell({
  items,
  apps,
  children,
}: {
  items: ResumeItem[];
  apps: PhoneAppItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const sky = useSky();

  /** 지금 열려 있는 앱. 없으면 홈 화면입니다 */
  const open = apps.find(
    (a) => pathname === a.href || pathname.startsWith(`${a.href}/`),
  );

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

        <PhoneHome apps={apps} sky={sky} items={items} />

        {open && <PhoneApp app={open}>{children}</PhoneApp>}
      </div>
    </MusicProvider>
  );
}

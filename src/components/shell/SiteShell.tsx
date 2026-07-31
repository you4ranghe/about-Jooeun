"use client";

import type { ResumeItem } from "@/content/types";
import type { Profile } from "@/content/resume";
import type { PhoneAppItem } from "@/content/phone";
import { RoomShell } from "@/components/room/RoomShell";
import { PhoneShell } from "@/components/phone/PhoneShell";
import { useIsPhone } from "@/components/phone/useIsPhone";

/**
 * 화면에 맞는 껍데기 하나를 고릅니다 (docs/08 §6).
 *
 *   넓은 화면 → 서재 (RoomShell)
 *   좁은 화면 → 아이폰 홈 화면 (PhoneShell)
 *
 * ── 왜 둘 다 그려 놓고 CSS 로 숨기지 않나 ──
 * 유튜브 iframe 이 둘이 됩니다. 그리고 iframe 은 DOM 에서 옮기는 순간
 * 다시 로드돼 음악이 끊깁니다(docs/06 M-07). 하나만 살아 있어야 합니다.
 *
 * ── 첫 프레임 ──
 * 서버는 화면 크기를 모르므로 SSR 은 서재를 그리고, 하이드레이션 직후
 * 폰이면 이쪽으로 넘어옵니다. 그 사이에 방이 보이지 않도록
 * `app/layout.tsx` 의 인라인 스크립트가 미리 `html[data-shell]` 을 심고
 * `phone.css` 가 맞지 않는 쪽을 감춥니다.
 */
export function SiteShell({
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
  const phone = useIsPhone();

  if (phone) {
    return (
      <PhoneShell items={items} profile={profile} apps={apps}>
        {children}
      </PhoneShell>
    );
  }
  return (
    <RoomShell items={items} profile={profile}>
      {children}
    </RoomShell>
  );
}

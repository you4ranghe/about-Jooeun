import type { IconArtKey } from "./types";
import { getDesktopProjects } from "./projects";

/**
 * 아이폰 홈 화면에 놓이는 것들 (docs/08).
 *
 * 데스크톱 바탕화면(`content/desktop.ts`)과 목록이 겹치지만 성격이 다릅니다.
 * 바탕화면은 **바로가기**(.url 확장자·화살표 배지)이고,
 * 홈 화면은 **앱**입니다. 폰에서 "바로가기" 라는 개념은 어색합니다.
 *
 * 저장소를 하나 더 받으면 `projects.ts` 에 `desktop: true` 를 켜는 것으로
 * 바탕화면과 홈 화면에 동시에 올라갑니다. 이 파일은 건드리지 않습니다.
 */

export interface PhoneAppItem {
  id: string;
  /** 아이콘 아래 이름. 짧아야 합니다 */
  label: string;
  /** 앱 화면 위에 뜨는 이름 */
  title: string;
  art: IconArtKey;
  href: string;
  /**
   * 눌러도 되는 사람이 정해져 있는가.
   *
   * `/calendar` 는 미들웨어가 막습니다. 그냥 보내면 **로그인 페이지로 튕겨 나갑니다** —
   * 아이콘을 눌렀는데 다른 사이트로 나가는 것처럼 보입니다.
   * 방에서 관리자 여부를 먼저 보고 안내를 띄웠던 것과 같은 처리가 폰에도 필요합니다.
   */
  guard?: "admin";
}

export interface PhoneDockItem {
  id: string;
  label: string;
  art: IconArtKey;
  href: string;
}

/**
 * 아이콘 이름은 짧아야 합니다.
 * 프로젝트 제목은 "인터페이퍼 — 바우치 서재" 처럼 설명이 붙어 있으므로
 * 줄표 앞만 씁니다. 아이폰 아이콘 이름이 두 줄을 넘으면 읽지 않습니다.
 */
function shortName(title: string): string {
  return title.split("—")[0].trim();
}

export async function getPhoneApps(): Promise<PhoneAppItem[]> {
  const projects = await getDesktopProjects();

  return [
    ...projects.map((p) => ({
      id: p.slug,
      label: shortName(p.title),
      title: p.title,
      art: p.icon ?? ("globe" as IconArtKey),
      href: `/projects/${p.slug}`,
    })),
    {
      id: "calendar",
      label: "캘린더",
      title: "캘린더",
      art: "calendar" as IconArtKey,
      href: "/calendar",
      guard: "admin" as const,
    },
  ];
}

/**
 * 독 — 바깥으로 나가는 것만 둡니다.
 *
 * 아이폰 독에는 자주 쓰는 앱을 두지만, 여기서 자주 쓰는 앱은 프로젝트입니다.
 * 그건 이미 홈 화면 위쪽에 있으므로 독에는 **연락 수단**을 둡니다.
 */
export const PHONE_DOCK: PhoneDockItem[] = [
  {
    id: "github",
    label: "GitHub",
    art: "globe",
    href: "https://github.com/you4ranghe",
  },
  {
    id: "mail",
    label: "메일",
    art: "mail",
    href: "mailto:you4ranghe@gmail.com",
  },
];

import type { IconArtKey } from "./types";
import { getDesktopProjects } from "./projects";

/**
 * 모니터 안 바탕화면에 놓이는 것들 (docs/06 P8).
 *
 * ── 왜 layout.ts 가 아닌가 ──
 * `content/layout.ts` 는 **방의 좌표**만 담는 파일입니다.
 * 바탕화면은 방에 놓인 물건이 아니라 모니터 화면 안의 내용이라 여기에 둡니다.
 * 아이콘 자리는 좌표가 아니라 순서로 정해집니다 — 격자는 CSS 가 잡습니다.
 *
 * ── 저장소를 하나 더 받으면 ──
 * `projects.ts` 의 그 항목에 `desktop: true` 와 `icon` 을 켜면 끝입니다.
 * 이 파일도 화면 코드도 건드리지 않습니다.
 */

export type DesktopOpen =
  /** 사이트 안 주소 — 창이 열립니다 */
  | { kind: "route"; href: string }
  /** 바깥 주소 — 새 탭입니다 */
  | { kind: "external"; href: string };

export interface DesktopShortcut {
  id: string;
  /** 아이콘 아래 이름. 확장자까지 적어야 바로가기로 읽힙니다 */
  label: string;
  art: IconArtKey;
  /** 왼쪽 아래 바로가기 화살표를 겹칠지 */
  shortcut?: boolean;
  open: DesktopOpen;
  /** 마우스를 올렸을 때 뜨는 말풍선 = 실제 목적지 */
  hint: string;
}

export async function getDesktopShortcuts(): Promise<DesktopShortcut[]> {
  const projects = await getDesktopProjects();

  return [
    ...projects.map((p) => ({
      id: p.slug,
      label: `${p.title}.url`,
      art: p.icon ?? ("globe" as IconArtKey),
      shortcut: true,
      open: { kind: "route", href: `/projects/${p.slug}` } as DesktopOpen,
      hint: `${p.repo} · ${p.live || "배포 없음"}`,
    })),
    {
      id: "github",
      label: "GitHub.url",
      art: "globe",
      shortcut: true,
      open: { kind: "external", href: "https://github.com/you4ranghe" },
      hint: "github.com/you4ranghe — 새 탭에서 열립니다",
    },
  ];
}

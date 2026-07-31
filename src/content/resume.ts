import type { ResumeItem, ArtKey } from "./types";

/**
 * 이력서와 소개 — 읽기 (docs/09).
 *
 * ── 2026-07-31, 하드코딩에서 DB 로 ──
 * 여기 있던 12개는 전부 제가 지어낸 예시였습니다. 실명도 회사도 연도도 가짜라
 * 그것 때문에 검색 색인을 잠가 두고 있었습니다. DB 로 옮기면서 전부 내렸습니다.
 * 내용은 `/admin/resume` 에서 채웁니다 — 예시 문장은 그 폼의 회색 글자로 옮겼습니다.
 *
 * ── 정적 렌더링을 잃지 않는 방법 ──
 * 이력서는 `(site)/layout.tsx` 가 읽어 셸에 내려 줍니다. 요청마다 DB 를 읽으면
 * **그 아래 모든 라우트가 동적으로 강등됩니다.** 무료 Supabase 는 7일 요청이 없으면
 * 잠드는데, 그때 채용 담당자가 링크를 열면 이력서가 비어 있게 됩니다.
 *
 * 그래서 Supabase 클라이언트 대신 **REST 를 fetch 로** 부르고 태그를 붙입니다.
 *   읽기 — force-cache + tags. 방문자 요청으로는 DB 에 한 번도 가지 않습니다
 *   쓰기 — 관리자가 저장할 때 revalidateTag 로 그때만 다시 굽습니다
 * `/api/weather` 에서 이미 쓰는 방법과 같습니다.
 *
 * ⚠️ Next 15 부터 fetch 기본값이 no-store 입니다. `cache: "force-cache"` 를 빼면
 *    조용히 매 요청 DB 를 읽게 되고 위의 전제가 통째로 무너집니다.
 */

export const RESUME_TAG = "resume";
export const PROFILE_TAG = "profile";

const REST = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** DB 가 돌려주는 모양. 배열 넷은 jsonb 입니다 */
interface RowShape {
  id: string;
  art: string;
  tip: string;
  category: string;
  short: string;
  title: string;
  lead: string;
  rows: ResumeItem["rows"];
  chips: ResumeItem["chips"];
  body: string[];
  links: ResumeItem["links"];
}

export interface Profile {
  name: string;
  role: string;
  email: string;
  github: string;
  intro: string;
}

/** DB 를 못 읽었을 때. 화면이 깨지는 대신 비어 있게 둡니다 */
const NO_PROFILE: Profile = {
  name: "",
  role: "",
  email: "",
  github: "",
  intro: "",
};

async function read<T>(path: string, tag: string): Promise<T[]> {
  if (!KEY) return [];
  try {
    const res = await fetch(`${REST}/${path}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
      cache: "force-cache",
      next: { tags: [tag] },
    });
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    /* 사내망·프록시·DB 정지 어느 쪽이든 빈 목록입니다.
       이미 구워 둔 정적 HTML 이 있으면 그게 계속 나가므로 방문자는 모릅니다.
       완전히 새로 빌드하는 순간에만 비어 보이고, 빌드를 깨뜨리지는 않습니다. */
    return [];
  }
}

/** 빈 배열은 없는 것으로 둡니다 — 화면이 `item.rows &&` 로 판단합니다 */
const orNone = <T,>(v: T[] | null | undefined) =>
  v && v.length ? v : undefined;

export async function getResume(): Promise<ResumeItem[]> {
  const rows = await read<RowShape>(
    "resume_items?select=*&published=is.true&order=sort.asc",
    RESUME_TAG,
  );

  return rows.map((r) => ({
    id: r.id,
    art: r.art as ArtKey,
    tip: r.tip,
    category: r.category,
    short: r.short,
    title: r.title,
    lead: r.lead,
    rows: orNone(r.rows),
    chips: orNone(r.chips),
    body: r.body ?? [],
    links: orNone(r.links),
  }));
}

export async function getProfile(): Promise<Profile> {
  const rows = await read<Profile>(
    "profile?select=name,role,email,github,intro&id=eq.1",
    PROFILE_TAG,
  );
  return rows[0] ?? NO_PROFILE;
}

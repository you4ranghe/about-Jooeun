import { getResume, getProfile } from "@/content/resume";
import { getPhoneApps } from "@/content/phone";
import { SiteShell } from "@/components/shell/SiteShell";

/**
 * 껍데기를 레이아웃에 둡니다.
 *
 * 이게 핵심입니다. 레이아웃은 / ↔ /projects 사이를 오갈 때 다시 그려지지 않으므로
 * 방(또는 홈 화면)이 그대로 살아 있고, 바뀌는 것은 카메라 위치와 화면 속 내용뿐입니다.
 * 그래서 "페이지 이동"이 아니라 "화면 안으로 들어갔다 나오는" 것처럼 보입니다.
 *
 * 넓은 화면은 서재, 좁은 화면은 아이폰 홈 화면입니다(docs/08).
 * 고르는 일은 `SiteShell` 이 브라우저에서 합니다 — 서버는 화면 크기를 모릅니다.
 *
 * ── 이력서를 여기서 읽어도 정적입니다 ──
 * `getResume()` 은 태그가 붙은 캐시를 읽습니다(docs/09). 방문자 요청으로는
 * DB 에 가지 않고, 관리자가 저장할 때만 `revalidateTag` 로 다시 구워집니다.
 * 그냥 Supabase 클라이언트로 읽었다면 이 아래 **모든 라우트**가 동적으로
 * 강등됐을 자리입니다.
 *
 * ⚠️ 여기서 cookies() 를 읽으면 안 됩니다. 한 번 읽는 순간 같은 일이 벌어집니다
 *    (docs/03 §3.1). 로그인 여부는 셸이 브라우저에서 확인합니다.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, profile, apps] = await Promise.all([
    getResume(),
    getProfile(),
    getPhoneApps(),
  ]);

  return (
    <SiteShell items={items} profile={profile} apps={apps}>
      {children}
    </SiteShell>
  );
}

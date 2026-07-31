import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/supabase/server";
import "@/styles/admin.css";

/**
 * 관리자 화면 껍데기.
 *
 * `(site)` 바깥입니다. 방을 띄운 채 폼을 열면 카메라와 입력칸이 겹쳐 산만하고,
 * 이력서 한 항목은 표·칩·본문이 붙은 문서라 벽에 걸린 288px 종이 안에서
 * 고칠 수 있는 크기가 아닙니다(docs/09 §5).
 *
 * 미들웨어가 이미 /admin/:path* 를 막고 있지만 여기서 한 번 더 봅니다.
 * 미들웨어는 세션 쿠키를 보고, 여기서는 토큰을 Supabase 에 확인시킵니다.
 * 그리고 진짜 방어선은 그 아래 RLS 입니다 — 셋이 겹쳐 있습니다.
 */
export const metadata: Metadata = {
  title: "관리",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdmin();
  if (!admin) redirect("/login?next=/admin");

  return (
    <div className="adm">
      <header className="adm__top">
        <Link className="adm__home" href="/admin">
          관리
        </Link>
        <nav>
          <Link href="/admin/resume">이력서</Link>
          <Link href="/admin/profile">소개</Link>
          <Link href="/">사이트 보기 ↗</Link>
        </nav>
      </header>
      <main className="adm__main">{children}</main>
    </div>
  );
}

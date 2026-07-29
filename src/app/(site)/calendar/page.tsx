import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CalendarScreen } from "@/components/calendar/CalendarScreen";

/**
 * 일정 화면.
 *
 * (site) 안에 두어야 방이 그대로 살아 있고, 카메라가 벽걸이 캘린더로 밀고 들어갑니다.
 * /projects 가 모니터로 들어가는 것과 같은 구조입니다.
 *
 * ⚠️ 여기서 cookies() 를 읽지만 그건 이 라우트만 동적으로 만듭니다.
 *    레이아웃에서 읽으면 / 와 /projects 까지 동적이 되므로 절대 올리면 안 됩니다.
 *
 * 로그인 확인은 미들웨어가 이미 했습니다. 여기서는 역할까지 봅니다.
 * 그래도 최종 방어선은 RLS 입니다 — 이 화면을 통과해도 데이터는 정책이 막습니다.
 */
export const metadata: Metadata = {
  title: "일정",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.app_metadata as { role?: string } | null)?.role;

  if (!user || role !== "admin") {
    return (
      <div className="calGate">
        <p className="calGate__h">{user ? "관리자 권한이 없습니다" : "로그인이 필요합니다"}</p>
        <p className="calGate__p">
          {user
            ? "계정에 관리자 역할이 부여되지 않았습니다. 부여한 뒤 로그아웃하고 다시 로그인하세요."
            : "세션이 만료되었을 수 있습니다."}
        </p>
        <a className="calGate__go" href="/login?next=/calendar">
          로그인 화면으로
        </a>
      </div>
    );
  }

  return <CalendarScreen />;
}

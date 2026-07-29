"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

/**
 * 지금 보고 있는 사람이 관리자인지 — **브라우저에서** 확인합니다.
 *
 * ⚠️ 왜 서버가 아니라 브라우저인가
 *
 * 레이아웃에서 cookies() 를 읽으면 그 아래 모든 라우트가 동적 렌더링으로 강등됩니다.
 * 실제로 그렇게 만들었다가 / 와 /projects 가 전부 ƒ Dynamic 이 되어,
 * 방문자 요청마다 서버리스 함수가 도는 구조가 됐습니다.
 * 공개 페이지를 정적으로 유지하는 것이 이 사이트 비용 설계의 근간이라(docs/03 §3.1)
 * 확인을 브라우저로 옮겼습니다.
 *
 * 이 값은 **캘린더를 눌렀을 때 어디로 보낼지** 정하는 데만 씁니다.
 * 일정 데이터 자체는 RLS 가 막으므로, 이 값이 틀려도 새어 나가지 않습니다.
 * 그래서 네트워크 왕복이 없는 getSession() 으로 충분합니다.
 */
export function useViewerIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 환경변수가 아직 없으면 Supabase 없이도 방은 떠야 합니다
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }

    let alive = true;
    const supabase = createClient();

    const read = (meta: unknown) => (meta as { role?: string } | null)?.role === "admin";

    supabase.auth.getSession().then(({ data }) => {
      if (alive) setIsAdmin(read(data.session?.user.app_metadata));
    });

    // 로그인·로그아웃 뒤 방으로 돌아왔을 때도 반영되도록
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (alive) setIsAdmin(read(session?.user.app_metadata));
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return isAdmin;
}

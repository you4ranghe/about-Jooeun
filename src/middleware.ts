import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 미들웨어가 하는 일은 두 가지뿐입니다.
 *   1. 만료가 임박한 access token 을 갱신하고 응답 쿠키에 실어 보냅니다
 *   2. 로그인하지 않은 사람을 /admin 밖으로 돌려보냅니다
 *
 * ⚠️ 이건 보안 경계가 아니라 UX 처리입니다.
 *    미들웨어를 우회해 페이지에 도달하더라도 데이터는 RLS 가 막습니다.
 *    두 층을 혼동하면 안 됩니다.
 *
 * ★ matcher 를 /admin 으로 한정한 것이 이 파일에서 가장 중요한 줄입니다.
 *   Next.js 기본 예제처럼 거의 모든 경로에 걸면 방문자 요청마다 Edge 함수가 실행되어,
 *   공개 페이지를 정적으로 서빙해 얻은 이점(docs/04 §3)이 통째로 사라집니다.
 *   이렇게 두면 미들웨어 실행 횟수가 "내가 관리 화면을 쓰는 횟수" 로 고정됩니다.
 */
export const config = {
  matcher: ["/admin/:path*", "/calendar", "/calendar/:path*"],
};

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경변수가 아직 없으면 로그인 자체가 불가능합니다.
  // 500 을 내는 대신 로그인 화면으로 보냅니다. 거기서 안내가 나옵니다.
  if (!url || !key) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("setup", "1");
    return NextResponse.redirect(login);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getSession() 은 쿠키를 그대로 믿습니다. 권한 판단에는 getUser() 를 씁니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    // 로그인 뒤 원래 가려던 곳으로 돌려보내기 위해 남깁니다
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return response;
}

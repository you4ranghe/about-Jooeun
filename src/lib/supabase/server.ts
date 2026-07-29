import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 서버 컴포넌트 · Server Action 용 Supabase 클라이언트.
 *
 * anon 키를 씁니다. service_role 키는 이 앱의 런타임에 등장하지 않습니다.
 * 권한 상승은 오직 JWT 의 role 클레임으로 일어나고 판단은 RLS 가 합니다.
 * service_role 을 쓰고 싶어지는 순간이 오면 그건 설계가 잘못됐다는 신호입니다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // 서버 컴포넌트에서는 쿠키를 쓸 수 없습니다.
            // 세션 갱신은 미들웨어가 하므로 여기서 조용히 넘어가도 됩니다.
          }
        },
      },
    },
  );
}

/**
 * 지금 로그인한 사람이 관리자인지.
 *
 * getUser() 는 토큰을 Supabase 에 확인시킵니다. getSession() 은 쿠키를 그대로 믿으므로
 * 서버에서 권한을 판단할 때 쓰면 안 됩니다.
 *
 * 다만 이건 화면을 가리기 위한 판단일 뿐입니다. 진짜 방어선은 RLS 입니다.
 */
export async function getAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  const role = (user.app_metadata as { role?: string } | null)?.role;
  return role === "admin" ? user : null;
}

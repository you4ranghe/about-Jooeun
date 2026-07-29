import { createBrowserClient } from "@supabase/ssr";

/**
 * 클라이언트 컴포넌트용 Supabase 클라이언트.
 *
 * 여기 쓰이는 anon 키는 브라우저 번들에 그대로 들어갑니다. 그래도 괜찮습니다 —
 * 애초에 공개를 전제로 만들어진 키이고, 무엇을 읽고 쓸 수 있는지는 RLS 가 정합니다.
 *
 * 반대로 service_role 키에 NEXT_PUBLIC_ 접두사가 붙는 순간 RLS 전체가 무의미해집니다.
 * 이 프로젝트에서 일어날 수 있는 최악의 실수입니다.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

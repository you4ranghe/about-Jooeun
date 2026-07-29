import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import "@/styles/login.css";

/**
 * 로그인 화면.
 *
 * (site) 레이아웃 바깥에 둡니다. 방을 띄운 채 로그인시키면 카메라와 폼이 겹쳐
 * 화면이 산만해지고, 미들웨어 matcher 도 /admin 으로 깔끔하게 한정할 수 없습니다.
 *
 * 계정은 하나뿐이고 가입 경로는 Supabase 설정에서 막아 둡니다.
 * 그래서 이 화면에는 가입·비밀번호 찾기 링크가 없습니다.
 */
export const metadata: Metadata = {
  title: "로그인",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; setup?: string }>;
}) {
  const { next, setup } = await searchParams;

  // 환경변수가 아직 없어 미들웨어가 돌려보낸 경우입니다
  const needsSetup = setup === "1" || !process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <main className="login">
      <div className="login__card">
        <Link href="/" className="login__back">
          ← 작업실로
        </Link>

        <h1 className="login__h">관리자 로그인</h1>
        <p className="login__lead">
          개인 일정은 저만 볼 수 있습니다. 방문자에게는 어떤 경로로도 보이지 않습니다.
        </p>

        {needsSetup ? (
          <div className="login__setup">
            <b>아직 Supabase 가 연결되지 않았습니다.</b>
            <p>
              프로젝트 루트에 <code>.env.local</code> 을 만들고
              <code>NEXT_PUBLIC_SUPABASE_URL</code> 과 <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> 를
              넣은 뒤 서버를 다시 띄우면 로그인할 수 있습니다.
            </p>
            <p>
              값은 Supabase 대시보드의 <b>Project Settings → API</b> 에 있습니다.
              자세한 절차는 <code>.env.example</code> 과 <code>supabase/migrations/</code> 를 보세요.
            </p>
          </div>
        ) : (
          <LoginForm next={next ?? "/calendar"} />
        )}

        <p className="login__note">
          이 사이트에는 가입 기능이 없습니다. 운영자 계정 하나만 존재합니다.
        </p>
      </div>
    </main>
  );
}

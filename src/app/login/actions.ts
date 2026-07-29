"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Action 은 사실상 공개 HTTP 엔드포인트입니다.
 * 버튼을 숨겨도 누구나 호출할 수 있으므로 입력 검증을 생략하면 안 됩니다.
 * 다만 최종 방어선은 여기가 아니라 Supabase Auth 와 RLS 입니다.
 */

export type LoginState = { error: string | null };

/** 로그인 뒤 돌아갈 곳. 외부 주소로 튕기는 것을 막기 위해 내부 경로만 허용합니다. */
function safeNext(raw: FormData) {
  const next = String(raw.get("next") ?? "");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/calendar";
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // 어느 쪽이 틀렸는지 알려주지 않습니다.
    // 계정이 존재하는지를 흘리면 그 자체가 정보 노출입니다.
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

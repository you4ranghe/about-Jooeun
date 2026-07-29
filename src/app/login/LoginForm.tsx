"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="login__submit" disabled={pending}>
      {pending ? "확인하는 중…" : "로그인"}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<LoginState, FormData>(signIn, { error: null });

  return (
    <form action={action} className="login__form">
      <input type="hidden" name="next" value={next} />

      <label className="login__field">
        <span>이메일</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          placeholder="you@example.com"
        />
      </label>

      <label className="login__field">
        <span>비밀번호</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>

      {/* 오류는 화면에 나타났을 때 스크린리더가 읽도록 role="alert" */}
      {state.error && (
        <p className="login__error" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

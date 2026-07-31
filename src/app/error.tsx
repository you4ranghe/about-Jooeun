"use client";

import { useEffect } from "react";
import "@/styles/oops.css";

/**
 * 무언가 터졌을 때.
 *
 * 오류 화면은 사과하지 않습니다. **무엇이 잘못됐고 어떻게 하면 되는지**만 말합니다.
 * "죄송합니다" 로 시작하는 화면은 방문자에게 아무것도 해 주지 않습니다.
 *
 * `reset()` 은 이 구간만 다시 그려 봅니다. 일시적인 실패(네트워크 한 번 끊김,
 * 데이터베이스가 깨어나는 중)면 이 버튼 하나로 끝납니다 — 새로고침보다 가볍습니다.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 서버 로그에는 이미 남아 있습니다. 브라우저에서도 볼 수 있게 한 줄
    console.error(error);
  }, [error]);

  return (
    <main className="oops">
      <div className="oops__in">
        <p className="oops__k">ERROR</p>
        <h1 className="oops__h">화면을 그리다 멈췄습니다</h1>
        <p className="oops__p">
          잠깐 그런 것일 수 있습니다. 다시 시도해 보시고, 그래도 같으면
          <br />
          작업실로 돌아가 다른 길로 들어와 주세요.
        </p>

        <div className="oops__row">
          <button type="button" className="oops__btn" onClick={reset}>
            다시 시도
          </button>
          <a className="oops__ghost" href="/">
            작업실로
          </a>
        </div>

        {error.digest && <p className="oops__code">{error.digest}</p>}
      </div>
    </main>
  );
}

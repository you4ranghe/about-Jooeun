"use client";

import { useMusic } from "@/components/music/MusicProvider";

/**
 * 홈 화면의 "재생 중" 위젯 (docs/08).
 *
 * ── 왜 앱이 아니라 위젯인가 ──
 * 유튜브 플레이어는 **DOM 에서 자리를 옮기면 다시 로드됩니다** — 음악이 끊깁니다
 * (docs/06 M-07). 앱으로 만들면 열 때마다 플레이어를 홈 화면에서 앱 안으로
 * 옮겨야 하는데, 그게 정확히 금지된 동작입니다.
 *
 * 그래서 방에서 아이패드가 한자리를 지켰던 것처럼 여기서도 위젯 한자리에 박아 둡니다.
 * 플레이어가 늘 보이므로 유튜브 약관과도 맞습니다 — 감추거나 덮지 않습니다.
 *
 * ── 자동 재생하지 않습니다 ──
 * 채용 담당자는 사무실에서 소리를 켜고 봅니다. 반드시 눌러야 소리가 납니다.
 */
export function MusicWidget() {
  const { current, status, ready, armed, arm, mountRef, next, prev } =
    useMusic();

  return (
    <div className="phMusic">
      <div className="phMusic__screen">
        {/* 플레이어가 들어앉는 자리. 이 노드는 절대 옮기지 않습니다 */}
        <div ref={mountRef} />

        {/* 켜기 전. 이 상태에서는 유튜브로 나간 요청이 한 건도 없습니다 */}
        {!armed && (
          <button type="button" className="phMusic__wake" onClick={arm}>
            <span>▶</span>
            음악 켜기
          </button>
        )}
      </div>

      <div className="phMusic__bar">
        <div className="phMusic__now">
          <span className="phMusic__k">
            {status === "playing" ? "재생 중" : "음악"}
          </span>
          <span className="phMusic__title">
            {current?.title ?? "재생목록이 비어 있어요"}
          </span>
        </div>

        <div className="phMusic__ctrl">
          <button
            type="button"
            onClick={prev}
            disabled={!ready}
            aria-label="이전 곡"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M15 4v12L7 10z" fill="currentColor" />
              <rect x="4" y="4" width="2.4" height="12" rx="1.2" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!ready}
            aria-label="다음 곡"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 4v12l8-6z" fill="currentColor" />
              <rect x="13.6" y="4" width="2.4" height="12" rx="1.2" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

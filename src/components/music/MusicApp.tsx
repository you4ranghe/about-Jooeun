"use client";

import { PLAYLIST, thumbUrl } from "@/content/playlist";
import { useMusic } from "./MusicProvider";
import "@/styles/music.css";

/**
 * 아이패드 화면 안의 유튜브 뮤직.
 *
 * 화면 밖 어디에도 뜨지 않습니다 — 아이패드 화면 안에서 그려집니다.
 * 그래서 확대하면 "아이패드로 음악 앱을 보고 있는" 화면이 됩니다.
 *
 * 왼쪽 위는 영상(= 플레이어 iframe, DeskPad 가 들고 있습니다),
 * 아래는 재생 조작 막대, 오른쪽은 대기열입니다.
 * **영상 위를 덮지 않습니다.** 덮으면 플레이어를 가리는 것이 됩니다.
 *
 * ── 왜 진행 막대가 없는가 ──
 * 영상 안에 유튜브 플레이어의 진행 막대가 이미 있습니다.
 * 그건 플레이어의 일부라 가릴 수 없으니(가리면 약관 위반),
 * 없앨 수 있는 쪽은 우리 것뿐입니다. 같은 일을 하는 막대를 둘 둘 이유가 없습니다.
 * 탐색과 시간 표시는 영상 위 유튜브 컨트롤에 맡깁니다.
 *
 * 이전/다음은 남깁니다 — 재생목록은 우리 것이라 유튜브 컨트롤에는 없습니다.
 */

export function MusicApp() {
  const { current, status, ready, select, togglePlay, next, prev } = useMusic();
  const playing = status === "playing";

  return (
    <>
      {/* ── 아래 조작 막대 ── */}
      <div className="ytm__bar">
        <div className="ytm__transport">
          <button
            type="button"
            className="ytm__skip"
            onClick={prev}
            aria-label="이전 곡"
          >
            ⏮
          </button>
          <button
            type="button"
            className="ytm__play"
            onClick={togglePlay}
            disabled={!ready}
            aria-label={playing ? "일시정지" : "재생"}
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <button
            type="button"
            className="ytm__skip"
            onClick={next}
            aria-label="다음 곡"
          >
            ⏭
          </button>
        </div>

        <p className="ytm__now">
          <span className="ytm__nowTitle">
            {current?.title ?? "고른 곡 없음"}
          </span>
          <span className="ytm__nowArtist">{current?.artist ?? ""}</span>
        </p>
      </div>

      {/* ── 오른쪽 대기열 ── */}
      <aside className="ytm__queue" aria-label="다음 트랙">
        <p className="ytm__queueH">다음 트랙</p>
        <ul className="ytm__list">
          {PLAYLIST.map((t, i) => {
            const on = current?.id === t.id;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  className="ytm__item"
                  data-on={on ? "true" : "false"}
                  onClick={() => select(t)}
                >
                  <span className="ytm__no">{on && playing ? "▶" : i + 1}</span>
                  <span className="ytm__art">
                    {/* 유튜브 썸네일 CDN. 우리 대역폭도 이미지 변환 한도도 쓰지 않습니다. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbUrl(t.id)} alt="" draggable={false} />
                  </span>
                  <span className="ytm__meta">
                    <span className="ytm__title">{t.title}</span>
                    <span className="ytm__artist">{t.artist}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="ytm__foot">방으로 나가도 소리는 이어집니다.</p>
      </aside>
    </>
  );
}

"use client";

import { useState } from "react";

/**
 * 증거 블록 — 눌러서 실행 (docs/07 §4, E-RUN).
 *
 * 스크린샷 대신 운영 중인 사이트를 그 자리에 띄웁니다.
 * 포트폴리오의 문장은 전부 자기 주장이라, 옆에 검증할 수 있는 것을 하나 둡니다.
 *
 * ── 왜 자동으로 불러오지 않는가 ──
 * 페이지를 열 때마다 그쪽 Supabase 에 접속이 일어납니다. 방문자가 열 명이면 열 번이고,
 * 무료 티어를 갉아먹습니다. 게임이 소리를 내므로 방 안 아이패드(유튜브)와 겹치기도 합니다.
 * 안 누르면 아무 일도 일어나지 않는 것이 기본값으로 맞습니다.
 */
export function RunEmbed({ url, note }: { url: string; note?: string }) {
  const [on, setOn] = useState(false);
  const host = url.replace(/^https?:\/\//, "");

  return (
    <>
      <div className="led__run">
        <div className="led__runBar">
          <i />
          <i />
          <i />
          <span>{url}</span>
        </div>
        <div className="led__runStage">
          {on ? (
            <iframe
              src={url}
              title={`${host} — 운영 중인 사이트`}
              allow="autoplay; fullscreen"
              loading="lazy"
            />
          ) : (
            <button
              type="button"
              className="led__runGo"
              onClick={() => setOn(true)}
            >
              <span aria-hidden="true">▶</span>
              <b>여기서 바로 실행</b>
              <small>{host}</small>
            </button>
          )}
        </div>
      </div>
      {note && <p className="led__runNote">{note}</p>}
    </>
  );
}

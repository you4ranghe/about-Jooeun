"use client";

import { ROOM as L } from "@/content/layout";
import type { Sky } from "./useSky";

/**
 * 벽에 붙인 메모들.
 *
 * 원래 화면 위에 떠 있던 HUD 였습니다 — 이름표, 이력서 버튼, 읽은 개수,
 * 날씨, 밝기 토글. 알약 모양 칩이 장면 위에 얹혀 있으니
 * "방을 찍은 사진 위에 웹 UI 를 올린 것"처럼 보였습니다.
 *
 * 벽에 붙은 종이는 방의 일부입니다. 카메라를 움직이면 같이 움직이고,
 * 줌인하면 같이 흐려집니다. 그래야 한 장면이 됩니다.
 *
 * ── 손글씨인 이유 ──
 * 포스트잇에 인쇄체가 적혀 있으면 종이로 안 보입니다.
 * 기울기도 메모마다 다르게 줍니다. 전부 반듯하면 붙인 게 아니라 인쇄한 것 같습니다.
 */
export function WallNotes({
  readCount,
  total,
  onOpenResume,
  sky,
  lightMode,
  onCycleLight,
  lightLabel,
}: {
  readCount: number;
  total: number;
  onOpenResume: () => void;
  sky: Sky;
  lightMode: "auto" | "day" | "night";
  onCycleLight: () => void;
  lightLabel: string;
}) {
  const N = L.notes;
  const pct = total > 0 ? (readCount / total) * 100 : 0;

  return (
    <>
      {/* ── 이름표 ──
          누르는 것이 아니라 읽는 것이라 종이 한 장에 테이프만 붙였습니다. */}
      <div
        className="note note--brand"
        style={{
          left: `${N.brand.x}px`,
          top: `${N.brand.y}px`,
          width: `${N.brand.w}px`,
          height: `${N.brand.h}px`,
          rotate: `${N.brand.deg}deg`,
        }}
      >
        <span className="note__tape" />
        <h1 className="note__name">you4ranghe의 작업실</h1>
        <p className="note__role">backend engineer · 4 yrs · seoul</p>
      </div>

      {/* ── 이력서 ──
          방 안에서 이력서로 들어가는 유일한 입구라 누를 수 있어야 합니다.
          읽은 개수도 여기 같이 적습니다 — 따로 떼면 메모가 하나 더 늘 뿐입니다. */}
      <button
        type="button"
        className="note note--resume"
        onClick={onOpenResume}
        style={{
          left: `${N.resume.x}px`,
          top: `${N.resume.y}px`,
          width: `${N.resume.w}px`,
          height: `${N.resume.h}px`,
          rotate: `${N.resume.deg}deg`,
        }}
      >
        <span className="note__pin" />
        <span className="note__h">이력서</span>
        <span className="note__sub">
          {total}가지 이야기
          <br />
          눌러서 펼치기 →
        </span>
        <span className="note__progress" aria-hidden="true">
          <span className="note__bar" style={{ width: `${pct}%` }} />
        </span>
        <span className="note__count">
          {readCount} / {total} 읽음
        </span>
      </button>

      {/* ── 창밖 ──
          날씨와 밝기는 둘 다 "바깥이 어떤가" 라서 한 장에 적습니다.
          날씨를 못 받아왔으면 그 줄만 빼고 밝기 메모로 남습니다. */}
      <div
        className="note note--sky"
        style={{
          left: `${N.sky.x}px`,
          top: `${N.sky.y}px`,
          width: `${N.sky.w}px`,
          height: `${N.sky.h}px`,
          rotate: `${N.sky.deg}deg`,
        }}
      >
        <span className="note__pin note__pin--blue" />
        <span className="note__h">오늘 서울</span>
        {sky.label ? (
          <span className="note__weather">{sky.label}</span>
        ) : (
          <span className="note__sub">날씨를 못 불러왔어요</span>
        )}
        <button
          type="button"
          className="note__light"
          onClick={onCycleLight}
          aria-label={lightLabel}
          title={lightLabel}
        >
          <span className="note__lightIcon">
            {lightMode === "auto" ? "🌗" : lightMode === "day" ? "☀️" : "🌙"}
          </span>
          {lightMode === "auto"
            ? "시각 따라"
            : lightMode === "day"
              ? "낮 고정"
              : "밤 고정"}
        </button>
      </div>
    </>
  );
}

"use client";

import { PAD, PAD_SCREEN, padBox } from "@/content/layout";
import { useMusic } from "@/components/music/MusicProvider";
/* 화면 안 .ytm 마크업은 /music 이 아닐 때도 늘 여기 있습니다.
   그래서 이 스타일도 늘 필요합니다 — MusicApp 에만 걸어 두면
   방 화면에서 플레이어가 스타일 없이 쪼그라듭니다. 실제로 그랬습니다. */
import "@/styles/music.css";

/**
 * 책상 오른쪽 끝에 세워 둔 아이패드.
 *
 * 화면 전체가 유튜브 플레이어입니다. 감추지 않고 기기 모양 그대로 두면
 * 플레이어가 온전히 보이면서 장면의 일부가 됩니다.
 *
 * ── 왜 방 화면에 재생 버튼이 없는가 ──
 * 화면 안 iframe 이 유튜브 플레이어 자체라 재생·일시정지 컨트롤을 이미 갖고 있습니다.
 * 밖에 버튼을 하나 더 두면 같은 일을 하는 조작부가 둘이 됩니다.
 * 곡을 고르고 넘기는 조작은 확대했을 때 화면 안에서 합니다.
 *
 * ── 왜 눌러도 화면이 아니라 테두리인가 ──
 * 화면 위를 덮으면 플레이어를 가리는 것이 됩니다.
 * 그래서 클릭 영역은 테두리(베젤) 고리만 씁니다. 화면은 z-index 로 위에 있어
 * 그 안쪽 클릭은 유튜브 플레이어가 그대로 받습니다.
 *
 * ── 왜 확대해도 다시 로드되지 않는가 ──
 * iframe 을 DOM 에서 옮기면 처음부터 다시 로드됩니다(= 음악이 끊깁니다).
 * 그래서 자리는 그대로 두고 CSS 크기만 바꿉니다.
 */
export function DeskPad({
  onOpen,
  zoomed,
  surfaceRef,
  screenRef,
  stageRef,
  children,
}: {
  onOpen?: () => void;
  zoomed?: boolean;
  /** 카메라가 겨냥할 본체 */
  surfaceRef?: React.Ref<HTMLDivElement>;
  /** 화면 영역. 무대 크기를 계산하는 기준입니다 */
  screenRef?: React.Ref<HTMLDivElement>;
  /** 화면 안 내용을 실제 화면 크기로 그리기 위한 무대 (모니터·캘린더와 같은 방식) */
  stageRef?: React.Ref<HTMLDivElement>;
  /** 확대했을 때 화면 안에 뜨는 유튜브 뮤직 UI */
  children?: React.ReactNode;
}) {
  const { ready, mountRef } = useMusic();

  return (
    <div className="pad" style={padBox()} data-zoom={zoomed ? "true" : "false"}>
      {/* 거치대 — 본체 뒤에서 받칩니다 */}
      <span className="pad__stand" />

      <div
        className="pad__body"
        ref={surfaceRef}
        style={{
          borderRadius: `${PAD.bezel + 4}px`,
          padding: `${PAD.bezel}px`,
        }}
      >
        {/* 전면 카메라 */}
        <span className="pad__cam" />

        <div
          className="pad__screen"
          ref={screenRef}
          style={{ width: `${PAD_SCREEN.w}px`, height: `${PAD_SCREEN.h}px` }}
        >
          {/* 무대는 늘 여기 있습니다. 플레이어가 이 안에 박혀 있고 절대 옮기지 않습니다. */}
          <div className="pad__stage" ref={stageRef}>
            <div className="ytm">
              <div className="ytm__video">
                <div ref={mountRef} />
              </div>
              {children}
            </div>
          </div>
          {!ready && <span className="pad__loading">플레이어 준비 중…</span>}
        </div>
      </div>

      {/* 테두리를 누르면 확대됩니다. 화면 위는 덮지 않습니다. */}
      {onOpen && !zoomed && (
        <button
          type="button"
          className="pad__hit"
          onClick={onOpen}
          aria-label="아이패드 — 음악 재생목록 열기"
        />
      )}
      <span className="thing__tip">아이패드 · 듣는 음악 →</span>
    </div>
  );
}

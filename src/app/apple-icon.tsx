import { ImageResponse } from "next/og";

/**
 * 아이폰 "홈 화면에 추가" 아이콘.
 *
 * ── 왜 필요한가 ──
 * `apple-touch-icon` 이 없으면 iOS 가 알아서 만듭니다. 대개 제목 첫 글자를 딴
 * 글자 타일이라 **"Y" 한 글자**가 붙습니다. 아이폰 홈 화면인 척하는 사이트가
 * 정작 홈 화면에서는 기본 글자 타일인 셈입니다.
 *
 * ── 무엇을 그렸나 ──
 * 어두운 방에 켜져 있는 모니터입니다. 이 사이트의 첫 화면이 서재이고,
 * 그 방에서 모든 것이 모니터 안에 들어 있습니다 — 프로젝트도 바탕화면도.
 * 60px 로 줄어도 "어두운 데 화면 하나가 켜져 있다" 는 읽힙니다.
 *
 * 색은 방에서 그대로 가져왔습니다. 나무 테두리(#4A4038), 종이빛 화면,
 * 모니터가 벽에 뿌리는 푸른 빛(`.mon__glow`).
 *
 * ── 왜 이미지 파일이 아닌가 ──
 * 빌드할 때 만들어 냅니다. 저장소에 PNG 를 넣지 않는다는 원칙(docs/04)을
 * 지키면서도 결과물은 진짜 PNG 입니다. 색을 고치려면 이 파일의 숫자만 바꿉니다.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(155deg, #3E3128 0%, #241C16 58%, #150F0B 100%)",
        }}
      >
        {/* 모니터가 벽에 뿌리는 빛 */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 6,
            width: 168,
            height: 128,
            display: "flex",
            borderRadius: 84,
            background:
              "radial-gradient(circle at 50% 45%, rgba(150,205,235,0.42) 0%, rgba(150,205,235,0.10) 46%, rgba(150,205,235,0) 70%)",
          }}
        />

        {/* 본체 */}
        <div
          style={{
            display: "flex",
            width: 122,
            height: 84,
            padding: 9,
            borderRadius: 13,
            background: "linear-gradient(168deg, #574A40, #332A24)",
          }}
        >
          {/* 화면 */}
          <div
            style={{
              display: "flex",
              flex: 1,
              borderRadius: 4,
              background: "linear-gradient(152deg, #F2FAFD 0%, #CFE6F2 42%, #8FB8C4 100%)",
            }}
          />
        </div>

        {/* 목받침 */}
        <div
          style={{
            display: "flex",
            width: 20,
            height: 14,
            background: "linear-gradient(90deg, #574A40, #332A24)",
          }}
        />
        {/* 받침대 */}
        <div
          style={{
            display: "flex",
            width: 62,
            height: 8,
            borderRadius: 4,
            background: "linear-gradient(180deg, #574A40, #241E1A)",
          }}
        />

        {/* 책상 상판 — 아래를 잘라 주는 한 줄 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 22,
            width: 180,
            height: 7,
            display: "flex",
            background: "linear-gradient(180deg, #6B4F35, #4A3627)",
          }}
        />
      </div>
    ),
    size,
  );
}

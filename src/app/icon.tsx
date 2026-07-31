import { ImageResponse } from "next/og";

/**
 * 앱 아이콘 (512×512).
 *
 * `apple-icon` 과 같은 장면입니다 — 어두운 방에 켜져 있는 모니터.
 * 이쪽은 **안드로이드 홈 화면과 웹 매니페스트**가 씁니다.
 * 한 장면을 두 곳에서 쓰므로, 어느 기기에 담아 두든 같은 얼굴이 붙습니다.
 *
 * 크기가 달라 비율만 다시 잡았습니다(180 → 512, 약 2.84배).
 * 안드로이드는 아이콘을 원형으로 깎기도 하므로 가장자리에 중요한 것을 두지 않습니다.
 */

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          background:
            "linear-gradient(155deg, #3E3128 0%, #241C16 58%, #150F0B 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 18,
            width: 476,
            height: 364,
            display: "flex",
            borderRadius: 238,
            background:
              "radial-gradient(circle at 50% 45%, rgba(150,205,235,0.42) 0%, rgba(150,205,235,0.10) 46%, rgba(150,205,235,0) 70%)",
          }}
        />

        {/* 본체 — 원형으로 깎여도 남도록 가운데에 모읍니다 */}
        <div
          style={{
            display: "flex",
            width: 320,
            height: 224,
            padding: 24,
            borderRadius: 34,
            background: "linear-gradient(168deg, #574A40, #332A24)",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              borderRadius: 10,
              background:
                "linear-gradient(152deg, #F2FAFD 0%, #CFE6F2 42%, #8FB8C4 100%)",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            width: 54,
            height: 38,
            background: "linear-gradient(90deg, #574A40, #332A24)",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 168,
            height: 22,
            borderRadius: 11,
            background: "linear-gradient(180deg, #574A40, #241E1A)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 62,
            width: 512,
            height: 19,
            display: "flex",
            background: "linear-gradient(180deg, #6B4F35, #4A3627)",
          }}
        />
      </div>
    ),
    size,
  );
}

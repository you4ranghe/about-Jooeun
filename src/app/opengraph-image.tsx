import { ImageResponse } from "next/og";
import { getProfile } from "@/content/resume";
import { ogFonts } from "@/lib/og";

/**
 * 링크를 보냈을 때 뜨는 그림 (사이트 전체).
 *
 * 이 사이트의 용도는 **채용 담당자에게 주소를 보내는 것**입니다.
 * 카톡·슬랙·링크드인에 붙였을 때 그림이 없으면 회색 빈 상자가 뜨고,
 * 첫인상이 거기서 정해집니다.
 *
 * 그려 넣은 것은 방입니다 — 어두운 벽, 책상, 켜져 있는 모니터.
 * 아이콘(apple-icon)과 같은 장면이라 홈 화면에 담아 둔 사람에게도 이어집니다.
 *
 * 이름과 직함은 DB 에서 옵니다. 관리자가 고치면 다음 빌드에 따라옵니다.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "you4ranghe — 백엔드 개발자 포트폴리오";

export default async function OgImage() {
  const [profile, fonts] = await Promise.all([getProfile(), ogFonts()]);
  const hasKorean = Boolean(fonts);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          background:
            "linear-gradient(150deg, #3E3128 0%, #241C16 56%, #150F0B 100%)",
          fontFamily: "Pretendard",
          color: "#FFF7EA",
        }}
      >
        {/* 모니터가 벽에 뿌리는 빛 */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -60,
            width: 720,
            height: 560,
            display: "flex",
            borderRadius: 360,
            background:
              "radial-gradient(circle at 50% 50%, rgba(150,205,235,0.36) 0%, rgba(150,205,235,0.09) 46%, rgba(150,205,235,0) 70%)",
          }}
        />

        {/* 켜져 있는 모니터 */}
        <div
          style={{
            position: "absolute",
            top: 96,
            right: 92,
            display: "flex",
            width: 330,
            height: 218,
            padding: 16,
            borderRadius: 20,
            background: "linear-gradient(168deg, #574A40, #332A24)",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              borderRadius: 6,
              background:
                "linear-gradient(152deg, #F2FAFD 0%, #CFE6F2 44%, #8FB8C4 100%)",
            }}
          />
        </div>

        {/* 책상 상판 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 150,
            height: 14,
            display: "flex",
            background: "linear-gradient(180deg, #6B4F35, #4A3627)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", zIndex: 2 }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 4,
              color: "#C9A96A",
              marginBottom: 18,
            }}
          >
            PORTFOLIO · SEOUL
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              letterSpacing: -2,
              lineHeight: 1.1,
            }}
          >
            {hasKorean
              ? profile.name || "you4ranghe의 작업실"
              : "you4ranghe"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              marginTop: 14,
              color: "rgba(255,247,234,0.66)",
            }}
          >
            {profile.role || "backend engineer · seoul"}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

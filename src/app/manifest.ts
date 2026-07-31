import type { MetadataRoute } from "next";

/**
 * 웹 매니페스트 — "홈 화면에 추가" 했을 때의 모습.
 *
 * ── 왜 이 사이트에 특히 잘 맞나 ──
 * 좁은 화면에서는 이 사이트가 **아이폰 홈 화면인 척**합니다(docs/08).
 * 그런데 정작 브라우저 주소창이 위에 남아 있으면 "홈 화면 흉내를 낸 웹페이지"
 * 로 보입니다. `display: standalone` 이면 주소창이 사라져서,
 * 홈 화면에서 열었을 때 진짜 앱처럼 전체 화면으로 뜹니다.
 *
 * ── 덤으로 풀리는 것 ──
 * 안드로이드는 홈 화면 아이콘을 여기 icons 에서 가져갑니다.
 * 지금까지 기본 아이콘이 붙던 것이 `icon.tsx` 로 바뀝니다.
 * (아이폰은 `apple-icon.tsx` 를 따로 봅니다.)
 *
 * ── 색 ──
 * `background_color` 는 앱이 뜨는 동안의 빈 화면 색입니다.
 * 방의 어두운 벽으로 맞춰 두면 흰 화면이 번쩍하지 않습니다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "you4ranghe — 백엔드 개발자 포트폴리오",
    short_name: "작업실",
    description:
      "책상 위 모니터 안에 만든 것들이 들어 있는 작업실. 좁은 화면에서는 홈 화면이 됩니다.",
    lang: "ko",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#241C16",
    theme_color: "#241C16",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        // 안드로이드가 원형·둥근사각 등 기기 모양대로 깎아 쓸 수 있게
        purpose: "any",
      },
    ],
  };
}

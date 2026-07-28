import type { Metadata } from "next";
import { Jua, IBM_Plex_Sans_KR, IBM_Plex_Mono, Black_Han_Sans } from "next/font/google";
import "./globals.css";

/**
 * 폰트는 next/font 로 셀프 호스팅합니다.
 * Google Fonts 를 <link> 로 걸면 외부 요청이 생기고 폰트 교체 시 레이아웃이 흔들립니다.
 */

/**
 * 서브셋에 관한 확인된 사실 (2026.07 빌드로 실측):
 *
 * 이 한글 폰트들은 next/font 가 "latin" 만 받습니다("korean" 은 타입 오류).
 * 그런데 latin 을 요청해도 생성된 CSS 의 unicode-range 에 한글 코드포인트가
 * 들어 있습니다 (U+AC00, U+ACE0, U+AE30 …). Google 이 한글 폰트를
 * unicode-range 조각 수백 개로 쪼개 서빙하기 때문입니다.
 *
 * 결과: woff2 파일이 473개 생성되지만 각각 아주 작고,
 * 브라우저는 화면에 실제로 쓰인 글자의 조각만 내려받습니다.
 * → 서브셋을 늘릴 필요 없고, 파일 개수에 놀랄 필요도 없습니다.
 */

/** 방의 표제 — 둥글고 친근한 한글 */
const jua = Jua({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/** 본문 */
const plexKr = IBM_Plex_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

/** 수치 · 라벨 — 한글 서브셋이 없는 폰트이므로 latin 만 */
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/** 갤러리의 큰 표제 — 두꺼운 한글 */
const blackHan = Black_Han_Sans({
  variable: "--font-heavy",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/**
 * OG 태그의 절대 주소를 만드는 기준값입니다.
 * 틀리면 카카오톡·슬랙 링크 미리보기가 깨집니다.
 * 커스텀 도메인을 붙이면 여기만 바꾸면 됩니다.
 */
const SITE_URL = "https://about-jooeun.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "you4ranghe — 백엔드 개발자 포트폴리오",
    template: "%s — you4ranghe",
  },
  description:
    "4년차 백엔드 개발자. Java와 Spring으로 주문·결제·정산 도메인을 만듭니다. 작업실을 둘러보고 저장소 12개를 열어 보세요.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "you4ranghe",
    url: SITE_URL,
  },
  /**
   * ⚠️ 지금은 색인을 막아 뒀습니다.
   *
   * src/content/resume.ts 의 경력·자격증·회사명이 아직 예시(제가 지어낸 값)입니다.
   * 실명 도메인에 지어낸 이력이 검색에 잡히면 구직에 해가 됩니다.
   *
   * 실제 이력으로 교체한 뒤 아래를 { index: true, follow: true } 로 바꾸세요.
   * 그 한 줄이 이 사이트를 검색에 여는 스위치입니다.
   */
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${jua.variable} ${plexKr.variable} ${plexMono.variable} ${blackHan.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}

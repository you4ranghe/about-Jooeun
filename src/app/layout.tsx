import type { Metadata } from "next";
import {
  Jua,
  IBM_Plex_Sans_KR,
  IBM_Plex_Mono,
  Nanum_Pen_Script,
  Gothic_A1,
  Gowun_Batang,
  Nanum_Myeongjo,
} from "next/font/google";
import { SITE_URL } from "@/content/site";
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

/** 벽에 붙인 메모 — 손으로 쓴 글씨. 종이에 적힌 것처럼 보여야 합니다 */
const nanumPen = Nanum_Pen_Script({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/**
 * 프로젝트 상세의 표제 — 굵은 고딕.
 *
 * 본문(Plex Sans KR)은 500 까지만 있어서 큰 제목이 물러 보입니다.
 * 표제만 900 으로 세우려고 따로 받습니다. 700 은 카드 제목용입니다.
 * 포스터체(Black Han Sans)를 쓰지 않은 이유: 상세는 읽는 문서라
 * 표제까지 포스터가 되면 본문이 부속처럼 보입니다 (docs/07 §7.1).
 */
const gothicA1 = Gothic_A1({
  variable: "--font-strong",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
});

/**
 * 명조 표제 — 책을 다루는 사이트의 상세페이지용.
 *
 * 상세페이지는 그 프로젝트 사이트의 글씨를 입습니다(docs/07 §5).
 * 인터페이퍼(바우치 서재)가 책 제목에 Gowun Batang 을 쓰므로 같은 걸 씁니다.
 */
const gowunBatang = Gowun_Batang({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

/** 불멍 감정 소각장이 표제에 쓰는 명조. 같은 명조라도 인상이 달라 따로 받습니다 */
const nanumMyeongjo = Nanum_Myeongjo({
  variable: "--font-myeongjo",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

/*
 * 2026-07-30 에 Black Han Sans(--font-heavy)를 내렸습니다.
 * 갤러리 목록의 큰 표제 전용이었는데 그 화면이 사라져 쓰는 곳이 0곳이 됐습니다.
 * 포스터체가 다시 필요하면 그때 올립니다 — 지금 남은 일곱은 전부 쓰입니다.
 */

/**
 * OG 태그의 절대 주소를 만드는 기준값은 content/site.ts 에 있습니다.
 * 브라우저 창의 주소 표시줄도 같은 값을 씁니다 — 도메인을 바꿀 때 한 곳만 고칩니다.
 */

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
      /* 아래 인라인 스크립트가 첫 페인트 전에 data-shell 을 심습니다.
         서버가 보낸 HTML 에는 없는 속성이라 리액트가 불일치로 봅니다 —
         **일부러 만든 차이**이므로 이 요소의 속성 검사만 끕니다.
         한 겹만 적용되므로 안쪽 내용은 그대로 검사받습니다. */
      suppressHydrationWarning
      className={`${jua.variable} ${plexKr.variable} ${plexMono.variable} ${nanumPen.variable} ${gothicA1.variable} ${gowunBatang.variable} ${nanumMyeongjo.variable} antialiased`}
    >
      <head>
        {/*
          그리기 전에 어떤 셸인지 심어 둡니다 (docs/08 §6).

          서버는 화면 크기를 모르므로 SSR 은 서재를 그립니다. 그대로 두면
          폰에서 **방이 한 번 번쩍한 뒤** 홈 화면으로 바뀝니다.
          이 한 줄이 첫 페인트 전에 html[data-shell] 을 정해 주고,
          CSS 가 맞지 않는 셸을 감춥니다. 리액트는 그 뒤에 조용히 교체합니다.

          인터페이퍼(02)가 다크모드 깜빡임을 막은 것과 같은 수법입니다.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.shell=matchMedia("(max-width: 900px)").matches?"phone":"room"}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

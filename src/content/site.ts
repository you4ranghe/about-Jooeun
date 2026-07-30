/**
 * 사이트 자체에 대한 값.
 *
 * 두 곳에서 씁니다.
 *   - `app/layout.tsx` 의 metadataBase — OG 태그의 절대 주소 기준
 *   - 브라우저 창의 주소 표시줄 — 창 안에 열린 페이지의 실제 주소
 *
 * 두 군데에 따로 적어 두면 도메인을 바꿀 때 한쪽만 고치게 됩니다.
 */
export const SITE_HOST = "about-jooeun.vercel.app";
export const SITE_URL = `https://${SITE_HOST}`;

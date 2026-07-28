import type { ArtKey } from "@/content/types";

/**
 * 방에 놓인 사물 그림 12종.
 *
 * 이미지 파일을 쓰지 않고 인라인 SVG 로 그립니다.
 *  - 네트워크 요청 0회, Vercel 이미지 변환 0회 (docs/04 §3)
 *  - 색을 CSS 변수로 넘기거나 밤 얼굴을 켜고 끄기가 쉬움
 *
 * 각 그림 안의 <g className="face"> 는 낮에는 opacity 0,
 * 밤(<body class="is-night">)에만 나타납니다. scene.css 에서 제어합니다.
 *
 * 빛이 오른쪽 창에서 들어오므로 그림자는 항상 왼쪽으로 떨어집니다.
 */

const FACE = "face";

function Yut() {
  return (
    <svg viewBox="0 0 96 50" role="presentation">
      <g stroke="#8A5527" strokeWidth="1.6">
        <rect x="3" y="3" width="88" height="9" rx="4.5" fill="#E3B579" />
        <rect x="6" y="14" width="86" height="9" rx="4.5" fill="#FFF6E2" />
        <rect x="2" y="25" width="88" height="9" rx="4.5" fill="#E3B579" />
        <rect x="7" y="36" width="84" height="9" rx="4.5" fill="#FFF6E2" />
      </g>
      <g stroke="#C0392B" strokeWidth="2.6" strokeLinecap="round">
        <path d="M24 18.5h3M42 18.5h3M60 18.5h3M34 40.5h3M56 40.5h3" />
      </g>
      <g fill="rgba(255,255,255,.45)">
        <rect x="6" y="4.4" width="82" height="2" rx="1" />
        <rect x="5" y="26.4" width="82" height="2" rx="1" />
      </g>
      {/* 네 짝이 나란히 누워 천장을 본다 */}
      <g className={FACE}>
        <g fill="#3A2740">
          <circle cx="12" cy="6.2" r="1.4" />
          <circle cx="18" cy="6.2" r="1.4" />
          <circle cx="14" cy="17.2" r="1.4" />
          <circle cx="20" cy="17.2" r="1.4" />
          <circle cx="11" cy="28.2" r="1.4" />
          <circle cx="17" cy="28.2" r="1.4" />
          <circle cx="16" cy="39.2" r="1.4" />
          <circle cx="22" cy="39.2" r="1.4" />
        </g>
        <g fill="none" stroke="#3A2740" strokeWidth="1.1" strokeLinecap="round">
          <path d="M13 9q2 1.7 4 0" />
          <path d="M15 20q2 1.7 4 0" />
          <path d="M12 31q2 1.7 4 0" />
          <path d="M17 42q2 1.7 4 0" />
        </g>
      </g>
    </svg>
  );
}

function Bell() {
  return (
    <svg viewBox="0 0 58 62" role="presentation">
      <path
        d="M29 7c-9.5 0-16 7.4-16 18 0 9.4-2.2 14.6-5.4 18.6h42.8C47.2 39.6 45 34.4 45 25c0-10.6-6.5-18-16-18z"
        fill="#FFC93C"
        stroke="#B98A1E"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx="29" cy="5.5" r="4.2" fill="#E8A81C" stroke="#B98A1E" strokeWidth="2" />
      <path d="M22.5 48.5a6.5 6.5 0 0013 0" fill="#E8A81C" stroke="#B98A1E" strokeWidth="2.6" />
      <path
        d="M18.5 25c0-6.4 3.2-10.6 8.4-11.6"
        stroke="#FFF6E2"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M13 43.6h32" stroke="#B98A1E" strokeWidth="2.2" />
      {/* 눈을 감고 졸고 있다 */}
      <g className={FACE} fill="none" stroke="#3A2740" strokeWidth="2" strokeLinecap="round">
        <path d="M19 30q3.2-4 6.4 0" />
        <path d="M32.4 30q3.2-4 6.4 0" />
        <path d="M25.5 36.5q3.5 3 7 0" />
      </g>
    </svg>
  );
}

function Lock() {
  return (
    <svg viewBox="0 0 54 64" role="presentation">
      <path
        d="M15 27v-9.5a12 12 0 0124 0V27"
        fill="none"
        stroke="#A7B2C4"
        strokeWidth="6.4"
        strokeLinecap="round"
      />
      <path
        d="M15 22v-4.5a12 12 0 0110-11.8"
        fill="none"
        stroke="#D3DAE6"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <rect x="6" y="26" width="42" height="33" rx="9" fill="#6FC3F0" stroke="#3E86AE" strokeWidth="2.8" />
      <rect x="10" y="30" width="12" height="24" rx="6" fill="rgba(255,255,255,.28)" />
      <circle cx="27" cy="39" r="5.2" fill="#2C5F7E" />
      <path d="M27 43v7" stroke="#2C5F7E" strokeWidth="4.4" strokeLinecap="round" />
      {/* 열쇠구멍이 그대로 입이 된다. 눈매가 까다롭다 */}
      <g className={FACE}>
        <circle cx="20" cy="32.5" r="2.2" fill="#25405A" />
        <circle cx="34" cy="32.5" r="2.2" fill="#25405A" />
        <circle cx="20.8" cy="31.6" r="0.8" fill="#fff" />
        <circle cx="34.8" cy="31.6" r="0.8" fill="#fff" />
        <g stroke="#25405A" strokeWidth="1.8" strokeLinecap="round">
          <path d="M16.6 28.3l5 1.5" />
          <path d="M37.4 28.3l-5 1.5" />
        </g>
      </g>
    </svg>
  );
}

function Ticket() {
  return (
    <svg viewBox="0 0 80 50" role="presentation">
      <path
        d="M5 9h70v11.5a5.5 5.5 0 000 11V43H5V31.5a5.5 5.5 0 000-11z"
        fill="#FF7A5C"
        stroke="#C4472F"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M52 11v30" stroke="#FFE0D6" strokeWidth="2.4" strokeDasharray="4 4.5" />
      <g stroke="#FFE9E2" strokeWidth="3.6" strokeLinecap="round">
        <path d="M13 20h30M13 30h21" />
      </g>
      <path
        d="M60 20l4 4 8-8"
        stroke="#FFF6E2"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="40" cy="4" r="3.6" fill="#8A5527" />
      <circle cx="39" cy="3" r="1.2" fill="#C99A17" />
      {/* 선착순이라 신났다 */}
      <g className={FACE}>
        <rect x="10" y="14" width="38" height="26" fill="#FF7A5C" />
        <ellipse cx="16" cy="31" rx="3.2" ry="2.1" fill="#FFB3A0" />
        <ellipse cx="40" cy="31" rx="3.2" ry="2.1" fill="#FFB3A0" />
        <circle cx="22" cy="24" r="2.6" fill="#3A2740" />
        <circle cx="34" cy="24" r="2.6" fill="#3A2740" />
        <circle cx="22.9" cy="23" r="0.9" fill="#fff" />
        <circle cx="34.9" cy="23" r="0.9" fill="#fff" />
        <ellipse cx="28" cy="33" rx="3.6" ry="4.2" fill="#3A2740" />
      </g>
    </svg>
  );
}

function Coins() {
  return (
    <svg viewBox="0 0 62 58" role="presentation">
      <g stroke="#B98A1E" strokeWidth="2.3">
        <ellipse cx="31" cy="48" rx="23" ry="7.6" fill="#F0B72C" />
        <ellipse cx="31" cy="39" rx="23" ry="7.6" fill="#FFD867" />
        <ellipse cx="31" cy="30" rx="23" ry="7.6" fill="#F0B72C" />
        <ellipse cx="31" cy="21" rx="23" ry="7.6" fill="#FFD867" />
      </g>
      <ellipse cx="31" cy="21" rx="13" ry="4" fill="#FFE9A8" />
      <text x="31" y="24" fontSize="9" textAnchor="middle" fill="#B98A1E" fontFamily="monospace">
        ₩
      </text>
      {/* 뿌듯하다 */}
      <g className={FACE}>
        <circle cx="24" cy="47" r="2.1" fill="#3A2740" />
        <circle cx="38" cy="47" r="2.1" fill="#3A2740" />
        <circle cx="24.8" cy="46.1" r="0.75" fill="#fff" />
        <circle cx="38.8" cy="46.1" r="0.75" fill="#fff" />
        <path d="M28 51.4q3 2.4 6 0" fill="none" stroke="#3A2740" strokeWidth="1.7" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Rack() {
  return (
    <svg viewBox="0 0 58 72" role="presentation">
      <defs>
        <linearGradient id="art-rack-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8A6FA0" />
          <stop offset="1" stopColor="#46304F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="50" height="64" rx="8" fill="#46304F" stroke="#2C1E36" strokeWidth="2.6" />
      <rect x="4" y="4" width="50" height="64" rx="8" fill="url(#art-rack-sheen)" opacity=".4" />
      <g fill="#6B5178">
        <rect x="10" y="11" width="38" height="12" rx="3" />
        <rect x="10" y="27" width="38" height="12" rx="3" />
        <rect x="10" y="43" width="38" height="12" rx="3" />
        <rect x="10" y="59" width="38" height="6" rx="3" />
      </g>
      <g stroke="#3A2A46" strokeWidth="1.4">
        <path d="M14 17h16M14 33h16M14 49h16" />
      </g>
      <circle cx="42" cy="17" r="2.8" fill="#3FBFA8" />
      <circle cx="42" cy="33" r="2.8" fill="#FFC93C" />
      <circle cx="42" cy="49" r="2.8" fill="#FF7A5C" />
      {/* 24시간 근무 중이라 입이 일자다 */}
      <g className={FACE}>
        <rect x="10" y="43" width="28" height="12" rx="3" fill="#6B5178" />
        <circle cx="19" cy="48" r="2.3" fill="#241830" />
        <circle cx="30" cy="48" r="2.3" fill="#241830" />
        <circle cx="19.8" cy="47.1" r="0.8" fill="#C9B8DA" />
        <circle cx="30.8" cy="47.1" r="0.8" fill="#C9B8DA" />
        <path d="M21 52.4h7" stroke="#241830" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Glass() {
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <path d="M41 41l17 17" stroke="#8A5527" strokeWidth="8.5" strokeLinecap="round" />
      <path d="M41 41l17 17" stroke="#B98A5F" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="26" cy="26" r="21" fill="rgba(111,195,240,.4)" stroke="#46304F" strokeWidth="4.2" />
      <path
        d="M14 21a12.5 12.5 0 0110.5-8.5"
        stroke="#FFF6E2"
        strokeWidth="3.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.4" />
      {/* 렌즈 안에서 눈이 확대돼 보인다 */}
      <g className={FACE}>
        <circle cx="19" cy="24" r="4.6" fill="#2B3D52" />
        <circle cx="33" cy="24" r="4.6" fill="#2B3D52" />
        <circle cx="20.8" cy="22.2" r="1.6" fill="#fff" />
        <circle cx="34.8" cy="22.2" r="1.6" fill="#fff" />
        <path d="M20 35q6 5 12 0" fill="none" stroke="#2B3D52" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Plant() {
  return (
    <svg viewBox="0 0 70 86" role="presentation">
      <g stroke="#2C7A5E" strokeWidth="2.4" fill="#3FBFA8">
        <path d="M35 54c0-17-9.5-27.5-23-31.5C14 39 21.5 50 35 54z" />
        <path d="M35 54c0-19 10.5-29.5 25-32.5C57 39 48.5 49.5 35 54z" />
        <path d="M35 54c-2-13.5 3-25 12.5-32.5C46 36 42.5 46.5 35 54z" />
      </g>
      <path d="M12 54h46l-5 27H17z" fill="#FF7A5C" stroke="#C4472F" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M10 50h50v7.5H10z" fill="#FF9880" stroke="#C4472F" strokeWidth="2.5" />
      <path d="M20 62h4M28 66h4M40 62h4" stroke="#FFD0C4" strokeWidth="2.6" strokeLinecap="round" />
      {/* 세입자 거미 — 낮에도 눈이 있다 */}
      <circle cx="51" cy="25" r="4.6" fill="#46304F" />
      <g stroke="#46304F" strokeWidth="1.9" strokeLinecap="round">
        <path d="M47 22l-5.5-3.5M47 28l-5.5 3.5M55 22l5.5-3.5M55 28l5.5 3.5" />
      </g>
      <circle cx="49.4" cy="23.6" r="1" fill="#FFF6E2" />
      <circle cx="52.6" cy="23.6" r="1" fill="#FFF6E2" />
      {/* 밤에는 화분이 주인 얼굴을 드러낸다 */}
      <g className={FACE}>
        <rect x="19" y="59" width="32" height="17" fill="#FF7A5C" />
        <circle cx="29" cy="66" r="2.7" fill="#3A2740" />
        <circle cx="41" cy="66" r="2.7" fill="#3A2740" />
        <circle cx="29.9" cy="65" r="0.95" fill="#fff" />
        <circle cx="41.9" cy="65" r="0.95" fill="#fff" />
        <path d="M31.5 71.5q3.5 3.4 7 0" fill="none" stroke="#3A2740" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Duck() {
  return (
    <svg viewBox="0 0 72 60" role="presentation">
      <ellipse cx="35" cy="43" rx="27" ry="14.5" fill="#F5BE2A" stroke="#C99A17" strokeWidth="2.5" />
      <ellipse cx="30" cy="39" rx="18" ry="8" fill="#FFD867" opacity=".7" />
      <circle cx="49" cy="22" r="14.5" fill="#FFD867" stroke="#C99A17" strokeWidth="2.5" />
      <path
        d="M61.5 22l10.5 4.4-10.5 5.2z"
        fill="#FF9440"
        stroke="#C4661F"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <circle cx="53" cy="18" r="2.9" fill="#46304F" />
      <circle cx="54" cy="17" r="1" fill="#fff" />
      <path
        d="M16 39c6.5-6.5 15-6.5 21.5 0"
        stroke="#C99A17"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M43 12a10 10 0 018-2" stroke="#FFF0B8" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* 밤에는 눈이 하나 더 생기고 얼굴이 붉어진다 */}
      <g className={FACE}>
        <ellipse cx="41" cy="27" rx="4" ry="2.6" fill="#FF8A8A" opacity=".5" />
        <ellipse cx="57" cy="27.5" rx="3.4" ry="2.2" fill="#FF8A8A" opacity=".4" />
        <circle cx="43" cy="20" r="2.5" fill="#46304F" />
        <circle cx="43.9" cy="19" r="0.9" fill="#fff" />
      </g>
    </svg>
  );
}

function Frame() {
  return (
    <svg viewBox="0 0 84 96" role="presentation">
      <defs>
        <linearGradient id="art-frame-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8FD3C4" />
          <stop offset="1" stopColor="#FFD37A" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="78" height="90" rx="4" fill="#B98A5F" stroke="#8A5527" strokeWidth="2.6" />
      <rect x="12" y="12" width="60" height="72" rx="2" fill="#FFF7EA" />
      <rect x="12" y="12" width="60" height="72" rx="2" fill="url(#art-frame-sky)" />
      <circle cx="42" cy="42" r="13" fill="#46304F" />
      <path d="M18 84c4-14 12-20 24-20s20 6 24 20z" fill="#46304F" />
      <rect x="12" y="12" width="60" height="72" rx="2" fill="none" stroke="#8A5527" strokeWidth="1.6" />
      {/* 밤에는 사진 속 사람도 눈을 뜬다 */}
      <g className={FACE}>
        <circle cx="37" cy="40" r="2.4" fill="#FFF7EA" />
        <circle cx="47" cy="40" r="2.4" fill="#FFF7EA" />
        <path d="M38 47q4 3.4 8 0" fill="none" stroke="#FFF7EA" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Books() {
  return (
    <svg viewBox="0 0 88 66" role="presentation">
      <g stroke="#46304F" strokeWidth="2.5">
        <rect x="4" y="43" width="54" height="14" rx="3" fill="#FF7A5C" />
        <rect x="8" y="31" width="48" height="12" rx="3" fill="#6FC3F0" />
        <rect x="6" y="19" width="52" height="12" rx="3" fill="#7B5AA6" />
      </g>
      <g stroke="rgba(255,255,255,.45)" strokeWidth="1.6">
        <path d="M10 50h42M13 37h38M11 25h42" />
      </g>
      <path d="M62 32h14a5.5 5.5 0 010 11h-2.5" fill="none" stroke="#C99A17" strokeWidth="3.4" />
      <path
        d="M58 27h21v22.5a6.5 6.5 0 01-6.5 6.5h-8A6.5 6.5 0 0158 49.5z"
        fill="#FFF6E2"
        stroke="#C99A17"
        strokeWidth="2.6"
      />
      <ellipse cx="68.5" cy="28" rx="10.5" ry="2.6" fill="#7A4A2A" />
      {/* 식은 커피를 안고 웃는다 */}
      <g className={FACE}>
        <ellipse cx="61" cy="43" rx="2.6" ry="1.7" fill="#FF9E8C" opacity=".6" />
        <ellipse cx="76" cy="43" rx="2.6" ry="1.7" fill="#FF9E8C" opacity=".6" />
        <circle cx="64" cy="39" r="2.3" fill="#3A2740" />
        <circle cx="73" cy="39" r="2.3" fill="#3A2740" />
        <circle cx="64.8" cy="38.1" r="0.8" fill="#fff" />
        <circle cx="73.8" cy="38.1" r="0.8" fill="#fff" />
        <path d="M65 44.4q3.5 3 7 0" fill="none" stroke="#3A2740" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Box() {
  return (
    <svg viewBox="0 0 86 70" role="presentation">
      <path d="M5 21h76v46H5z" fill="#C98A55" stroke="#8A5527" strokeWidth="2.7" strokeLinejoin="round" />
      <path d="M5 21L21 4h44l16 17z" fill="#DDA672" stroke="#8A5527" strokeWidth="2.7" strokeLinejoin="round" />
      <rect x="35" y="4" width="16" height="63" fill="#FFF6E2" opacity=".78" stroke="#8A5527" strokeWidth="2" />
      <g stroke="#8A5527" strokeWidth="2.5" strokeLinecap="round">
        <path d="M13 33h13M13 41h9" />
      </g>
      <path
        d="M60 34l5 5 11-11"
        stroke="#3FBFA8"
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 눈이 좌우로 갈라지고 가운데 테이프가 입을 막고 있다 */}
      <g className={FACE}>
        <rect x="9" y="27" width="24" height="17" fill="#C98A55" />
        <rect x="53" y="27" width="26" height="17" fill="#C98A55" />
        <circle cx="22" cy="34" r="3.2" fill="#3A2740" />
        <circle cx="64" cy="34" r="3.2" fill="#3A2740" />
        <circle cx="23.1" cy="32.8" r="1.1" fill="#fff" />
        <circle cx="65.1" cy="32.8" r="1.1" fill="#fff" />
        <g stroke="#3A2740" strokeWidth="2" strokeLinecap="round">
          <path d="M17 28.4l5 1.7" />
          <path d="M69 28.4l-5 1.7" />
        </g>
      </g>
    </svg>
  );
}

const ART: Record<ArtKey, () => React.JSX.Element> = {
  frame: Frame,
  yut: Yut,
  bell: Bell,
  lock: Lock,
  ticket: Ticket,
  coins: Coins,
  rack: Rack,
  glass: Glass,
  plant: Plant,
  duck: Duck,
  books: Books,
  box: Box,
};

/** 사물 그림 하나를 그립니다. */
export function ObjectArt({ art }: { art: ArtKey }) {
  const Shape = ART[art];
  return <Shape />;
}

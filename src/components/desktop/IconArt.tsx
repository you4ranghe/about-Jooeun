import type { IconArtKey } from "@/content/types";

/**
 * 바탕화면 아이콘 그림.
 *
 * 전부 SVG 로 직접 그립니다. 이미지 파일을 추가하지 않는다는 원칙(docs/04)을
 * 화면 안에서도 지킵니다.
 *
 * ── 상표를 쓰지 않습니다 ──
 * Windows 풍으로 만들되 실제 로고는 베끼지 않습니다.
 * GitHub 도 고양이 대신 지구본입니다 — 어차피 "웹 주소로 나가는 바로가기"라
 * 브라우저 아이콘 쪽이 오히려 하는 일에 가깝습니다.
 *
 * 크기는 64×64 기준이고 실제 크기는 CSS 가 정합니다.
 */

/**
 * 윷놀이 온라인.
 *
 * 지어낸 그림이 아니라 **그 사이트가 실제로 쓰는 앱 아이콘**을 옮긴 것입니다
 * (저장소의 `icon-192.png`). 남색 바탕에 흰 윷판, 가운데만 청록입니다.
 *
 * 바탕화면 바로가기는 그 사이트의 얼굴을 그대로 달고 있어야
 * 눌렀을 때 나오는 것과 아이콘이 이어집니다. 예쁜 그림을 새로 그리면
 * 그 순간 아이콘이 사이트가 아니라 이 포트폴리오의 장식이 됩니다.
 *
 * PNG 를 그대로 쓰지 않은 이유: 이미지 파일을 늘리지 않기로 했고(docs/04),
 * SVG 면 방에서 축소돼도 흐려지지 않습니다.
 */
function Yut() {
  /** 판의 네 귀 (남·북·동·서 꼭짓점) */
  const corners = [
    [13, 13],
    [51, 13],
    [51, 51],
    [13, 51],
  ] as const;

  /** 변 위의 작은 칸 — 귀와 귀 사이를 4등분 */
  const edges = [
    [22.5, 13],
    [32, 13],
    [41.5, 13],
    [51, 22.5],
    [51, 32],
    [51, 41.5],
    [41.5, 51],
    [32, 51],
    [22.5, 51],
    [13, 41.5],
    [13, 32],
    [13, 22.5],
  ] as const;

  /** 지름길 — 귀에서 가운데로 가는 길목 둘씩 */
  const shortcuts = [
    [19.3, 19.3],
    [25.7, 25.7],
    [44.7, 19.3],
    [38.3, 25.7],
    [44.7, 44.7],
    [38.3, 38.3],
    [19.3, 44.7],
    [25.7, 38.3],
  ] as const;

  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <defs>
        <linearGradient id="dtYutBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2B2F63" />
          <stop offset="1" stopColor="#14172F" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#dtYutBg)" />

      {/* 길 — 네 변과 두 지름길 */}
      <g
        stroke="#FFFFFF"
        strokeOpacity="0.3"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M13 13h38v38H13z" />
        <path d="M13 13l38 38M51 13L13 51" />
      </g>

      {/* 작은 칸 */}
      <g fill="#D7D9EE">
        {edges.map(([x, y]) => (
          <circle key={`e${x}-${y}`} cx={x} cy={y} r="2.6" />
        ))}
        {shortcuts.map(([x, y]) => (
          <circle key={`s${x}-${y}`} cx={x} cy={y} r="2.2" />
        ))}
      </g>

      {/* 네 귀 — 크고 흰 칸 */}
      <g fill="#FFFFFF">
        {corners.map(([x, y]) => (
          <circle key={`c${x}-${y}`} cx={x} cy={y} r="5.6" />
        ))}
      </g>

      {/* 가운데 방 — 이 아이콘에서 유일하게 색이 있는 곳 */}
      <circle cx="32" cy="32" r="6.2" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="3.1" fill="#00C2A8" />
    </svg>
  );
}

/**
 * 인터페이퍼 — 바우치 서재.
 *
 * 이 사이트는 파비콘이 기본값이라 옮겨올 원본이 없습니다(`web/public` 에 아이콘 없음).
 * 그래서 **그 사이트의 시그니처**를 그렸습니다 — 책 표지가 가운데 한 권만 또렷하고
 * 양옆은 기울어 흐려지는 Coverflow 캐러셀입니다.
 *
 * 색도 지어내지 않고 그 사이트의 팔레트에서 가져왔습니다.
 * 따뜻한 회백 바탕(#F4F1EC) · 먹(#26231F) · 강조 차콜(#4A443E) ·
 * 다크모드 모래(#D8C8AB). 남색인 윷놀이 옆에 두면 확실히 구분됩니다.
 */
function Library() {
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <defs>
        <linearGradient id="dtLibBg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#FBF9F5" />
          <stop offset="1" stopColor="#EDE7DC" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#dtLibBg)" />

      {/* 바깥 두 권 — 기울고 작고 흐림 */}
      <g opacity="0.42">
        <rect
          x="6.5"
          y="22"
          width="13"
          height="24"
          rx="1.6"
          fill="#4A443E"
          transform="rotate(-13 13 34)"
        />
        <rect
          x="44.5"
          y="22"
          width="13"
          height="24"
          rx="1.6"
          fill="#4A443E"
          transform="rotate(13 51 34)"
        />
      </g>

      {/* 안쪽 두 권 */}
      <g opacity="0.72">
        <rect
          x="15"
          y="18.5"
          width="15"
          height="29"
          rx="1.8"
          fill="#26231F"
          transform="rotate(-7 22.5 33)"
        />
        <rect
          x="34"
          y="18.5"
          width="15"
          height="29"
          rx="1.8"
          fill="#26231F"
          transform="rotate(7 41.5 33)"
        />
      </g>

      {/* 가운데 한 권만 반듯하고 또렷합니다 */}
      <rect x="23" y="14" width="18" height="36" rx="2" fill="#26231F" />
      {/* 책등 — 표지와 등을 가르는 선 */}
      <rect x="26.4" y="14" width="1.5" height="36" rx="0.75" fill="#0F0D0B" />
      {/* 제목 자리. 이 사이트의 책 제목은 명조입니다 */}
      <g fill="#D8C8AB">
        <rect x="30" y="21" width="8" height="2" rx="1" />
        <rect x="30" y="26" width="6" height="2" rx="1" />
      </g>

      {/* 바닥 반사 — Coverflow 의 그 반짝임 */}
      <rect
        x="14"
        y="51.5"
        width="36"
        height="3"
        rx="1.5"
        fill="#26231F"
        opacity="0.14"
      />
    </svg>
  );
}

/**
 * 불멍 감정 소각장.
 *
 * 이 사이트도 파비콘이 없어 옮겨올 원본이 없습니다.
 * 대신 이름 그대로 **불**을 그렸습니다 — 근처가 캄캄하고 불만 따뜻한,
 * 그 사이트의 인상 그대로입니다.
 *
 * 색은 실제 화면에서 뽑았습니다. 바탕 #04050A, 불빛 #FFAA5A,
 * 글자로 쓰이는 크림 #FFF4E6. 남색(윷놀이)·회백(인터페이퍼)과 나란히 놓으면
 * 셋이 확실히 구분됩니다.
 */
function Bonfire() {
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <defs>
        <radialGradient id="dtFireGlow" cx="0.5" cy="0.68" r="0.55">
          <stop offset="0" stopColor="#FFAA5A" stopOpacity="0.42" />
          <stop offset="1" stopColor="#FFAA5A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dtFlame" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0" stopColor="#FF8A3C" />
          <stop offset="0.55" stopColor="#FFC178" />
          <stop offset="1" stopColor="#FFF0D2" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="14" fill="#04050A" />
      <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#dtFireGlow)" />

      {/* 장작 두 개 */}
      <g stroke="#5A4433" strokeWidth="4.6" strokeLinecap="round">
        <path d="M17 50l30-6" />
        <path d="M17 44l30 6" />
      </g>

      {/* 불꽃 — 바깥 한 겹, 안쪽 한 겹 */}
      <path
        d="M32 14c6 7 10 11 10 17a10 10 0 0 1-20 0c0-3 1.6-5.4 3.4-7.6.6 1.9 1.8 3.2 3.2 3.6-1.1-4.6.6-9.4 3.4-13z"
        fill="url(#dtFlame)"
      />
      <path
        d="M32 27c2.6 3.2 4.2 5 4.2 7.4a4.2 4.2 0 0 1-8.4 0c0-2.4 1.6-4.2 4.2-7.4z"
        fill="#FFF4E6"
        opacity="0.9"
      />

      {/* 불티 */}
      <g fill="#FFCE95">
        <circle cx="45" cy="21" r="1.6" opacity="0.85" />
        <circle cx="20" cy="27" r="1.2" opacity="0.6" />
        <circle cx="47" cy="33" r="1" opacity="0.45" />
      </g>
    </svg>
  );
}

/**
 * MomsUp — 협찬 관리 에이전트.
 *
 * 이 사이트도 옮겨올 파비콘이 없습니다. 대신 하는 일을 그렸습니다 —
 * **받은 DM 한 통이 정리된 문서로 바뀌는 것**이 이 제품의 전부입니다.
 * 말풍선 안에 줄이 반듯하게 서 있고, 옆에 반짝임 하나.
 *
 * 색은 실제 화면에서 뽑은 분홍입니다(#EC4899 · #F9A8D4 · #FB7185).
 * 남색 · 회백 · 검정에 이어 넷째 아이콘이라 확실히 튀어야 했습니다.
 */
function Dm() {
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <defs>
        <linearGradient id="dtDmBg" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#FB7185" />
          <stop offset="0.5" stopColor="#F472B6" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#dtDmBg)" />
      <path
        d="M4 17a13 13 0 0 1 13-13h30a13 13 0 0 1 13 13v5c-9 5-17 7-28 7S12 26 4 22z"
        fill="#FFFFFF"
        opacity="0.14"
      />

      {/* 말풍선 — 받은 DM */}
      <path
        d="M14 16h36a5 5 0 0 1 5 5v20a5 5 0 0 1-5 5H31l-10 8v-8h-7a5 5 0 0 1-5-5V21a5 5 0 0 1 5-5z"
        fill="#FFFFFF"
      />
      {/* 정리된 줄 — 들어올 때는 뭉친 글이었지만 나갈 때는 목록입니다 */}
      <g fill="#EC4899">
        <rect x="21" y="24" width="22" height="3.2" rx="1.6" />
        <rect x="21" y="31" width="26" height="3.2" rx="1.6" />
        <rect x="21" y="38" width="16" height="3.2" rx="1.6" />
      </g>
      <g fill="#FBCFE8">
        <circle cx="47" cy="25.6" r="2.2" />
        <circle cx="47" cy="39.6" r="2.2" />
      </g>

      {/* 반짝임 — AI 가 손을 댔다는 표시 */}
      <path
        d="M49 8.5l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"
        fill="#FFF1F6"
      />
    </svg>
  );
}

/**
 * 점메추.
 *
 * **이건 제가 그린 게 아닙니다.** 저장소의 `icon.svg` 를 그대로 옮겼습니다
 * (좌표·색·회전각 전부 동일). 그 사이트가 실제로 쓰는 얼굴이라
 * 바로가기가 가리키는 곳과 아이콘이 정확히 일치합니다.
 *
 * 원본 주석: "식판 콘셉트 앱 아이콘: 반찬 빨강 배경 + 흰 숟가락·젓가락."
 * viewBox 도 원본(512)을 유지합니다 — 크기는 CSS 가 정하므로 바꿀 이유가 없고,
 * 숫자를 건드리면 옮겨온 것이 아니라 다시 그린 것이 됩니다.
 */
function Tray() {
  return (
    <svg viewBox="0 0 512 512" role="presentation">
      <rect width="512" height="512" rx="112" fill="#DE3B21" />
      {/* 숟가락 */}
      <g transform="rotate(-14 224 256)" fill="#fff">
        <rect x="208" y="150" width="32" height="236" rx="16" />
        <ellipse cx="224" cy="172" rx="44" ry="56" />
      </g>
      {/* 젓가락 */}
      <g transform="rotate(12 322 256)" fill="#fff">
        <rect x="300" y="140" width="19" height="252" rx="9.5" />
        <rect x="332" y="140" width="19" height="252" rx="9.5" />
      </g>
    </svg>
  );
}

/**
 * 홈노트 (ourHome).
 *
 * 이 사이트도 옮겨올 파비콘이 없어 그 사이트의 디자인 토큰으로 그렸습니다 —
 * 저장소의 tailwind 설정에 "Supanova" 라는 이름으로 적혀 있는 값입니다.
 * 먹빛 바탕 #0B0C10, 채도를 뺀 호박색 #D8B487, 부드러운 호박 #E7CFAE.
 *
 * 창을 두 칸으로 나눈 것은 이 앱이 **두 사람**의 것이기 때문입니다.
 * 한 사람이 적으면 다른 사람 화면에 바로 뜹니다.
 */
function Home() {
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <defs>
        <radialGradient id="dtHomeGlow" cx="0.5" cy="0.62" r="0.5">
          <stop offset="0" stopColor="#D8B487" stopOpacity="0.3" />
          <stop offset="1" stopColor="#D8B487" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="14" fill="#0B0C10" />
      <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#dtHomeGlow)" />
      {/* 유리 테두리 — 이 사이트의 double-bezel 을 한 겹으로 줄인 것 */}
      <rect
        x="0.9"
        y="0.9"
        width="62.2"
        height="62.2"
        rx="13.2"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.1"
        strokeWidth="1.2"
      />

      {/* 집 */}
      <path
        d="M11 30L32 13l21 17"
        fill="none"
        stroke="#D8B487"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 29v20a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V29"
        fill="none"
        stroke="#D8B487"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 불 켜진 창 — 두 칸입니다 */}
      <rect x="24" y="34" width="7" height="9" rx="1.4" fill="#E7CFAE" />
      <rect x="33" y="34" width="7" height="9" rx="1.4" fill="#E7CFAE" />
    </svg>
  );
}

function Globe() {
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <defs>
        <linearGradient id="dtGlobe" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#7FC4DE" />
          <stop offset="1" stopColor="#2E7EA8" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="25" fill="url(#dtGlobe)" />
      <g fill="none" stroke="#F3FAFD" strokeWidth="2.1" opacity="0.85">
        <circle cx="32" cy="32" r="25" />
        <path d="M7 32h50" />
        <path d="M32 7c8 7 8 43 0 50-8-7-8-43 0-50z" />
        <path d="M12 17c11 6 29 6 40 0" />
        <path d="M12 47c11-6 29-6 40 0" />
      </g>
      <path
        d="M32 7a25 25 0 0 1 22 13c-11 8-30 9-41 3A25 25 0 0 1 32 7z"
        fill="#FFFFFF"
        opacity="0.14"
      />
    </svg>
  );
}

function Folder() {
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <defs>
        <linearGradient id="dtFolderBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F0C868" />
          <stop offset="1" stopColor="#D9A63C" />
        </linearGradient>
        <linearGradient id="dtFolderFront" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#FFDE93" />
          <stop offset="1" stopColor="#E8B44E" />
        </linearGradient>
      </defs>
      <path
        d="M5 16a4 4 0 0 1 4-4h14l6 6h26a4 4 0 0 1 4 4v6H5z"
        fill="url(#dtFolderBack)"
      />
      <path
        d="M5 24h54v26a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"
        fill="url(#dtFolderFront)"
      />
      <path d="M5 24h54v3H5z" fill="#FFFFFF" opacity="0.35" />
    </svg>
  );
}

function Doc() {
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <path
        d="M13 6h26l12 12v40a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
        fill="#FBFBF8"
        stroke="#C3C0B6"
        strokeWidth="1.6"
      />
      {/* 접힌 모서리 */}
      <path d="M39 6l12 12H39z" fill="#DEDBD1" />
      <g stroke="#B9B5AA" strokeWidth="2" strokeLinecap="round">
        <path d="M19 26h18" />
        <path d="M19 33h26" />
        <path d="M19 40h22" />
      </g>
      {/* PDF 띠 */}
      <rect x="9" y="44" width="34" height="14" rx="3" fill="#B4453A" />
      <text
        x="26"
        y="54"
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="700"
        fill="#FFFFFF"
        fontFamily="Segoe UI, Malgun Gothic, sans-serif"
      >
        PDF
      </text>
    </svg>
  );
}

function Trash() {
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <defs>
        <linearGradient id="dtBin" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E7EDF2" />
          <stop offset="0.5" stopColor="#C3CDD6" />
          <stop offset="1" stopColor="#9AA6B1" />
        </linearGradient>
      </defs>
      <path d="M18 8h28l-2 5H20z" fill="#8E9AA6" />
      <path
        d="M14 16h36l-4 40a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z"
        fill="url(#dtBin)"
      />
      <g stroke="#7C8894" strokeWidth="2" strokeLinecap="round" opacity="0.7">
        <path d="M26 25v27" />
        <path d="M32 25v27" />
        <path d="M38 25v27" />
      </g>
      <rect x="12" y="12" width="40" height="6" rx="3" fill="#B4BFC9" />
    </svg>
  );
}

/**
 * 캘린더 앱 — 아이폰 홈 화면용 (docs/08).
 *
 * 흰 타일에 빨간 머리띠. 아이폰 캘린더는 오늘 날짜를 아이콘에 찍지만
 * 여기서는 격자만 둡니다 — 서버가 그리는 그림이라 날짜를 넣으면
 * **배포한 날이 굳어 버립니다.** 벽걸이 캘린더에서 이미 겪은 문제입니다.
 */
function CalendarIcon() {
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <rect x="0" y="0" width="64" height="64" rx="14" fill="#FFFFFF" />
      <path d="M0 14A14 14 0 0 1 14 0h36a14 14 0 0 1 14 14v5H0z" fill="#E5453B" />
      <g fill="#D8D5D0">
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3, 4].map((c) => (
            <rect
              key={`${r}-${c}`}
              x={9 + c * 9.6}
              y={26 + r * 8.4}
              width="6.4"
              height="5"
              rx="1.4"
            />
          )),
        )}
      </g>
      {/* 오늘 자리 하나만 색을 둡니다. 숫자를 적지 않으니 날짜가 굳지 않습니다 */}
      <rect x="37.8" y="34.4" width="6.4" height="5" rx="1.4" fill="#E5453B" />
    </svg>
  );
}

/** 메일 — 독에 놓입니다. 파란 타일에 흰 봉투 */
function Mail() {
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <defs>
        <linearGradient id="dtMailBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5BC0F8" />
          <stop offset="1" stopColor="#1D82E8" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#dtMailBg)" />
      <rect x="12" y="20" width="40" height="26" rx="4.5" fill="#FFFFFF" />
      <path
        d="M13.5 23.5l16.4 12.6a3.4 3.4 0 0 0 4.2 0L50.5 23.5"
        fill="none"
        stroke="#1D82E8"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 소개 — 이름과 하는 일이 적힌 명함 한 장.
 *
 * 방에서는 벽에 테이프로 붙인 종이였습니다(`note--brand`).
 * 폰에는 벽이 없으니 손에 쥐는 것으로 바꿨습니다. 종이 색은 그 메모에서 가져왔습니다.
 */
function Card() {
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <rect x="0" y="0" width="64" height="64" rx="14" fill="#3D3229" />
      <rect x="9" y="16" width="46" height="32" rx="3.5" fill="#FBF6E9" />
      {/* 사람 */}
      <circle cx="23" cy="28" r="5.4" fill="#B4574A" />
      <path
        d="M14.5 40.5c1.4-4.2 4.6-6.3 8.5-6.3s7.1 2.1 8.5 6.3z"
        fill="#B4574A"
      />
      {/* 이름 줄 */}
      <g fill="#6B6155">
        <rect x="36" y="25" width="15" height="3" rx="1.5" />
        <rect x="36" y="31" width="12" height="2.4" rx="1.2" />
        <rect x="36" y="36.5" width="14" height="2.4" rx="1.2" />
      </g>
    </svg>
  );
}

const ART: Record<IconArtKey, () => React.ReactElement> = {
  calendar: CalendarIcon,
  mail: Mail,
  card: Card,
  yut: Yut,
  library: Library,
  bonfire: Bonfire,
  dm: Dm,
  tray: Tray,
  home: Home,
  folder: Folder,
  doc: Doc,
  globe: Globe,
  trash: Trash,
};

export function IconArt({ art }: { art: IconArtKey }) {
  const Draw = ART[art];
  return <Draw />;
}

/**
 * 바로가기 화살표.
 *
 * 실제 Windows 는 바로가기(.url · .lnk)에 이 작은 화살표를 겹칩니다.
 * 이게 있으면 "설치된 프로그램"이 아니라 "어딘가로 나가는 링크"로 읽힙니다.
 */
export function ShortcutBadge() {
  return (
    <svg className="dtIcon__badge" viewBox="0 0 20 20" role="presentation">
      <rect
        x="0.8"
        y="0.8"
        width="18.4"
        height="18.4"
        rx="3"
        fill="#F7F9FB"
        stroke="#8894A0"
        strokeWidth="1.2"
      />
      <path
        d="M7 13L13 7M13 7H8.6M13 7v4.4"
        fill="none"
        stroke="#2E3944"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

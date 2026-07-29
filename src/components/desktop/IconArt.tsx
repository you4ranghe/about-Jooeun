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

function Yut() {
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <defs>
        <linearGradient id="dtYutTile" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#12756B" />
          <stop offset="1" stopColor="#07403C" />
        </linearGradient>
        <linearGradient id="dtYutStick" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E8CE94" />
          <stop offset="0.45" stopColor="#CBA65C" />
          <stop offset="1" stopColor="#9C7734" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="13" fill="url(#dtYutTile)" />
      {/* 타일 위쪽 광택 — 앱 아이콘처럼 보이게 하는 한 겹 */}
      <path
        d="M4 17a13 13 0 0 1 13-13h30a13 13 0 0 1 13 13v6c-9 5-17 7-28 7S12 27 4 23z"
        fill="#FFFFFF"
        opacity="0.09"
      />
      {/* 윷가락 넷. 한쪽이 평평한 단면을 어두운 선으로 냅니다 */}
      <g transform="rotate(-13 32 32)">
        {[12, 22.5, 33, 43.5].map((x) => (
          <g key={x}>
            <rect
              x={x}
              y="15"
              width="8.5"
              height="34"
              rx="4.25"
              fill="url(#dtYutStick)"
            />
            <rect
              x={x + 5.4}
              y="17"
              width="1.6"
              height="30"
              rx="0.8"
              fill="#6B4E1E"
              opacity="0.55"
            />
          </g>
        ))}
      </g>
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

const ART: Record<IconArtKey, () => React.ReactElement> = {
  yut: Yut,
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

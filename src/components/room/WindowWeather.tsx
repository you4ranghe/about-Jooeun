"use client";

/**
 * 창밖 날씨와 계절.
 *
 * 창(.win) 안에 겹쳐 넣는 층들입니다. 어느 것이 보일지는
 * 부모의 data-cond / data-season 이 CSS 로 정합니다 — 여기서는 전부 그려 둡니다.
 * 조건마다 컴포넌트를 갈아 끼우지 않는 이유는, 그러면 날씨가 바뀔 때
 * 층이 통째로 사라졌다 나타나서 뚝 끊겨 보이기 때문입니다.
 * 늘 있게 두고 opacity 만 바꾸면 서로 스며들며 넘어갑니다.
 */

/** 빗줄기 · 눈송이는 층마다 속도가 달라야 깊이가 생깁니다 */
const LAYERS = [0, 1, 2] as const;

export function WindowWeather() {
  return (
    <>
      {/* ── 계절 나무 ──
          언덕 위에 한 그루. 잎 색과 유무만 계절을 따릅니다.
          가지는 늘 그려 두고 겨울에 잎만 걷습니다 — 그래야 앙상해집니다. */}
      <span className="win__tree" aria-hidden="true">
        <svg viewBox="0 0 64 88" role="presentation">
          {/* 줄기와 가지 */}
          <path
            className="win__treeWood"
            d="M32 88V40M32 56l-12-12M32 48l11-11M32 66l-9-9M32 60l8-8"
            fill="none"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          {/* 잎 — 세 덩이가 겹쳐 수관이 됩니다 */}
          <g className="win__treeLeaf">
            <circle cx="32" cy="26" r="18" />
            <circle cx="17" cy="36" r="13" />
            <circle cx="47" cy="36" r="13" />
          </g>
          {/* 봄에만 흩날리는 꽃잎 */}
          <g className="win__treePetal">
            <circle cx="12" cy="52" r="1.6" />
            <circle cx="22" cy="60" r="1.3" />
            <circle cx="49" cy="55" r="1.5" />
          </g>
        </svg>
      </span>

      {/* ── 비 ── */}
      <span className="win__rain" aria-hidden="true">
        {LAYERS.map((i) => (
          <i key={i} />
        ))}
      </span>

      {/* ── 눈 ── */}
      <span className="win__snow" aria-hidden="true">
        {LAYERS.map((i) => (
          <i key={i} />
        ))}
      </span>

      {/* ── 안개 ── */}
      <span className="win__fog" aria-hidden="true">
        <i />
        <i />
      </span>

      {/* ── 번개 — 천둥일 때만 아주 가끔 번쩍입니다 ── */}
      <span className="win__flash" aria-hidden="true" />

      {/* ── 새벽·노을 물빛 ──
          해가 뜨고 질 때 하늘 전체에 도는 붉은 기운입니다.
          낮/밤 그림을 따로 만드는 대신 위에 한 겹 덮습니다. */}
      <span className="win__tint" aria-hidden="true" />
    </>
  );
}

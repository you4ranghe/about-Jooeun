"use client";

import { useRoomLayout } from "./useRoomLayout";

/**
 * 책상 위 책꽂이.
 *
 * 책은 이미지가 아니라 색·폭·높이가 조금씩 다른 사각형입니다.
 * 값을 난수로 만들면 서버와 브라우저가 다른 그림을 그려 하이드레이션이 깨지므로
 * 아래 배열에 직접 적어 두었습니다. 손으로 고르는 편이 결과도 낫습니다.
 *
 * 사실적으로 보이게 하려고 세 가지를 넣었습니다.
 *  - 키를 들쭉날쭉하게 해서 윗줄이 평평하지 않게
 *  - 마지막 한 권을 옆판에 기대어 세우고
 *  - 짧은 책들 위에 두 권을 뉘어 둠
 * 세로로만 가지런히 꽂혀 있으면 진열장처럼 보이고 쓰는 책꽂이로 안 읽힙니다.
 *
 * 지금은 장식입니다. 이력서 항목을 여기에 연결할지는 docs/06 §9 Q-A 참조.
 */

/** 오래된 책의 천·가죽 느낌으로 채도를 낮춘 책등 색 */
const SPINES = [
  "#7d5a4a",
  "#5f6b52",
  "#8a6b3e",
  "#4e5c66",
  "#84544c",
  "#6b6455",
  "#3f4f52",
  "#9a7b4f",
  "#6d5568",
];

/** [폭, 높이, 색 index] — 왼쪽부터 */
const BOOKS: [number, number, number][] = [
  [20, 156, 0],
  [16, 168, 3],
  [24, 148, 7],
  [18, 162, 1],
  [22, 138, 4],
  [15, 170, 6],
  [26, 152, 2],
  [19, 142, 8],
  [17, 165, 5],
  [23, 134, 0],
  [20, 158, 3],
];

/** 옆판 두께와 바닥판 두께 */
const SIDE = 11;
const BASE = 10;

export function DeskShelf() {
  const L = useRoomLayout();
  const shelf = L.props.bookshelf;
  // 세로 무대에는 책꽂이가 없습니다. 640px 안에 다 넣으면 얼룩이 됩니다.
  if (!shelf?.h) return null;

  // 책꽂이 자체는 상판에 바닥을 대고 서고, 안쪽 좌표는 자기 상자(0..h) 기준입니다.
  const h = shelf.h;
  const innerLeft = SIDE + 4;
  const floorY = h - BASE; // 책들이 서는 바닥

  // 왼쪽부터 차례로 놓으며 x 를 누적합니다
  let cursor = innerLeft;
  const placed = BOOKS.map(([bw, bh, ci]) => {
    const at = cursor;
    cursor += bw + 3;
    return { at, bw, bh, ci };
  });

  return (
    <div className="deskShelf" style={L.onDesk(shelf)}>
      {/* 안쪽 그늘 — 속이 깊어야 책꽂이로 보입니다 */}
      <span className="deskShelf__well" />

      {/* 세워 꽂은 책 */}
      {placed.map(({ at, bw, bh, ci }, i) => (
        <span
          key={i}
          className="deskShelf__book"
          style={{
            left: at,
            top: floorY - bh,
            width: bw,
            height: bh,
            background: SPINES[ci],
          }}
        />
      ))}

      {/* 마지막 한 권 — 옆판에 기대어 */}
      <span
        className="deskShelf__book deskShelf__book--lean"
        style={{
          left: cursor + 6,
          top: floorY - 146,
          width: 18,
          height: 146,
          background: SPINES[4],
        }}
      />

      {/* 짧은 책들 위에 뉘어 둔 두 권 */}
      <span
        className="deskShelf__flat"
        style={{ left: innerLeft + 92, top: floorY - 148, width: 96, background: SPINES[6] }}
      />
      <span
        className="deskShelf__flat"
        style={{ left: innerLeft + 96, top: floorY - 158, width: 88, background: SPINES[2] }}
      />

      {/* 옆판 · 바닥판 — 책 위에 그려야 책이 안쪽에 있는 것처럼 보입니다 */}
      <span className="deskShelf__side deskShelf__side--l" style={{ width: SIDE }} />
      <span className="deskShelf__side deskShelf__side--r" style={{ width: SIDE }} />
      <span className="deskShelf__base" style={{ height: BASE }} />
    </div>
  );
}

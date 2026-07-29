import { FURNITURE } from "@/content/layout";

/**
 * 왼쪽 벽면을 채우는 책장.
 *
 * 책은 이미지가 아니라 색·폭·높이가 조금씩 다른 사각형입니다.
 * 값을 난수로 만들면 서버와 브라우저가 다른 그림을 그려 하이드레이션이 깨지므로,
 * 아래 배열에 직접 적어 두었습니다. 손으로 고르는 편이 결과도 낫습니다.
 *
 * 사물(윷·종·자물쇠·화분·쿠폰)은 이 책장 선반 위에 놓입니다.
 * 그래서 3층과 4층은 책을 성기게 두어 사물이 놓일 자리를 비워 두었습니다.
 */

/** 책등 색 — 오래된 책의 천·가죽 느낌으로 채도를 낮췄습니다 */
const SPINES = ["#7d5a4a", "#5f6b52", "#8a6b3e", "#4e5c66", "#84544c", "#6b6455", "#3f4f52", "#9a7b4f"];

/** [폭, 높이비율, 색 index] — 층마다 다르게 */
type Book = [number, number, number];

const ROWS: { top: number; height: number; books: Book[] }[] = [
  // 1층 — 사물(윷·종·자물쇠)이 놓이므로 오른쪽만 책
  {
    top: 96,
    height: 108,
    books: [
      [15, 0.82, 3],
      [13, 0.9, 0],
      [17, 0.76, 5],
    ],
  },
  // 2층 — 사물(화분·쿠폰) 자리를 비우고 가장자리에만
  {
    top: 232,
    height: 112,
    books: [
      [14, 0.88, 1],
      [12, 0.79, 6],
      [16, 0.94, 2],
      [13, 0.84, 4],
    ],
  },
  // 3층 — 꽉 채움
  {
    top: 372,
    height: 106,
    books: [
      [15, 0.9, 0],
      [12, 0.82, 4],
      [18, 0.95, 2],
      [13, 0.76, 7],
      [16, 0.88, 1],
      [11, 0.93, 5],
      [17, 0.8, 3],
      [14, 0.86, 6],
      [12, 0.91, 0],
      [15, 0.78, 2],
    ],
  },
  // 4층 — 꽉 채우고 몇 권은 뉘어 둠
  {
    top: 498,
    height: 100,
    books: [
      [13, 0.92, 5],
      [16, 0.84, 1],
      [12, 0.88, 3],
      [17, 0.79, 6],
      [14, 0.95, 0],
      [15, 0.82, 4],
      [11, 0.9, 7],
      [18, 0.86, 2],
      [13, 0.94, 1],
    ],
  },
];

export function Bookcase() {
  const { x, y, w, h } = FURNITURE.bookcase;

  return (
    <div className="bookcase" style={{ left: x, top: y, width: w, height: h }}>
      {ROWS.map((row, i) => {
        const shelfTop = row.top - y + row.height;
        return (
          <div key={i}>
            {/* 책들 — 선반 바닥에 밑을 맞춰 세웁니다 */}
            <div
              className="bookcase__books"
              style={{
                left: 22,
                right: 22,
                top: row.top - y,
                height: row.height,
              }}
            >
              {row.books.map(([bw, bh, ci], j) => (
                <i
                  key={j}
                  style={{
                    position: "relative",
                    width: bw,
                    height: `${bh * 100}%`,
                    background: SPINES[ci],
                  }}
                />
              ))}
            </div>
            {/* 선반 판 */}
            <span className="bookcase__shelf" style={{ top: shelfTop }} />
          </div>
        );
      })}
      {/* 4층 위에 뉘어 둔 책 두 권 — 세로로만 꽂혀 있으면 새 책장처럼 보입니다 */}
      <span
        style={{
          position: "absolute",
          left: 236,
          top: 574,
          width: 96,
          height: 9,
          borderRadius: 2,
          background: "#6b6455",
          boxShadow: "0 2px 5px rgba(0,0,0,.4)",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 240,
          top: 564,
          width: 88,
          height: 9,
          borderRadius: 2,
          background: "#7d5a4a",
          boxShadow: "0 2px 5px rgba(0,0,0,.4)",
        }}
      />
    </div>
  );
}

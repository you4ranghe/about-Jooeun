"use client";

import { useRouter } from "next/navigation";
import type { PhoneAppItem } from "@/content/phone";
import { IconArt } from "@/components/desktop/IconArt";

/**
 * 만든 시간 — 시계 위젯을 누르면 뜹니다 (docs/08).
 *
 * ── 왜 시계 앱을 흉내 내지 않았나 ──
 * 알람·타이머·세계시계를 만들면 전부 가짜입니다. 누르면 아무 일도 일어나지 않거나,
 * 이 사이트와 상관없는 기능이 하나 생길 뿐입니다.
 *
 * 이 사이트에 **진짜로 있는 시간 데이터**는 하나입니다 — 저장소를 만든 기간.
 * 그리고 그건 채용 담당자가 실제로 궁금해하는 것이기도 합니다: 얼마 만에 만들었나.
 *
 * ── 날짜는 지어내지 않았습니다 ──
 * `projects.ts` 의 `span` 이고, 저장소 커밋 이력에서 실측한 값입니다.
 * 문자열 `period` 를 파싱하지 않는 이유는 표기가 조금씩 달라 언젠가 깨지기 때문입니다.
 */

const DAY = 24 * 60 * 60 * 1000;

/** "2026-07-24" → 밀리초. UTC 로 읽어 시간대에 흔들리지 않게 합니다 */
function at(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, (m ?? 1) - 1, d ?? 1);
}

/** 걸린 날 수. 하루 만에 만든 것도 1일입니다 (끝나는 날 포함) */
function lengthOf(from: string, to: string): number {
  return Math.round((at(to) - at(from)) / DAY) + 1;
}

const SHORT_COUNT = ["", "하루", "이틀", "사흘", "나흘", "닷새", "엿새", "이레"];

function sayDays(n: number): string {
  return SHORT_COUNT[n] ?? `${n}일`;
}

/** "2026-03-25" → "3.25" */
function short(date: string): string {
  const [, m, d] = date.split("-");
  return `${Number(m)}.${d}`;
}

export function TimelineApp({ apps }: { apps: PhoneAppItem[] }) {
  const router = useRouter();

  /* 기간이 있는 것만. 캘린더처럼 만든 날짜가 없는 앱은 빠집니다 */
  const rows = apps
    .filter((a): a is PhoneAppItem & { span: { from: string; to: string } } =>
      Boolean(a.span),
    )
    .sort((a, b) => at(a.span.from) - at(b.span.from));

  if (!rows.length) return null;

  const first = at(rows[0].span.from);
  const last = Math.max(...rows.map((r) => at(r.span.to)));
  const total = Math.max(last - first, DAY);

  const totalDays = Math.round(total / DAY) + 1;
  const workedDays = rows.reduce(
    (sum, r) => sum + lengthOf(r.span.from, r.span.to),
    0,
  );

  return (
    <div className="phDoc phTl">
      <header className="phDoc__top">
        <p className="phDoc__k">TIMELINE</p>
        <h1 className="phDoc__h1">만든 시간</h1>
        <p className="phDoc__lede">
          {short(rows[0].span.from)}부터 {short(rows[rows.length - 1].span.to)}
          까지 {totalDays}일 동안 {rows.length}개를 만들었습니다.
        </p>
      </header>

      <ul className="phTl__list">
        {rows.map((r) => {
          const from = at(r.span.from);
          const to = at(r.span.to);
          const days = lengthOf(r.span.from, r.span.to);
          const left = ((from - first) / total) * 100;
          /* 하루짜리는 폭이 0 이라 점으로 사라집니다. 최소 폭을 줍니다 */
          const width = Math.max(((to - from) / total) * 100, 4);

          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => router.push(r.href)}
                aria-label={`${r.title} 열기`}
              >
                <span className="phTl__art">
                  <IconArt art={r.art} />
                </span>

                <span className="phTl__body">
                  <span className="phTl__head">
                    <b>{r.label}</b>
                    <small>{sayDays(days)}</small>
                  </span>

                  <span className="phTl__track" aria-hidden="true">
                    <i style={{ left: `${left}%`, width: `${width}%` }} />
                  </span>

                  <span className="phTl__when">
                    {short(r.span.from)}
                    {r.span.from !== r.span.to && ` — ${short(r.span.to)}`}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="phTl__note">
        막대는 위 기간 전체를 가로로 펼친 것입니다. 실제로 손을 댄 날은 모두
        합쳐 {workedDays}일입니다 — 겹치는 기간이 있어 전체 기간보다 짧습니다.
        날짜는 저장소 커밋 이력에서 가져왔습니다.
      </p>
    </div>
  );
}

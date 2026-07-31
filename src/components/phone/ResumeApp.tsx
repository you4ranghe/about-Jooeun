"use client";

import { useState } from "react";
import Link from "next/link";
import type { ResumeItem } from "@/content/types";
import { ObjectArt } from "@/components/art/ObjectArt";

/**
 * 이력서 앱.
 *
 * 방에서는 벽에 붙은 노란 포스트잇을 눌러 목록이 떴습니다.
 * 폰에서는 앱 하나가 그 일을 합니다. 내용(`content/resume.ts`)은 같습니다.
 *
 * ── 왜 아코디언인가 ──
 * 열두 항목을 전부 펼치면 아주 긴 한 장이 되고, 무엇을 읽고 있는지 놓칩니다.
 * 제목만 늘어놓고 누른 것만 펼치면 목록이 목차 노릇을 합니다.
 * 한 번에 하나만 열립니다 — 여럿이 열리면 다시 긴 한 장이 됩니다.
 */
export function ResumeApp({
  items,
  isAdmin,
}: {
  items: ResumeItem[];
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="phDoc">
      <header className="phDoc__top">
        <p className="phDoc__k">RESUME</p>
        <h1 className="phDoc__h1">이력서</h1>
        <p className="phDoc__lede">
          {items.length
            ? `${items.length}가지 이야기입니다. 제목을 누르면 펼쳐집니다.`
            : "아직 채우는 중입니다."}
        </p>

        {/* 관리자에게만 보이는 문. 폰에서도 주소를 외워 칠 일이 없어야 합니다 */}
        {isAdmin && (
          <Link className="phDoc__admin" href="/admin/resume">
            ✎ 이력서 고치기
          </Link>
        )}
      </header>

      <ul className="phList">
        {items.map((item) => {
          const on = open === item.id;
          return (
            <li key={item.id} data-on={String(on)}>
              <button
                type="button"
                className="phList__head"
                onClick={() => setOpen(on ? null : item.id)}
                aria-expanded={on}
              >
                <span className="phList__art">
                  <ObjectArt art={item.art} />
                </span>
                <span className="phList__t">
                  <b>{item.title}</b>
                  <small>{item.short}</small>
                </span>
                <span className="phList__chev" aria-hidden="true" />
              </button>

              {on && (
                <div className="phList__body">
                  <p className="phList__lead">{item.lead}</p>

                  {item.rows && (
                    <dl className="phRows">
                      {item.rows.map((row) => (
                        <div key={row.label + row.value}>
                          <dt>{row.label}</dt>
                          <dd>
                            <b>{row.value}</b>
                            {row.note && <small>{row.note}</small>}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {item.chips && (
                    <ul className="phChips">
                      {item.chips.map((chip) => (
                        <li key={chip.name} data-hot={String(Boolean(chip.hot))}>
                          {chip.name}
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.body.map((paragraph, i) => (
                    // 저장소 안의 신뢰된 문자열이며 <strong> 만 씁니다
                    <p key={i} dangerouslySetInnerHTML={{ __html: paragraph }} />
                  ))}

                  {item.links && (
                    <div className="phLinks">
                      {item.links.map((link) => (
                        <a
                          key={link.href + link.label}
                          href={link.href}
                          {...(link.href.startsWith("http")
                            ? { target: "_blank", rel: "noopener" }
                            : {})}
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

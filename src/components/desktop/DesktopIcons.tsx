"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DesktopShortcut } from "@/content/desktop";
import { IconArt, ShortcutBadge } from "./IconArt";

/**
 * 바탕화면 아이콘 격자.
 *
 * ── 왜 더블클릭인가 ──
 * 진짜 바탕화면이 그렇습니다. 한 번은 고르는 것이고 두 번이 여는 것입니다.
 * 한 번에 열리면 편하지만 "실제 컴퓨터처럼"이 목적이라 편의 쪽을 버렸습니다.
 * 대신 처음 온 사람이 막히지 않도록 아래에 안내 한 줄을 띄우고,
 * 한 번이라도 열고 나면 그 줄은 사라집니다.
 *
 * ── 손가락은 예외 ──
 * 더블탭은 브라우저마다 확대 제스처와 겹칩니다.
 * 마우스가 없는 기기(pointer: coarse)에서는 한 번 눌러 엽니다.
 * 서버는 어떤 기기인지 모르므로 기본값은 더블클릭이고, 브라우저에서 확인해 바꿉니다.
 */

export function DesktopIcons({ items }: { items: DesktopShortcut[] }) {
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [tapToOpen, setTapToOpen] = useState(false);

  useEffect(() => {
    setTapToOpen(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const open = (item: DesktopShortcut) => {
    setOpened(true);
    setSelected(item.id);
    if (item.open.kind === "external") {
      window.open(item.open.href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(item.open.href);
  };

  /** 방향키로 아이콘 사이를 옮겨 다닙니다. 격자가 한 줄이라 앞뒤 두 방향뿐입니다. */
  const step = (from: string, delta: number) => {
    const i = items.findIndex((it) => it.id === from);
    if (i < 0) return;
    const next = items[(i + delta + items.length) % items.length];
    setSelected(next.id);
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-icon="${next.id}"]`)
      ?.focus();
  };

  return (
    <div
      className="dt__field"
      /* 빈 바탕을 누르면 선택이 풀립니다 — 이것도 진짜 바탕화면의 동작입니다 */
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setSelected(null);
      }}
    >
      <div className="dt__grid" ref={gridRef}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="dtIcon"
            data-icon={item.id}
            data-sel={String(selected === item.id)}
            title={item.hint}
            aria-label={`${item.label} — ${item.hint}`}
            onClick={() => (tapToOpen ? open(item) : setSelected(item.id))}
            onDoubleClick={() => open(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(item);
              }
              if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                e.preventDefault();
                step(item.id, 1);
              }
              if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                step(item.id, -1);
              }
            }}
            onFocus={() => setSelected(item.id)}
          >
            <span className="dtIcon__art">
              <IconArt art={item.art} />
              {item.shortcut && <ShortcutBadge />}
            </span>
            <span className="dtIcon__label">{item.label}</span>
          </button>
        ))}
      </div>

      <p className="dt__hint" data-on={String(!opened)}>
        {tapToOpen ? "아이콘을 눌러 여세요" : "아이콘을 두 번 눌러 여세요"}
      </p>
    </div>
  );
}

import type { ResumeItem } from "@/content/types";

/**
 * 배열 필드를 **여러 줄 글**로 주고받습니다 (docs/09).
 *
 * ── 왜 반복 입력칸이 아닌가 ──
 * 표·칩·본문·링크는 개수가 정해져 있지 않습니다. 추가/삭제 버튼이 달린
 * 반복 입력칸을 만들면 그 자체가 상태를 들고 있는 화면이 되고,
 * 폰에서는 좁아 손대기 어렵습니다.
 *
 * 줄 하나가 항목 하나인 글상자면 자바스크립트 없이도 동작하고,
 * 붙여넣기·순서 바꾸기가 전부 글 편집으로 끝납니다.
 * 형식은 폼의 회색 예시 글자가 알려 줍니다.
 *
 * ── 형식 ──
 *   표    라벨 | 값 | 보조설명(선택)
 *   칩    이름            (끝에 * 를 붙이면 강조)
 *   본문  빈 줄로 문단 구분
 *   링크  라벨 | 주소 | ghost(선택)
 */

const trim = (s: string) => s.trim();
const alive = (s: string) => s.length > 0;

/** "a | b | c" → ["a","b","c"] */
function cells(line: string): string[] {
  return line.split("|").map(trim);
}

/* ── 글 → 값 ─────────────────────────────────────────── */

export function parseRows(text: string): ResumeItem["rows"] {
  const out = text
    .split("\n")
    .map(trim)
    .filter(alive)
    .map((line) => {
      const [label = "", value = "", note = ""] = cells(line);
      return note ? { label, value, note } : { label, value };
    });
  return out.length ? out : undefined;
}

export function parseChips(text: string): ResumeItem["chips"] {
  const out = text
    .split("\n")
    .map(trim)
    .filter(alive)
    .map((line) =>
      line.endsWith("*")
        ? { name: trim(line.slice(0, -1)), hot: true }
        : { name: line },
    );
  return out.length ? out : undefined;
}

/** 문단은 빈 줄로 나눕니다. 한 문단 안의 줄바꿈은 공백으로 합칩니다 */
export function parseBody(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.split("\n").map(trim).filter(alive).join(" "))
    .filter(alive);
}

export function parseLinks(text: string): ResumeItem["links"] {
  const out = text
    .split("\n")
    .map(trim)
    .filter(alive)
    .map((line) => {
      const [label = "", href = "", flag = ""] = cells(line);
      return flag === "ghost" ? { href, label, ghost: true } : { href, label };
    })
    .filter((l) => l.href && l.label);
  return out.length ? out : undefined;
}

/* ── 값 → 글 (폼에 다시 채울 때) ──────────────────────── */

export function rowsToText(rows: ResumeItem["rows"]): string {
  return (rows ?? [])
    .map((r) => [r.label, r.value, r.note].filter(Boolean).join(" | "))
    .join("\n");
}

export function chipsToText(chips: ResumeItem["chips"]): string {
  return (chips ?? []).map((c) => (c.hot ? `${c.name} *` : c.name)).join("\n");
}

export function bodyToText(body: string[]): string {
  return (body ?? []).join("\n\n");
}

export function linksToText(links: ResumeItem["links"]): string {
  return (links ?? [])
    .map((l) => [l.label, l.href, l.ghost ? "ghost" : ""].filter(Boolean).join(" | "))
    .join("\n");
}

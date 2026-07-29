import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 일정 데이터 접근.
 *
 * 브라우저에서 직접 Supabase 를 호출합니다. 권한은 RLS 가 막으므로
 * Server Action 을 거칠 이유가 없고, 화면 반응도 그쪽이 빠릅니다.
 * 로그인하지 않은 사람은 테이블 접근 자체가 거부됩니다(anon 권한 회수).
 */

/** 달력에서 색으로 구분하기 위한 값. DB 의 CHECK 제약과 같아야 합니다. */
export const EVENT_COLORS = ["brick", "olive", "slate", "ochre", "plum"] as const;
export type EventColor = (typeof EVENT_COLORS)[number];

export const COLOR_LABEL: Record<EventColor, string> = {
  brick: "벽돌",
  olive: "올리브",
  slate: "슬레이트",
  ochre: "황토",
  plum: "자두",
};

export interface CalEvent {
  id: string;
  title: string;
  note: string | null;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  color: EventColor;
}

/** 새로 만들거나 고칠 때 넘기는 값 */
export interface EventDraft {
  title: string;
  note: string | null;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  color: EventColor;
}

const COLUMNS = "id,title,note,starts_at,ends_at,all_day,color";

/**
 * 한 달치를 가져옵니다.
 *
 * 경계는 KST 기준입니다. 서버는 UTC 로 저장하므로 그대로 비교하면
 * 한국 시간 1일 오전 일정이 지난달로 빠지거나 말일 밤 일정이 다음 달로 넘어갑니다.
 */
export async function fetchMonth(
  supabase: SupabaseClient,
  year: number,
  month: number,
): Promise<CalEvent[]> {
  const from = kstDayStart(year, month, 1);
  const to = kstDayStart(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, 1);

  const { data, error } = await supabase
    .from("events")
    .select(COLUMNS)
    .gte("starts_at", from.toISOString())
    .lt("starts_at", to.toISOString())
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CalEvent[];
}

export async function createEvent(supabase: SupabaseClient, draft: EventDraft) {
  const { data, error } = await supabase.from("events").insert(draft).select(COLUMNS).single();
  if (error) throw error;
  return data as CalEvent;
}

export async function updateEvent(supabase: SupabaseClient, id: string, draft: Partial<EventDraft>) {
  const { data, error } = await supabase
    .from("events")
    .update(draft)
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return data as CalEvent;
}

export async function deleteEvent(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

/* ── KST 시각 다루기 ─────────────────────────────────────────
   브라우저의 시간대가 무엇이든 한국 시간을 기준으로 다뤄야 합니다.
   서울에 있는 사람의 일정표이지 방문자의 일정표가 아니기 때문입니다.
   KST 는 서머타임이 없어 항상 UTC+9 이므로 고정 오프셋으로 계산할 수 있습니다. */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 한국 시간 기준 그 날 00:00 에 해당하는 시각 */
export function kstDayStart(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - KST_OFFSET_MS);
}

/** 저장된 시각을 한국 날짜/시각 조각으로 풉니다 */
export function toKstParts(iso: string) {
  const shifted = new Date(new Date(iso).getTime() + KST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

/** "2026-07-29" 같은 키. 날짜별로 묶을 때 씁니다. */
export function kstDayKey(iso: string) {
  const p = toKstParts(iso);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function dayKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** 오늘(KST) */
export function kstToday() {
  const p = toKstParts(new Date().toISOString());
  return { year: p.year, month: p.month, day: p.day };
}

/** "14:30" 표기 */
export function hhmm(iso: string) {
  const p = toKstParts(iso);
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

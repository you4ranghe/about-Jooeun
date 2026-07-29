"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/browser";
import { useRoomStage } from "@/components/room/RoomStage";
import {
  COLOR_LABEL,
  EVENT_COLORS,
  type CalEvent,
  type EventColor,
  createEvent,
  dayKey,
  deleteEvent,
  fetchMonth,
  hhmm,
  kstDayKey,
  kstDayStart,
  kstToday,
  toKstParts,
  updateEvent,
} from "@/content/events";
import "@/styles/calendar.css";

/**
 * 줌인했을 때 벽걸이 캘린더 자리에 뜨는 월 보기.
 *
 * 날짜를 누르면 오른쪽에 그날의 일정 패널이 열립니다.
 *
 * ⚠️ 패널은 반드시 포털로 <body> 에 붙입니다.
 *    이 컴포넌트는 카메라 transform 안에 있는데, transform 된 조상이 있으면
 *    position:fixed 가 뷰포트가 아니라 그 조상을 기준으로 잡힙니다.
 *    포털로 빼지 않으면 패널이 캘린더 종이 안에 갇힙니다.
 */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function CalendarScreen() {
  const supabase = useMemo(() => createClient(), []);
  const today = useMemo(() => kstToday(), []);

  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const { setSidePanel } = useRoomStage();

  useEffect(() => setMounted(true), []);

  /* 패널이 열리고 닫히는 것을 카메라에 알립니다.
     그러면 캘린더가 가운데에서 왼쪽으로 부드럽게 옮겨갑니다. */
  useEffect(() => {
    setSidePanel(picked !== null);
  }, [picked, setSidePanel]);

  useEffect(() => () => setSidePanel(false), [setSidePanel]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEvents(await fetchMonth(supabase, year, month));
    } catch {
      // RLS 가 막았거나 세션이 끊긴 경우입니다. 원인을 자세히 노출하지 않습니다.
      setError("일정을 불러오지 못했습니다. 로그인이 풀렸을 수 있습니다.");
    } finally {
      setLoading(false);
    }
  }, [supabase, year, month]);

  useEffect(() => {
    void load();
  }, [load]);

  /* 날짜별로 묶어 둡니다 */
  const byDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const e of events) {
      const k = kstDayKey(e.starts_at);
      const list = map.get(k);
      if (list) list.push(e);
      else map.set(k, [e]);
    }
    return map;
  }, [events]);

  const lead = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = i - lead + 1;
    return d >= 1 && d <= days ? d : null;
  });

  const step = (by: number) => {
    const m = month + by;
    if (m < 1) {
      setYear(year - 1);
      setMonth(12);
    } else if (m > 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(m);
    }
    setPicked(null);
  };

  const goToday = () => {
    setYear(today.year);
    setMonth(today.month);
    setPicked(today.day);
  };

  const pickedEvents = picked ? (byDay.get(dayKey(year, month, picked)) ?? []) : [];

  return (
    <div className="cs">
      <header className="cs__top">
        <div className="cs__nav">
          {/* 큰 숫자로 달을 먼저 읽히게 하고 연도는 뒤로 물립니다 */}
          <h1 className="cs__title">
            <b>{month}월</b> {year}
          </h1>
          <div className="cs__arrows">
            <button type="button" onClick={() => step(-1)} aria-label="이전 달">
              ‹
            </button>
            <button type="button" onClick={() => step(1)} aria-label="다음 달">
              ›
            </button>
          </div>
        </div>
        <div className="cs__tools">
          <span className="cs__state">{loading ? "불러오는 중…" : `${events.length}건`}</span>
          <button type="button" className="cs__today" onClick={goToday}>
            오늘
          </button>
        </div>
      </header>

      {error && (
        <p className="cs__error" role="alert">
          {error}
        </p>
      )}

      <div className="cs__grid">
        {WEEKDAYS.map((w, i) => (
          <span key={w} className="cs__wd" data-wd={i === 0 ? "sun" : i === 6 ? "sat" : ""}>
            {w}
          </span>
        ))}

        {cells.map((d, i) => {
          if (d === null) return <span key={i} className="cs__cell cs__cell--empty" />;
          const list = byDay.get(dayKey(year, month, d)) ?? [];
          const isToday = year === today.year && month === today.month && d === today.day;
          return (
            <button
              key={i}
              type="button"
              className="cs__cell"
              data-wd={i % 7 === 0 ? "sun" : i % 7 === 6 ? "sat" : ""}
              data-today={isToday ? "true" : "false"}
              data-picked={picked === d ? "true" : "false"}
              onClick={() => setPicked(d)}
            >
              <span className="cs__date">{d}</span>
              <span className="cs__chips">
                {list.slice(0, 3).map((e) => (
                  <span key={e.id} className="cs__chip" data-color={e.color}>
                    {!e.all_day && <i>{hhmm(e.starts_at)}</i>}
                    {e.title}
                  </span>
                ))}
                {list.length > 3 && <span className="cs__more">+{list.length - 3}</span>}
              </span>
            </button>
          );
        })}
      </div>

      {/* 패널은 포털로 body 에 붙입니다. transform 안에서는 fixed 가 갇힙니다. */}
      {mounted &&
        picked !== null &&
        createPortal(
          <DayPanel
            year={year}
            month={month}
            day={picked}
            events={pickedEvents}
            onClose={() => setPicked(null)}
            onChanged={load}
          />,
          document.body,
        )}
    </div>
  );
}

/* ═══ 하루 패널 ═══════════════════════════════════════════ */

function DayPanel({
  year,
  month,
  day,
  events,
  onClose,
  onChanged,
}: {
  year: number;
  month: number;
  day: number;
  events: CalEvent[];
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [editing, setEditing] = useState<CalEvent | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (adding || editing) {
          setAdding(false);
          setEditing(null);
        } else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [adding, editing, onClose]);

  const remove = async (id: string) => {
    if (!confirm("이 일정을 지울까요? 되돌릴 수 없습니다.")) return;
    setBusy(true);
    setError(null);
    try {
      await deleteEvent(supabase, id);
      await onChanged();
    } catch {
      setError("삭제하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];

  return (
    <aside className="dp" aria-label={`${month}월 ${day}일 일정`}>
      <header className="dp__top">
        <div>
          <p className="dp__date">
            {month}월 {day}일 <span>{weekday}</span>
          </p>
          <p className="dp__count">{events.length}건</p>
        </div>
        <button type="button" className="dp__close" onClick={onClose} aria-label="닫기">
          ×
        </button>
      </header>

      {error && (
        <p className="dp__error" role="alert">
          {error}
        </p>
      )}

      <div className="dp__list">
        {events.length === 0 && !adding && <p className="dp__empty">아직 일정이 없습니다.</p>}

        {events.map((e) =>
          editing?.id === e.id ? (
            <EventForm
              key={e.id}
              year={year}
              month={month}
              day={day}
              initial={e}
              onCancel={() => setEditing(null)}
              onSaved={async () => {
                setEditing(null);
                await onChanged();
              }}
            />
          ) : (
            <article key={e.id} className="dp__item" data-color={e.color}>
              <div className="dp__itemMain">
                <p className="dp__itemTitle">{e.title}</p>
                <p className="dp__itemTime">
                  {e.all_day ? "하루 종일" : hhmm(e.starts_at)}
                  {!e.all_day && e.ends_at && ` — ${hhmm(e.ends_at)}`}
                </p>
                {e.note && <p className="dp__itemNote">{e.note}</p>}
              </div>
              <div className="dp__itemActions">
                <button type="button" onClick={() => setEditing(e)} disabled={busy}>
                  수정
                </button>
                <button type="button" onClick={() => remove(e.id)} disabled={busy}>
                  삭제
                </button>
              </div>
            </article>
          ),
        )}

        {adding && (
          <EventForm
            year={year}
            month={month}
            day={day}
            onCancel={() => setAdding(false)}
            onSaved={async () => {
              setAdding(false);
              await onChanged();
            }}
          />
        )}
      </div>

      {!adding && !editing && (
        <button type="button" className="dp__add" onClick={() => setAdding(true)}>
          + 일정 추가
        </button>
      )}
    </aside>
  );
}

/* ═══ 등록 · 수정 폼 ══════════════════════════════════════ */

function EventForm({
  year,
  month,
  day,
  initial,
  onCancel,
  onSaved,
}: {
  year: number;
  month: number;
  day: number;
  initial?: CalEvent;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const start = initial ? toKstParts(initial.starts_at) : null;
  const end = initial?.ends_at ? toKstParts(initial.ends_at) : null;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [allDay, setAllDay] = useState(initial?.all_day ?? true);
  const [from, setFrom] = useState(
    start && !initial?.all_day
      ? `${String(start.hour).padStart(2, "0")}:${String(start.minute).padStart(2, "0")}`
      : "09:00",
  );
  const [to, setTo] = useState(
    end ? `${String(end.hour).padStart(2, "0")}:${String(end.minute).padStart(2, "0")}` : "",
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [color, setColor] = useState<EventColor>(initial?.color ?? "brick");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = title.trim();
    if (!name) {
      setError("제목을 입력해 주세요.");
      return;
    }

    const [fh, fm] = from.split(":").map(Number);
    const draft = {
      title: name,
      note: note.trim() || null,
      all_day: allDay,
      color,
      starts_at: (allDay
        ? kstDayStart(year, month, day)
        : kstDayStart(year, month, day, fh, fm)
      ).toISOString(),
      ends_at:
        !allDay && to
          ? kstDayStart(year, month, day, Number(to.split(":")[0]), Number(to.split(":")[1])).toISOString()
          : null,
    };

    setBusy(true);
    setError(null);
    try {
      if (initial) await updateEvent(supabase, initial.id, draft);
      else await createEvent(supabase, draft);
      await onSaved();
    } catch {
      setError("저장하지 못했습니다. 로그인이 풀렸을 수 있습니다.");
      setBusy(false);
    }
  };

  return (
    <form className="ef" onSubmit={submit}>
      <input
        className="ef__title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="무슨 일정인가요"
        maxLength={120}
        autoFocus
      />

      <label className="ef__check">
        <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
        하루 종일
      </label>

      {!allDay && (
        <div className="ef__times">
          <input type="time" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="시작" />
          <span>—</span>
          <input
            type="time"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-label="종료 (선택)"
          />
        </div>
      )}

      <textarea
        className="ef__note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="메모 (선택)"
        rows={2}
        maxLength={2000}
      />

      <div className="ef__colors" role="group" aria-label="색">
        {EVENT_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className="ef__color"
            data-color={c}
            data-on={color === c ? "true" : "false"}
            onClick={() => setColor(c)}
            aria-label={COLOR_LABEL[c]}
            title={COLOR_LABEL[c]}
          />
        ))}
      </div>

      {error && (
        <p className="ef__error" role="alert">
          {error}
        </p>
      )}

      <div className="ef__actions">
        <button type="submit" className="ef__save" disabled={busy}>
          {busy ? "저장 중…" : initial ? "수정" : "저장"}
        </button>
        <button type="button" className="ef__cancel" onClick={onCancel} disabled={busy}>
          취소
        </button>
      </div>
    </form>
  );
}

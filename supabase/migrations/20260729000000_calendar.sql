-- ═══════════════════════════════════════════════════════════
-- 개인 일정(캘린더) 스키마
--
-- 설계 근거는 docs/02-data-model.md 를 따릅니다.
-- 이 파일은 Supabase 대시보드의 SQL Editor 에 통째로 붙여 넣어 실행합니다.
-- 여러 번 실행해도 안전하도록 전부 멱등(idempotent)하게 작성했습니다.
--
-- ⚠️ 이 캘린더는 비공개입니다.
--    방문자(익명)에게는 일정이 단 한 줄도 보이면 안 됩니다.
--    그 보장은 애플리케이션 코드가 아니라 아래 RLS 정책이 합니다.
-- ═══════════════════════════════════════════════════════════


-- ── 1. 관리자 판별 함수 ────────────────────────────────────
--
-- JWT 의 app_metadata.role 을 봅니다.
-- user_metadata 를 쓰면 안 됩니다. 그건 사용자가 스스로 고칠 수 있어서
-- 누구나 자기를 관리자로 승격시킬 수 있습니다.
-- app_metadata 는 service_role 권한으로만 바뀝니다.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

comment on function public.is_admin() is
  '현재 요청자가 관리자인지. JWT app_metadata.role 로 판별하며 조인이 없어 가볍습니다.';


-- ── 2. 일정 테이블 ────────────────────────────────────────

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  note        text,

  -- 날짜만 다루는 일정과 시각까지 다루는 일정을 함께 담습니다.
  -- all_day 가 true 면 starts_at 의 날짜 부분만 의미가 있습니다.
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  all_day     boolean not null default true,

  -- 달력에서 색으로 구분하기 위한 값. 자유 문자열이 아니라 정해진 이름만 받습니다.
  color       text not null default 'brick',

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint events_title_len   check (char_length(title) between 1 and 120),
  constraint events_note_len    check (note is null or char_length(note) <= 2000),
  constraint events_period      check (ends_at is null or ends_at >= starts_at),
  constraint events_color_known check (color in ('brick','olive','slate','ochre','plum'))
);

comment on table public.events is '개인 일정. 관리자 본인만 읽고 씁니다.';

-- 달력은 항상 "이 달 범위" 로 조회하므로 시작 시각 인덱스가 실질적으로 쓰입니다.
create index if not exists events_starts_at_idx on public.events (starts_at);


-- ── 3. updated_at 자동 갱신 ───────────────────────────────
--
-- 앱을 거치지 않고 대시보드에서 직접 고치는 일이 실제로 잦습니다.
-- 그래서 애플리케이션이 아니라 트리거로 둡니다.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();


-- ── 4. GRANT ──────────────────────────────────────────────
--
-- GRANT 와 RLS 는 별개의 층입니다.
--   GRANT = 이 롤이 이 테이블에 접근할 수 있는가 (테이블 단위)
--   RLS   = 접근할 수 있다면 어떤 행까지인가 (행 단위)
-- 2026-05-30 이후 만들어진 프로젝트는 GRANT 가 자동으로 붙지 않으므로 명시합니다.
--
-- ★ anon 에게는 events 권한을 일절 주지 않습니다.
--   비공개 일정이므로 "행이 없다" 가 아니라 "테이블에 접근할 수 없다" 로 막습니다.

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.events to authenticated;

-- ★ Supabase 는 public 스키마에 기본 권한을 걸어 두어, 테이블을 만들면
--   anon 에게도 권한이 자동으로 붙습니다. 위에서 authenticated 에만 GRANT 했다고 해서
--   그게 사라지지 않으므로 명시적으로 회수해야 합니다.
--   이걸 빠뜨리면 익명 요청이 "권한 없음" 이 아니라 "빈 배열" 로 돌아옵니다.
--   지금은 정책이 없어 0건이지만, 정책을 하나 잘못 추가하는 순간 새어 나갑니다.
revoke all on public.events from anon;


-- ── 5. RLS ────────────────────────────────────────────────

alter table public.events enable row level security;
-- force 가 없으면 테이블 소유자는 정책을 우회합니다.
-- 그러면 대시보드에서 테스트할 때 "왜 다 보이지?" 하고 착각하게 됩니다.
alter table public.events force row level security;

drop policy if exists events_select_admin on public.events;
drop policy if exists events_insert_admin on public.events;
drop policy if exists events_update_admin on public.events;
drop policy if exists events_delete_admin on public.events;

create policy events_select_admin
  on public.events for select
  to authenticated
  using (public.is_admin());

create policy events_insert_admin
  on public.events for insert
  to authenticated
  with check (public.is_admin());

-- update 에는 using 과 with check 가 둘 다 필요합니다.
-- using 은 건드릴 수 있는 기존 행, with check 는 바뀐 뒤의 행을 봅니다.
create policy events_update_admin
  on public.events for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy events_delete_admin
  on public.events for delete
  to authenticated
  using (public.is_admin());


-- ═══════════════════════════════════════════════════════════
-- 실행 후 반드시 확인할 것
--
-- 1) 관리자 계정에 역할 부여 (대시보드 > Authentication > Users > 해당 유저 편집)
--       app_metadata 에  { "role": "admin" }
--    ※ 부여 뒤에는 반드시 로그아웃 → 재로그인 해야 합니다.
--       이미 발급된 JWT 에는 반영되지 않습니다.
--
-- 2) 회원가입 차단 (대시보드 > Authentication > Sign In / Providers)
--       Allow new users to sign up  →  끄기
--    계정은 하나뿐이므로 가입 경로가 열려 있을 이유가 없습니다.
--
-- 3) 격리 검증 — 이게 통과하기 전에는 실제 일정을 넣지 마십시오.
--       로그아웃 상태에서 익명 키로 아래를 호출했을 때 401/403 이어야 합니다.
--       (200 에 빈 배열이 아니라, 접근 자체가 거부되어야 합니다)
--
--       curl "https://<프로젝트>.supabase.co/rest/v1/events?select=*" \
--            -H "apikey: <anon key>"
-- ═══════════════════════════════════════════════════════════

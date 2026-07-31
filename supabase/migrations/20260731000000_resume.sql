-- ============================================================
-- 이력서 · 소개를 화면에서 고치기 (docs/09)
--
-- 여러 번 실행해도 안전합니다. 기존 데이터는 남습니다.
--
-- ── 캘린더와 권한이 반대입니다 ──
-- events 는 비공개 일정이라 anon 에게서 권한을 통째로 걷어냈습니다.
-- 이력서는 **하라고 만든 공개 콘텐츠**라 읽기를 열어 줍니다.
-- 다만 쓰기는 관리자만이고, published=false 인 초안은 읽히지 않습니다.
--
-- ⚠️ 20260729010000 에서 이렇게 해 뒀습니다:
--      alter default privileges in schema public revoke all on tables from anon;
--    그래서 새 표는 **명시적으로 grant 하지 않으면 anon 이 못 읽습니다.**
--    아래 grant 두 줄이 빠지면 방문자에게 이력서가 통째로 안 보입니다.
-- ============================================================

-- ── 갱신 시각 ────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 이력서 ──────────────────────────────────────────────────
create table if not exists public.resume_items (
  -- 'intro' · 'career-a' 같은 사람이 읽는 식별자.
  -- 방 안 사물 자리(SPOTS)와 맞물릴 수 있어 uuid 가 아니라 text 입니다.
  id          text primary key,
  sort        integer     not null default 0,

  -- 방에 놓을 그림 키(ArtKey). 값 검사는 앱이 합니다 —
  -- 그림이 늘 때마다 DB 제약을 고치러 오고 싶지 않습니다.
  art         text        not null default 'frame',

  category    text        not null default '',
  short       text        not null default '',
  title       text        not null default '',
  lead        text        not null default '',
  tip         text        not null default '',

  -- 넷 다 항목과 통째로 읽고 통째로 씁니다. 따로 조회할 일이 없어 jsonb 입니다.
  --   rows  [{ label, value, note? }]
  --   chips [{ name, hot? }]
  --   body  ["문단", ...]
  --   links [{ href, label, ghost? }]
  rows        jsonb       not null default '[]'::jsonb,
  chips       jsonb       not null default '[]'::jsonb,
  body        jsonb       not null default '[]'::jsonb,
  links       jsonb       not null default '[]'::jsonb,

  -- 쓰는 중인 항목을 감춰 둘 수 있게. 공개 정책이 이 값을 봅니다.
  published   boolean     not null default true,
  updated_at  timestamptz not null default now(),

  constraint resume_items_json_is_array check (
    jsonb_typeof(rows) = 'array' and
    jsonb_typeof(chips) = 'array' and
    jsonb_typeof(body) = 'array' and
    jsonb_typeof(links) = 'array'
  )
);

comment on table public.resume_items is
  '이력서 항목. 공개 읽기 · 관리자 쓰기 (docs/09)';

-- 화면은 언제나 sort 순으로 published 만 읽습니다
create index if not exists resume_items_public_idx
  on public.resume_items (published, sort);

drop trigger if exists resume_items_touch on public.resume_items;
create trigger resume_items_touch
  before update on public.resume_items
  for each row execute function public.touch_updated_at();

-- ── 소개 (한 행짜리) ────────────────────────────────────────
create table if not exists public.profile (
  -- 행이 하나뿐임을 DB 가 보장합니다. 실수로 두 번째 프로필이 생길 자리가 없습니다.
  id          smallint    primary key default 1 check (id = 1),
  name        text        not null default '',
  role        text        not null default '',
  email       text        not null default '',
  github      text        not null default '',
  intro       text        not null default '',
  updated_at  timestamptz not null default now()
);

comment on table public.profile is
  '이름 · 직함 · 연락처. 벽에 붙은 이름표와 폰 소개 앱이 같은 값을 씁니다';

drop trigger if exists profile_touch on public.profile;
create trigger profile_touch
  before update on public.profile
  for each row execute function public.touch_updated_at();

-- 지금 컴포넌트에 박혀 있던 값을 그대로 옮겨 둡니다.
-- 화면이 비지 않게 하려는 것이고, 관리자 화면에서 바로 고칠 수 있습니다.
insert into public.profile (id, name, role, email, github)
values (
  1,
  'you4ranghe의 작업실',
  'backend engineer · 4 yrs · seoul',
  'you4ranghe@gmail.com',
  'you4ranghe'
)
on conflict (id) do nothing;

-- ── 권한 ────────────────────────────────────────────────────
alter table public.resume_items enable row level security;
alter table public.profile      enable row level security;

grant usage on schema public to anon, authenticated;

-- 읽기는 누구나. **이 두 줄이 빠지면 방문자에게 이력서가 안 보입니다** (위 주의 참고)
grant select on public.resume_items to anon, authenticated;
grant select on public.profile      to anon, authenticated;

-- 쓰기는 로그인한 사람에게만 문을 열어 두고, 실제 판정은 아래 정책이 합니다
grant insert, update, delete on public.resume_items to authenticated;
grant update                 on public.profile      to authenticated;

-- ── 정책 ────────────────────────────────────────────────────
drop policy if exists resume_public_read   on public.resume_items;
drop policy if exists resume_admin_read    on public.resume_items;
drop policy if exists resume_admin_insert  on public.resume_items;
drop policy if exists resume_admin_update  on public.resume_items;
drop policy if exists resume_admin_delete  on public.resume_items;

-- 공개된 항목은 누구나. 초안(published=false)은 여기에 걸리지 않습니다
create policy resume_public_read
  on public.resume_items for select
  to anon, authenticated
  using (published);

-- 관리자는 초안까지 봅니다
create policy resume_admin_read
  on public.resume_items for select
  to authenticated
  using (public.is_admin());

create policy resume_admin_insert
  on public.resume_items for insert
  to authenticated
  with check (public.is_admin());

create policy resume_admin_update
  on public.resume_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy resume_admin_delete
  on public.resume_items for delete
  to authenticated
  using (public.is_admin());

drop policy if exists profile_public_read  on public.profile;
drop policy if exists profile_admin_update on public.profile;

create policy profile_public_read
  on public.profile for select
  to anon, authenticated
  using (true);

create policy profile_admin_update
  on public.profile for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 확인해 볼 것
--
-- 대시보드의 SQL Editor 로는 확인이 **안 됩니다.** 최고 권한으로 돌아서
-- RLS 를 그냥 통과합니다. 익명 키로 REST 를 직접 찔러야 합니다.
--
--   curl "$URL/rest/v1/profile?select=*" -H "apikey: $ANON_KEY"
--
--   1. 익명 읽기 → profile 1건, resume_items 는 published 인 것만
--   2. 익명 insert → 401 (RLS 위반)
--   3. 익명 update/delete → **상태 코드가 아니라 값으로 확인합니다** (아래)
--
-- ⚠️ 익명 update/delete 는 403 이 아니라 **204** 로 돌아옵니다.
--    성공이 아닙니다. RLS 가 대상 행을 미리 걸러 내서 "바뀐 행 0개" 라는 뜻입니다.
--    insert 는 새 행을 검사(with check)하므로 대놓고 거부하지만,
--    update·delete 는 볼 수 있는 행(using)이 없으면 조용히 아무 일도 안 합니다.
--    그래서 확인은 **다시 읽어서 값이 그대로인지**로 해야 합니다.
--    2026-07-31 실측: 익명으로 이름을 바꾸려 해도 값이 그대로였습니다.
--
-- 익명 읽기가 0건이거나 "permission denied" 가 나오면 정책이 아니라 **grant** 를
-- 먼저 보세요 — 이 프로젝트는 anon 기본 권한을 회수해 두었기 때문입니다.
-- ============================================================

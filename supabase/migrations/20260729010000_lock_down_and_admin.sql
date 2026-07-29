-- ═══════════════════════════════════════════════════════════
-- 두 가지를 고칩니다.
--   1. anon 의 events 접근 권한을 완전히 회수
--   2. 관리자 역할(app_metadata.role = 'admin') 부여
--
-- 대시보드 SQL Editor 에 붙여 넣어 실행하세요. ②의 이메일만 바꾸면 됩니다.
-- ═══════════════════════════════════════════════════════════


-- ── ① anon 권한 회수 ──────────────────────────────────────
--
-- 왜 필요한가:
-- Supabase 는 public 스키마에 기본 권한(default privileges)을 걸어 두어,
-- 새로 만든 테이블에 anon 과 authenticated 권한이 자동으로 붙습니다.
-- 앞선 마이그레이션에서 authenticated 에만 GRANT 를 준다고 해서
-- 이미 붙어 있던 anon 권한이 사라지지는 않습니다.
--
-- 지금도 RLS 정책이 anon 을 위해 없으므로 행은 0건이 반환됩니다.
-- 즉 데이터가 새고 있지는 않습니다. 하지만 그건 정책 하나에만 의존하는 상태입니다.
-- 테이블 접근 권한 자체를 없애 층을 하나 더 둡니다.
--
-- 회수 뒤에는 익명 요청이 "빈 배열" 이 아니라 "권한 없음" 으로 거부됩니다.

revoke all on public.events from anon;

-- 앞으로 이 스키마에 만들 테이블에도 anon 권한이 자동으로 붙지 않게 합니다.
-- 이 프로젝트에서 익명에게 열어야 할 테이블이 생기면 그때 명시적으로 GRANT 합니다.
alter default privileges in schema public revoke all on tables from anon;


-- ── ② 관리자 역할 부여 ────────────────────────────────────
--
-- 대시보드 UI 에서는 app_metadata 를 직접 고칠 수 없습니다.
-- auth.users 를 직접 갱신합니다.
--
-- user_metadata 가 아니라 app_metadata 인 것이 중요합니다.
-- user_metadata 는 사용자가 스스로 고칠 수 있어서, 거기에 role 을 두면
-- 누구나 자기를 관리자로 승격시킬 수 있습니다.

-- ⚠️ 먼저 계정이 있어야 합니다.
--    Supabase 프로젝트는 처음에 사용자가 0명입니다. 아래 쿼리가 비어 있으면
--    대시보드에서 만드세요:
--      Authentication → Users → Add user → Create new user
--      (Auto Confirm User 를 켜야 합니다. 안 켜면 확인 메일을 기다리게 되는데
--       무료 티어 기본 SMTP 는 도달이 불안정합니다.)
--
--   select id, email, raw_app_meta_data from auth.users;

-- 이메일을 손으로 적다 틀리는 일이 잦아, 가장 먼저 만든 계정을 집도록 했습니다.
-- 계정이 하나뿐인 프로젝트라 이 방식이 안전하고 확실합니다.
update auth.users
set raw_app_meta_data =
      coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where id = (select id from auth.users order by created_at limit 1);


-- ── ③ 확인 ────────────────────────────────────────────────
--
-- role 이 admin 으로 들어갔는지 봅니다.

select
  email,
  raw_app_meta_data ->> 'role' as role,
  case when raw_app_meta_data ->> 'role' = 'admin'
       then '✅ 관리자'
       else '❌ 아직 아님 — 위 update 의 이메일을 확인하세요'
  end as status
from auth.users;


-- ═══════════════════════════════════════════════════════════
-- 실행 뒤에 할 것
--
-- 1) 이미 로그인해 있었다면 반드시 로그아웃 → 재로그인.
--    이미 발급된 JWT 에는 새 role 이 들어 있지 않습니다.
--
-- 2) 익명 접근이 막혔는지 다시 확인:
--
--      curl "https://<프로젝트>.supabase.co/rest/v1/events?select=*" \
--           -H "apikey: <anon key>"
--
--    이제 200 [] 이 아니라 401 또는 403 이 나와야 합니다.
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 로그인이 안 될 때 원인을 한 번에 확인합니다.
-- 대시보드 SQL Editor 에 붙여 넣어 실행하세요.
-- ═══════════════════════════════════════════════════════════

select
  email,

  -- ① 메일 확인이 됐는가
  --    안 됐으면 signInWithPassword 가 "Email not confirmed" 로 실패합니다.
  case when email_confirmed_at is null
       then '❌ 미확인 — 아래 ①번 수정 실행'
       else '✅ 확인됨'
  end as "1_메일확인",

  -- ② 관리자 역할이 붙었는가
  --    없으면 로그인 자체는 되지만 /admin/calendar 가 /login 으로 되돌립니다.
  --    화면상으로는 "로그인이 안 된다" 처럼 보입니다.
  case when raw_app_meta_data ->> 'role' = 'admin'
       then '✅ admin'
       else '❌ 없음 — 아래 ②번 수정 실행  (현재값: '
            || coalesce(raw_app_meta_data ->> 'role', 'null') || ')'
  end as "2_관리자역할",

  -- ③ 비밀번호가 설정돼 있는가
  --    초대 메일로 만든 계정은 비밀번호가 없어 비밀번호 로그인이 안 됩니다.
  case when encrypted_password is null or encrypted_password = ''
       then '❌ 없음 — 대시보드에서 비밀번호를 다시 설정하세요'
       else '✅ 있음'
  end as "3_비밀번호",

  -- ④ 차단 여부
  case when banned_until is not null and banned_until > now()
       then '❌ 차단됨'
       else '✅ 정상'
  end as "4_계정상태",

  created_at
from auth.users
order by created_at;


-- ═══════════════════════════════════════════════════════════
-- 수정 — 위 결과에서 ❌ 가 나온 항목만 실행하세요
-- ═══════════════════════════════════════════════════════════

-- ① 메일 확인 처리
--    무료 티어 기본 SMTP 는 도달이 불안정하므로 직접 확인 처리합니다.
--
-- update auth.users
-- set email_confirmed_at = coalesce(email_confirmed_at, now())
-- where id = (select id from auth.users order by created_at limit 1);


-- ② 관리자 역할 부여
--    부여 뒤에는 반드시 로그아웃 → 재로그인 해야 합니다.
--    이미 발급된 JWT 에는 새 role 이 들어 있지 않습니다.
--
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where id = (select id from auth.users order by created_at limit 1);


-- ③ 비밀번호는 SQL 로 바꾸지 마세요.
--    해시 방식이 바뀔 수 있어 직접 넣으면 깨질 수 있습니다.
--    대시보드 > Authentication > Users > 해당 계정 > ⋯ > Reset password
--    또는 계정을 지우고 Add user 로 다시 만드는 편이 확실합니다.

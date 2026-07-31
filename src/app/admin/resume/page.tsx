import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/**
 * 이력서 목록.
 *
 * 공개 화면과 달리 **초안(published=false)까지** 보여야 하므로
 * 캐시(`getResume`)가 아니라 로그인한 세션으로 DB 를 직접 읽습니다.
 * 관리자 정책이 초안을 열어 주고, 이 페이지는 어차피 방문자용이 아니라
 * 동적으로 도는 것이 맞습니다.
 */

interface Row {
  id: string;
  sort: number;
  title: string;
  category: string;
  published: boolean;
}

export default async function ResumeList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resume_items")
    .select("id,sort,title,category,published")
    .order("sort", { ascending: true });

  const rows = (data ?? []) as Row[];

  return (
    <>
      <div className="adm__head">
        <h1 className="adm__h1">이력서</h1>
        <Link className="adm__btn" href="/admin/resume/new">
          + 새 항목
        </Link>
      </div>

      {error && (
        <p className="adm__error">
          목록을 불러오지 못했습니다: {error.message}
        </p>
      )}

      {!rows.length && !error && (
        <p className="adm__empty">
          아직 하나도 없습니다. <b>+ 새 항목</b>으로 첫 이야기를 만들어 주세요.
          <br />
          비어 있는 동안 사이트에는 &ldquo;준비 중&rdquo;으로 보입니다.
        </p>
      )}

      {rows.length > 0 && (
        <ul className="adm__list">
          {rows.map((r) => (
            <li key={r.id} data-off={String(!r.published)}>
              <Link href={`/admin/resume/${r.id}`}>
                <span className="adm__sort">{r.sort}</span>
                <span className="adm__t">
                  <b>{r.title || "(제목 없음)"}</b>
                  <small>
                    {r.category || "분류 없음"} · {r.id}
                  </small>
                </span>
                {!r.published && <span className="adm__draft">초안</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="adm__note">
        순서는 각 항목의 <b>순서</b> 숫자가 정합니다. 작은 것이 먼저 나옵니다.
        <br />
        <b>초안</b>은 사이트에 나가지 않습니다 — 쓰다 만 것을 감춰 둘 때 씁니다.
      </p>
    </>
  );
}

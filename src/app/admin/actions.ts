"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getAdmin } from "@/lib/supabase/server";
import { RESUME_TAG, PROFILE_TAG } from "@/content/resume";
import { parseRows, parseChips, parseBody, parseLinks } from "./lines";

/**
 * 이력서·소개 저장 (docs/09).
 *
 * ── 저장할 때만 다시 굽습니다 ──
 * 공개 화면은 태그가 붙은 캐시를 읽습니다. 여기서 태그를 버리지 않으면
 * **고쳐도 사이트에 반영되지 않습니다.** 반대로 매번 버리므로 방문자 요청으로는
 * DB 에 한 번도 가지 않습니다. 이 두 줄이 정적 렌더링을 지키는 값입니다.
 *
 * ⚠️ 이 버전의 Next 에서 `revalidateTag(tag)` 는 인자가 둘입니다
 *    (`revalidateTag(tag, profile)`). 대신 **`updateTag`** 를 씁니다 —
 *    서버 액션 전용이고 "방금 쓴 것을 바로 읽는다" 를 보장합니다.
 *    저장하고 목록으로 돌아갔을 때 옛 값이 보이면 안 되므로 이쪽이 맞습니다.
 *
 * ── 권한 ──
 * `getAdmin()` 은 화면을 가리기 위한 판단입니다. 진짜 방어선은 RLS 이고,
 * 관리자가 아니면 아래 쿼리는 DB 에서 거부됩니다. 그래도 여기서 먼저 막는 이유는
 * 거부 오류 대신 알아들을 수 있는 메시지를 주기 위해서입니다.
 */

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

async function guard() {
  const admin = await getAdmin();
  if (!admin) redirect("/login?next=/admin/resume");
  return createClient();
}

/** 고치고 나면 공개 화면 캐시를 버립니다 */
function refresh() {
  updateTag(RESUME_TAG);
  updateTag(PROFILE_TAG);
}

export async function saveItem(formData: FormData) {
  const supabase = await guard();

  const id = str(formData, "id");
  if (!id) throw new Error("식별자(id)가 비어 있습니다");

  const row = {
    id,
    sort: Number(str(formData, "sort")) || 0,
    art: str(formData, "art") || "frame",
    category: str(formData, "category"),
    short: str(formData, "short"),
    title: str(formData, "title"),
    lead: str(formData, "lead"),
    tip: str(formData, "tip"),
    rows: parseRows(str(formData, "rows")) ?? [],
    chips: parseChips(str(formData, "chips")) ?? [],
    body: parseBody(str(formData, "body")),
    links: parseLinks(str(formData, "links")) ?? [],
    published: formData.get("published") === "on",
  };

  // upsert — 새로 만들 때와 고칠 때가 같은 폼입니다
  const { error } = await supabase.from("resume_items").upsert(row);
  if (error) throw new Error(`저장하지 못했습니다: ${error.message}`);

  refresh();
  redirect("/admin/resume");
}

export async function deleteItem(formData: FormData) {
  const supabase = await guard();
  const id = str(formData, "id");

  const { error } = await supabase.from("resume_items").delete().eq("id", id);
  if (error) throw new Error(`지우지 못했습니다: ${error.message}`);

  refresh();
  redirect("/admin/resume");
}

export async function saveProfile(formData: FormData) {
  const supabase = await guard();

  const { error } = await supabase
    .from("profile")
    .update({
      name: str(formData, "name"),
      role: str(formData, "role"),
      email: str(formData, "email"),
      github: str(formData, "github"),
      intro: str(formData, "intro"),
    })
    .eq("id", 1);

  if (error) throw new Error(`저장하지 못했습니다: ${error.message}`);

  refresh();
  redirect("/admin");
}

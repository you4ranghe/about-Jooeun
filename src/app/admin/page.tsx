import Link from "next/link";
import { getResume, getProfile } from "@/content/resume";

/**
 * 관리 첫 화면.
 *
 * 여기서 읽는 값은 공개 화면과 **같은 캐시**를 봅니다. 그래서 저장한 뒤에
 * 여기 숫자가 그대로면 `revalidateTag` 가 안 돈 것이고, 그건 사이트에도
 * 반영되지 않았다는 뜻입니다. 확인용으로 쓸 수 있습니다.
 */
export default async function AdminHome() {
  const [items, profile] = await Promise.all([getResume(), getProfile()]);

  return (
    <>
      <h1 className="adm__h1">무엇을 고칠까요</h1>

      <div className="adm__cards">
        <Link className="adm__card" href="/admin/resume">
          <b>이력서</b>
          <span>{items.length}가지 공개 중</span>
          <small>
            {items.length
              ? "항목을 더하거나 순서를 바꿉니다"
              : "아직 비어 있습니다. 첫 항목을 만들어 주세요"}
          </small>
        </Link>

        <Link className="adm__card" href="/admin/profile">
          <b>소개</b>
          <span>{profile.name || "이름 없음"}</span>
          <small>벽에 붙은 이름표와 폰 소개 앱이 같은 값을 씁니다</small>
        </Link>
      </div>

      <p className="adm__note">
        고친 내용은 저장하는 순간 사이트에 반영됩니다. 방문자가 볼 때는 DB 를
        거치지 않고 미리 구워 둔 화면이 나가므로, 데이터베이스가 잠들어 있어도
        사이트는 그대로 돕니다.
      </p>
    </>
  );
}

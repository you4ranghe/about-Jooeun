import Link from "next/link";
import { getProfile } from "@/content/resume";
import { saveProfile } from "../actions";

/**
 * 소개 편집.
 *
 * 표에 행이 하나뿐이라 만들기·지우기가 없습니다 — 고치기만 있습니다.
 * DB 가 `check (id = 1)` 로 그 사실을 보장합니다(docs/09 §3).
 *
 * 여기서 고친 값은 **벽에 붙은 이름표**와 **폰 소개 앱**이 같이 씁니다.
 * 전에는 두 컴포넌트에 각각 문자열로 박혀 있어서 한쪽만 고치기 쉬웠습니다.
 */
export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <>
      <div className="adm__head">
        <h1 className="adm__h1">소개</h1>
        <Link className="adm__back" href="/admin">
          ← 관리
        </Link>
      </div>

      <form action={saveProfile} className="adm__form">
        <label>
          <span>이름</span>
          <input
            name="name"
            defaultValue={profile.name}
            placeholder="you4ranghe의 작업실"
          />
          <small>벽에 붙은 이름표의 큰 글씨</small>
        </label>

        <label>
          <span>직함</span>
          <input
            name="role"
            defaultValue={profile.role}
            placeholder="backend engineer · 4 yrs · seoul"
          />
          <small>이름 바로 아래 한 줄</small>
        </label>

        <div className="adm__pair">
          <label>
            <span>이메일</span>
            <input
              name="email"
              type="email"
              defaultValue={profile.email}
              placeholder="you4ranghe@gmail.com"
            />
          </label>

          <label>
            <span>GitHub 아이디</span>
            <input
              name="github"
              defaultValue={profile.github}
              placeholder="you4ranghe"
            />
            <small>주소가 아니라 아이디만</small>
          </label>
        </div>

        <label>
          <span>한 문단 소개</span>
          <textarea
            name="intro"
            defaultValue={profile.intro}
            rows={4}
            placeholder="주문과 정산처럼 틀리면 돈이 어긋나는 쪽을 만듭니다."
          />
          <small>폰 소개 앱에 들어갑니다. 비워 두면 나오지 않습니다</small>
        </label>

        <div className="adm__actions">
          <button type="submit" className="adm__btn">
            저장
          </button>
        </div>
      </form>
    </>
  );
}

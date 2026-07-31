import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ResumeItem } from "@/content/types";
import { saveItem, deleteItem } from "../../actions";
import {
  rowsToText,
  chipsToText,
  bodyToText,
  linksToText,
} from "../../lines";

/**
 * 이력서 한 항목 편집. `new` 면 새로 만드는 폼입니다.
 *
 * ── 회색 예시 글자 ──
 * 원래 `content/resume.ts` 에 하드코딩돼 있던 12개는 전부 내렸습니다(docs/09 Q1).
 * 그 문장들이 여기 `placeholder` 로 들어가 있습니다. 빈 폼 앞에서 무엇을 쓸지
 * 막막하지 않으면서, **공개되는 곳에는 한 글자도 나가지 않습니다.**
 *
 * ── 자바스크립트 없이 동작합니다 ──
 * 서버 액션을 쓰는 평범한 `<form>` 입니다. 배열은 여러 줄 글로 주고받습니다(../lines).
 * 폰에서도 그대로 쓸 수 있습니다.
 */

/** 방에 놓을 그림. content/types.ts 의 ArtKey 와 같아야 합니다 */
const ARTS = [
  ["frame", "액자"],
  ["coins", "동전"],
  ["books", "책"],
  ["yut", "윷"],
  ["bell", "종"],
  ["lock", "자물쇠"],
  ["ticket", "쿠폰"],
  ["rack", "서버랙"],
  ["glass", "돋보기"],
  ["plant", "화분"],
  ["duck", "러버덕"],
  ["box", "택배상자"],
] as const;

type Props = { params: Promise<{ id: string }> };

/** DB 한 행. 공개용 ResumeItem 에 관리자만 보는 두 칸이 더 붙습니다 */
type Stored = ResumeItem & { sort: number; published: boolean };

export default async function EditItem({ params }: Props) {
  const { id } = await params;
  const isNew = id === "new";

  let item: Stored | null = null;

  if (!isNew) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("resume_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    item = (data as Stored | null) ?? null;
  }

  const v = {
    id: isNew ? "" : id,
    sort: item?.sort ?? 10,
    art: item?.art ?? "frame",
    category: item?.category ?? "",
    short: item?.short ?? "",
    title: item?.title ?? "",
    tip: item?.tip ?? "",
    lead: item?.lead ?? "",
    rows: rowsToText(item?.rows),
    chips: chipsToText(item?.chips),
    body: bodyToText(item?.body ?? []),
    links: linksToText(item?.links),
    published: item?.published ?? true,
  };

  return (
    <>
      <div className="adm__head">
        <h1 className="adm__h1">{isNew ? "새 항목" : v.title || id}</h1>
        <Link className="adm__back" href="/admin/resume">
          ← 목록
        </Link>
      </div>

      <form action={saveItem} className="adm__form">
        <label>
          <span>식별자 (id)</span>
          <input
            name="id"
            defaultValue={v.id}
            readOnly={!isNew}
            required
            pattern="[a-z0-9-]+"
            placeholder="career"
          />
          <small>
            영문 소문자·숫자·하이픈. 한 번 정하면 바꾸지 않습니다 — 방 안 사물
            자리와 맞물립니다.
          </small>
        </label>

        <div className="adm__pair">
          <label>
            <span>순서</span>
            <input
              name="sort"
              type="number"
              defaultValue={v.sort}
              placeholder="10"
            />
            <small>작은 것이 먼저</small>
          </label>

          <label>
            <span>그림</span>
            <select name="art" defaultValue={v.art}>
              {ARTS.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <small>방에 꺼내 놓을 때 쓰는 사물</small>
          </label>
        </div>

        <div className="adm__pair">
          <label>
            <span>분류</span>
            <input
              name="category"
              defaultValue={v.category}
              placeholder="EXPERIENCE · 경력"
            />
            <small>카드 맨 위 작은 글씨</small>
          </label>

          <label>
            <span>짧은 이름</span>
            <input name="short" defaultValue={v.short} placeholder="경력" />
            <small>목록에서 쓰는 한 단어</small>
          </label>
        </div>

        <label>
          <span>제목</span>
          <input
            name="title"
            defaultValue={v.title}
            required
            placeholder="쌓아온 4년"
          />
        </label>

        <label>
          <span>한 줄 소개</span>
          <input
            name="lead"
            defaultValue={v.lead}
            placeholder="커머스 도메인에서 주문·결제·정산을 맡았습니다."
          />
          <small>제목 바로 아래 한 문장</small>
        </label>

        <label>
          <span>사물 이름표</span>
          <input
            name="tip"
            defaultValue={v.tip}
            placeholder="쌓아둔 동전 · 경력"
          />
          <small>방에서 사물에 마우스를 올렸을 때 뜨는 말</small>
        </label>

        <label>
          <span>표</span>
          <textarea
            name="rows"
            defaultValue={v.rows}
            rows={5}
            placeholder={`2024 — | OO커머스 · 백엔드 개발자 | 주문·결제 도메인. 3인 팀\n2022 — | OO테크 · 백엔드 개발자 | 정산 배치, 게이트웨이 구축\n2021 | 국비 교육 수료 | Java 백엔드 과정 6개월`}
          />
          <small>
            한 줄에 하나. <b>라벨 | 값 | 보조설명</b> — 보조설명은 없어도 됩니다
          </small>
        </label>

        <label>
          <span>기술 칩</span>
          <textarea
            name="chips"
            defaultValue={v.chips}
            rows={4}
            placeholder={`Java *\nSpring Boot *\nMySQL\nRedis`}
          />
          <small>
            한 줄에 하나. 끝에 <b>*</b> 를 붙이면 강조됩니다 (실무에서 문제를
            풀어 본 것)
          </small>
        </label>

        <label>
          <span>본문</span>
          <textarea
            name="body"
            defaultValue={v.body}
            rows={8}
            placeholder={`정산 배치를 300만 건 12분으로 줄였고, 선착순 쿠폰의 초과 발급 사고를 잡았습니다.\n\n숫자로 말할 수 있는 것만 적었습니다. 자세한 내용은 모니터 안 프로젝트에 있습니다.`}
          />
          <small>
            문단은 <b>빈 줄</b>로 나눕니다. 강조는 &lt;strong&gt;굵게&lt;/strong&gt;
          </small>
        </label>

        <label>
          <span>링크</span>
          <textarea
            name="links"
            defaultValue={v.links}
            rows={3}
            placeholder={`이메일 보내기 | mailto:you4ranghe@gmail.com\nGitHub ↗ | https://github.com/you4ranghe | ghost`}
          />
          <small>
            한 줄에 하나. <b>라벨 | 주소</b> — 끝에 <b>ghost</b> 를 붙이면 보조
            버튼이 됩니다
          </small>
        </label>

        <label className="adm__check">
          <input
            type="checkbox"
            name="published"
            defaultChecked={v.published}
          />
          <span>사이트에 공개</span>
          <small>끄면 초안으로 남고 방문자에게 보이지 않습니다</small>
        </label>

        <div className="adm__actions">
          <button type="submit" className="adm__btn">
            저장
          </button>
          <Link className="adm__back" href="/admin/resume">
            취소
          </Link>
        </div>
      </form>

      {!isNew && (
        <form action={deleteItem} className="adm__danger">
          <input type="hidden" name="id" value={id} />
          <button type="submit">이 항목 지우기</button>
          <small>되돌릴 수 없습니다</small>
        </form>
      )}
    </>
  );
}

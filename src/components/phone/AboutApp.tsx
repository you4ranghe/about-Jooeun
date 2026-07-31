"use client";

import type { Profile } from "@/content/resume";

/**
 * 소개 앱.
 *
 * 방에서는 벽에 테이프로 붙인 이름표였습니다(`note--brand`).
 * 적힌 내용도 그대로입니다 — 새로 지어낸 문장을 넣지 않았습니다.
 *
 * 마지막 줄에 "넓은 화면에서는 서재가 나온다" 를 적어 둡니다.
 * 폰으로 본 사람은 방이 있다는 것 자체를 모르고, 그건 이 사이트에서
 * 가장 공들인 부분입니다. 링크가 아니라 안내인 이유는 폰에서 눌러도
 * 어차피 홈 화면이 나오기 때문입니다.
 */
export function AboutApp({
  profile,
  projects,
  resumeCount,
  isAdmin,
}: {
  profile: Profile;
  projects: number;
  resumeCount: number;
  isAdmin: boolean;
}) {
  return (
    <div className="phDoc">
      <header className="phDoc__top">
        <p className="phDoc__k">ABOUT</p>
        <h1 className="phDoc__h1">{profile.name || "이름을 채워 주세요"}</h1>
        <p className="phDoc__lede">{profile.role}</p>

        {isAdmin && (
          <a className="phDoc__admin" href="/admin/profile">
            ✎ 소개 고치기
          </a>
        )}
      </header>

      <dl className="phAbout">
        <div>
          <dt>저장소</dt>
          <dd>{projects}개</dd>
        </div>
        <div>
          <dt>이력서</dt>
          <dd>{resumeCount}가지</dd>
        </div>
        <div>
          <dt>있는 곳</dt>
          <dd>서울</dd>
        </div>
      </dl>

      <section className="phAbout__sec">
        <h2>이 사이트</h2>
        <p>
          프로젝트마다 <b>무엇을 버렸고 왜 버렸는지</b>를 적었습니다. 기능은
          저장소를 열면 보이지만, 갈림길에서 무엇을 포기했는지는 만든 사람만
          알기 때문입니다.
        </p>
        <p>
          수치와 내용은 전부 저장소와 실제 화면에서 확인한 것입니다. 확인하지
          못한 자리는 비워 뒀습니다.
        </p>
      </section>

      <section className="phAbout__sec">
        <h2>연락</h2>
        <div className="phLinks">
          {profile.email && (
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          )}
          {profile.github && (
            <a
              href={`https://github.com/${profile.github}`}
              target="_blank"
              rel="noopener"
            >
              github.com/{profile.github} ↗
            </a>
          )}
        </div>
      </section>

      <p className="phAbout__foot">
        넓은 화면에서 열면 이 사이트는 <b>서재</b>가 됩니다. 책상 위 모니터
        안에 같은 프로젝트들이 들어 있고, 창밖에는 지금 서울 날씨가 흐릅니다.
      </p>
    </div>
  );
}

/**
 * 콘텐츠 타입 정의.
 *
 * 이력서(방)와 프로젝트(갤러리)는 성격이 달라 저장 위치도 다릅니다.
 *  - 이력서: 이 저장소의 타입 상수. 연 몇 번 바뀌는 문서에 관리자 CRUD를 붙이지 않습니다.
 *  - 프로젝트: 지금은 상수, 관리자 화면을 붙이는 시점에 Supabase로 이관합니다.
 *    그래서 아래 Project 타입은 docs/02 의 projects 테이블 컬럼과 이름을 맞춰 뒀습니다.
 */

/** 방 안의 사물 식별자. 그림 컴포넌트 키와 1:1로 대응합니다. */
export type ArtKey =
  | "frame"
  | "yut"
  | "bell"
  | "lock"
  | "ticket"
  | "coins"
  | "rack"
  | "glass"
  | "plant"
  | "duck"
  | "books"
  | "box";

/** 이력서 카드 안에 들어가는 표 한 줄. */
export interface ResumeRow {
  /** 왼쪽 라벨 (연도, "이름" 등) */
  label: string;
  /** 굵게 표시되는 본문 */
  value: string;
  /** 아래 작게 붙는 보조 설명 */
  note?: string;
}

/** 기술 칩. hot = 실무에서 문제를 해결해 본 것. */
export interface ResumeChip {
  name: string;
  hot?: boolean;
}

export interface ResumeLink {
  href: string;
  label: string;
  /** 보조 버튼(외곽선) 스타일 */
  ghost?: boolean;
}

/** 방에 놓인 사물 하나 = 이력서 한 항목. */
export interface ResumeItem {
  /**
   * React key 이자 **무대 위 자리를 찾는 열쇠**입니다.
   * 실제 좌표는 content/layout.ts 의 SPOTS[id] 에 있습니다.
   * 내용(여기)과 배치(거기)를 갈라 둔 이유: 방을 다시 꾸밀 때 글은 건드리지 않기 위해서입니다.
   */
  id: string;
  /** 어떤 그림을 쓸지 */
  art: ArtKey;
  /** 마우스를 올렸을 때 뜨는 이름표 */
  tip: string;
  /** 카드 상단의 분류 라벨 */
  category: string;
  /** 목록 패널에서 쓰는 짧은 분류명 */
  short: string;
  /** 카드 제목 */
  title: string;
  /** 제목 아래 한 줄 */
  lead: string;
  rows?: ResumeRow[];
  chips?: ResumeChip[];
  /** 본문 단락. <strong> 만 허용합니다. */
  body: string[];
  links?: ResumeLink[];
}

/** 프로젝트 상세의 "판단이 갈렸던 지점" 한 쌍. */
export interface ProjectQuestion {
  question: string;
  answer: string;
}

/**
 * GitHub 에서 가져올 수 있는 값들.
 * 2단계에서 RepositoryProvider 가 채웁니다(docs/03 §7). 지금은 손으로 넣습니다.
 */
export interface RepoMeta {
  language: string;
  stars: number;
  forks: number;
  commits: number;
  /** "3일 전" 같은 사람이 읽는 표현 */
  lastCommit: string;
  license: string;
}

export interface Project {
  /** URL 식별자. docs/02 의 projects.slug 와 동일한 제약을 따릅니다. */
  slug: string;
  /** 목록에서 보이는 번호 */
  no: string;
  /** 밴드 색. 목록과 상세 헤더에 함께 쓰입니다. */
  color: string;
  title: string;
  /** 한 줄 요약. OG description 으로도 재사용합니다. */
  summary: string;
  repo: string;
  /** 배포 주소. 없으면 빈 문자열 */
  live: string;
  /** 목록 오른쪽에 표시할 연도 표기 */
  year: string;
  /** 사람이 읽는 기간 */
  period: string;
  role: string;
  tags: string[];
  meta: RepoMeta;
  /** 어떤 문제였나 */
  overview: string[];
  /** 무엇을 했나. <b> 로 앞머리를 강조합니다. */
  did: string[];
  questions: ProjectQuestion[];
  learned: string;
  /** 아쉬운 것. 잘한 것만 적힌 포트폴리오보다 신뢰가 갑니다. */
  regret: string;
}

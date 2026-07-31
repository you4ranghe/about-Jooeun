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

/**
 * 갈림길 하나 (docs/07 §7.2).
 *
 * `dropped` 가 **필수**인 것이 이 타입의 전부입니다.
 * 버린 길을 적을 수 없으면 그건 결정이 아니라 기능이고, 기능은 `built` 로 갑니다.
 * 규칙을 문서에만 적어 두면 지켜지지 않아서 타입으로 옮겼습니다.
 */
export interface Decision {
  /** 무엇을 정해야 했나 */
  ask: string;
  /** 진지하게 고려했다가 버린 쪽. why 는 "안 좋아서" 가 아니라 구체적 손해 */
  dropped: { title: string; why: string };
  taken: { title: string; why: string };
}

/**
 * 그 사이트의 옷 (docs/07 §5).
 *
 * 상세페이지는 **그 프로젝트 사이트의 색과 글씨를 입습니다.**
 * 값은 지어내지 않고 그 사이트가 실제로 쓰는 팔레트에서 가져옵니다.
 *
 * 포트폴리오가 흩어지지 않는 것은 색이 같아서가 아니라
 * 정보 순서와 결정 대장이라는 장치가 같기 때문입니다.
 */
export interface ProjectTheme {
  /** 밝은 화면인가 어두운 화면인가. 그림자와 테두리 세기가 갈립니다 */
  mode: "dark" | "light";
  /** 바탕 */
  bg: string;
  /** 카드·패널 — 바탕에서 한 겹 올라온 곳 */
  surface: string;
  /** 한 겹 눌린 곳 — 버린 길 카드, 주소 표시줄 */
  sunken: string;
  /** 본문 글자 */
  fg: string;
  /** 보조 글자 */
  mid: string;
  /** 라벨 · 가장 약한 글자 */
  dim: string;
  line: string;
  /** 강조색 하나. 택한 길 · 수치 · 버튼 */
  accent: string;
  /** 강조색 위에 얹는 글자색 */
  onAccent: string;
  /** 버린 길 */
  drop: string;
  /**
   * 표제 글씨. **그 사이트가 실제로 쓰는 글꼴**을 고릅니다.
   * batang(Gowun Batang) 과 myeongjo(Nanum Myeongjo) 는 둘 다 명조지만
   * 인상이 달라, 명조를 쓰는 사이트가 둘이어도 같아 보이지 않습니다.
   */
  display: "gothic" | "batang" | "myeongjo";
  /** 모서리 반경. 둥근 사이트와 각진 사이트가 다릅니다 */
  radius: string;
}

/** 히어로 위 수치 한 칸. 고정 항목이 아니라 프로젝트가 고릅니다 (docs/07 §6). */
export interface ProjectFact {
  label: string;
  value: string;
  /** 값 뒤에 작게 붙는 단위나 단서 */
  note?: string;
}

/** "무엇을 만들었나" 한 칸. */
export interface BuiltItem {
  title: string;
  body: string;
}

/**
 * 증거 블록 (docs/07 §4).
 *
 * 주장 옆에 검증 가능한 것을 하나 둡니다. 가이드에는 여섯 종류가 있지만
 * **그 종류를 쓰는 저장소를 받을 때 하나씩 추가**합니다.
 * 그리지 못하는 종류를 미리 타입에만 적어 두면, 넣는 순간 조용히 빈 화면이 됩니다.
 */
export type Evidence =
  /** 배포된 웹이 있을 때. 누르기 전에는 통신하지 않습니다 */
  | { kind: "run"; url: string; note?: string }
  /**
   * 구조도 — 열어 볼 수 없는 것(로그인 뒤, 사내 시스템)일 때.
   * 스크린샷보다 낫습니다. 화면은 예쁜지만 보여주지만 구조는 무엇을 아는지 보여줍니다.
   */
  | {
      kind: "diagram";
      nodes: { k: string; v: string; note?: string }[];
      note?: string;
    }
  /**
   * 코드 한 조각 — 설계가 코드 몇 줄로 드러날 때.
   *
   * **20줄을 넘기지 않습니다.** 길면 저장소를 보라고 하는 편이 낫습니다.
   * 지어낸 코드를 넣지 않습니다 — 저장소에 실제로 있는 것만 옮깁니다.
   */
  | {
      kind: "code";
      lang: string;
      /** 이 코드가 무엇을 말하는지 한 줄 */
      caption: string;
      code: string;
      note?: string;
    };

/**
 * 히어로 장치 (docs/07 §3).
 *
 * 첫 화면은 그 프로젝트에서 **가장 특징적인 것**이어야 합니다.
 * 큰 숫자 + 작은 라벨은 어느 프로젝트에나 맞는 답이라 아무 말도 하지 않습니다.
 * 종류는 쓸 프로젝트가 생길 때 하나씩 늘립니다 — 그리지 못하는 종류를
 * 미리 타입에만 적어 두면 넣는 순간 조용히 빈 화면이 됩니다.
 *
 * `lead` 는 그대로, `em` 은 강조색으로 뒤집힙니다. 합쳐서 28자 안쪽.
 */
export type Hero =
  /** 명제형 — 상식과 어긋나는 한 문장이 있을 때 */
  | { kind: "claim"; lead: string; em: string }
  /** 대비형 — 바꾸기 전후가 극명할 때. 명제 아래 before → after 를 붙입니다 */
  | {
      kind: "contrast";
      lead: string;
      em: string;
      before: { k: string; v: string };
      after: { k: string; v: string };
    }
  /**
   * 수치형 — 숫자 하나가 전부를 설명할 때.
   *
   * **쓸 숫자가 없으면 쓰지 않습니다.** 억지로 고르면 "큰 숫자 + 작은 라벨" 이라는
   * 어느 프로젝트에나 맞고 아무 말도 안 하는 히어로가 됩니다.
   * `lead`·`em` 은 그 숫자가 무엇인지 설명하는 줄입니다.
   */
  | { kind: "number"; value: string; unit: string; lead: string; em: string }
  /**
   * 도해형 — 구조나 흐름 자체가 자랑거리일 때.
   * 단계를 옆으로 늘어놓습니다. 마지막 단계에 `faded` 를 주면
   * "끝났지만 사라지지 않은" 상태를 표현합니다.
   */
  | {
      kind: "flow";
      lead: string;
      em: string;
      steps: { k: string; v: string; note?: string; faded?: boolean }[];
    };

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

/**
 * 바탕화면 아이콘 그림.
 *
 * 모니터 안 바탕화면에 놓이는 아이콘의 종류입니다(docs/06 P8).
 * 상표를 베끼지 않고 형태만 그립니다.
 */
export type IconArtKey =
  | "yut"
  | "library"
  | "bonfire"
  | "dm"
  | "tray"
  | "home"
  | "calendar"
  | "mail"
  | "card"
  | "folder"
  | "doc"
  | "globe"
  | "trash";

export interface Project {
  /** URL 식별자. docs/02 의 projects.slug 와 동일한 제약을 따릅니다. */
  slug: string;
  /**
   * 바탕화면에 아이콘으로 꺼내 놓을지.
   *
   * **실제 저장소만 true 입니다.** 예시로 채워 둔 항목이 바탕화면에 올라가면
   * 방문자는 그것도 실제라고 읽습니다. 새 저장소를 받을 때마다 하나씩 켭니다.
   */
  desktop?: boolean;
  /** 바탕화면 아이콘 그림. desktop 이 true 일 때만 씁니다. */
  icon?: IconArtKey;
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
  /** 사람이 읽는 기간. "2026.07.24 (하루 · 커밋 10)" 처럼 단서가 붙습니다 */
  period: string;
  /**
   * 기계가 읽는 기간 (YYYY-MM-DD).
   *
   * `period` 를 파싱하지 않습니다 — 표기가 조금씩 달라서 정규식이 언젠가 깨집니다.
   * 폰의 "만든 시간" 연표가 이 값으로 막대를 놓습니다(docs/08).
   * 하루 만에 만든 것은 from 과 to 가 같습니다.
   */
  span: { from: string; to: string };
  role: string;
  tags: string[];
  meta: RepoMeta;

  /* ── 상세페이지 (docs/07) ────────────────────────────── */

  /** 그 사이트의 색과 글씨 (docs/07 §5) */
  theme: ProjectTheme;
  /** 히어로 장치. 프로젝트마다 다른 것을 고릅니다 (docs/07 §3) */
  hero: Hero;
  /** 히어로 아래 수치. **다섯 개.** 넷이면 허전하고 여섯이면 안 읽습니다 */
  facts: ProjectFact[];
  evidence: Evidence;
  /** 만든 것. 결정이 아닌 기능은 전부 여기로 */
  built: BuiltItem[];
  /** 갈림길 2~6개. 하나면 대장이 아니고 일곱이면 안 읽습니다 */
  decisions: Decision[];
  /** 다음에 비슷한 걸 만들 때 먼저 던질 질문. 한 단락 */
  learned: string;
  /**
   * 아직 못 한 것.
   * "아쉬운 것"이 아닙니다 — 사과가 아니라 현재 상태 보고입니다.
   */
  limits: string[];
}

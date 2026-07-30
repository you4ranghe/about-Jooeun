import type { Project } from "./types";

/**
 * 프로젝트.
 *
 * ── 2026-07-30, 열두 개에서 하나로 ──
 * 여기 있던 12개는 전부 제가 지어낸 예시였습니다. 스타 96, 커밋 1420 같은
 * 수치까지 그럴듯하게 적혀 있었고, 그대로 배포돼 있었습니다.
 * 채용 담당자가 저장소를 열어 보면 바로 들통나는 거짓말이라 전부 내렸습니다.
 *
 * 지금은 **실제 저장소만** 있습니다. 하나씩 받아 채웁니다.
 * 새로 붙이는 절차는 docs/07 §10 에 있습니다.
 *
 * 지금은 상수지만 관리자 CRUD 를 붙이는 시점에 Supabase 로 이관합니다.
 * 그래서 화면 코드는 이 배열을 직접 import 하지 않고 항상 아래 함수를 거칩니다.
 */
const PROJECTS: Project[] = [
  {
    slug: "yutnori",
    no: "01",
    /** 이 앱이 실제로 쓰는 청록. 아이콘 가운데 방의 색입니다 */
    color: "#19A697",
    desktop: true,
    icon: "yut",
    title: "윷놀이 온라인",
    summary:
      "브라우저 네 개가 같은 판을 봅니다. 그런데 그 판을 지키는 서버 프로그램은 한 대도 없습니다. 윷의 난수도 승패 판정도 Postgres 함수가 냅니다.",
    repo: "you4ranghe/yutnori",
    live: "https://yutnori-rho.vercel.app",
    year: "2026",
    period: "2026.07.22 — 07.23",
    role: "기획 · 개발 · 배포 (단독)",
    tags: ["바닐라 JS", "Supabase", "Postgres", "Realtime", "PWA"],
    meta: {
      language: "HTML",
      stars: 0,
      forks: 0,
      commits: 27,
      lastCommit: "2026-07-23",
      license: "없음",
    },

    /* 이 사이트의 옷 — 앱 아이콘의 남색 바탕과 가운데 방의 청록.
       게임이라 화면이 어둡고, 표제는 곧은 고딕입니다. */
    theme: {
      mode: "dark",
      bg: "#11142E",
      surface: "#1A1E42",
      sunken: "#0C0F26",
      fg: "#E8EAF6",
      mid: "#A0A5CC",
      dim: "#6B7099",
      line: "#262B58",
      accent: "#00C2A8",
      onAccent: "#04231F",
      drop: "#B3737F",
      display: "gothic",
      radius: "12px",
    },

    hero: {
      kind: "claim",
      lead: "서버를 두지 않았습니다.",
      em: "데이터베이스가 서버입니다.",
    },

    /* 이 프로젝트에서 자랑할 것은 규모가 아니라 "없는 것"입니다.
       그래서 0 이 셋입니다. 스타 수는 넣지 않습니다 (docs/07 §6). */
    facts: [
      { label: "LANGUAGE", value: "HTML", note: "바닐라 JS" },
      { label: "소스 파일", value: "3", note: "개" },
      { label: "빌드 단계", value: "0", note: "번들러 없음" },
      { label: "월 운영비", value: "0", note: "원" },
      { label: "만든 기간", value: "2", note: "일" },
    ],

    evidence: {
      kind: "run",
      url: "https://yutnori-rho.vercel.app",
      note: "소리가 납니다. 배경음악은 음원 파일이 아니라 브라우저가 그 자리에서 연주하는 것입니다.",
    },

    built: [
      {
        title: "빈 팀은 컴퓨터가",
        body: "혼자 방을 만들어도 바로 시작됩니다. 기다리는 화면이 없습니다.",
      },
      {
        title: "친구가 오면 알림",
        body: "컴퓨터와 놀던 중 누가 들어오면 “함께 놀까요?”가 뜨고, 한 번 눌러 대기방으로 돌아갑니다.",
      },
      {
        title: "초대 코드 없음",
        body: "로비에 열린 방이 그대로 보이고 누르면 들어갑니다. 이미 시작된 방은 관전으로 들어갑니다.",
      },
      {
        title: "20초 자동 진행",
        body: "자리를 비워도 판이 멈추지 않습니다. 32초가 지나면 방장 화면에서 차례를 넘깁니다.",
      },
      {
        title: "중간에 나가도",
        body: "나간 사람 팀이 비면 상대 승, 한 명이라도 남으면 2:1로 계속합니다.",
      },
      {
        title: "새로고침해도 그 방",
        body: "같은 브라우저로 다시 열면 하던 방으로 돌아갑니다. 관전 중이었으면 관전으로.",
      },
    ],

    decisions: [
      {
        ask: "윷의 난수를 누가 만드는가",
        dropped: {
          title: "브라우저에서 Math.random()",
          why: "개발자 도구를 열면 원하는 끗수를 만들 수 있습니다. 판정을 믿을 수 없으면 실시간이든 아니든 게임이 아닙니다.",
        },
        taken: {
          title: "DB 함수 throw_sticks()",
          why: "난수를 서버 쪽에서 만들고 클라이언트는 결과만 받습니다. 대신 “던지는 맛”이 사라지므로, 결과를 먼저 정하고 그 결과로 끝나는 애니메이션을 재생하는 쪽으로 연출을 뒤집었습니다.",
        },
      },
      {
        ask: "그 서버를 무엇으로 세울까",
        dropped: {
          title: "Node · Spring 상시 서버",
          why: "익숙하지만 계속 떠 있어야 하고, 무료 플랜에서는 잠들거나 돈이 듭니다. 친구들과 하는 놀이에 월 요금을 붙이고 싶지 않았습니다.",
        },
        taken: {
          title: "Postgres 함수 + Realtime",
          why: "방 만들기·참가·시작·던지기·퇴장을 전부 DB 함수로 두고, 상태 변화는 Realtime 구독으로 흘려보냅니다. 내 코드가 도는 서버는 한 대도 없습니다.",
        },
      },
      {
        ask: "배경음악을 어떻게 넣을까",
        dropped: {
          title: "mp3 파일 재생",
          why: "저작권을 확인해야 하고, 용량이 늘고, 방문자마다 대역폭을 씁니다. 무료로 유지한다는 전제와 정면으로 부딪칩니다.",
        },
        taken: {
          title: "Web Audio 실시간 연주",
          why: "한국 전통 5음계로 10곡을 브라우저가 직접 연주합니다. 한 바퀴 약 11분. 내려받을 파일도, 저작권도, 대역폭도 0입니다. 빠르기와 화음 진행은 코드 안 표를 고치면 바로 바뀝니다.",
        },
      },
      {
        ask: "“윷이야” 소리를 어떻게 낼까",
        dropped: {
          title: "직접 녹음한 음성 파일",
          why: "여섯 마디를 위해 녹음·편집·호스팅이 붙습니다. 목소리를 바꾸고 싶어지면 그 일을 다시 해야 합니다.",
        },
        taken: {
          title: "기기에 있는 한국어 TTS",
          why: "도·개·걸·윷이야·모야·빽도를 기기가 말합니다. 음성 파일 0개. 한국어 음성이 없는 기기에서는 조용히 생략하고 효과음만 남깁니다 — 없다고 화면이 깨지지 않습니다.",
        },
      },
      {
        ask: "가입 문턱을 어디에 둘까",
        dropped: {
          title: "이메일 인증 후 로그인",
          why: "놀자고 부른 친구에게 메일함을 열게 만드는 순간 절반은 안 들어옵니다.",
        },
        taken: {
          title: "아이디 + 비밀번호, 게스트 허용",
          why: "아이디를 내부적으로 아이디@yutnori.app 으로 바꿔 저장하고 실제 메일은 오가지 않습니다. 가입 없이 게스트로도 놀 수 있고, 나중에 가입하면 쓰던 이름과 사진이 새 계정으로 옮겨집니다.",
        },
      },
      {
        ask: "다 놀고 난 데이터를 어떻게 할까",
        dropped: {
          title: "전적으로 계속 쌓아두기",
          why: "기록이 남으면 그럴듯하지만, 무료 용량을 갉아먹고 남의 대화를 계속 들고 있게 됩니다.",
        },
        taken: {
          title: "1시간 무진행이면 자동 삭제",
          why: "던지기·이동·입퇴장·채팅이 있으면 시간이 초기화되고, 아무 일도 없으면 방과 채팅이 함께 사라집니다. pg_cron 이 10분마다 돌고, 권한이 없는 환경에서는 누군가 로비를 열 때 대신 청소합니다.",
        },
      },
    ],

    learned:
      "서버가 없어도 “권위 있는 한 곳”은 반드시 있어야 한다는 걸 확인했습니다. 누가 진실을 갖는지 먼저 정하고 나니 나머지는 그 자리를 무엇으로 채우느냐의 문제였고, 이번에는 그 자리를 데이터베이스 함수가 맡을 수 있었습니다. 다음에 비슷한 걸 만든다면 이 질문부터 던질 겁니다.",

    limits: [
      "진행 중인 게임에는 참가할 수 없고 관전만 됩니다",
      "방 목록과 접속자가 모두에게 보입니다. 완전한 비공개 방이 없습니다",
      "실제 메일을 쓰지 않으므로 비밀번호를 찾을 방법이 없습니다",
      "나가기 버튼 없이 창을 닫으면 이탈이 즉시 반영되지 않습니다",
    ],
  },

  {
    slug: "interpaper",
    no: "02",
    /** 이 사이트의 다크모드 강조색(모래). 밝은 쪽 차콜은 어두운 바탕에서 안 보입니다 */
    color: "#D8C8AB",
    desktop: true,
    icon: "library",
    title: "인터페이퍼 — 바우치 서재",
    summary:
      "아버지가 쓴 책 여섯 권을 위한 서재입니다. Spring Boot 로 70%까지 만들었지만 서버를 껐다 켜면 댓글이 사라졌습니다. 상시 서버가 필요 없는 구조로 다시 지었습니다.",
    repo: "you4ranghe/interPapper",
    live: "https://inter-papper.vercel.app",
    year: "2026",
    period: "2026.05.22 — 07.06",
    role: "기획 · 개발 · 배포 (단독)",
    tags: ["Next.js 16", "React 19", "TypeScript", "Supabase", "Tailwind 4"],
    meta: {
      language: "TypeScript",
      stars: 0,
      forks: 0,
      commits: 19,
      lastCommit: "2026-07-06",
      license: "없음",
    },

    /* 이 사이트의 옷 — 그 사이트의 디자인 규칙에서 그대로 가져왔습니다.
       따뜻한 회백 바탕, 흰 카드, 실선 한 올 테두리, 강조색은 차콜 하나.
       책을 다루는 사이트라 표제는 명조입니다. 윷놀이와 정반대 방향입니다. */
    theme: {
      mode: "light",
      bg: "#F7F4EF",
      surface: "#FFFFFF",
      sunken: "#F1EDE5",
      fg: "#26231F",
      mid: "#5C554C",
      dim: "#8C8377",
      line: "#E4DFD7",
      accent: "#4A443E",
      onAccent: "#FBF9F5",
      drop: "#A2564A",
      display: "batang",
      radius: "10px",
    },

    /* 대비형 — 이 저장소에는 갈아엎기 전과 후가 **둘 다 남아 있습니다.**
       루트에 Gradle·Java, web/ 에 Next.js. 그게 이 프로젝트의 첫 문장입니다. */
    hero: {
      kind: "contrast",
      lead: "70%까지 만든 걸",
      em: "갈아엎었습니다.",
      before: { k: "처음", v: "Spring Boot · Thymeleaf · H2 인메모리" },
      after: { k: "지금", v: "Next.js 16 · Supabase · Vercel" },
    },

    facts: [
      { label: "FRONTEND", value: "Next.js 16", note: "App Router" },
      { label: "수록된 책", value: "6", note: "권" },
      { label: "댓글 깊이", value: "무제한", note: "자기참조" },
      { label: "상시 서버", value: "0", note: "대" },
      { label: "갈아엎은 지점", value: "70", note: "%" },
    ],

    evidence: {
      kind: "run",
      url: "https://inter-papper.vercel.app",
      note: "첫 화면은 영상이 배경으로 깔립니다. 서재로 들어가면 책 표지가 가운데만 또렷한 Coverflow 로 늘어섭니다.",
    },

    built: [
      {
        title: "Coverflow 서재",
        body: "표지 다섯 권이 한 화면에 서고, 가운데만 또렷하며 양옆은 0.8·0.6 배로 흐려집니다. 끝에서 처음으로 이어져 계속 돌아갑니다.",
      },
      {
        title: "책을 고르면 아래로",
        body: "표지를 누르면 그 책의 소개와 지은이의 말이 있는 자리로 화면이 부드럽게 내려갑니다.",
      },
      {
        title: "깊이 제한 없는 댓글",
        body: "답글의 답글의 답글까지 들어갑니다. 댓글이 자기 자신을 부모로 갖는 구조라 단계를 미리 정해 둘 필요가 없습니다.",
      },
      {
        title: "관리자 화면",
        body: "책·회원·댓글·알림을 한곳에서 봅니다. 로그인한 관리자만 들어갑니다.",
      },
      {
        title: "시력 보호 모드",
        body: "밝은 회백과 어두운 모래빛 두 벌입니다. 오래 읽는 사람을 위한 것이라 흰 화면을 그냥 반전시키지 않고 색을 따로 골랐습니다.",
      },
      {
        title: "이메일 · 소셜 로그인",
        body: "가입·로그인·비밀번호 재설정과 소셜 로그인 콜백까지 붙였습니다.",
      },
    ],

    decisions: [
      {
        ask: "70% 온 것을 계속 갈까, 다시 지을까",
        dropped: {
          title: "Spring Boot 로 마저 완성",
          why: "동작은 했지만 H2 인메모리라 서버를 재시작할 때마다 책도 댓글도 사라졌습니다. 남기려면 DB 를 따로 세우고, 그 DB 와 서버를 계속 켜 둬야 합니다. 아버지 책 여섯 권을 보여주는 서재에 붙일 운영 부담이 아니었습니다.",
        },
        taken: {
          title: "Next.js + Supabase 로 다시",
          why: "Vercel 이 화면을 맡고 Supabase 가 데이터와 로그인을 맡습니다. 켜 둘 서버가 없어지고, 껐다 켜도 댓글이 남습니다. 갈아엎은 흔적은 지우지 않고 저장소 루트에 그대로 뒀습니다.",
        },
      },
      {
        ask: "댓글을 몇 단까지 받을까",
        dropped: {
          title: "2단까지만 (댓글 + 답글)",
          why: "화면을 짜기는 쉽지만, 대화가 길어지면 누구에게 하는 말인지 알 수 없어집니다.",
        },
        taken: {
          title: "자기참조로 깊이 제한 없이",
          why: "댓글이 자기 자신을 부모로 갖습니다. 대신 순진하게 읽으면 한 단마다 질의가 하나씩 늘어(N+1) 목록이 느려지므로 fetch join 으로 한 번에 가져오고, 엔티티를 그대로 내보내면 부모↔자식이 서로를 물어 순환 참조가 나므로 DTO 로 바꿔 내보냅니다.",
        },
      },
      {
        ask: "강조색을 몇 개 쓸까",
        dropped: {
          title: "금색 + 파랑",
          why: "책과 고전이라는 소재에 금색이 어울릴 것 같았는데, 표지마다 색이 제각각인 화면에서는 강조색이 하나 더 늘어난 것에 지나지 않았습니다.",
        },
        taken: {
          title: "따뜻한 차콜 하나만",
          why: "링크·버튼·포커스·활성 탭이 전부 같은 색입니다. 색이 하나뿐이라 “색이 칠해진 곳 = 누를 수 있는 곳”이 됩니다. 화면의 색은 책 표지가 냅니다.",
        },
      },
      {
        ask: "어두운 테마를 어떻게 만들까",
        dropped: {
          title: "클래스를 붙여 색을 두 벌 관리",
          why: "`.dark` 아래에 색을 다시 적는 방식은 값이 두 곳에 흩어집니다. 한쪽만 고치는 실수가 반드시 납니다.",
        },
        taken: {
          title: "CSS `light-dark()` + `color-scheme`",
          why: "한 줄에 밝을 때와 어두울 때 값을 같이 적습니다. 색이 한곳에 모여 있어 빠뜨릴 수가 없습니다.",
        },
      },
      {
        ask: "테마를 언제 적용할까",
        dropped: {
          title: "리액트가 뜬 뒤에 적용",
          why: "화면이 한 번 그려진 다음 테마가 바뀝니다. 어두운 테마를 쓰는 사람은 접속할 때마다 흰 화면이 한 번 번쩍합니다. 눈을 보호하려고 만든 기능이 정확히 반대로 작동합니다.",
        },
        taken: {
          title: "첫 페인트 전에 인라인 스크립트로",
          why: "`layout.tsx` 안의 작은 스크립트가 그리기 전에 `html` 에 테마를 붙입니다. 주소의 `?theme=` → 저장된 설정 → 운영체제 설정 순으로 봅니다.",
        },
      },
    ],

    learned:
      "“여기까지 왔으니 아깝다”는 이유로 계속 가면 남은 30%가 아니라 그 뒤의 운영을 떠안게 된다는 걸 배웠습니다. 70%에서 멈추고 다시 지은 것이 결과적으로 빨랐습니다. 다음에는 만들기 전에 “이걸 누가 계속 켜 두는가”를 먼저 물어보려고 합니다.",

    limits: [
      "갈아엎기 전 Spring Boot 코드가 저장소 루트에 그대로 남아 있습니다. 기록으로 남긴 것이지만, 처음 여는 사람에게는 어느 쪽이 진짜인지 헷갈립니다",
      "책 표지 이미지 업로드가 관리자 화면에 붙어 있지 않습니다",
      "댓글 신고·숨김 같은 관리 기능이 없습니다",
      "테스트 코드가 없습니다",
    ],
  },

  {
    slug: "todaktodak",
    no: "03",
    /** 실제 화면에서 뽑은 불빛색 */
    color: "#FFAA5A",
    desktop: true,
    icon: "bonfire",
    title: "불멍 감정 소각장",
    summary:
      "쓴 감정을 불에 태워 없애는 화면입니다. 그런데 태워도 실제로는 지우지 않습니다 — 다음에 같은 마음이 왔을 때 그 사람이 예전에 뭐라고 썼는지 알아야 제대로 위로할 수 있기 때문입니다.",
    repo: "you4ranghe/todaktodak",
    live: "https://todaktodak.vercel.app",
    year: "2026",
    period: "2026.05.21 (하루)",
    role: "기획 · 개발 (단독)",
    tags: ["Spring Boot 3.4", "Java 21", "JPA", "H2", "Spring Security"],
    meta: {
      language: "Java",
      stars: 0,
      forks: 0,
      commits: 4,
      lastCommit: "2026-05-21",
      license: "없음",
    },

    /* 이 사이트의 옷 — 실제 화면에서 뽑은 값입니다.
       바탕 #04050A(거의 검정), 크림 #FFF4E6, 불빛 rgba(255,170,90).
       표제는 그 사이트가 쓰는 Nanum Myeongjo. 불 앞에 앉은 밤 화면입니다. */
    theme: {
      mode: "dark",
      bg: "#04050A",
      surface: "#12100E",
      sunken: "#0A0908",
      fg: "#FFF4E6",
      mid: "#C8B7A3",
      dim: "#8A7C6E",
      line: "#2A2320",
      accent: "#FFAA5A",
      onAccent: "#2A1405",
      /** 재 — 소각장에서 버려진 길의 색으로 이만한 게 없습니다 */
      drop: "#8A6F63",
      display: "myeongjo",
      radius: "14px",
    },

    /* 도해형 — 이 프로젝트의 전부가 이 세 칸입니다.
       마지막 칸이 흐린 점선인 것이 핵심입니다. 태웠는데 남아 있습니다. */
    hero: {
      kind: "flow",
      lead: "태웠습니다.",
      em: "지우지는 않았습니다.",
      steps: [
        { k: "POST /api/trash", v: "적재", note: "status = ACCUMULATED" },
        {
          k: "PATCH /api/trash/{id}/burn",
          v: "소각 연출",
          note: "화면에서 사라짐",
        },
        {
          k: "status = BURNED",
          v: "남아 있음",
          note: "사용자에게는 안 보이고 AI 만 참조",
          faded: true,
        },
      ],
    },

    facts: [
      { label: "BACKEND", value: "Spring Boot", note: "3.4 · Java 21" },
      { label: "물리 삭제", value: "0", note: "건" },
      { label: "감정 원문 로그", value: "0", note: "줄" },
      { label: "진행 단계", value: "2", note: "/ 5" },
      { label: "만든 기간", value: "1", note: "일" },
    ],

    evidence: {
      kind: "run",
      url: "https://todaktodak.vercel.app",
      note: "배포된 것은 화면까지입니다. vercel.json 이 정적 폴더만 올리도록 돼 있어서, 로그인과 소각 API 는 로컬 Spring Boot 에서만 돕니다.",
    },

    built: [
      {
        title: "소각 = 소프트 삭제",
        body: "태우면 status 가 BURNED 로 바뀔 뿐 행은 남습니다. 사용자 화면에서는 사라집니다.",
      },
      {
        title: "로그인 · 회원가입",
        body: "Spring Security 로 붙였습니다. 쓴 글이 그 사람에게 귀속돼야 다음 위로가 이어집니다.",
      },
      {
        title: "감정 투척 API 세 개",
        body: "던지기(POST) · 아직 안 태운 것 보기(GET) · 태우기(PATCH). 그게 전부입니다.",
      },
      {
        title: "카테고리 직접 선택",
        body: "AI 가 알아서 분류하지 않습니다. 사용자가 고른 값이라 조회가 단순해집니다.",
      },
      {
        title: "H2 파일 DB",
        body: "인메모리가 아니라 파일입니다. 재시작해도 적재분이 남습니다.",
      },
      {
        title: "POV 진입 화면",
        body: "불 앞에 앉은 시점으로 들어갑니다. 영상 합성은 아직이고 지금은 CSS 로 흉내 낸 상태입니다.",
      },
    ],

    decisions: [
      {
        ask: "태운 글을 정말 지울까",
        dropped: {
          title: "행을 지우는 물리 삭제",
          why: "“태웠다”는 말과 시스템이 하는 일이 정확히 일치합니다. 대신 그 사람이 지난달에 무엇 때문에 힘들었는지 아무도 모르게 되어, 다음 위로가 매번 처음 만난 사람의 말이 됩니다.",
        },
        taken: {
          title: "status 를 BURNED 로 (소프트 삭제)",
          why: "사용자 화면에서는 사라지지만 행은 남습니다. 같은 카테고리의 과거 글을 AI 가 참조해 “또 그 일이군요” 라고 말할 수 있게 됩니다. 대신 태웠다는 말과 실제가 어긋나므로, 이건 안내에 적어야 할 빚입니다.",
        },
      },
      {
        ask: "감정을 누가 분류할까",
        dropped: {
          title: "AI 가 글을 읽고 자동 분류",
          why: "쓰는 사람은 편하지만, 분류가 틀리면 엉뚱한 과거 글을 끌어와 위로합니다. 조회할 때도 분류 결과를 먼저 기다려야 합니다.",
        },
        taken: {
          title: "사용자가 직접 고르기",
          why: "고르는 손이 한 번 더 가지만 값이 확실합니다. 같은 카테고리 과거 글을 찾는 질의가 단순한 조건 하나로 끝납니다.",
        },
      },
      {
        ask: "로그인을 받을까",
        dropped: {
          title: "익명으로 바로 쓰기",
          why: "감정을 쏟아내는 곳에 가입 절차는 문턱입니다. 그런데 글이 누구 것인지 모르면 다음에 와도 이어지지 않습니다.",
        },
        taken: {
          title: "로그인 필수",
          why: "이 서비스의 값어치가 “예전에 쓴 글을 기억해 주는 것”에 있어서, 귀속을 포기하면 남는 게 소각 연출뿐입니다. 문턱을 받고 기억을 택했습니다.",
        },
      },
      {
        ask: "디버깅을 위해 감정 원문을 로그에 남길까",
        dropped: {
          title: "content 를 로그에 찍기",
          why: "장애가 났을 때 무슨 값이 들어왔는지 바로 보입니다. 그런데 그 값이 남의 가장 사적인 문장입니다. 로그는 파일에 남고 복사되고 오래 삽니다.",
        },
        taken: {
          title: "원문은 어떤 경우에도 로그에 남기지 않음",
          why: "사람이 안 보는 곳에 남기는 것도 남기는 것입니다. 디버깅은 식별자와 상태 값만으로 합니다.",
        },
      },
      {
        ask: "설치돼 있던 JDK 로 빌드할까",
        dropped: {
          title: "이미 깔린 JDK 25 사용",
          why: "새로 설치할 게 없어 편합니다. 그런데 Gradle 8.10 이 JDK 25 가 만든 클래스(v69)를 못 읽어 빌드 스크립트 파싱부터 실패했습니다. Spring Boot 플러그인은 17 이상을 요구하는데 시스템 기본은 11 이었습니다.",
        },
        taken: {
          title: "JDK 21 을 따로 설치해 고정",
          why: "Gradle 툴체인을 21 로 못 박고 실행 스크립트에서 JAVA_HOME 을 지정합니다. 어떤 기계에서 받아도 같은 자바로 빌드됩니다.",
        },
      },
    ],

    learned:
      "“지운다”가 사용자에게는 약속이고 시스템에는 상태 변경일 뿐이라는 걸 알았습니다. 둘이 어긋나도 기능은 잘 돌아가기 때문에 더 위험합니다. 다음에 삭제를 다룰 때는 코드보다 먼저 안내 문구를 어떻게 쓸지 정하려고 합니다.",

    limits: [
      "AI 위로가 아직 Mock 입니다. Claude API 연동은 다음 단계입니다",
      "불멍 영상 합성이 아직 없습니다. 지금 보이는 불은 CSS 로 흉내 낸 것입니다",
      "배포된 것은 화면까지입니다. 로그인과 소각은 로컬에서만 동작합니다",
      "태웠다고 말하지만 데이터는 남습니다. 이 사실이 화면 어디에도 적혀 있지 않습니다",
      "통계 · 반응형 · 엣지케이스는 손대지 않았습니다",
    ],
  },

  {
    slug: "momsup",
    no: "04",
    /** 실제 로그인 화면에서 뽑은 분홍 */
    color: "#EC4899",
    desktop: true,
    icon: "dm",
    title: "MomsUp — 협찬 관리 에이전트",
    summary:
      "인스타그램 인플루언서가 받는 협찬 DM 을 붙여넣으면, 무엇을 요구하는지 뽑아 정리하고 광고 문안 초안까지 만들어 줍니다. 남의 DM 을 다루는 서비스라 전부 로그인 뒤에서 돕니다.",
    repo: "you4ranghe/chaechae_daddy",
    live: "https://chaechae-daddy.vercel.app",
    year: "2026",
    period: "2026.03.25 — 05.27",
    role: "기획 · 개발 · 배포 (단독)",
    tags: ["Next.js 16", "TypeScript", "Supabase", "Claude API", "Tailwind 4"],
    meta: {
      language: "TypeScript",
      stars: 0,
      forks: 0,
      commits: 9,
      lastCommit: "2026-05-27",
      license: "없음",
    },

    /* 이 사이트의 옷 — 로그인 화면에서 뽑은 분홍 계열 그대로입니다.
       #EC4899 · #F472B6 · #F9A8D4 · #FB7185. 엄마 인플루언서가 쓰는 제품이라
       밝고 둥급니다. 모서리를 16px 로 둔 것도 그 인상입니다. */
    theme: {
      mode: "light",
      bg: "#FFF6FA",
      surface: "#FFFFFF",
      sunken: "#FDEBF3",
      /** 검정 대신 자줏빛 먹 — 분홍 옆에서 검정은 차갑게 뜹니다 */
      fg: "#3B2233",
      mid: "#6E5265",
      dim: "#9E8494",
      line: "#F7DCE9",
      accent: "#EC4899",
      onAccent: "#FFFFFF",
      drop: "#8A7686",
      display: "gothic",
      radius: "16px",
    },

    hero: {
      kind: "claim",
      lead: "협찬 DM 을 붙여넣으면",
      em: "광고 문안까지 나옵니다.",
    },

    facts: [
      { label: "FRONTEND", value: "Next.js 16", note: "App Router" },
      { label: "AI", value: "Claude", note: "Opus · Sonnet" },
      { label: "브라우저에 노출된 AI 키", value: "0", note: "개" },
      { label: "손으로 하던 단계", value: "3", note: "→ 붙여넣기 한 번" },
      { label: "접근 제어", value: "RLS", note: "Postgres" },
    ],

    /* 로그인 벽 뒤라 "눌러서 실행"이 로그인 화면만 보여줍니다.
       그건 증거가 아니라 문 앞 사진이라, 안에서 무슨 일이 도는지를 적었습니다. */
    evidence: {
      kind: "diagram",
      nodes: [
        {
          k: "INPUT",
          v: "받은 협찬 DM 을 그대로 붙여넣기",
          note: "형식을 맞출 필요가 없습니다. 브랜드마다 말투도 길이도 다릅니다.",
        },
        {
          k: "ANALYZE",
          v: "무엇을 요구하는지 뽑아냄",
          note: "Claude 가 읽고 조건을 끄집어냅니다.",
        },
        {
          k: "ORGANIZE",
          v: "요구사항 목록으로 정리",
          note: "사람이 확인하고 고칠 수 있는 형태로 남습니다.",
        },
        {
          k: "GENERATE",
          v: "광고 콘텐츠 초안 생성",
          note: "정리된 조건을 근거로 씁니다. 초안이지 완성본이 아닙니다.",
        },
        {
          k: "STORE",
          v: "내 협찬 목록에 저장",
          note: "Supabase. RLS 로 본인 것만 읽고 씁니다.",
        },
      ],
      note: "AI 호출은 전부 서버 라우트에서 일어납니다. 브라우저는 Claude 를 직접 부르지 않습니다.",
    },

    built: [
      {
        title: "협찬 대시보드",
        body: "받은 협찬을 목록으로 봅니다. 하나를 열면 정리된 요구사항과 생성된 문안이 같이 있습니다.",
      },
      {
        title: "사용량 화면",
        body: "AI 호출은 부를 때마다 돈이 나갑니다. 얼마나 썼는지 사용자가 볼 수 있는 자리를 따로 뒀습니다.",
      },
      {
        title: "로그인 · 비밀번호 재설정",
        body: "Supabase Auth. 랜딩만 공개이고 나머지는 전부 로그인 뒤입니다.",
      },
      {
        title: "에이전트 API",
        body: "분석 · 정리 · 생성이 각각 서버 라우트입니다. 키가 서버에만 있어야 해서 브라우저에서 부르지 않습니다.",
      },
    ],

    decisions: [
      {
        ask: "Claude 를 어디서 부를까",
        dropped: {
          title: "브라우저에서 직접 호출",
          why: "서버 라우트를 만들 필요가 없어 빠릅니다. 그런데 키를 브라우저로 내보내야 하고, 그 순간 개발자 도구를 연 누구나 내 계정으로 호출할 수 있습니다. 요금은 저에게 청구됩니다.",
        },
        taken: {
          title: "서버 라우트에서만",
          why: "Supabase 값만 NEXT_PUBLIC_ 으로 두고 ANTHROPIC_API_KEY 는 서버 전용으로 뒀습니다. 브라우저 번들에 키가 들어갈 방법이 없습니다.",
        },
      },
      {
        ask: "남의 협찬 DM 을 어떻게 지킬까",
        dropped: {
          title: "애플리케이션 코드에서 사용자 확인",
          why: "화면 코드에서 걸러도 Supabase 는 REST 로 직접 부를 수 있습니다. 익명 키가 브라우저에 있는 구조라 코드로 막는 건 문 앞에 안내판을 세우는 것에 가깝습니다.",
        },
        taken: {
          title: "Postgres RLS 로 행 단위 차단",
          why: "본인 행이 아니면 조회 자체가 0건입니다. 화면을 어떻게 짜든, 어떤 경로로 부르든 같습니다.",
        },
      },
      {
        ask: "모델을 하나로 통일할까",
        dropped: {
          title: "전부 가장 좋은 모델로",
          why: "품질은 가장 좋습니다. 대신 단순한 정리 작업에도 같은 비용과 시간이 듭니다. 개인이 내는 SaaS 에서 그 차이는 그대로 요금이 됩니다.",
        },
        taken: {
          title: "Opus 와 Sonnet 을 나눠 쓰기",
          why: "판단이 필요한 자리와 형식을 맞추는 자리를 나눴습니다. 한 요청 안에서도 단계마다 부르는 모델이 다릅니다.",
        },
      },
      {
        ask: "쓴 만큼을 사용자에게 보여줄까",
        dropped: {
          title: "안 보여주고 한도만 걸기",
          why: "화면이 단순해집니다. 그런데 갑자기 막히면 사용자는 고장인지 한도인지 알 수 없습니다.",
        },
        taken: {
          title: "사용량 화면을 따로 두기",
          why: "얼마나 썼는지 언제든 볼 수 있습니다. 뒤에서 도는 비용을 사용자가 볼 수 있게 두는 편이 정직하고, 문의도 줄어듭니다.",
        },
      },
    ],

    learned:
      "AI 를 쓰는 서비스에서 새로 배운 것은 모델 사용법이 아니라 “호출 하나가 돈”이라는 감각이었습니다. 어디서 부르는지(키), 얼마나 부르는지(비용), 누가 부를 수 있는지(권한)를 먼저 정해 두지 않으면 기능이 늘어날 때마다 세 가지가 같이 새어 나갑니다.",

    limits: [
      "랜딩을 빼면 전부 로그인 뒤라 방문자가 동작을 확인할 방법이 없습니다",
      "생성된 문안의 품질을 재는 기준이 없습니다. 좋아 보이는지로만 판단하고 있습니다",
      "인스타그램과 연동되지 않습니다. DM 을 사람이 복사해 붙여넣어야 합니다",
      "테스트 코드가 없습니다",
    ],
  },
];

/**
 * 데이터 접근 함수.
 *
 * 화면 코드는 PROJECTS 배열을 직접 쓰지 않고 반드시 아래를 거칩니다.
 * Supabase 로 이관할 때 이 함수 본문만 바꾸면 화면은 손대지 않습니다(docs/03 §5).
 * 그때 시그니처가 Promise 로 바뀔 것을 대비해 지금부터 async 로 둡니다.
 */
export async function getPublishedProjects(): Promise<Project[]> {
  return PROJECTS;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return PROJECTS.find((p) => p.slug === slug) ?? null;
}

export async function getProjectSlugs(): Promise<string[]> {
  return PROJECTS.map((p) => p.slug);
}

/**
 * 바탕화면에 아이콘으로 꺼내 놓을 프로젝트.
 *
 * 실제 저장소만 나옵니다. 저장소를 하나 더 받으면 그 항목에 `desktop: true` 를
 * 켜는 것으로 끝이고, 화면 코드는 건드리지 않습니다(docs/06 P8).
 */
export async function getDesktopProjects(): Promise<Project[]> {
  const list = await getPublishedProjects();
  return list.filter((p) => p.desktop);
}

/** 목록 위에 붙는 요약 수치. */
export async function getProjectStats() {
  const list = await getPublishedProjects();
  const languages = new Set(list.map((p) => p.meta.language));
  return {
    count: list.length,
    deployed: list.filter((p) => p.live !== "").length,
    languages: [...languages],
  };
}

/** 필터 칩에 쓸 태그 목록. 등장 횟수 순으로 정렬합니다. */
export async function getTagsByFrequency(limit = 7): Promise<string[]> {
  const list = await getPublishedProjects();
  const tally = new Map<string, number>();
  for (const project of list) {
    for (const tag of project.tags) {
      tally.set(tag, (tally.get(tag) ?? 0) + 1);
    }
  }
  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

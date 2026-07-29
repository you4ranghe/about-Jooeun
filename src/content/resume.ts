import type { ResumeItem } from "./types";

/**
 * 방에 놓인 사물 12개 = 이력서 12항목.
 *
 * ⚠️ 아래 내용은 전부 예시입니다. 실명·회사명·자격증·연도를 실제 이력으로 바꾸세요.
 *    바꿔야 하는 곳에는 TODO 를 달아 뒀습니다.
 *
 * 이 파일에는 **글만** 있습니다. 방 어디에 놓이는지는 content/layout.ts 의 SPOTS 가 정합니다.
 * 둘을 갈라 둔 이유: 방을 다시 꾸밀 때 이력서 문장을 건드리지 않기 위해서입니다.
 */
export const RESUME: ResumeItem[] = [
  {
    id: "profile",
    art: "frame",
    tip: "액자 · 저는요",
    category: "PROFILE · 자기소개",
    short: "자기소개",
    title: "you4ranghe", // TODO: 실명 또는 활동명
    lead: "주문과 정산처럼 틀리면 돈이 어긋나는 쪽을 만드는 4년차 백엔드 개발자입니다.",
    rows: [
      { label: "이름", value: "홍길동", note: "TODO: 실명을 넣으세요" },
      { label: "경력", value: "4년 2개월", note: "2022.03 —" },
      { label: "위치", value: "서울", note: "원격 · 하이브리드 모두 가능" },
      { label: "상태", value: "이직 준비 중", note: "7월 말부터 면접 가능" },
    ],
    body: [
      "Java와 Spring으로 서버를 만듭니다. 이 방에 놓인 물건들이 각각 제 이야기 하나씩이고, 책상 위 모니터 안에 제가 만든 것 12개가 들어 있습니다.",
      "새 기능을 넣을 때 제일 먼저 확인하는 건 <strong>롤백 경로</strong>입니다. 되돌릴 방법이 없으면 아직 배포할 준비가 안 된 겁니다.",
    ],
    links: [
      { href: "mailto:you4ranghe@gmail.com", label: "이메일 보내기" },
      { href: "https://github.com/you4ranghe", label: "GitHub ↗", ghost: true },
    ],
  },
  {
    id: "career",
    art: "coins",
    tip: "쌓아둔 동전 · 경력",
    category: "EXPERIENCE · 경력",
    short: "경력",
    title: "쌓아온 4년",
    lead: "커머스 도메인에서 주문·결제·정산을 맡았습니다.",
    rows: [
      // TODO: 실제 회사명과 기간으로 교체
      {
        label: "2024 —",
        value: "OO커머스 · 백엔드 개발자",
        note: "주문·결제 도메인. 3인 팀. 일 거래 12만 건 규모",
      },
      {
        label: "2022 —",
        value: "OO테크 · 백엔드 개발자",
        note: "정산 배치, 사내 공통 라이브러리, 게이트웨이 구축",
      },
      { label: "2021", value: "국비 교육 수료", note: "Java 백엔드 과정 6개월" },
    ],
    body: [
      "정산 배치를 300만 건 12분으로 줄였고, 선착순 쿠폰의 초과 발급 사고를 잡았습니다. 사내 서비스 6곳이 쓰는 인증 라이브러리를 만들었습니다.",
      "숫자로 말할 수 있는 것만 적었습니다. 자세한 내용은 모니터 안 프로젝트 갤러리에 있습니다.",
    ],
  },
  {
    id: "skills",
    art: "rack",
    tip: "서버 랙 · 기술 스택",
    category: "SKILLS · 기술",
    short: "기술 스택",
    title: "쓰는 것들",
    lead: "깊이가 다른 걸 구분해서 적었습니다. 면접에서 곤란해지지 않으려고요.",
    chips: [
      { name: "Java 17", hot: true },
      { name: "Spring Boot 3", hot: true },
      { name: "JPA / Hibernate", hot: true },
      { name: "MySQL", hot: true },
      { name: "Kafka" },
      { name: "Redis" },
      { name: "Spring Batch" },
      { name: "Docker" },
      { name: "AWS EC2 / RDS" },
      { name: "Elasticsearch" },
      { name: "Quartz" },
      { name: "TypeScript" },
      { name: "Next.js" },
      { name: "Supabase" },
    ],
    body: [
      "<strong>진한 것</strong>은 실무에서 문제를 해결해 본 것, 나머지는 필요한 만큼 써 본 것입니다.",
      "요즘 파고 있는 건 <strong>배치 처리량</strong>과 <strong>동시성 제어</strong>입니다. 프런트엔드는 이 사이트를 만들면서 배우는 중이고, 아직 초급이라고 말하는 게 정확합니다.",
    ],
  },
  {
    id: "education",
    art: "books",
    tip: "식은 커피와 노트 · 공부",
    category: "EDUCATION · 학력과 공부",
    short: "학력",
    title: "계속 읽습니다",
    lead: "전공은 아니었고, 지금도 매일 조금씩 메꾸고 있습니다.",
    rows: [
      // TODO: 실제 학교·학과·연도로 교체
      { label: "학력", value: "OO대학교 · OO학과", note: "2016 — 2021 · 비전공" },
      { label: "전환", value: "국비 지원 Java 과정", note: "2021 · 6개월" },
      { label: "지금", value: "사내 스터디 운영", note: "주 1회 · 2년째" },
    ],
    body: [
      "비전공이라 기초가 비어 있다는 걸 알고 시작했습니다. 그래서 남들이 넘어가는 부분에서 자주 멈춥니다.",
      "읽은 것 중 가장 오래 남은 책은 <strong>『자바 성능 튜닝 이야기』</strong>와 <strong>『가상 면접 사례로 배우는 대규모 시스템 설계 기초』</strong>입니다. 알고리즘 기록은 6년째 이어 오고 있습니다.",
    ],
  },
  {
    id: "strength",
    art: "glass",
    tip: "돋보기 · 강점",
    category: "STRENGTH · 강점",
    short: "강점",
    title: "원인까지 팝니다",
    lead: "증상을 덮는 것보다 왜 그런지 알아내는 데 시간을 씁니다.",
    body: [
      "쿠폰이 43장 더 나갔을 때, 재고를 맞추고 끝내지 않고 왜 그랬는지 재현하는 데 2주를 썼습니다. 그 과정을 저장소에 남겨 뒀고 지금도 팀에서 참고합니다.",
      '"페치 조인이 빠르다" 같은 말을 근거 없이 반복하는 게 불편해서 직접 측정해 기록하는 저장소를 만들었습니다. 지금은 <strong>측정값 없이 성능 이야기를 꺼내지 않습니다.</strong>',
      "장애 대응에서 제 역할은 보통 로그를 잇는 일입니다. 흩어진 서버 세 대의 로그를 한 줄로 만드는 파이프라인도 그래서 만들었습니다.",
    ],
  },
  {
    id: "how-i-work",
    art: "duck",
    tip: "러버덕 · 막힐 때",
    category: "HOW I WORK · 일하는 방식",
    short: "일하는 방식",
    title: "막히면 설명합니다",
    lead: "이 친구에게 소리 내어 설명하다 보면 대개 어디가 틀렸는지 나옵니다.",
    body: [
      "혼자 두 시간 헤매는 것보다 누군가에게 30분 설명하는 게 빠르다는 걸 배웠습니다. 사람이 없을 때는 이 오리에게 하고, 그래도 안 되면 <strong>30분 규칙</strong>으로 팀에 묻습니다.",
      '코드 리뷰에서는 "이렇게 하세요"보다 "이 경우엔 어떻게 되나요"로 묻는 편입니다. 제가 놓친 맥락이 있을 확률이 높아서요.',
      "PR은 되도록 작게 올립니다. 리뷰어의 집중력이 한정된 자원이라고 생각합니다.",
    ],
  },
  {
    id: "principles",
    art: "lock",
    tip: "자물쇠 · 지키는 것",
    category: "PRINCIPLES · 원칙",
    short: "원칙",
    title: "타협하지 않는 것",
    lead: "속도 때문에 양보해도 되는 것과 안 되는 것을 구분합니다.",
    body: [
      "<strong>되돌릴 수 없는 배포는 하지 않습니다.</strong> 롤백 경로가 없으면 준비가 안 된 겁니다.",
      "<strong>비밀은 코드에 두지 않습니다.</strong> 급해도 환경변수부터 만듭니다.",
      "<strong>권한은 애플리케이션이 아니라 아래 층에서 막습니다.</strong> 앱 코드로 막은 건 우회 경로가 생깁니다.",
      "<strong>모르는 걸 안다고 하지 않습니다.</strong> 면접에서도 그렇습니다. 아는 범위를 정확히 말하는 게 서로에게 이득입니다.",
    ],
  },
  {
    id: "collaboration",
    art: "bell",
    tip: "작은 종 · 협업",
    category: "COLLABORATION · 협업",
    short: "협업",
    title: "제때 알립니다",
    lead: "나쁜 소식은 빨리 전하는 게 낫다고 배웠습니다.",
    body: [
      "일정이 밀릴 것 같으면 밀린 다음에 말하지 않고, <strong>밀릴 것 같을 때</strong> 말합니다. 늦게 알리면 선택지가 사라집니다.",
      '기획·프런트엔드와 이야기할 때 스키마나 트랜잭션 같은 말을 먼저 꺼내지 않습니다. "이 경우에 사용자에게 뭐가 보여야 하나요"부터 맞춥니다.',
      "문서를 남깁니다. 제가 없을 때 팀이 막히지 않는 게 좋은 인수인계라고 생각합니다.",
    ],
  },
  {
    id: "certification",
    art: "ticket",
    tip: "꽂아둔 쿠폰 · 자격",
    category: "CERTIFICATION · 자격과 교육",
    short: "자격증",
    title: "가진 것들",
    lead: "많지 않습니다. 필요해서 딴 것만 있습니다.",
    rows: [
      // TODO: 실제 보유 자격증으로 교체
      { label: "2023", value: "AWS Solutions Architect Associate" },
      { label: "2022", value: "정보처리기사" },
      { label: "2021", value: "SQLD" },
      { label: "교육", value: "사내 Kafka 심화 과정", note: "2024 · 32시간" },
    ],
    body: [
      "자격증이 실력을 증명한다고 생각하진 않습니다. 다만 AWS는 인프라를 체계적으로 훑는 계기가 됐습니다.",
    ],
  },
  {
    id: "values",
    art: "yut",
    tip: "윷 네 짝 · 가치관",
    category: "VALUES · 가치관",
    short: "가치관",
    title: "운과 판단 사이",
    lead: "윷은 운이 절반이지만, 말을 어디에 놓을지는 판단입니다.",
    body: [
      "개발도 비슷하다고 생각합니다. 통제할 수 없는 일은 반드시 생기고, 그때 무엇을 준비해 뒀는지가 갈립니다. 그래서 저는 <strong>실패를 없애는 쪽보다 실패해도 되돌아오는 쪽</strong>을 만듭니다.",
      "재시작 가능한 배치, 보상 트랜잭션, 백업 리허설 — 제가 만든 것들의 공통점이 이겁니다.",
      '설날에 가족들과 윷놀이를 하다가 "원격으로도 되면 좋겠다"는 말이 나와서 만든 프로젝트가 모니터 안에 있습니다. 시작은 대개 그런 데서 옵니다.',
    ],
  },
  {
    id: "personal",
    art: "plant",
    tip: "화분… 에 사는 거미",
    category: "PERSONAL · 사람으로서",
    short: "취미",
    title: "일 밖의 저",
    lead: "화분은 세 번째고, 앞의 둘은 실패했습니다. 거미는 세입자입니다.",
    body: [
      "식물을 키웁니다. 매일 물을 주면 죽는다는 걸 두 번 죽이고 배웠습니다. <strong>과하게 돌보는 것도 방치</strong>라는 걸 여기서 배웠고, 코드에도 비슷하게 적용됩니다.",
      "주말에는 등산을 합니다. 서울 근교 산은 대부분 가 봤습니다.",
      "보드게임을 좋아합니다. 규칙이 있는 판에서 사람들이 어떻게 다르게 판단하는지 보는 게 재미있습니다. 윷놀이 프로젝트도 여기서 출발했습니다.",
    ],
  },
  {
    id: "contact",
    art: "box",
    tip: "배송 대기 중인 상자 · 연락",
    category: "CONTACT · 연락처",
    short: "연락처",
    title: "보내주세요",
    lead: "이력서 PDF도 준비돼 있습니다. 편하신 쪽으로 연락 주세요.",
    rows: [
      { label: "이메일", value: "you4ranghe@gmail.com", note: "가장 빠릅니다" },
      { label: "GitHub", value: "github.com/you4ranghe" },
      { label: "위치", value: "서울", note: "출근 · 원격 모두 가능" },
      { label: "응답", value: "보통 하루 안에" },
    ],
    body: [
      "채용 담당자시라면 <strong>모니터 안의 프로젝트 갤러리</strong>를 먼저 보시는 걸 권합니다. 각 저장소마다 무엇을 왜 그렇게 만들었고 무엇이 아쉬웠는지까지 적어 뒀습니다.",
    ],
    links: [
      { href: "mailto:you4ranghe@gmail.com", label: "이메일 보내기" },
      // TODO: 실제 이력서 PDF 를 public/ 에 올리고 경로를 바꾸세요
      { href: "#", label: "이력서 PDF", ghost: true },
    ],
  },
];

/** 이력서 항목을 id 로 찾습니다. */
export function findResumeItem(id: string): ResumeItem | undefined {
  return RESUME.find((item) => item.id === id);
}

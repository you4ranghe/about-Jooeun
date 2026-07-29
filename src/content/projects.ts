import type { Project } from "./types";

/**
 * 프로젝트 12개.
 *
 * ⚠️ 내용은 예시입니다. 실제 저장소 목록을 주시면 교체합니다.
 *
 * 지금은 상수지만 관리자 CRUD 를 붙이는 시점에 Supabase 로 이관합니다.
 * 그때 이 파일은 사라지고 features/projects/queries.ts 가 같은 타입을 반환하게 됩니다.
 * 그래서 화면 코드는 이 파일을 직접 import 하지 않고 항상 아래 함수를 거칩니다.
 */
const PROJECTS: Project[] = [
  {
    // ⚠️ 아래 내용은 아직 예시입니다. 실측한 값으로 교체하는 것이 docs/06 의 Y-01 입니다.
    //    지금 사실인 것은 repo · live · desktop · icon 네 개뿐입니다.
    slug: "yutnori",
    no: "01",
    color: "#0B4F4A",
    /** 실제 저장소 1호 — 바탕화면에 아이콘으로 나옵니다 */
    desktop: true,
    icon: "yut",
    title: "윷놀이 온라인 대전",
    summary:
      "WebSocket으로 4인 실시간 대전을 구현했습니다. 말 이동과 잡기 규칙 판정을 전부 서버에 두어, 클라이언트가 어떤 값을 보내도 판이 어긋나지 않습니다.",
    repo: "you4ranghe/yutnori",
    live: "https://yutnori-rho.vercel.app",
    year: "2024",
    period: "2024.03 — 2024.07",
    role: "기획 · 서버 · 배포 (단독)",
    tags: ["Java", "Spring Boot", "WebSocket", "Redis"],
    meta: { language: "Java", stars: 34, forks: 6, commits: 412, lastCommit: "3일 전", license: "MIT" },
    overview: [
      "설날에 가족들과 윷놀이를 하다가 “원격으로도 되면 좋겠다”는 말이 나와서 만들었습니다. 규칙이 단순해 보이지만 백도, 업기, 지름길 분기 같은 예외가 많아서 도메인 모델을 잡는 데 시간이 제일 많이 들었습니다.",
      "4인이 한 판에 들어와 순서대로 던지고, 남의 말을 잡으면 한 번 더 던지는 흐름을 실시간으로 맞춥니다.",
    ],
    did: [
      "<b>판 상태를 서버 단일 소스로</b> — 말 위치, 순서, 잡기 판정을 전부 서버 메모리에서 계산",
      "<b>클라이언트는 의도만 전송</b> — “윷을 던졌다”만 보내고 결과는 서버가 정함",
      "<b>재접속 복구</b> — 연결이 끊겨도 30초 안에 돌아오면 같은 자리에서 이어감",
      "<b>관전 모드</b> — 방이 꽉 차도 들어와서 볼 수 있음",
    ],
    questions: [
      {
        question: "왜 판정을 전부 서버에 뒀나요?",
        answer:
          "처음엔 클라이언트에서 계산하고 서버는 중계만 했습니다. 그런데 개발자 도구로 값을 바꾸면 말이 원하는 자리로 갔습니다. 게임에서 클라이언트를 믿으면 안 된다는 걸 몸으로 배웠고, 이후 모든 판정을 서버로 옮겼습니다.",
      },
      {
        question: "윷 던지기 난수는 어디서 만드나요?",
        answer:
          "서버입니다. 클라이언트가 만든 난수를 받으면 원하는 값을 보낼 수 있습니다. 대신 “던지는 느낌”이 사라져서, 서버가 결과를 먼저 정하고 클라이언트는 그 결과로 끝나는 애니메이션을 재생하는 방식으로 맞췄습니다.",
      },
    ],
    learned:
      "게임 서버는 CRUD와 다른 종류의 문제였습니다. “누가 진실을 갖는가”를 먼저 정하지 않으면 나머지 설계가 전부 흔들린다는 걸 처음 실감했습니다.",
    regret:
      "방 상태를 서버 인스턴스 메모리에 둬서 수평 확장이 막혔습니다. Redis로 옮기려고 브랜치를 팠다가 멈춰 있습니다. 다시 만든다면 처음부터 상태를 밖으로 뺐을 겁니다.",
  },
  {
    slug: "order-service",
    no: "02",
    color: "#1B3BCF",
    title: "주문·결제 도메인 서비스",
    summary:
      "주문 상태 전이를 도메인 이벤트로 분리하고 Kafka로 결제·배송에 전파했습니다. 결제 지연이 주문 생성을 막지 않습니다.",
    repo: "you4ranghe/order-service",
    live: "",
    year: "2024",
    period: "2024.01 — 진행 중",
    role: "서버 개발 (3인 팀)",
    tags: ["Java", "Spring Boot", "Kafka", "MySQL"],
    meta: { language: "Java", stars: 12, forks: 2, commits: 876, lastCommit: "1일 전", license: "비공개" },
    overview: [
      "결제 승인 응답이 늦어지면 주문 생성 API 전체가 붙잡히는 구조였습니다. 피크 시간에 커넥션이 말라붙어 주문을 아예 못 받는 사고가 두 번 났습니다.",
      "주문 상태 전이를 도메인 이벤트로 끊어내고, 결제와 배송을 비동기 소비자로 분리했습니다.",
    ],
    did: [
      "<b>상태 전이를 이벤트로</b> — 주문 생성 / 결제 완료 / 배송 시작을 각각 이벤트로 발행",
      "<b>보상 트랜잭션</b> — 결제 실패 시 주문을 취소 상태로 되돌리는 경로를 명시적으로 구현",
      "<b>멱등 처리</b> — 같은 이벤트가 두 번 와도 결과가 같도록 처리 이력 테이블 도입",
      "<b>아웃박스 패턴</b> — DB 커밋과 이벤트 발행 사이의 유실 구간 제거",
    ],
    questions: [
      {
        question: "이벤트를 나누는 기준이 뭐였나요?",
        answer:
          "기술이 아니라 “따로 실패해도 되는가”였습니다. 결제가 실패해도 주문 기록은 남아야 하니 나눴고, 주문 항목과 주문 헤더는 따로 실패하면 안 되니 한 트랜잭션에 묶었습니다.",
      },
      {
        question: "멱등성은 어떻게 보장했나요?",
        answer:
          "이벤트마다 고유 키를 부여하고 처리 이력 테이블에 유니크 제약을 걸었습니다. 중복 소비가 오면 INSERT가 실패하고 그대로 스킵합니다. 애플리케이션 로직으로 막는 것보다 DB 제약이 확실했습니다.",
      },
    ],
    learned:
      "비동기로 바꾸면 성능은 좋아지지만 “언제 끝났는지 모르는” 문제가 생깁니다. 사용자에게 무엇을 언제 보여줄지가 오히려 더 어려운 설계였습니다.",
    regret:
      "이벤트 스키마 버전 관리를 초반에 안 정해두고 시작해서, 필드 하나 추가할 때마다 소비자 배포 순서를 신경 써야 했습니다.",
  },
  {
    slug: "coupon-issuer",
    no: "03",
    color: "#CE3B27",
    title: "선착순 쿠폰 발급",
    summary:
      "Redis 분산 락으로 재고 초과 발급을 막았습니다. 동시 요청 1만 건에서 발급 수량이 정확히 일치합니다.",
    repo: "you4ranghe/coupon-issuer",
    live: "",
    year: "2023",
    period: "2023.09 — 2023.11",
    role: "단독",
    tags: ["Java", "Spring Boot", "Redis"],
    meta: { language: "Java", stars: 58, forks: 14, commits: 203, lastCommit: "2주 전", license: "MIT" },
    overview: [
      "이벤트 쿠폰 1,000장을 뿌렸는데 1,043장이 나갔습니다. 원인을 찾다가 동시성 제어를 제대로 공부하게 됐고, 그 과정을 저장소에 전부 남겼습니다.",
      "DB 비관적 락 → 낙관적 락 → Redis 분산 락 순으로 바꿔가며 같은 부하 조건에서 측정했습니다.",
    ],
    did: [
      "<b>세 가지 방식 비교</b> — 비관적 락 / 낙관적 락 / Redis 원자 연산을 동일 조건에서 측정",
      "<b>k6 부하 스크립트 동봉</b> — 누구나 같은 결과를 재현할 수 있게",
      "<b>발급 이력 분리</b> — 재고 차감과 발급 기록을 나눠 실패 시 추적 가능하게",
    ],
    questions: [
      {
        question: "왜 DB 락으로는 안 됐나요?",
        answer:
          "비관적 락은 정확했지만 커넥션 풀이 먼저 말라붙었습니다. 1만 요청이 한 행을 두고 줄을 서니 응답 시간이 초 단위로 늘었습니다. 정확성은 얻었는데 서비스가 죽었습니다.",
      },
      {
        question: "Redis는 안전한가요?",
        answer:
          "단일 인스턴스라면 DECR 원자 연산으로 충분합니다. 클러스터라면 이야기가 다르고, 그때는 Redlock 논쟁을 읽어봐야 합니다. 저희 규모에서는 단일 인스턴스로 충분하다고 판단하고 그 근거를 README에 적었습니다.",
      },
    ],
    learned:
      "“동시성 문제”는 하나가 아니라 층이 여러 개였습니다. 어느 층에서 막을지 정하는 게 어떤 락을 쓸지보다 먼저였습니다.",
    regret: "Redis가 죽으면 발급이 통째로 멈춥니다. 폴백 경로를 안 만들어 뒀습니다.",
  },
  {
    slug: "batch-settlement",
    no: "04",
    color: "#B98511",
    title: "일 정산 배치",
    summary:
      "Spring Batch 청크 처리로 300만 건 정산을 12분에 마감합니다. 실패 지점부터 재시작할 수 있습니다.",
    repo: "you4ranghe/batch-settlement",
    live: "",
    year: "2023",
    period: "2023.04 — 2023.08",
    role: "설계 · 구현 (2인)",
    tags: ["Java", "Spring Batch", "MySQL"],
    meta: { language: "Java", stars: 21, forks: 3, commits: 334, lastCommit: "1개월 전", license: "비공개" },
    overview: [
      "기존 배치는 단일 트랜잭션으로 돌아서 중간에 실패하면 처음부터 다시 돌려야 했습니다. 새벽 3시에 실패하면 아침까지 정산이 안 끝났습니다.",
      "청크 단위로 나누고 실행 이력을 남겨, 실패한 청크부터 재시작하도록 바꿨습니다.",
    ],
    did: [
      "<b>청크 크기 튜닝</b> — 500 / 1,000 / 5,000을 실측해 1,000으로 확정",
      "<b>재시작 가능하게</b> — JobRepository로 실행 상태를 영속화",
      "<b>병렬 스텝</b> — 가맹점 단위로 파티셔닝해 4개 스레드로 분산",
      "<b>실패 알림</b> — Job 리스너에서 슬랙으로 실패 청크 번호까지 전송",
    ],
    questions: [
      {
        question: "청크 크기를 1,000으로 정한 이유는?",
        answer:
          "5,000이 가장 빨랐지만 실패 시 되돌리는 양이 커졌습니다. 500은 커밋 오버헤드가 컸고요. 1,000이 속도와 복구 비용의 균형점이었고, 세 조건의 측정값을 README 표로 남겼습니다.",
      },
    ],
    learned:
      "배치는 “빠른 것”보다 “다시 돌릴 수 있는 것”이 중요했습니다. 12분이 15분이 되더라도 재시작이 되는 쪽을 골랐습니다.",
    regret:
      "파티셔닝 기준을 가맹점으로 잡았는데, 거래량이 몰린 대형 가맹점 하나가 전체 배치 시간을 결정합니다. 균등 분할이 아니었습니다.",
  },
  {
    slug: "api-gateway",
    no: "05",
    color: "#16161A",
    title: "사내 API 게이트웨이",
    summary:
      "라우팅·인증·레이트리밋을 한곳에 모아 서비스마다 반복되던 필터 코드를 걷어냈습니다. 신규 서비스는 설정 한 줄로 붙습니다.",
    repo: "you4ranghe/api-gateway",
    live: "",
    year: "2023",
    period: "2023.02 — 2023.05",
    role: "단독",
    tags: ["Java", "Spring Cloud Gateway", "Redis"],
    meta: { language: "Java", stars: 9, forks: 1, commits: 187, lastCommit: "3개월 전", license: "비공개" },
    overview: [
      "서비스가 여섯 개로 늘면서 같은 JWT 검증 필터가 여섯 벌 복사돼 있었습니다. 토큰 정책을 하나 바꾸면 여섯 번 배포해야 했습니다.",
      "게이트웨이로 모으고, 서비스는 헤더로 전달된 사용자 정보만 신뢰하도록 바꿨습니다.",
    ],
    did: [
      "<b>인증 일원화</b> — JWT 검증을 게이트웨이에서만 수행",
      "<b>레이트리밋</b> — Redis 기반 토큰 버킷, 경로별 정책 분리",
      "<b>라우팅 설정 외부화</b> — 신규 서비스 등록은 YAML 한 블록",
      "<b>서킷 브레이커</b> — 특정 서비스 장애가 게이트웨이 전체를 막지 않도록",
    ],
    questions: [
      {
        question: "단일 장애점이 되지 않나요?",
        answer:
          "됩니다. 그래서 만들기 전에 이중화와 헬스체크를 먼저 붙였습니다. 게이트웨이 두 대를 로드밸런서 뒤에 두고, 무중단 배포를 확인한 다음에야 트래픽을 옮겼습니다.",
      },
    ],
    learned:
      "공통 인프라를 만들 때는 기능보다 “이게 죽으면 무슨 일이 나는가”를 먼저 답해야 했습니다.",
    regret:
      "게이트웨이 로그와 각 서비스 로그를 잇는 추적 ID를 나중에 붙였습니다. 처음부터 넣었으면 초기 디버깅이 훨씬 쉬웠을 겁니다.",
  },
  {
    slug: "notification-hub",
    no: "06",
    color: "#0B4F4A",
    title: "알림 발송 허브",
    summary:
      "FCM·SMS·이메일을 하나의 인터페이스 뒤로 감췄습니다. 문자 업체를 바꿀 때 호출하는 쪽 코드를 한 줄도 건드리지 않았습니다.",
    repo: "you4ranghe/notification-hub",
    live: "",
    year: "2022",
    period: "2022.10 — 2022.12",
    role: "단독",
    tags: ["Java", "Spring Boot", "RabbitMQ"],
    meta: { language: "Java", stars: 16, forks: 4, commits: 142, lastCommit: "5개월 전", license: "MIT" },
    overview: [
      "알림 발송 코드가 서비스마다 흩어져 있었고, 업체 SDK가 그대로 비즈니스 로직에 박혀 있었습니다.",
      "채널을 인터페이스로 추상화하고, 발송을 큐로 넘겨 실패해도 본 흐름을 막지 않도록 했습니다.",
    ],
    did: [
      "<b>채널 추상화</b> — NotificationChannel 인터페이스 하나에 구현체 3종",
      "<b>비동기 발송</b> — RabbitMQ로 넘겨 호출 측은 즉시 반환",
      "<b>재시도 + DLQ</b> — 3회 재시도 후 실패 큐로 격리",
      "<b>템플릿 관리</b> — 문구를 코드에서 빼내 DB로",
    ],
    questions: [
      {
        question: "추상화가 정말 값을 했나요?",
        answer:
          "했습니다. 6개월 뒤 문자 업체를 바꿨는데 구현체 하나만 새로 쓰고 설정을 바꿨습니다. 호출하는 쪽 코드는 그대로였습니다. 추상화가 실제로 값을 하는 드문 경우를 직접 겪었고, 이후 인터페이스를 언제 만들지 판단하는 기준이 됐습니다.",
      },
    ],
    learned:
      "추상화는 “나중에 바뀔 것 같아서”가 아니라 “실제로 바뀐 적이 있어서” 만들 때 맞았습니다.",
    regret: "발송 결과를 조회하는 API를 안 만들어서, 사용자 문의가 오면 DB를 직접 봐야 했습니다.",
  },
  {
    slug: "jwt-auth-starter",
    no: "07",
    color: "#1B3BCF",
    title: "공통 인증 스타터",
    summary: "사내 서비스 6곳이 의존성 하나로 붙여 쓰는 Spring Boot 오토컨피규레이션 라이브러리입니다.",
    repo: "you4ranghe/jwt-auth-starter",
    live: "",
    year: "2022",
    period: "2022.06 — 2022.09",
    role: "단독",
    tags: ["Java", "Spring Boot"],
    meta: { language: "Java", stars: 7, forks: 0, commits: 96, lastCommit: "7개월 전", license: "비공개" },
    overview: [
      "게이트웨이 이전 단계에서, 각 서비스가 최소한 같은 방식으로 토큰을 검증하게 만들어야 했습니다.",
      "Spring Boot 스타터로 만들어 의존성만 추가하면 기본 설정이 자동으로 잡히도록 했습니다.",
    ],
    did: [
      "<b>오토컨피규레이션</b> — 의존성 추가만으로 필터 체인 등록",
      "<b>확장 지점 개방</b> — 필요한 팀이 특정 빈만 교체할 수 있도록 @ConditionalOnMissingBean",
      "<b>버전 호환 규율</b> — 마이너 버전에서 기존 동작을 깨지 않는다는 원칙을 문서화",
    ],
    questions: [
      {
        question: "라이브러리를 만드는 건 서비스와 뭐가 달랐나요?",
        answer:
          "쓰는 쪽이 무엇을 바꾸고 싶어할지 미리 열어둬야 한다는 점이었습니다. 서비스는 제가 다 고칠 수 있지만, 라이브러리는 남의 코드에서 돕니다. 닫아두면 그 팀은 라이브러리를 버리고 직접 짭니다.",
      },
    ],
    learned:
      "API를 공개한다는 건 그걸 앞으로 못 바꾼다는 뜻에 가까웠습니다. 무엇을 공개하지 않을지를 더 고민했습니다.",
    regret: "초기에 설정 프로퍼티 이름을 성급하게 정해서, 나중에 바꾸고 싶어도 못 바꿨습니다.",
  },
  {
    slug: "log-collector",
    no: "08",
    color: "#B98511",
    title: "로그 수집 파이프라인",
    summary:
      "흩어진 애플리케이션 로그를 Elasticsearch로 모으고 대시보드로 열었습니다. 원인 추적 시간이 크게 줄었습니다.",
    repo: "you4ranghe/log-collector",
    live: "",
    year: "2022",
    period: "2022.03 — 2022.05",
    role: "단독",
    tags: ["Java", "Elasticsearch"],
    meta: { language: "Java", stars: 5, forks: 1, commits: 78, lastCommit: "8개월 전", license: "비공개" },
    overview: [
      "장애가 나면 서버 세 대에 각각 SSH로 붙어 grep 하던 시절이 있었습니다. 시간 순서를 맞추는 것부터 일이었습니다.",
      "로그 포맷을 JSON으로 통일하고 Logstash로 수집해 Kibana에서 보게 만들었습니다.",
    ],
    did: [
      "<b>구조화 로깅</b> — 모든 서비스의 로그를 JSON 한 줄로 통일",
      "<b>추적 ID 전파</b> — 요청 하나가 서비스 세 개를 지나가도 한 줄로 이어 보이게",
      "<b>보존 정책</b> — 30일 이후 자동 삭제로 저장 비용 통제",
    ],
    questions: [
      {
        question: "가장 효과가 컸던 건 뭐였나요?",
        answer:
          "수집 인프라보다 로그 포맷 통일이었습니다. 포맷만 맞춰도 grep으로 훨씬 빨라졌습니다. 도구를 먼저 도입했다면 효과가 절반이었을 겁니다.",
      },
    ],
    learned: "관측 가능성은 도구를 붙이는 일이 아니라 “무엇을 남길지”를 정하는 일이었습니다.",
    regret: "개인정보가 로그에 찍히는 걸 나중에 발견했습니다. 마스킹을 처음부터 넣었어야 했습니다.",
  },
  {
    slug: "crawler-scheduler",
    no: "09",
    color: "#CE3B27",
    title: "분산 크롤링 스케줄러",
    summary:
      "Quartz 클러스터 모드로 노드가 늘어도 같은 작업이 두 번 돌지 않습니다. 스케줄 변경은 재배포 없이 반영됩니다.",
    repo: "you4ranghe/crawler-scheduler",
    live: "",
    year: "2022",
    period: "2022.01 — 2022.02",
    role: "단독",
    tags: ["Java", "Quartz", "MySQL"],
    meta: { language: "Java", stars: 11, forks: 2, commits: 64, lastCommit: "10개월 전", license: "MIT" },
    overview: [
      "서버를 두 대로 늘리자 크롤링이 두 번씩 돌아 상대 사이트에서 차단당했습니다.",
      "Quartz 클러스터 모드로 바꿔 DB 락으로 실행권을 한 노드만 갖도록 했습니다.",
    ],
    did: [
      "<b>클러스터 모드</b> — DB 기반 잠금으로 중복 실행 차단",
      "<b>스케줄 외부화</b> — 주기를 DB에 두고 런타임에 읽어 재배포 불필요",
      "<b>요청 간격 제어</b> — 상대 서버 부담을 고려한 딜레이와 robots.txt 준수",
    ],
    questions: [
      {
        question: "스케줄을 DB에 둔 이유는?",
        answer:
          "주기 하나 바꾸는 데 배포가 필요한 게 이상했습니다. DB로 옮긴 뒤로는 운영팀이 직접 조정합니다. 개발자가 병목이 되지 않게 하는 게 이 작업의 진짜 목적이었습니다.",
      },
    ],
    learned: "분산 환경에서 “한 번만 실행”은 생각보다 어려운 보장이었습니다.",
    regret: "크롤링 대상 사이트의 구조가 바뀌면 조용히 빈 결과를 저장했습니다. 결과 검증을 안 넣었습니다.",
  },
  {
    slug: "jpa-lab",
    no: "10",
    color: "#16161A",
    title: "JPA 성능 실험실",
    summary:
      "N+1, 페치 조인, 배치 사이즈를 같은 조건에서 재보고 기록했습니다. 팀 코드 리뷰에서 근거로 인용합니다.",
    repo: "you4ranghe/jpa-lab",
    live: "",
    year: "2021—",
    period: "2021.05 — 진행 중",
    role: "단독",
    tags: ["Java", "JPA", "MySQL"],
    meta: { language: "Java", stars: 96, forks: 23, commits: 521, lastCommit: "6일 전", license: "MIT" },
    overview: [
      "“페치 조인이 빠르다”는 말을 근거 없이 반복하는 게 불편했습니다. 조건마다 다를 텐데 다들 단정적으로 말하고 있었습니다.",
      "같은 데이터, 같은 조건에서 방식별로 실행 계획과 소요 시간을 재고 전부 기록했습니다.",
    ],
    did: [
      "<b>재현 가능한 벤치마크</b> — Testcontainers로 동일한 DB 상태에서 측정",
      "<b>실행 계획 첨부</b> — 숫자만이 아니라 EXPLAIN 결과를 함께 기록",
      "<b>반례 수집</b> — 페치 조인이 오히려 느린 경우(카테시안 곱)도 따로 정리",
    ],
    questions: [
      {
        question: "가장 의외였던 결과는?",
        answer:
          "컬렉션 두 개를 동시에 페치 조인하면 행이 곱으로 늘어 오히려 느려졌습니다. 흔히 알려진 이야기지만 직접 재보니 체감이 달랐습니다. 배치 사이즈 설정이 대부분의 경우 더 나았습니다.",
      },
    ],
    learned:
      "“빠르다/느리다”는 조건 없이 말할 수 없는 문장이었습니다. 지금은 측정값을 붙이지 않으면 성능 이야기를 꺼내지 않습니다.",
    regret:
      "초기 측정은 로컬 맥북에서 했습니다. 조건을 명시했지만, 서버 환경과 다르다는 한계가 있습니다.",
  },
  {
    slug: "portfolio-gallery",
    no: "11",
    color: "#0B4F4A",
    title: "이 사이트",
    summary:
      "전 구간 무료 티어로 운영합니다. 공개·비공개 경계를 애플리케이션이 아니라 Postgres RLS로 강제했습니다.",
    repo: "you4ranghe/portfolio-gallery",
    live: "",
    year: "2026",
    period: "2026.07 — 진행 중",
    role: "단독",
    tags: ["TypeScript", "Next.js", "Supabase"],
    meta: { language: "TypeScript", stars: 3, forks: 0, commits: 58, lastCommit: "오늘", license: "MIT" },
    overview: [
      "백엔드만 하다 보니 프런트엔드를 설명할 게 없었습니다. 배우면서 만들되, 백엔드 사람답게 만들자고 정했습니다.",
      "비용 0원이라는 제약을 1순위로 두고 설계했더니 오히려 구조가 단순해졌습니다.",
    ],
    did: [
      "<b>RLS로 접근 제어</b> — 익명 키가 브라우저에 노출되는 구조라 DB 정책이 유일한 방어선",
      "<b>공개 페이지 전부 정적</b> — 함수 호출 0, 대역폭 최소",
      "<b>이미지 사전 변환</b> — 업로드 시 WebP 3종 생성, 런타임 변환 0회",
      "<b>keep-alive + 자동 백업</b> — 7일 미접속 시 DB가 잠드는 문제 대응",
    ],
    questions: [
      {
        question: "왜 접근 제어를 DB에 뒀나요?",
        answer:
          "브라우저가 익명 키로 DB에 직접 요청할 수 있는 구조입니다. 애플리케이션 코드에서 걸러도 REST 엔드포인트를 직접 호출하면 그대로 새어 나갑니다. RLS만이 실효가 있는 방어선이었습니다.",
      },
      {
        question: "정적 렌더링을 고른 게 비용 때문만인가요?",
        answer:
          "비용이 출발점이었는데, 부수 효과가 더 컸습니다. 공개 페이지가 정적이니 DB가 잠들어 있어도 방문자에게는 정상으로 보입니다. 비용을 줄이려던 선택이 가용성까지 챙겼습니다.",
      },
    ],
    learned:
      "제약이 설계를 망치는 게 아니라 오히려 선택지를 좁혀 줬습니다. “무료로만”이라는 조건이 없었다면 훨씬 복잡하게 만들었을 겁니다.",
    regret:
      "프런트엔드 상태 관리를 아직 잘 모릅니다. 지금은 필요 없어서 안 썼지만, 필요해지는 순간을 판단할 감이 없습니다.",
  },
  {
    slug: "algo-study",
    no: "12",
    color: "#1B3BCF",
    title: "알고리즘 기록",
    summary: "풀이보다 오답 노트가 많습니다. 6년치 커밋 그래프가 이 저장소의 본문입니다.",
    repo: "you4ranghe/algo-study",
    live: "",
    year: "2020—",
    period: "2020.02 — 진행 중",
    role: "단독",
    tags: ["Java"],
    meta: { language: "Java", stars: 2, forks: 0, commits: 1420, lastCommit: "2일 전", license: "MIT" },
    overview: [
      "맞은 문제보다 틀린 이유를 적는 데 시간을 더 씁니다.",
      "6년치가 쌓이니 제 사고의 빈 구멍이 어디인지 패턴으로 보입니다. 그리디에서 자주 틀리고, 구현 문제에서 예외 처리를 자주 빠뜨립니다.",
    ],
    did: [
      "<b>오답 노트 우선</b> — 왜 틀렸는지를 먼저 적고 풀이는 그다음",
      "<b>유형별 태그</b> — 약한 유형을 통계로 확인할 수 있게",
      "<b>재풀이 주기</b> — 틀린 문제는 2주 뒤 다시 품",
    ],
    questions: [
      {
        question: "6년을 어떻게 이어왔나요?",
        answer:
          "하루 한 문제 같은 목표를 세우지 않았습니다. 대신 “틀리면 반드시 적는다”만 지켰습니다. 규칙이 하나라 안 깨졌습니다.",
      },
    ],
    learned: "꾸준함은 의지가 아니라 규칙의 개수 문제였습니다.",
    regret:
      "초기 2년치는 풀이만 있고 왜 그렇게 풀었는지가 없습니다. 지금 보면 제가 쓴 코드인데도 이해가 안 됩니다.",
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

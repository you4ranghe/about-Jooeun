# about-Jooeun

백엔드 개발자 포트폴리오. **방 = 나라는 사람, 모니터 = 내가 만든 것**으로 나뉩니다.

- `/` — 작업실. 물건 12개를 누르면 경력·기술·원칙이 나옵니다. 밤/낮 토글이 있습니다.
- `/projects` — 프로젝트 갤러리 목록
- `/projects/[slug]` — 프로젝트 상세. 링크 공유의 목적지입니다.

---

## ⚠️ 콘텐츠가 아직 예시입니다

`src/content/resume.ts` 와 `src/content/projects.ts` 의 내용은 **작성 중 채워 넣은 예시**입니다.
회사명·자격증·성과 수치·프로젝트 설명이 실제 이력이 아닙니다.

그래서 `src/app/layout.tsx` 의 `robots` 를 `index: false` 로 두었습니다.
**실제 이력으로 교체한 뒤** `{ index: true, follow: true }` 로 바꾸세요.

교체가 필요한 곳에는 `TODO` 주석을 달아 뒀습니다:

```bash
grep -rn "TODO" src/
```

주요 항목:

| 파일 | 바꿔야 할 것 |
|---|---|
| `src/content/resume.ts` | 실명, 회사명, 재직 기간, 학력, 자격증 |
| `src/content/projects.ts` | 실제 저장소 12개의 내용과 GitHub 수치 |
| `src/app/layout.tsx` | `SITE_URL`, `robots` |
| `public/` | 이력서 PDF (`resume.ts` 의 링크가 `#` 로 비어 있음) |

---

## 개발

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 전 라우트가 Static / SSG 로 나와야 정상
```

빌드 로그의 라우트 표에서 `/` 와 `/projects` 가 **`○ Static`**,
`/projects/[slug]` 가 **`● SSG`** 로 나와야 합니다.
하나라도 `ƒ Dynamic` 이 되면 무료 티어 비용 설계가 무너집니다 — 원인은 대개
`searchParams` 접근이나 캐시되지 않는 `fetch` 입니다.

## 구조

```
src/
├── app/
│   ├── page.tsx                 방 (이력서)
│   └── projects/
│       ├── page.tsx             갤러리 목록
│       └── [slug]/page.tsx      프로젝트 상세
├── components/
│   ├── art/ObjectArt.tsx        사물 SVG 12종 + 밤 얼굴
│   ├── room/RoomScene.tsx       장면 + 카메라 (클라이언트)
│   ├── room/GalleryPreview.tsx  모니터 화면 안의 축소판
│   └── gallery/ProjectBands.tsx 태그 필터 + 목록
├── content/                     ★ 여기만 고치면 내용이 바뀝니다
│   ├── types.ts
│   ├── resume.ts
│   └── projects.ts
└── styles/
    ├── scene.css                방 장면
    └── gallery.css              갤러리
```

### 왜 이렇게 나눴나

- **이력서는 코드 상수** — 연 몇 번 바뀌는 문서에 관리자 CRUD 를 붙이면 낭비입니다.
  Git 이력이 그대로 수정 이력이 됩니다.
- **프로젝트는 나중에 Supabase 로** — `content/projects.ts` 의 함수를 이미 `async`
  로 두었으니, 이관할 때 함수 본문만 바꾸면 화면은 손대지 않습니다.
- **장면은 CSS, UI 껍데기는 Tailwind** — 퍼센트 좌표로 절대 배치된 일러스트를
  유틸리티 클래스로 옮기면 읽을 수 없어집니다.
- **모니터에 iframe 을 쓰지 않음** — `/projects` 가 진짜 라우트여야 링크 공유와
  검색 노출이 됩니다. 모니터에는 같은 데이터로 그린 축소판이 들어갑니다.

## 설계 문서

`docs/` 에 있습니다.

| 문서 | 내용 |
|---|---|
| `01-requirements.md` | 유스케이스, 우선순위, MVP 제외 항목과 사유 |
| `02-data-model.md` | 테이블·RLS 정책·Storage. **아직 미적용** |
| `03-architecture.md` | 라우팅·렌더링·인증·데이터 접근 |
| `04-free-tier-strategy.md` | 7일 일시정지 대응, 이미지 전략, 한도 추산 |
| `05-roadmap.md` | 스프린트 계획과 완료 기준 |

### 문서와 실제의 차이

- 문서: Next.js 15 → 실제: **16.2.12**
- 문서: 로컬 Supabase(Docker) → 실제: **아직 DB 없음** (콘텐츠가 코드 상수)
- 문서에 없던 것: 방이 이력서가 되면서 생긴 `resume.ts` 콘텐츠 종류

## 시안

`design/` 에 초기 HTML 시안 5종이 있습니다. `design/index.html` 로 비교할 수 있습니다.
채택된 방향은 `design/05-room.html` (작업실)입니다.

## 스택

Next.js 16 (App Router) · TypeScript · Tailwind 4 · Vercel

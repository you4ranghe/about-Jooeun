/**
 * 링크 미리보기 그림(OG)에 쓸 한글 폰트.
 *
 * ── 왜 필요한가 ──
 * 그림을 만드는 엔진(Satori)에 기본으로 들어 있는 글꼴에는 **한글이 없습니다.**
 * 그냥 그리면 글자가 전부 네모(두부)로 나옵니다.
 * 카톡에 링크를 붙였을 때 제목이 네모로 뜨느니 안 만드는 편이 낫습니다.
 *
 * ── 왜 저장소에 넣지 않았나 ──
 * 한글 글꼴은 완본이 수 MB 입니다. 이미지 파일을 늘리지 않는다는 원칙(docs/04)과
 * 같은 이유로 저장소에 두지 않고 **빌드할 때 받아옵니다.**
 * next/font 가 이미 빌드 중에 구글 폰트를 받고 있으므로 새로 생기는 의존이 아닙니다.
 *
 * ── 못 받아오면 ──
 * 사내망·프록시·CDN 장애 어느 쪽이든 `null` 을 돌려주고, 부르는 쪽은
 * **한글 없이** 그림을 만듭니다. 빌드를 깨뜨리지 않습니다.
 * next/font 는 woff2 를 주는데 Satori 가 woff2 를 못 읽어 그 파일은 쓸 수 없습니다.
 */

const SOURCE =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/alternative/Pretendard-Bold.ttf";

let cached: ArrayBuffer | null | undefined;

export async function loadKoreanFont(): Promise<ArrayBuffer | null> {
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(SOURCE, {
      cache: "force-cache",
      signal: AbortSignal.timeout(8000),
    });
    cached = res.ok ? await res.arrayBuffer() : null;
  } catch {
    cached = null;
  }
  return cached;
}

/** 폰트를 받았을 때만 넘깁니다. 빈 배열이면 Satori 가 기본 글꼴을 씁니다 */
export async function ogFonts() {
  const data = await loadKoreanFont();
  if (!data) return undefined;
  return [{ name: "Pretendard", data, weight: 700 as const, style: "normal" as const }];
}

/**
 * LP 턴테이블에 올릴 음반 목록.
 *
 * 유튜브 임베드를 씁니다. 대역폭을 쓰지 않고 곡 교체가 쉽습니다.
 * 감수하는 것은 docs/06 §1 에 적어 뒀습니다 — 광고를 막을 수 없고,
 * 영상이 삭제·비공개되면 그 항목이 깨집니다.
 *
 * ⚠️ 플레이어를 감추고 소리만 쓰지 않습니다.
 *    유튜브 약관은 플레이어를 숨긴 재생을 허용하지 않습니다.
 *    그래서 확대 화면에서 플레이어를 그대로 보여 주고,
 *    LP 판은 그 옆에서 도는 장식으로 둡니다.
 *
 * ⚠️ 자동 재생하지 않습니다.
 *    채용 담당자는 사무실에서 소리를 켜고 봅니다.
 *    반드시 사용자가 눌러야 소리가 납니다.
 */

export interface Track {
  /** 유튜브 영상 ID */
  id: string;
  title: string;
  /** 채널명 */
  artist: string;
  /** 한 줄 메모. 왜 이 곡을 올렸는지 */
  note?: string;
}

/** LP 판 가운데 라벨에 쓸 썸네일 주소 */
export function thumbUrl(id: string) {
  // hqdefault 는 모든 영상에 반드시 존재합니다.
  // maxresdefault 는 없는 영상이 있어 깨진 이미지가 나옵니다.
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export const PLAYLIST: Track[] = [
  {
    id: "wNsHDBFgWPA",
    title: "relaxing WoW Classic music with rain sounds... (slowed & reverb)",
    artist: "Azeroth Ambience",
    note: "빗소리 섞인 긴 앰비언트. 집중이 필요한 날 틀어 둡니다.",
  },
  {
    id: "cY9NiA55tII",
    title: "[Playlist] 캐롤 뭐 틀지 모르겠으면 그냥 이거 틀면 됨 | 존박 캐롤 모음",
    artist: "존이냐박이냐",
    note: "연말에 틀어 두는 재생목록.",
  },
  {
    id: "hm3jn7yUGrM",
    title: "한로로 재즈편곡 플리 | HANRORO Jazz [playlist]",
    artist: "Jazzoppa Playlist",
    note: "가사가 있어도 방해가 덜한 편곡. 문서 쓸 때 듣습니다.",
  },
  {
    id: "tC3E7pN76PQ",
    title: "Pi's Lullaby | Life of Pi (Original Motion Picture Soundtrack)",
    artist: "SonySoundtracksVEVO",
    note: "짧게 하나만 듣고 싶을 때.",
  },

  // TODO: 듣는 음반을 여기에 계속 추가하세요.
  // 유튜브 주소의 v= 뒤 11자리가 id 입니다.
  //   https://www.youtube.com/watch?v=wNsHDBFgWPA  →  "wNsHDBFgWPA"
];

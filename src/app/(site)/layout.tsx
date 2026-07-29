import { RESUME } from "@/content/resume";
import { RoomShell } from "@/components/room/RoomShell";

/**
 * 방을 레이아웃에 둡니다.
 *
 * 이게 핵심입니다. 레이아웃은 / ↔ /projects 사이를 오갈 때 다시 그려지지 않으므로
 * 모니터와 방이 그대로 살아 있고, 바뀌는 것은 카메라 위치와 화면 속 내용뿐입니다.
 * 그래서 "페이지 이동"이 아니라 "화면 안으로 들어갔다 나오는" 것처럼 보입니다.
 *
 * ⚠️ 여기서 cookies() 를 읽으면 안 됩니다.
 *    한 번 읽는 순간 이 아래 모든 라우트가 동적 렌더링으로 강등되어
 *    방문자 요청마다 서버리스 함수가 돕니다(docs/03 §3.1).
 *    로그인 여부는 RoomShell 이 브라우저에서 확인합니다.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <RoomShell items={RESUME}>{children}</RoomShell>;
}

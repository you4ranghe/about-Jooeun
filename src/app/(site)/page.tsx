import type { Metadata } from "next";
import { DesktopScreen } from "@/components/desktop/DesktopScreen";

/**
 * 작업실.
 *
 * 방 자체는 레이아웃(RoomShell)이 그립니다.
 * 이 페이지가 반환하는 것은 "모니터 화면에 떠 있는 내용"입니다.
 *
 * /projects 와 같은 내용을 렌더링하는 것은 의도입니다.
 * 두 주소의 화면 속 내용이 동일해야 오갈 때 바뀌는 것이 카메라뿐이고,
 * 그래야 이동이 끊기지 않습니다.
 *
 * 2026-07-29 부터 그 내용은 갤러리 목록이 아니라 **켜져 있는 바탕화면**입니다.
 * 여기서는 멀리서 보는 그림이고, 줌인해야 눌립니다(docs/06 P8).
 */
export const metadata: Metadata = {
  title: "you4ranghe — 백엔드 개발자 포트폴리오",
  description:
    "4년차 백엔드 개발자의 작업실. 벽에 붙은 메모에 경력과 기술이 있고, 책상 위 모니터에는 켜져 있는 컴퓨터가 있습니다.",
  alternates: { canonical: "/" },
};

export default function RoomPage() {
  return <DesktopScreen />;
}

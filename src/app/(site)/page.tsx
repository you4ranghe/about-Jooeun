import type { Metadata } from "next";
import { GalleryScreen } from "@/components/gallery/GalleryScreen";
import "@/styles/gallery.css";

/**
 * 작업실.
 *
 * 방 자체는 레이아웃(RoomShell)이 그립니다.
 * 이 페이지가 반환하는 것은 "모니터 화면에 떠 있는 내용"입니다.
 *
 * /projects 와 같은 내용을 렌더링하는 것은 의도입니다.
 * 두 주소의 화면 속 내용이 동일해야 오갈 때 바뀌는 것이 카메라뿐이고,
 * 그래야 이동이 끊기지 않습니다.
 */
export const metadata: Metadata = {
  title: "you4ranghe — 백엔드 개발자 포트폴리오",
  description:
    "4년차 백엔드 개발자의 작업실. 물건 12개에 경력·기술·원칙을 담았고, 책상 위 모니터에 저장소 12개가 들어 있습니다.",
  alternates: { canonical: "/" },
};

export default function RoomPage() {
  return <GalleryScreen />;
}

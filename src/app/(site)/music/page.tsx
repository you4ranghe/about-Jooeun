import type { Metadata } from "next";
import { MusicApp } from "@/components/music/MusicApp";

/**
 * 듣는 음악.
 *
 * 화면을 새로 그리지 않습니다. 책상 위 아이패드가 이미 플레이어를 품고 있어서,
 * 이 라우트는 카메라를 아이패드로 당기고 화면 안에 유튜브 뮤직 UI 를 띄우는
 * 역할만 합니다.
 */
export const metadata: Metadata = {
  title: "듣는 음악",
  description: "작업할 때 틀어 두는 음반들.",
};

export default function MusicPage() {
  return <MusicApp />;
}

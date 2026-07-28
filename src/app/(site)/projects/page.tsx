import type { Metadata } from "next";
import { GalleryScreen } from "@/components/gallery/GalleryScreen";
import "@/styles/gallery.css";

/**
 * 프로젝트 갤러리 목록.
 *
 * 화면 속 내용은 `/` 와 완전히 같습니다. 다른 것은 카메라 위치뿐이고,
 * 그 위치는 RoomShell 이 pathname 을 보고 결정합니다.
 */
export const metadata: Metadata = {
  title: "프로젝트 갤러리",
  description:
    "저장소 12개. 무엇을 왜 그렇게 만들었고, 그때 어떤 판단을 했고 무엇이 아쉬웠는지까지 적어 뒀습니다.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return <GalleryScreen />;
}

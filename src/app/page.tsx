import type { Metadata } from "next";
import { RESUME } from "@/content/resume";
import { getPublishedProjects } from "@/content/projects";
import { RoomScene } from "@/components/room/RoomScene";
import { GalleryPreview } from "@/components/room/GalleryPreview";

/**
 * 방 = 이력서.
 *
 * 서버 컴포넌트에서 데이터를 읽어 RoomScene 에 넘깁니다.
 * RoomScene 은 'use client' 지만 서버에서도 한 번 렌더링되므로
 * 이력서 12항목의 본문이 HTML 소스에 그대로 들어갑니다(SEO).
 */
export const metadata: Metadata = {
  title: "you4ranghe — 백엔드 개발자 포트폴리오",
  description:
    "4년차 백엔드 개발자의 작업실. 물건 12개에 경력·기술·원칙을 담았고, 책상 위 모니터에 저장소 12개가 들어 있습니다.",
};

export default async function RoomPage() {
  const projects = await getPublishedProjects();

  return (
    <main>
      <RoomScene items={RESUME} preview={<GalleryPreview projects={projects} />} />
    </main>
  );
}

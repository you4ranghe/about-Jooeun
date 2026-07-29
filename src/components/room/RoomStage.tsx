"use client";

import { createContext, useContext } from "react";

/**
 * 방(카메라)과 확대된 화면 사이의 통로.
 *
 * 확대된 화면은 카메라 안쪽에 있어서 카메라를 직접 건드릴 수 없습니다.
 * "오른쪽 패널이 열렸다" 만 알려 주면, 카메라는 그걸로
 * 대상을 가운데 둘지 왼쪽으로 밀지 스스로 정합니다.
 *
 * 재생 상태는 여기로 오지 않습니다. 음악은 MusicProvider 가 따로 쥐고 있습니다 —
 * 화면 전환에도 소리가 이어져야 해서 방 레벨에 있어야 하기 때문입니다.
 */
interface RoomStage {
  setSidePanel: (open: boolean) => void;
}

const Ctx = createContext<RoomStage>({ setSidePanel: () => {} });

export const RoomStageProvider = Ctx.Provider;

export function useRoomStage() {
  return useContext(Ctx);
}

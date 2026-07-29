"use client";

import { createContext, useContext } from "react";

/**
 * 방(카메라)과 화면 안 내용 사이의 통로.
 *
 * 캘린더 화면은 카메라 안쪽에 있어서 카메라를 직접 움직일 수 없습니다.
 * "지금 오른쪽 패널이 열려 있다" 만 알려 주면, 카메라는 그에 맞춰
 * 캘린더를 가운데 둘지 왼쪽으로 밀지 스스로 정합니다.
 *
 * 화면 안 내용이 카메라 계산을 알 필요가 없도록 최소한만 주고받습니다.
 */
interface RoomStage {
  /** 오른쪽 패널이 열렸는지 알립니다 */
  setSidePanel: (open: boolean) => void;
}

const Ctx = createContext<RoomStage>({ setSidePanel: () => {} });

export const RoomStageProvider = Ctx.Provider;

export function useRoomStage() {
  return useContext(Ctx);
}

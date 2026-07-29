"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { PLAYLIST, type Track } from "@/content/playlist";

/**
 * 배경음악을 쥐고 있는 곳.
 *
 * ⚠️ 왜 라우트가 아니라 방(레이아웃)에 있는가
 *
 * 플레이어를 /music 화면 안에 두었더니, 방으로 돌아가는 순간 그 화면이
 * 언마운트되면서 소리가 끊겼습니다. 배경음악이 되려면 플레이어가
 * **화면 전환에도 살아남는 자리**에 있어야 합니다.
 *
 * ⚠️ iframe 은 절대 자리를 옮기지 않습니다.
 *
 * DOM 에서 노드를 다른 부모로 옮기면 iframe 은 처음부터 다시 로드됩니다.
 * 즉 음악이 끊깁니다. 그래서 플레이어는 아이패드 화면 안 한 자리에 박아 두고,
 * 확대/축소는 **CSS 크기만** 바꿉니다. 크기 변경으로는 다시 로드되지 않습니다.
 *
 * ⚠️ 플레이어를 감추지 않습니다.
 *
 * 유튜브 약관이 금지하는 것은 display:none 이라는 구현이 아니라
 * "플레이어가 보이지 않게 되는 결과"입니다. 앞에 무언가를 덮어 가리는 것도 같습니다.
 * 그래서 감추는 대신 **아이패드 화면을 통째로 플레이어에게 내줬습니다.**
 *
 * ⚠️ 자동 재생하지 않습니다. 반드시 사용자가 눌러야 소리가 납니다.
 */

export type PlayStatus = "idle" | "playing" | "paused";

interface MusicApi {
  current: Track | null;
  status: PlayStatus;
  ready: boolean;
  /** 플레이어가 들어앉을 자리. DeskPad 가 이 ref 를 아이패드 화면에 답니다. */
  mountRef: React.RefObject<HTMLDivElement | null>;
  select: (t: Track) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
}

const Ctx = createContext<MusicApi | null>(null);

export function useMusic() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMusic 은 MusicProvider 안에서만 쓸 수 있습니다");
  return v;
}

/* ── 유튜브 IFrame API ─────────────────────────────────── */

let apiPromise: Promise<void> | null = null;
function loadYouTubeApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<void>((resolve) => {
    const w = window as unknown as {
      YT?: { Player?: unknown };
      onYouTubeIframeAPIReady?: () => void;
    };
    if (w.YT?.Player) return resolve();
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return apiPromise;
}

interface YtPlayer {
  loadVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
}

/** YT.PlayerState 값 */
const YT_ENDED = 0;
const YT_PLAYING = 1;
const YT_PAUSED = 2;

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const player = useRef<YtPlayer | null>(null);

  const [current, setCurrent] = useState<Track | null>(PLAYLIST[0] ?? null);
  const [status, setStatus] = useState<PlayStatus>("idle");
  const [ready, setReady] = useState(false);

  /* 곡이 끝나면 다음 곡으로 넘어가야 하는데, 그 시점의 current 를 알아야 합니다.
     onStateChange 는 플레이어를 만들 때 한 번만 등록되므로 최신 값을 ref 로 들고 있습니다.

     ref 쓰기는 렌더 중이 아니라 effect 안에서 합니다.
     렌더 중에 쓰면 React 가 렌더를 버리고 다시 할 때 값이 어긋날 수 있습니다. */
  const currentRef = useRef(current);
  const advance = useRef<(step: number) => void>(() => {});

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    if (!PLAYLIST.length) return;
    let dead = false;

    // 자식(DeskPad)이 먼저 그려지므로 이 시점에 mountRef 는 채워져 있습니다.
    void loadYouTubeApi().then(() => {
      if (dead || !mountRef.current) return;
      const YT = (
        window as unknown as {
          YT: { Player: new (el: HTMLElement, o: object) => YtPlayer };
        }
      ).YT;

      player.current = new YT.Player(mountRef.current, {
        videoId: PLAYLIST[0].id,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: () => !dead && setReady(true),
          onStateChange: (e: { data: number }) => {
            if (dead) return;
            if (e.data === YT_PLAYING) setStatus("playing");
            else if (e.data === YT_PAUSED) setStatus("paused");
            else if (e.data === YT_ENDED) advance.current(1);
            else setStatus("idle");
          },
        },
      });
    });

    return () => {
      dead = true;
      player.current?.destroy();
      player.current = null;
    };
  }, []);

  /* 재생 위치를 따라 읽지 않습니다.
     진행 막대는 영상 안 유튜브 컨트롤이 이미 그리고 있어서,
     0.5초마다 도는 타이머로 같은 값을 또 만들 이유가 없습니다. */

  const select = useCallback((t: Track) => {
    setCurrent(t);
    // 사용자가 목록에서 고른 것이므로 바로 틀어도 됩니다
    player.current?.loadVideoById(t.id);
  }, []);

  /** 목록을 순환합니다. 마지막 곡이 끝나면 처음으로 돌아갑니다. */
  const step = useCallback(
    (by: number) => {
      if (!PLAYLIST.length) return;
      const i = PLAYLIST.findIndex((t) => t.id === currentRef.current?.id);
      const nextIndex =
        ((((i < 0 ? 0 : i) + by) % PLAYLIST.length) + PLAYLIST.length) %
        PLAYLIST.length;
      select(PLAYLIST[nextIndex]);
    },
    [select],
  );
  useEffect(() => {
    advance.current = step;
  }, [step]);

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  const togglePlay = useCallback(() => {
    const p = player.current;
    if (!p) return;
    if (status === "playing") p.pauseVideo();
    else p.playVideo();
  }, [status]);

  return (
    <Ctx.Provider
      value={{
        current,
        status,
        ready,
        mountRef,
        select,
        togglePlay,
        next,
        prev,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

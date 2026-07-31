"use client";

import { useRouter } from "next/navigation";

/**
 * 관리자 전용 앱을 눌렀을 때 뜨는 안내.
 *
 * ── 왜 필요한가 ──
 * `/calendar` 는 미들웨어가 막습니다. 그냥 보내면 로그인 페이지로 튕겨 나가고,
 * 방문자에게는 **아이콘을 눌렀는데 다른 사이트로 나간 것**처럼 보입니다.
 * 방에서 `LoginNotice` 가 하던 일을 폰에서 하는 화면입니다.
 *
 * ── 왜 아이콘을 감추지 않나 ──
 * 감추면 이 사이트에 캘린더가 있다는 사실 자체가 사라집니다.
 * 남겨 두고 "여긴 주인 것" 이라고 말하는 쪽이 정직합니다. 방에서 정한 것과 같습니다.
 *
 * `<dialog>` 가 아니라 그냥 겹친 카드입니다. 폰에서는 아래에서 올라오는 시트가
 * 익숙하고, 포커스 가두기는 어차피 화면 전체를 덮으므로 크게 다르지 않습니다.
 */
export function PhoneNotice({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <div
      className="phNotice"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="phNotice__card" role="dialog" aria-modal="true">
        <span className="phNotice__lock" aria-hidden="true">
          <svg viewBox="0 0 54 64" role="presentation">
            <path
              d="M15 27v-9.5a12 12 0 0124 0V27"
              fill="none"
              stroke="#8A94A6"
              strokeWidth="6.4"
              strokeLinecap="round"
            />
            <rect x="6" y="27" width="42" height="31" rx="7" fill="#8A94A6" />
            <circle cx="27" cy="41" r="4.4" fill="#fff" />
            <rect x="24.8" y="42" width="4.4" height="8" rx="2.2" fill="#fff" />
          </svg>
        </span>

        <h2>{title}는 주인만 봅니다</h2>
        <p>
          비공개 일정이라 로그인한 사람에게만 보입니다. 이 사이트를 만든 사람의
          일정이라 방문자에게는 열지 않습니다.
        </p>

        <div className="phNotice__btns">
          <button type="button" onClick={onClose}>
            알겠어요
          </button>
          <button
            type="button"
            className="phNotice__go"
            onClick={() => router.push("/login")}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}

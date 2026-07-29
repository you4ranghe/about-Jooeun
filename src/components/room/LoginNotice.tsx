"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * 비로그인 상태로 캘린더를 눌렀을 때 뜨는 안내.
 *
 * 캘린더를 아예 숨기지 않고 벽에 남겨 둔 다음 이 안내를 띄우는 쪽을 골랐습니다.
 * 방의 일부로 보이면서도 "여긴 주인 것" 이라고 정직하게 말합니다.
 *
 * <dialog> 를 씁니다. 포커스 가두기와 Esc 닫기를 브라우저가 해 주므로
 * 직접 구현한 모달보다 접근성이 확실합니다.
 */
export function LoginNotice({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="notice"
      onClose={onClose}
      // 배경(::backdrop)을 눌렀을 때만 닫습니다. 카드 안쪽 클릭은 통과시키지 않습니다.
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="notice__in">
        <span className="notice__icon" aria-hidden="true">
          <svg viewBox="0 0 54 64" role="presentation">
            <path
              d="M15 27v-9.5a12 12 0 0124 0V27"
              fill="none"
              stroke="#A7B2C4"
              strokeWidth="6.4"
              strokeLinecap="round"
            />
            <rect x="6" y="26" width="42" height="33" rx="9" fill="#8A4A3C" />
            <circle cx="27" cy="39" r="5.2" fill="#FDF6E6" />
            <path d="M27 43v7" stroke="#FDF6E6" strokeWidth="4.4" strokeLinecap="round" />
          </svg>
        </span>

        <h2 className="notice__h">여기는 제 개인 일정입니다</h2>
        <p className="notice__p">
          캘린더에 적힌 내용은 저만 볼 수 있습니다. 방문자에게는 어떤 경로로도 보이지 않습니다.
          일정은 데이터베이스 정책으로 막혀 있어서, 화면을 우회해도 읽히지 않습니다.
        </p>

        <div className="notice__actions">
          <button type="button" className="notice__go" onClick={() => router.push("/login?next=/calendar")}>
            로그인하러 가기
          </button>
          <button type="button" className="notice__close" onClick={onClose}>
            둘러보기로 돌아가기
          </button>
        </div>

        <p className="notice__foot">
          채용 담당자시라면 책상 위 <strong>모니터</strong>에 프로젝트 12개가 있습니다.
        </p>
      </div>
    </dialog>
  );
}

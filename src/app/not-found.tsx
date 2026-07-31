import Link from "next/link";
import "@/styles/oops.css";

/**
 * 없는 주소로 들어왔을 때.
 *
 * 이게 없으면 Next 의 기본 흑백 화면이 뜹니다. **방도 폰도 아니라
 * 갑자기 다른 사이트가 됩니다.** 오타 난 링크를 받은 사람이 처음 보는 화면일 수
 * 있어서, 여기서도 이 방의 색과 말투를 지킵니다.
 *
 * 방을 통째로 그리지는 않습니다. 카메라도 날씨도 필요 없는 화면에
 * 그 무게를 지울 이유가 없고, 여기서 할 일은 하나뿐입니다 — 돌아가는 길을 주는 것.
 */
export default function NotFound() {
  return (
    <main className="oops">
      <div className="oops__in">
        <p className="oops__k">404</p>
        <h1 className="oops__h">그 방에는 아무것도 없습니다</h1>
        <p className="oops__p">
          주소가 잘못됐거나, 있던 것이 옮겨 갔습니다.
          <br />
          작업실로 돌아가면 책상 위 모니터에 만든 것들이 있습니다.
        </p>
        <Link className="oops__btn" href="/">
          작업실로 돌아가기
        </Link>
      </div>
    </main>
  );
}

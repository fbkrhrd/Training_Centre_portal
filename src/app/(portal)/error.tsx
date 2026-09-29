"use client";

import Link from "next/link";

export default function PortalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="content-panel">
      <section className="content-card">
        <h1>요청을 처리하지 못했습니다</h1>
        <p>표시할 데이터가 없습니다</p>
        <div className="button-row">
          <button className="button button--primary" onClick={reset}>
            다시 시도
          </button>
          <Link className="button button--quiet" href="/">
            홈으로 이동
          </Link>
        </div>
      </section>
    </main>
  );
}

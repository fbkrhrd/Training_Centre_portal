export default function PortalLoading() {
  return (
    <section className="portal-loading" role="status" aria-live="polite">
      <span className="portal-loading__indicator" aria-hidden="true" />
      <p>화면을 불러오는 중입니다</p>
    </section>
  );
}

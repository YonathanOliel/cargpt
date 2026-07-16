'use client';

/** Loading placeholder shown while a diagnosis is being computed. */
export function ResultSkeleton() {
  return (
    <div className="card" aria-hidden="true">
      <div className="skeleton sk-badge" />
      <div className="skeleton sk-line" />
      <div className="skeleton sk-bar" />
      <div className="skeleton sk-bar" />
      <div className="skeleton sk-bar" />
    </div>
  );
}

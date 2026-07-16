'use client';

import type { DiagnosisResult, Urgency } from '../lib/api';

const URGENCY_LABEL: Record<Urgency, string> = {
  green: 'אפשר להמשיך לנסוע',
  yellow: 'מומלץ לבדוק בקרוב',
  red: 'מומלץ לעצור ולבדוק',
};

const URGENCY_ICON: Record<Urgency, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};

const shekel = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
});

export function ResultCard({ result }: { result: DiagnosisResult }) {
  return (
    <section className="card" aria-label="תוצאת אבחון">
      <span className={`urgency ${result.urgency}`} role="status">
        <span aria-hidden="true">{URGENCY_ICON[result.urgency]}</span>
        {URGENCY_LABEL[result.urgency]}
      </span>
      <p className="summary">{result.summary}</p>

      <ol className="hyp-list">
        {result.hypotheses.map((h) => {
          const pct = Math.round(h.probability * 100);
          return (
            <li className="hyp" key={h.label}>
              <div className="hyp-head">
                <span>{h.label}</span>
                <span className="hyp-pct">{pct}%</span>
              </div>
              <div
                className="bar"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`הסתברות ל${h.label}`}
              >
                <span style={{ width: `${pct}%` }} />
              </div>
              <p className="reason">{h.reasoning}</p>
              <div className="price">
                <div className="box">
                  <b>{shekel.format(h.price.low)}</b>
                  <span>נמוך</span>
                </div>
                <div className="box">
                  <b>{shekel.format(h.price.avg)}</b>
                  <span>ממוצע</span>
                </div>
                <div className="box">
                  <b>{shekel.format(h.price.high)}</b>
                  <span>גבוה</span>
                </div>
              </div>
              {h.sources && h.sources.length > 0 && (
                <div className="sources">
                  <span className="sources-label">מקורות:</span>
                  {h.sources.map((s) => (
                    <span key={`${s.publisher}-${s.title}`} className="source-chip" title={s.title}>
                      {s.publisher}
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <p className="disclaimer">{result.disclaimer}</p>
    </section>
  );
}

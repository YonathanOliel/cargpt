'use client';

import { useState } from 'react';
import {
  startDiagnosis,
  submitAnswers,
  type DiagnosisResponse,
  type DiagnosisResult,
  type FollowUpQuestion,
  type Urgency,
} from '../lib/api';

const URGENCY_LABEL: Record<Urgency, string> = {
  green: '🟢 אפשר להמשיך לנסוע',
  yellow: '🟡 מומלץ לבדוק בקרוב',
  red: '🔴 מומלץ לעצור ולבדוק',
};

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [diagnosisId, setDiagnosisId] = useState('');
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  function apply(res: DiagnosisResponse) {
    setDiagnosisId(res.diagnosisId);
    if (res.status === 'complete' && res.result) {
      setResult(res.result);
      setQuestions([]);
    } else {
      setQuestions(res.followUpQuestions ?? []);
      setResult(null);
    }
  }

  async function onStart() {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setQuestions([]);
    try {
      apply(await startDiagnosis(text.trim()));
    } catch {
      setError('שגיאה בחיבור לשרת. ודא שה-API רץ על פורט 3000.');
    } finally {
      setLoading(false);
    }
  }

  async function onAnswer(questionId: string, answer: string) {
    setLoading(true);
    setError('');
    try {
      apply(await submitAnswers(diagnosisId, [{ questionId, answer }]));
    } catch {
      setError('שגיאה בשליחת התשובה.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setText('');
    setResult(null);
    setQuestions([]);
    setDiagnosisId('');
    setError('');
  }

  return (
    <main className="container">
      <div className="brand">
        <span className="dot" />
        CarGPT
      </div>
      <p className="subtitle">תאר/י מה קורה עם הרכב — ונבין יחד מה כנראה הבעיה, כמה זה עולה, וכמה זה דחוף.</p>

      <div className="card">
        <div className="field">
          <textarea
            rows={2}
            placeholder="לדוגמה: יש רעש בזמן פנייה ימינה / נדלקה נורת מנוע / הרכב רועד בסרק"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          <button className="btn" onClick={onStart} disabled={loading || !text.trim()}>
            {loading ? 'מנתח…' : 'אבחן'}
          </button>
          {(result || questions.length > 0) && (
            <button className="btn" style={{ background: '#2c2c2e' }} onClick={reset}>
              התחל מחדש
            </button>
          )}
        </div>
        {error && <p className="reason" style={{ color: 'var(--danger)' }}>{error}</p>}
      </div>

      {questions.length > 0 && (
        <div className="card">
          {questions.map((q) => (
            <div key={q.id}>
              <div className="q">{q.question}</div>
              <div className="chips">
                {(q.options.length ? q.options : ['כן', 'לא']).map((opt) => (
                  <button
                    key={opt}
                    className="chip"
                    disabled={loading}
                    onClick={() => onAnswer(q.id, opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className="card">
          <span className={`urgency ${result.urgency}`}>{URGENCY_LABEL[result.urgency]}</span>
          <p style={{ marginTop: 12 }}>{result.summary}</p>

          {result.hypotheses.map((h) => (
            <div className="hyp" key={h.label}>
              <div className="hyp-head">
                <span>{h.label}</span>
                <span>{Math.round(h.probability * 100)}%</span>
              </div>
              <div className="bar">
                <span style={{ width: `${Math.round(h.probability * 100)}%` }} />
              </div>
              <p className="reason">{h.reasoning}</p>
              <div className="price">
                <div className="box">
                  <b>₪{h.price.low}</b>
                  <span>נמוך</span>
                </div>
                <div className="box">
                  <b>₪{h.price.avg}</b>
                  <span>ממוצע</span>
                </div>
                <div className="box">
                  <b>₪{h.price.high}</b>
                  <span>גבוה</span>
                </div>
              </div>
            </div>
          ))}

          <p className="disclaimer">{result.disclaimer}</p>
        </div>
      )}
    </main>
  );
}

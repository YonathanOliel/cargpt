'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createVehicle,
  listVehicles,
  requestOtp,
  startDiagnosis,
  startDiagnosisFromImage,
  submitAnswers,
  verifyOtp,
  type DiagnosisResponse,
  type DiagnosisResult,
  type FollowUpQuestion,
  type Urgency,
  type Vehicle,
  type VisionSummary,
} from '../lib/api';

const URGENCY_LABEL: Record<Urgency, string> = {
  green: '🟢 אפשר להמשיך לנסוע',
  yellow: '🟡 מומלץ לבדוק בקרוב',
  red: '🔴 מומלץ לעצור ולבדוק',
};

export default function Home() {
  // Auth
  const [token, setToken] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState('');

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({ make: '', model: '', year: '' });

  // Diagnosis
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [diagnosisId, setDiagnosisId] = useState('');
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [vision, setVision] = useState<VisionSummary | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = localStorage.getItem('cargpt_token');
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    listVehicles(token).then(setVehicles).catch(() => undefined);
  }, [token]);

  /* ---------- Auth handlers ---------- */
  async function onSendOtp() {
    setError('');
    try {
      const res = await requestOtp(phone);
      setOtpSent(true);
      if (res.devCode) {
        setDevCode(res.devCode);
        setCode(res.devCode);
      }
    } catch {
      setError('מספר טלפון לא תקין (למשל 0501234567).');
    }
  }

  async function onVerifyOtp() {
    setError('');
    try {
      const t = await verifyOtp(phone, code);
      localStorage.setItem('cargpt_token', t.accessToken);
      setToken(t.accessToken);
      setOtpSent(false);
      setDevCode('');
    } catch {
      setError('קוד שגוי או שפג תוקפו.');
    }
  }

  function logout() {
    localStorage.removeItem('cargpt_token');
    setToken(null);
    setVehicles([]);
    setSelected(null);
  }

  async function onAddVehicle() {
    if (!token || !newVehicle.make || !newVehicle.model || !newVehicle.year) return;
    try {
      const v = await createVehicle(token, {
        make: newVehicle.make,
        model: newVehicle.model,
        year: Number(newVehicle.year),
      });
      setVehicles((prev) => [...prev, v]);
      setSelected(v);
      setNewVehicle({ make: '', model: '', year: '' });
    } catch {
      setError('שגיאה בהוספת רכב.');
    }
  }

  /* ---------- Diagnosis handlers ---------- */
  function apply(res: DiagnosisResponse) {
    setDiagnosisId(res.diagnosisId);
    setVision(res.vision ?? null);
    if (res.status === 'complete' && res.result) {
      setResult(res.result);
      setQuestions([]);
    } else {
      setQuestions(res.followUpQuestions ?? []);
      setResult(null);
    }
  }

  function beforeRun() {
    setLoading(true);
    setError('');
    setResult(null);
    setQuestions([]);
    setVision(null);
  }

  async function onStart() {
    if (!text.trim()) return;
    beforeRun();
    try {
      apply(await startDiagnosis(text.trim(), selected ?? undefined));
    } catch {
      setError('שגיאה בחיבור לשרת. ודא שה-API רץ על פורט 3000.');
    } finally {
      setLoading(false);
    }
  }

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    beforeRun();
    try {
      apply(await startDiagnosisFromImage(file));
    } catch {
      setError('שגיאה בניתוח התמונה.');
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
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
    setVision(null);
    setError('');
  }

  return (
    <main className="container">
      <div className="topbar">
        <div className="brand">
          <span className="dot" />
          CarGPT
        </div>
        {token ? (
          <button className="link" onClick={logout}>
            התנתק
          </button>
        ) : null}
      </div>
      <p className="subtitle">
        תאר/י מה קורה עם הרכב — ונבין יחד מה כנראה הבעיה, כמה זה עולה, וכמה זה דחוף.
      </p>

      {/* Login */}
      {!token && (
        <div className="card">
          <div className="section-title">התחברות</div>
          {!otpSent ? (
            <div className="row">
              <input
                placeholder="מספר טלפון (0501234567)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ maxWidth: 220 }}
              />
              <button className="btn" onClick={onSendOtp} disabled={!phone}>
                שלח קוד
              </button>
            </div>
          ) : (
            <div className="row">
              <input
                placeholder="קוד בן 6 ספרות"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ maxWidth: 160 }}
              />
              <button className="btn" onClick={onVerifyOtp} disabled={code.length !== 6}>
                התחבר
              </button>
              {devCode && <span className="muted">קוד לפיתוח: {devCode}</span>}
            </div>
          )}
          <p className="muted" style={{ marginTop: 10 }}>
            התחברות מאפשרת לשמור רכבים והיסטוריה. אפשר גם לאבחן בלי להתחבר.
          </p>
        </div>
      )}

      {/* Vehicles */}
      {token && (
        <div className="card">
          <div className="section-title">הרכבים שלי</div>
          <div className="row" style={{ marginBottom: 10 }}>
            {vehicles.map((v) => (
              <button
                key={v.id}
                className={`veh-chip ${selected?.id === v.id ? 'active' : ''}`}
                onClick={() => setSelected(v)}
              >
                {v.make} {v.model} '{String(v.year).slice(-2)}
              </button>
            ))}
            {vehicles.length === 0 && <span className="muted">עדיין אין רכבים — הוסף אחד:</span>}
          </div>
          <div className="row">
            <input
              placeholder="יצרן"
              value={newVehicle.make}
              onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
              style={{ maxWidth: 120 }}
            />
            <input
              placeholder="דגם"
              value={newVehicle.model}
              onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
              style={{ maxWidth: 120 }}
            />
            <input
              placeholder="שנה"
              value={newVehicle.year}
              onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
              style={{ maxWidth: 90 }}
            />
            <button className="btn" onClick={onAddVehicle}>
              הוסף
            </button>
          </div>
        </div>
      )}

      {/* Diagnosis input */}
      <div className="card">
        {selected && <div className="muted" style={{ marginBottom: 8 }}>מאבחן עבור: {selected.make} {selected.model}</div>}
        <div className="field">
          <textarea
            rows={2}
            placeholder="לדוגמה: יש רעש בזמן פנייה ימינה / נדלקה נורת מנוע / הרכב רועד בסרק"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn" onClick={onStart} disabled={loading || !text.trim()}>
            {loading ? 'מנתח…' : 'אבחן'}
          </button>
          <button
            className="file-btn"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
          >
            📷 צלם/העלה נורה
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onImage}
          />
          {(result || questions.length > 0 || vision) && (
            <button className="btn" style={{ background: '#2c2c2e' }} onClick={reset}>
              התחל מחדש
            </button>
          )}
        </div>
        {error && <p className="reason" style={{ color: 'var(--danger)' }}>{error}</p>}
      </div>

      {/* Vision summary */}
      {vision && (
        <div className="vision">
          🔍 זוהה מהתמונה: <b>{vision.detectedLabel}</b> — {vision.description} (ביטחון{' '}
          {Math.round(vision.confidence * 100)}%)
        </div>
      )}

      {/* Follow-up questions */}
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

      {/* Result */}
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

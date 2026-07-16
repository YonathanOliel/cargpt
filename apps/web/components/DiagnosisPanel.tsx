'use client';

import { forwardRef } from 'react';
import type { Vehicle } from '../lib/api';

interface Props {
  text: string;
  setText: (v: string) => void;
  loading: boolean;
  selected: Vehicle | null;
  hasActivity: boolean;
  onStart: () => void;
  onPickImage: () => void;
  onImage: (file: File) => void;
  onReset: () => void;
}

export const DiagnosisPanel = forwardRef<HTMLInputElement, Props>(function DiagnosisPanel(
  { text, setText, loading, selected, hasActivity, onStart, onPickImage, onImage, onReset },
  fileRef,
) {
  return (
    <section className="card" aria-labelledby="diag-title">
      <h2 id="diag-title" className="sr-only">
        אבחון תקלה
      </h2>
      {selected && (
        <p className="muted mb-8">
          מאבחן עבור: {selected.make} {selected.model}
        </p>
      )}

      <label className="sr-only" htmlFor="complaint">
        תיאור התקלה
      </label>
      <textarea
        id="complaint"
        rows={2}
        placeholder="לדוגמה: יש רעש בזמן פנייה ימינה / נדלקה נורת מנוע / הרכב רועד בסרק"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onStart();
        }}
      />

      <div className="row mt-10">
        <button className="btn" onClick={onStart} disabled={loading || !text.trim()}>
          {loading ? 'מנתח…' : 'אבחן'}
        </button>
        <button className="file-btn" onClick={onPickImage} disabled={loading}>
          <span aria-hidden="true">📷</span> צלם/העלה נורה
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          aria-label="העלאת תמונת נורה או תקלה"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImage(file);
          }}
        />
        {hasActivity && (
          <button className="btn btn-ghost" onClick={onReset}>
            התחל מחדש
          </button>
        )}
      </div>
    </section>
  );
});

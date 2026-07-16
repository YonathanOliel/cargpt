'use client';

import type { FollowUpQuestion } from '../lib/api';

interface Props {
  questions: FollowUpQuestion[];
  loading: boolean;
  onAnswer: (questionId: string, answer: string) => void;
}

export function FollowUps({ questions, loading, onAnswer }: Props) {
  if (questions.length === 0) return null;

  return (
    <section className="card" aria-label="שאלות המשך">
      {questions.map((q) => (
        <div key={q.id} className="followup">
          <p className="q" id={`q-${q.id}`}>
            {q.question}
          </p>
          <div className="chips" role="group" aria-labelledby={`q-${q.id}`}>
            {(q.options.length ? q.options : ['כן', 'לא']).map((opt) => (
              <button
                key={opt}
                type="button"
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
    </section>
  );
}

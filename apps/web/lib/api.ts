const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

export type Urgency = 'green' | 'yellow' | 'red';

export interface FollowUpQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface PriceEstimate {
  low: number;
  avg: number;
  high: number;
  currency: string;
}

export interface Hypothesis {
  label: string;
  probability: number;
  confidence: number;
  reasoning: string;
  price: PriceEstimate;
  estLaborHours?: number;
  riskLevel: Urgency;
}

export interface DiagnosisResult {
  diagnosisId: string;
  urgency: Urgency;
  summary: string;
  hypotheses: Hypothesis[];
  disclaimer: string;
}

export interface DiagnosisResponse {
  diagnosisId: string;
  status: 'needs_followup' | 'complete';
  followUpQuestions?: FollowUpQuestion[];
  result?: DiagnosisResult;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export function startDiagnosis(text: string): Promise<DiagnosisResponse> {
  return post('/diagnoses', {
    vehicle: { make: 'Generic', model: 'Car', year: 2019 },
    inputType: 'text',
    text,
  });
}

export function submitAnswers(
  diagnosisId: string,
  answers: { questionId: string; answer: string }[],
): Promise<DiagnosisResponse> {
  return post(`/diagnoses/${diagnosisId}/answers`, { answers });
}

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

export interface Source {
  title: string;
  publisher: string;
  type: 'manufacturer' | 'regulator' | 'community' | 'standard' | 'reference';
}

export interface Hypothesis {
  label: string;
  probability: number;
  confidence: number;
  reasoning: string;
  price: PriceEstimate;
  estLaborHours?: number;
  riskLevel: Urgency;
  sources?: Source[];
}

export interface DiagnosisResult {
  diagnosisId: string;
  urgency: Urgency;
  summary: string;
  hypotheses: Hypothesis[];
  disclaimer: string;
}

export interface VisionSummary {
  detectedLabel: string;
  description: string;
  confidence: number;
}

export interface DiagnosisResponse {
  diagnosisId: string;
  status: 'needs_followup' | 'complete';
  followUpQuestions?: FollowUpQuestion[];
  result?: DiagnosisResult;
  vision?: VisionSummary;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  mileage?: number;
}

async function req<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'לא ניתן להתחבר לשרת. בדוק/י את החיבור ונסה/י שוב.');
  }

  if (!res.ok) {
    throw new ApiError(res.status, await messageFor(res));
  }
  return res.json() as Promise<T>;
}

/** Error carrying the HTTP status so callers can react to specific cases. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function messageFor(res: Response): Promise<string> {
  if (res.status === 429) return 'יותר מדי בקשות — נסה/י שוב בעוד רגע.';
  if (res.status === 401) return 'ההתחברות פגה — התחבר/י מחדש.';
  try {
    const body = (await res.json()) as { message?: string };
    if (body?.message) return body.message;
  } catch {
    /* ignore non-JSON bodies */
  }
  return 'אירעה שגיאה. נסה/י שוב.';
}

function json(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

/* ---------- Auth ---------- */
export function requestOtp(phone: string): Promise<{ sent: boolean; devCode?: string }> {
  return req('/auth/otp/request', json({ phone }));
}

export function verifyOtp(
  phone: string,
  code: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  return req('/auth/otp/verify', json({ phone, code }));
}

/* ---------- Vehicles ---------- */
export function listVehicles(token: string): Promise<Vehicle[]> {
  return req('/vehicles', {}, token);
}

export function createVehicle(
  token: string,
  data: { make: string; model: string; year: number; mileage?: number },
): Promise<Vehicle> {
  return req('/vehicles', json(data), token);
}

/* ---------- Diagnosis ---------- */
export function startDiagnosis(text: string, vehicle?: Vehicle): Promise<DiagnosisResponse> {
  const v = vehicle
    ? { make: vehicle.make, model: vehicle.model, year: vehicle.year, engine: vehicle.engine, mileage: vehicle.mileage }
    : { make: 'Generic', model: 'Car', year: 2019 };
  return req(
    '/diagnoses',
    json({
      vehicle: v,
      inputType: 'text',
      text,
    }),
  );
}

export function startDiagnosisFromImage(file: File): Promise<DiagnosisResponse> {
  const form = new FormData();
  form.append('image', file);
  return req('/diagnoses/image', { method: 'POST', body: form });
}

export function submitAnswers(
  diagnosisId: string,
  answers: { questionId: string; answer: string }[],
): Promise<DiagnosisResponse> {
  return req(`/diagnoses/${diagnosisId}/answers`, json({ answers }));
}

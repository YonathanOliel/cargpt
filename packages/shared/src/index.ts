/**
 * Shared domain contracts for CarGPT.
 * These types are the stable boundary between the API, the AI layer and clients.
 */

export type UserRole = 'driver' | 'garage' | 'admin';

/** Traffic-light urgency shown to the driver. */
export type UrgencyLevel = 'green' | 'yellow' | 'red';

/** How the driver described the problem. */
export type DiagnosisInputType = 'text' | 'image';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  mileage?: number;
}

/** A single possible cause with its probability and price estimate. */
export interface DiagnosisHypothesis {
  /** Human-readable cause, e.g. "מיסב גלגל". */
  label: string;
  /** 0..1, probabilities across hypotheses should sum to ~1. */
  probability: number;
  /** 0..1, model confidence in this specific hypothesis. */
  confidence: number;
  /** Short explanation of why this is likely. */
  reasoning: string;
  price: PriceEstimate;
  estLaborHours?: number;
  riskLevel: UrgencyLevel;
}

export interface PriceEstimate {
  low: number;
  avg: number;
  high: number;
  currency: 'ILS';
}

/** An adaptive follow-up question the AI asks before concluding. */
export interface FollowUpQuestion {
  id: string;
  question: string;
  /** Quick-reply chips; empty means free text. */
  options: string[];
}

export interface DiagnosisResult {
  diagnosisId: string;
  urgency: UrgencyLevel;
  summary: string;
  hypotheses: DiagnosisHypothesis[];
  /** Mandatory safety/legal note. Always present. */
  disclaimer: string;
}

/** Request to start a diagnosis. */
export interface StartDiagnosisRequest {
  vehicle: Vehicle;
  inputType: DiagnosisInputType;
  text?: string;
}

/** Either follow-up questions are needed, or a final result is returned. */
export interface StartDiagnosisResponse {
  diagnosisId: string;
  status: 'needs_followup' | 'complete';
  followUpQuestions?: FollowUpQuestion[];
  result?: DiagnosisResult;
}

export interface FollowUpAnswer {
  questionId: string;
  answer: string;
}

export const SAFETY_DISCLAIMER =
  'זוהי הערכה ראשונית מבוססת AI ואינה תחליף לבדיקה של מכונאי מוסמך. בכל ספק בטיחותי, אנא הימנעו מנסיעה ופנו למוסך.';

/** Authenticated user identity carried in the JWT and request context. */
export interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
  name?: string;
  region?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

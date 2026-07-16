import type {
  FollowUpAnswer,
  FollowUpQuestion,
  PriceEstimate,
  Source,
  UrgencyLevel,
  Vehicle,
} from '@cargpt/shared';

/** Injection token so the LLM provider can be swapped without touching logic. */
export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

export interface DiagnosisPrompt {
  vehicle: Vehicle;
  complaint: string;
  answers: FollowUpAnswer[];
}

/** A hypothesis exactly as returned by a provider (before guardrails). */
export interface RawHypothesis {
  label: string;
  probability: number;
  confidence: number;
  reasoning: string;
  price: PriceEstimate;
  estLaborHours?: number;
  riskLevel: UrgencyLevel;
  sources?: Source[];
}

/**
 * A provider either asks for more info (followUpQuestions)
 * or returns hypotheses. The orchestrating service decides what to do.
 */
export interface RawDiagnosis {
  needsFollowUp: boolean;
  followUpQuestions?: FollowUpQuestion[];
  summary?: string;
  hypotheses?: RawHypothesis[];
}

/**
 * Provider-agnostic contract. Implementations: MockLlmProvider (now),
 * OpenAI/Anthropic/Gemini adapters (next). Logic never depends on a concrete provider.
 */
export interface LlmProvider {
  readonly name: string;
  generateDiagnosis(prompt: DiagnosisPrompt): Promise<RawDiagnosis>;
}

import type { UrgencyLevel } from '@cargpt/shared';
import type { RawHypothesis } from '../../ai/contracts/llm-provider';

const RANK: Record<UrgencyLevel, number> = { green: 0, yellow: 1, red: 2 };

/**
 * Safety-critical keywords. If the complaint mentions any of these,
 * urgency is escalated to at least yellow — never green — to avoid
 * telling a driver a potentially dangerous fault is safe.
 */
const SAFETY_KEYWORDS = [
  'בלם',
  'בלמים',
  'בלימה',
  'ברקס',
  'היגוי',
  'הגה',
  'צמיג',
  'גלגל',
  'עשן',
  'חום',
  'מתחמם',
  'רתיחה',
];

/** Highest risk among hypotheses. */
export function worstRisk(hypotheses: RawHypothesis[]): UrgencyLevel {
  return hypotheses.reduce<UrgencyLevel>(
    (worst, h) => (RANK[h.riskLevel] > RANK[worst] ? h.riskLevel : worst),
    'green',
  );
}

/**
 * Computes final urgency and applies safety guardrails.
 * The result is the more severe of: model risk vs. keyword-based floor.
 */
export function resolveUrgency(complaint: string, hypotheses: RawHypothesis[]): UrgencyLevel {
  let urgency = worstRisk(hypotheses);

  const text = complaint.toLowerCase();
  const hasSafetyKeyword = SAFETY_KEYWORDS.some((k) => text.includes(k.toLowerCase()));

  // Guardrail: safety-related complaints can never be "green".
  if (hasSafetyKeyword && RANK[urgency] < RANK.yellow) {
    urgency = 'yellow';
  }

  return urgency;
}

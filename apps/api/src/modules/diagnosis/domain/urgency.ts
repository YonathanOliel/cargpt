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

/** Minimum cumulative probability at a risk level for it to drive urgency. */
const RISK_PROBABILITY_THRESHOLD = 0.25;

/**
 * Computes final urgency using a probability-weighted model, then applies
 * safety guardrails.
 *
 * Rationale: the highest-risk hypothesis alone should not dominate — a 5%
 * chance of a red-level fault should not paint the whole result red. Instead
 * we look at how much probability mass sits at each risk level.
 *
 * - red    if cumulative red probability >= threshold
 * - yellow if cumulative (red + yellow) probability >= threshold
 * - green  otherwise
 *
 * A safety-related complaint (brakes, steering, tyres, overheating...) can
 * never resolve to green — it is floored at yellow.
 */
export function resolveUrgency(complaint: string, hypotheses: RawHypothesis[]): UrgencyLevel {
  const redProb = sumProbability(hypotheses, 'red');
  const yellowProb = sumProbability(hypotheses, 'yellow');

  let urgency: UrgencyLevel;
  if (redProb >= RISK_PROBABILITY_THRESHOLD) {
    urgency = 'red';
  } else if (redProb + yellowProb >= RISK_PROBABILITY_THRESHOLD) {
    urgency = 'yellow';
  } else {
    urgency = 'green';
  }

  const text = complaint.toLowerCase();
  const hasSafetyKeyword = SAFETY_KEYWORDS.some((k) => text.includes(k.toLowerCase()));

  // Guardrail: safety-related complaints can never be "green".
  if (hasSafetyKeyword && RANK[urgency] < RANK.yellow) {
    urgency = 'yellow';
  }

  return urgency;
}

function sumProbability(hypotheses: RawHypothesis[], level: UrgencyLevel): number {
  return hypotheses
    .filter((h) => h.riskLevel === level)
    .reduce((sum, h) => sum + h.probability, 0);
}

/** Human-readable action phrase matching a resolved urgency level. */
export function urgencyAction(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'red':
      return 'מומלץ להימנע מנסיעה עד לבדיקה';
    case 'yellow':
      return 'ניתן לנסוע בזהירות ולבדוק בקרוב';
    case 'green':
    default:
      return 'אין דחיפות מיידית';
  }
}

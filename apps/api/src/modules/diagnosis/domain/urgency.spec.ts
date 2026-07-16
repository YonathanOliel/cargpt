import { resolveUrgency, worstRisk } from './urgency';
import type { RawHypothesis } from '../../ai/contracts/llm-provider';

function hyp(
  label: string,
  probability: number,
  riskLevel: RawHypothesis['riskLevel'],
): RawHypothesis {
  return {
    label,
    probability,
    confidence: 0.6,
    reasoning: '',
    price: { low: 0, avg: 0, high: 0, currency: 'ILS' },
    riskLevel,
  };
}

describe('resolveUrgency', () => {
  it('does not paint everything red for a low-probability red hypothesis', () => {
    const hypotheses = [
      hyp('מיסב גלגל', 0.8, 'yellow'),
      hyp('בולם', 0.15, 'yellow'),
      hyp('בלם', 0.05, 'red'),
    ];
    // 5% red mass is below threshold -> yellow, not red.
    expect(resolveUrgency('רעש בפנייה', hypotheses)).toBe('yellow');
  });

  it('returns red when red probability mass is significant', () => {
    const hypotheses = [hyp('רפידות', 0.7, 'red'), hyp('דיסקים', 0.3, 'red')];
    expect(resolveUrgency('בעיה בבלמים', hypotheses)).toBe('red');
  });

  it('returns green for a benign, non-safety complaint', () => {
    const hypotheses = [hyp('מצתים', 0.9, 'green'), hyp('חיישן', 0.1, 'green')];
    expect(resolveUrgency('צריכת דלק גבוהה', hypotheses)).toBe('green');
  });

  it('floors safety complaints at yellow even when hypotheses are benign', () => {
    const hypotheses = [hyp('לחץ אוויר', 0.95, 'green'), hyp('חיישן', 0.05, 'green')];
    // "צמיג" is a safety keyword.
    expect(resolveUrgency('רעש מהצמיג', hypotheses)).toBe('yellow');
  });

  it('worstRisk still reports the highest present risk', () => {
    const hypotheses = [hyp('a', 0.9, 'yellow'), hyp('b', 0.1, 'red')];
    expect(worstRisk(hypotheses)).toBe('red');
  });
});

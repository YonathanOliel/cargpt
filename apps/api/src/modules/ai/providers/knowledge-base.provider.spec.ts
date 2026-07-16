import { KnowledgeBaseProvider } from './knowledge-base.provider';
import type { DiagnosisPrompt } from '../contracts/llm-provider';
import type { Vehicle } from '@cargpt/shared';

const vehicle: Vehicle = { id: 'v1', make: 'Mazda', model: '3', year: 2019 };

function prompt(complaint: string, answers: { questionId: string; answer: string }[] = []): DiagnosisPrompt {
  return { vehicle, complaint, answers };
}

describe('KnowledgeBaseProvider', () => {
  const provider = new KnowledgeBaseProvider();

  it('answers free-text about a topic beyond the original four patterns', async () => {
    const res = await provider.generateDiagnosis(prompt('המנוע מתחמם ויש ריח של רתיחה'));
    expect(res.needsFollowUp).toBe(false);
    expect(res.hypotheses?.length).toBeGreaterThan(0);
    expect(res.hypotheses![0].label).toContain('תרמוסטט');
  });

  it('attaches verified sources to every hypothesis', async () => {
    const res = await provider.generateDiagnosis(prompt('הרכב לא מתניע בבוקר'));
    expect(res.hypotheses!.every((h) => (h.sources?.length ?? 0) > 0)).toBe(true);
    expect(res.hypotheses![0].sources![0].publisher).toBeTruthy();
  });

  it('handles unknown input by asking a universal question, then giving sourced guidance', async () => {
    const first = await provider.generateDiagnosis(prompt('משהו מוזר קורה לי ברכב'));
    expect(first.needsFollowUp).toBe(true);
    expect(first.followUpQuestions![0].id).toBe('area');

    // After answering the universal question with no useful area, we still get guidance.
    const second = await provider.generateDiagnosis(
      prompt('משהו מוזר קורה לי ברכב', [{ questionId: 'area', answer: 'לא יודע' }]),
    );
    expect(second.needsFollowUp).toBe(false);
    expect(second.hypotheses!.some((h) => h.label.includes('OBD'))).toBe(true);
    expect(second.hypotheses!.every((h) => (h.sources?.length ?? 0) > 0)).toBe(true);
  });

  it('routes a vague complaint to a real topic once the area is chosen', async () => {
    const res = await provider.generateDiagnosis(
      prompt('יש לי בעיה', [{ questionId: 'area', answer: 'בלמים' }]),
    );
    expect(res.needsFollowUp).toBe(false);
    expect(res.hypotheses!.some((h) => h.label.includes('בלם'))).toBe(true);
  });
});

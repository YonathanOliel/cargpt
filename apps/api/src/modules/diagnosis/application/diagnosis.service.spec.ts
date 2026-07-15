import { DiagnosisService } from './diagnosis.service';
import { MockLlmProvider } from '../../ai/providers/mock-llm.provider';
import { InMemoryDiagnosisRepository } from '../infrastructure/in-memory-diagnosis.repository';
import type { StartDiagnosisRequest, Vehicle } from '@cargpt/shared';

const vehicle: Vehicle = { id: 'v1', make: 'Mazda', model: '3', year: 2019 };

function makeService(): DiagnosisService {
  return new DiagnosisService(new MockLlmProvider(), new InMemoryDiagnosisRepository());
}

describe('DiagnosisService', () => {
  it('asks follow-up questions before concluding', async () => {
    const service = makeService();
    const req: StartDiagnosisRequest = {
      vehicle,
      inputType: 'text',
      text: 'יש רעש בזמן פנייה ימינה',
    };

    const res = await service.start(req);

    expect(res.status).toBe('needs_followup');
    expect(res.followUpQuestions?.length).toBeGreaterThan(0);
  });

  it('returns probabilistic hypotheses that sum to ~1 after answers', async () => {
    const service = makeService();
    const started = await service.start({
      vehicle,
      inputType: 'text',
      text: 'יש רעש בזמן פנייה',
    });

    const completed = await service.submitAnswers(started.diagnosisId, [
      { questionId: 'when', answer: 'רק בפנייה' },
      { questionId: 'warning-light', answer: 'לא' },
    ]);

    expect(completed.status).toBe('complete');
    const hypotheses = completed.result!.hypotheses;
    const sum = hypotheses.reduce((s, h) => s + h.probability, 0);
    expect(sum).toBeGreaterThan(0.95);
    expect(sum).toBeLessThan(1.05);
    // Sorted by probability descending.
    expect(hypotheses[0].probability).toBeGreaterThanOrEqual(hypotheses[1].probability);
  });

  it('always attaches a safety disclaimer', async () => {
    const service = makeService();
    const started = await service.start({ vehicle, inputType: 'text', text: 'בלמים חורקים' });
    const done =
      started.status === 'complete'
        ? started
        : await service.submitAnswers(started.diagnosisId, [
            { questionId: 'x', answer: 'y' },
          ]);
    expect(done.result!.disclaimer).toContain('מכונאי');
  });

  it('never returns green urgency for a brake (safety) complaint', async () => {
    const service = makeService();
    const started = await service.start({ vehicle, inputType: 'text', text: 'בעיה בבלמים' });
    expect(started.status).toBe('complete');
    expect(started.result!.urgency).not.toBe('green');
  });
});

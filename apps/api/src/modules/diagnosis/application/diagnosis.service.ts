import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  SAFETY_DISCLAIMER,
  type DiagnosisHypothesis,
  type DiagnosisResult,
  type FollowUpAnswer,
  type StartDiagnosisRequest,
  type StartDiagnosisResponse,
  type UrgencyLevel,
  type Vehicle,
} from '@cargpt/shared';
import { LLM_PROVIDER, type LlmProvider } from '../../ai/contracts/llm-provider';
import type { RawHypothesis } from '../../ai/contracts/llm-provider';
import {
  VISION_PROVIDER,
  type VisionInput,
  type VisionProvider,
} from '../../ai/contracts/vision-provider';
import {
  DIAGNOSIS_REPOSITORY,
  type DiagnosisRepository,
  type DiagnosisSession,
} from '../domain/diagnosis.types';
import { resolveUrgency, urgencyAction } from '../domain/urgency';

@Injectable()
export class DiagnosisService {
  constructor(
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
    @Inject(VISION_PROVIDER) private readonly vision: VisionProvider,
    @Inject(DIAGNOSIS_REPOSITORY) private readonly repo: DiagnosisRepository,
  ) {}

  async start(req: StartDiagnosisRequest): Promise<StartDiagnosisResponse> {
    const session: DiagnosisSession = {
      id: randomUUID(),
      vehicle: req.vehicle,
      complaint: req.text ?? '',
      answers: [],
      createdAt: new Date(),
    };
    await this.repo.create(session);
    return this.run(session);
  }

  /** Analyzes an uploaded image and starts a diagnosis from what was detected. */
  async startFromImage(
    vehicle: Vehicle,
    image: VisionInput,
  ): Promise<StartDiagnosisResponse> {
    const vision = await this.vision.analyze(image, 'dashboard_light');
    const session: DiagnosisSession = {
      id: randomUUID(),
      vehicle,
      complaint: vision.suggestedComplaint,
      answers: [],
      createdAt: new Date(),
    };
    await this.repo.create(session);
    const response = await this.run(session);
    return {
      ...response,
      vision: {
        detectedLabel: vision.detectedLabel,
        description: vision.description,
        confidence: vision.confidence,
      },
    };
  }

  async submitAnswers(
    diagnosisId: string,
    answers: FollowUpAnswer[],
  ): Promise<StartDiagnosisResponse> {
    const session = await this.getOrThrow(diagnosisId);
    session.answers = this.mergeAnswers(session.answers, answers);
    await this.repo.update(session);
    return this.run(session);
  }

  async getResult(diagnosisId: string): Promise<DiagnosisResult> {
    const session = await this.getOrThrow(diagnosisId);
    if (!session.result) {
      throw new NotFoundException('Diagnosis not completed yet');
    }
    return session.result;
  }

  /** Orchestrates the provider call, applies guardrails, persists the result. */
  private async run(session: DiagnosisSession): Promise<StartDiagnosisResponse> {
    const raw = await this.llm.generateDiagnosis({
      vehicle: session.vehicle,
      complaint: session.complaint,
      answers: session.answers,
    });

    if (raw.needsFollowUp) {
      return {
        diagnosisId: session.id,
        status: 'needs_followup',
        followUpQuestions: raw.followUpQuestions ?? [],
      };
    }

    const hypotheses = raw.hypotheses ?? [];
    const urgency = resolveUrgency(session.complaint, hypotheses);

    const result: DiagnosisResult = {
      diagnosisId: session.id,
      urgency,
      summary: this.composeSummary(raw.summary, urgency),
      hypotheses: this.toHypotheses(hypotheses),
      disclaimer: SAFETY_DISCLAIMER,
    };

    session.result = result;
    await this.repo.update(session);

    return { diagnosisId: session.id, status: 'complete', result };
  }

  /** Combines the provider's base summary with an action phrase for the resolved urgency. */
  private composeSummary(base: string | undefined, urgency: UrgencyLevel): string {
    const action = urgencyAction(urgency);
    const trimmed = base?.trim();
    return trimmed ? `${trimmed} ${action}.` : `${action}.`;
  }

  private toHypotheses(raw: RawHypothesis[]): DiagnosisHypothesis[] {
    return [...raw]
      .sort((a, b) => b.probability - a.probability)
      .map((h) => ({
        label: h.label,
        probability: h.probability,
        confidence: h.confidence,
        reasoning: h.reasoning,
        price: h.price,
        estLaborHours: h.estLaborHours,
        riskLevel: h.riskLevel,
        sources: h.sources,
      }));
  }

  private mergeAnswers(
    existing: FollowUpAnswer[],
    incoming: FollowUpAnswer[],
  ): FollowUpAnswer[] {
    const byId = new Map(existing.map((a) => [a.questionId, a]));
    for (const a of incoming) byId.set(a.questionId, a);
    return [...byId.values()];
  }

  private async getOrThrow(id: string): Promise<DiagnosisSession> {
    const session = await this.repo.findById(id);
    if (!session) throw new NotFoundException('Diagnosis not found');
    return session;
  }
}

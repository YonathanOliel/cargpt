import { Injectable } from '@nestjs/common';
import type { DiagnosisPrompt, LlmProvider, RawDiagnosis, RawHypothesis } from '../contracts/llm-provider';
import { GENERIC_GUIDANCE, UNIVERSAL_FOLLOWUPS } from '../knowledge-base/kb.data';
import { retrieve } from '../knowledge-base/retrieval';

const MATCH_THRESHOLD = 1;

/**
 * Free-text diagnosis grounded in a verified knowledge base.
 *
 * Any complaint is matched against the KB by a scoring retriever; follow-up
 * answers are folded back into the search text so vague input is progressively
 * refined. When nothing specific matches, the user is guided with a universal
 * question and then given sourced general guidance — never a dead end.
 *
 * Implements the same LlmProvider interface as future OpenAI/Gemini adapters,
 * which can reuse this KB as grounding (RAG) when a real model is enabled.
 */
@Injectable()
export class KnowledgeBaseProvider implements LlmProvider {
  readonly name = 'knowledge-base';

  async generateDiagnosis(prompt: DiagnosisPrompt): Promise<RawDiagnosis> {
    const searchText = [prompt.complaint, ...prompt.answers.map((a) => a.answer)].join(' ');
    const answered = new Set(prompt.answers.map((a) => a.questionId));

    const match = retrieve(searchText);

    if (match && match.score >= MATCH_THRESHOLD) {
      const pending = (match.entry.followUps ?? []).filter((q) => !answered.has(q.id));
      if (pending.length > 0) {
        return { needsFollowUp: true, followUpQuestions: pending };
      }
      return {
        needsFollowUp: false,
        summary: this.buildSummary(match.entry.hypotheses),
        hypotheses: this.normalize(match.entry.hypotheses),
      };
    }

    // No specific match: ask a universal question first, then give sourced guidance.
    const pendingUniversal = UNIVERSAL_FOLLOWUPS.filter((q) => !answered.has(q.id));
    if (pendingUniversal.length > 0) {
      return { needsFollowUp: true, followUpQuestions: pendingUniversal };
    }
    return {
      needsFollowUp: false,
      summary: this.buildSummary(GENERIC_GUIDANCE),
      hypotheses: this.normalize(GENERIC_GUIDANCE),
    };
  }

  /** Ensure probabilities sum to ~1. */
  private normalize(hypotheses: RawHypothesis[]): RawHypothesis[] {
    const total = hypotheses.reduce((s, h) => s + h.probability, 0) || 1;
    return hypotheses.map((h) => ({
      ...h,
      probability: Math.round((h.probability / total) * 100) / 100,
    }));
  }

  private buildSummary(hypotheses: RawHypothesis[]): string {
    const top = [...hypotheses].sort((a, b) => b.probability - a.probability)[0];
    return `הסיבה הסבירה ביותר: ${top.label}.`;
  }
}

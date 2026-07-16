import { Injectable } from '@nestjs/common';
import type { DiagnosisPrompt, LlmProvider, RawDiagnosis, RawHypothesis } from '../contracts/llm-provider';
import { GENERIC_GUIDANCE } from '../knowledge-base/kb.data';
import { retrieveTop, type RetrievalMatch } from '../knowledge-base/retrieval';

/** A confident, specific match — safe to ask targeted follow-ups. */
const STRONG_SCORE = 3;

/**
 * Free-text diagnosis grounded in a verified knowledge base.
 *
 * Behaviour designed to feel helpful rather than confusing:
 * - Strong, specific match  -> that topic, with its targeted follow-ups.
 * - Weak but single topic   -> answer directly (no friction questions).
 * - Ambiguous (tie)         -> merge the leading causes across topics.
 * - Nothing matches         -> sourced general guidance, never a dead end.
 *
 * Implements the same LlmProvider interface as the OpenAI adapter, which can
 * reuse this KB as grounding (RAG) when a real model is enabled.
 */
@Injectable()
export class KnowledgeBaseProvider implements LlmProvider {
  readonly name = 'knowledge-base';

  async generateDiagnosis(prompt: DiagnosisPrompt): Promise<RawDiagnosis> {
    const searchText = [prompt.complaint, ...prompt.answers.map((a) => a.answer)].join(' ');
    const answered = new Set(prompt.answers.map((a) => a.questionId));

    const matches = retrieveTop(searchText, 3);

    if (matches.length === 0) {
      return this.complete(GENERIC_GUIDANCE);
    }

    const top = matches[0];

    // Confident, specific match: refine with the topic's own follow-ups.
    if (top.score >= STRONG_SCORE) {
      const pending = (top.entry.followUps ?? []).filter((q) => !answered.has(q.id));
      if (pending.length > 0) {
        return { needsFollowUp: true, followUpQuestions: pending };
      }
      return this.complete(top.entry.hypotheses);
    }

    // Ambiguous (several topics tie): merge their leading causes.
    const tied = matches.filter((m) => m.score === top.score);
    if (tied.length > 1) {
      return this.complete(this.mergeLeadingCauses(tied));
    }

    // Weak but single topic: answer directly, no friction question.
    return this.complete(top.entry.hypotheses);
  }

  private complete(hypotheses: RawHypothesis[]): RawDiagnosis {
    return {
      needsFollowUp: false,
      summary: this.buildSummary(hypotheses),
      hypotheses: this.normalize(hypotheses),
    };
  }

  /** Takes the most likely cause from each tied topic to present cross-area options. */
  private mergeLeadingCauses(matches: RetrievalMatch[]): RawHypothesis[] {
    const picked: RawHypothesis[] = [];
    const seen = new Set<string>();
    for (const m of matches.slice(0, 3)) {
      const best = [...m.entry.hypotheses].sort((a, b) => b.probability - a.probability)[0];
      if (best && !seen.has(best.label)) {
        picked.push(best);
        seen.add(best.label);
      }
    }
    return picked;
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

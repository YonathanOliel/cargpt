import { Injectable, Logger } from '@nestjs/common';
import type { DiagnosisPrompt, LlmProvider, RawDiagnosis } from '../contracts/llm-provider';
import { retrieve } from '../knowledge-base/retrieval';

interface OpenAiChoice {
  message?: { content?: string };
}
interface OpenAiResponse {
  choices?: OpenAiChoice[];
}

/**
 * OpenAI adapter. Enabled only when LLM_PROVIDER=openai and OPENAI_API_KEY is set.
 *
 * It grounds the model in the verified knowledge base (RAG) and requires a
 * strict JSON response matching RawDiagnosis, including cited sources. On any
 * failure (network, quota, malformed output) it transparently falls back to the
 * knowledge-base provider so the product never breaks.
 */
@Injectable()
export class OpenAiProvider implements LlmProvider {
  readonly name = 'openai';
  private readonly logger = new Logger(OpenAiProvider.name);

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly fallback: LlmProvider,
  ) {}

  async generateDiagnosis(prompt: DiagnosisPrompt): Promise<RawDiagnosis> {
    try {
      return await this.callModel(prompt);
    } catch (err) {
      this.logger.warn(`OpenAI call failed, using knowledge base: ${(err as Error).message}`);
      return this.fallback.generateDiagnosis(prompt);
    }
  }

  private async callModel(prompt: DiagnosisPrompt): Promise<RawDiagnosis> {
    const searchText = [prompt.complaint, ...prompt.answers.map((a) => a.answer)].join(' ');
    const grounding = retrieve(searchText)?.entry;

    const system = [
      'אתה מכונאי רכב מומחה שמדבר עברית.',
      'החזר אך ורק JSON התואם לסכמה:',
      '{ "needsFollowUp": boolean, "followUpQuestions"?: [{"id","question","options":[]}],',
      '  "summary"?: string, "hypotheses"?: [{"label","probability"(0..1),"confidence"(0..1),',
      '  "reasoning","price":{"low","avg","high","currency":"ILS"},"estLaborHours"?,',
      '  "riskLevel":"green|yellow|red","sources":[{"title","publisher","type"}]}] }',
      'שאל שאלות המשך רק אם חסר מידע קריטי. צטט מקורות מוכרים בלבד (למשל NHTSA, משרד התחבורה, מדריך יצרן) — בלי להמציא קישורים.',
      'לבעיות בטיחות (בלמים/היגוי/צמיגים/חום מנוע) אל תסמן ירוק.',
    ].join('\n');

    const user = JSON.stringify({
      vehicle: prompt.vehicle,
      complaint: prompt.complaint,
      answers: prompt.answers,
      referenceContext: grounding ? { title: grounding.title, hypotheses: grounding.hypotheses } : null,
    });

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as OpenAiResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('empty response');

    const parsed = JSON.parse(content) as RawDiagnosis;
    if (typeof parsed?.needsFollowUp !== 'boolean') {
      throw new Error('invalid schema');
    }
    return parsed;
  }
}

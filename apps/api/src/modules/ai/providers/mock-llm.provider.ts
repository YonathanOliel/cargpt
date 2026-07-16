import { Injectable } from '@nestjs/common';
import type { FollowUpQuestion } from '@cargpt/shared';
import type {
  DiagnosisPrompt,
  LlmProvider,
  RawDiagnosis,
  RawHypothesis,
} from '../contracts/llm-provider';

interface SymptomPattern {
  /** keywords (Hebrew) that trigger this pattern. */
  keywords: string[];
  followUps: FollowUpQuestion[];
  hypotheses: RawHypothesis[];
}

const ILS = 'ILS' as const;

/**
 * Deterministic, rules-based stand-in for a real LLM.
 * Lets the whole diagnosis pipeline run and be tested without API keys.
 * Replace with OpenAI/Anthropic/Gemini adapters implementing the same interface.
 */
@Injectable()
export class MockLlmProvider implements LlmProvider {
  readonly name = 'mock';

  private readonly patterns: SymptomPattern[] = [
    {
      keywords: ['רעש', 'פנייה', 'פניה', 'סיבוב', 'גלגל'],
      followUps: [
        {
          id: 'when',
          question: 'מתי הרעש מופיע?',
          options: ['רק בפנייה', 'תמיד בנסיעה', 'רק כשקר', 'רק בבלימה'],
        },
        {
          id: 'warning-light',
          question: 'יש נורת תקלה דולקת?',
          options: ['כן', 'לא', 'לא בטוח'],
        },
      ],
      hypotheses: [
        {
          label: 'מיסב גלגל',
          probability: 0.8,
          confidence: 0.7,
          reasoning: 'רעש מחזורי שמשתנה עם המהירות/פנייה אופייני לבלאי מיסב גלגל.',
          price: { low: 450, avg: 700, high: 950, currency: ILS },
          estLaborHours: 2,
          riskLevel: 'yellow',
        },
        {
          label: 'בולם זעזועים',
          probability: 0.15,
          confidence: 0.5,
          reasoning: 'רעש בפנייה יכול לנבוע גם ממערכת מתלים שחוקה.',
          price: { low: 600, avg: 900, high: 1300, currency: ILS },
          estLaborHours: 3,
          riskLevel: 'yellow',
        },
        {
          label: 'דיסק/רפידות בלם',
          probability: 0.05,
          confidence: 0.4,
          reasoning: 'פחות סביר, אך רעש הקשור לבלימה מצריך שלילה.',
          price: { low: 400, avg: 650, high: 900, currency: ILS },
          estLaborHours: 1.5,
          riskLevel: 'red',
        },
      ],
    },
    {
      keywords: ['נורה', 'מנוע', 'צ׳ק', "צ'ק", 'check', 'נדלק'],
      followUps: [
        {
          id: 'light-color',
          question: 'באיזה צבע הנורה?',
          options: ['כתום', 'אדום', 'מהבהב'],
        },
        {
          id: 'behavior',
          question: 'איך הרכב מתנהג?',
          options: ['תקין', 'אובדן כוח', 'רעידות', 'עשן'],
        },
      ],
      hypotheses: [
        {
          label: 'סליל הצתה',
          probability: 0.55,
          confidence: 0.6,
          reasoning: 'נורת מנוע עם רעידות בסרק מצביעה לרוב על כשל בהצתה.',
          price: { low: 250, avg: 450, high: 700, currency: ILS },
          estLaborHours: 1,
          riskLevel: 'yellow',
        },
        {
          label: 'מצתים',
          probability: 0.3,
          confidence: 0.5,
          reasoning: 'מצתים שחוקים גורמים לבעיות הצתה דומות.',
          price: { low: 200, avg: 350, high: 500, currency: ILS },
          estLaborHours: 1,
          riskLevel: 'green',
        },
        {
          label: 'מזרק דלק',
          probability: 0.15,
          confidence: 0.4,
          reasoning: 'פחות שכיח אך אפשרי בתסמינים דומים.',
          price: { low: 500, avg: 900, high: 1400, currency: ILS },
          estLaborHours: 2,
          riskLevel: 'yellow',
        },
      ],
    },
    {
      keywords: ['רועד', 'רעידות', 'סרק', 'רטט'],
      followUps: [
        {
          id: 'cold',
          question: 'זה קורה רק כשהמנוע קר?',
          options: ['כן', 'לא', 'תמיד'],
        },
      ],
      hypotheses: [
        {
          label: 'תושבות מנוע',
          probability: 0.5,
          confidence: 0.55,
          reasoning: 'רעידות בסרק אופייניות לתושבות מנוע שחוקות.',
          price: { low: 400, avg: 750, high: 1200, currency: ILS },
          estLaborHours: 2,
          riskLevel: 'yellow',
        },
        {
          label: 'כשל הצתה',
          probability: 0.5,
          confidence: 0.55,
          reasoning: 'רעידות עם חוסר יציבות מנוע יכולות לנבוע מכשל הצתה.',
          price: { low: 250, avg: 450, high: 700, currency: ILS },
          estLaborHours: 1,
          riskLevel: 'yellow',
        },
      ],
    },
    {
      keywords: ['בלם', 'בלמים', 'בלימה', 'ברקס'],
      followUps: [],
      hypotheses: [
        {
          label: 'רפידות בלם שחוקות',
          probability: 0.7,
          confidence: 0.6,
          reasoning: 'תלונות על בלימה קשורות ברוב המקרים לרפידות שחוקות.',
          price: { low: 300, avg: 550, high: 800, currency: ILS },
          estLaborHours: 1.5,
          riskLevel: 'red',
        },
        {
          label: 'דיסקים שחוקים',
          probability: 0.3,
          confidence: 0.5,
          reasoning: 'דיסקים פגומים יכולים לגרום לרעש/רעידות בבלימה.',
          price: { low: 500, avg: 900, high: 1300, currency: ILS },
          estLaborHours: 2,
          riskLevel: 'red',
        },
      ],
    },
  ];

  async generateDiagnosis(prompt: DiagnosisPrompt): Promise<RawDiagnosis> {
    const text = prompt.complaint.toLowerCase();
    const pattern = this.patterns.find((p) =>
      p.keywords.some((k) => text.includes(k.toLowerCase())),
    );

    if (!pattern) {
      return {
        needsFollowUp: true,
        followUpQuestions: [
          {
            id: 'describe',
            question: 'תוכל/י לתאר מתי הבעיה מופיעה ומה בדיוק מרגישים?',
            options: [],
          },
        ],
      };
    }

    // Ask follow-ups once, before concluding, if we still have unanswered ones.
    const answered = new Set(prompt.answers.map((a) => a.questionId));
    const pending = pattern.followUps.filter((q) => !answered.has(q.id));
    if (pending.length > 0) {
      return { needsFollowUp: true, followUpQuestions: pending };
    }

    return {
      needsFollowUp: false,
      summary: this.buildSummary(pattern.hypotheses),
      hypotheses: this.normalize(pattern.hypotheses),
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

  /**
   * Base summary naming the most likely cause. The urgency-specific action
   * phrase is appended by the service from the *resolved* urgency, so the
   * wording always matches the badge shown to the user.
   */
  private buildSummary(hypotheses: RawHypothesis[]): string {
    const top = [...hypotheses].sort((a, b) => b.probability - a.probability)[0];
    return `הסיבה הסבירה ביותר: ${top.label}.`;
  }
}

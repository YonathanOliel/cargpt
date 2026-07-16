import { Injectable } from '@nestjs/common';
import type {
  VisionInput,
  VisionProvider,
  VisionResult,
  VisionTask,
} from '../contracts/vision-provider';

/**
 * Deterministic stand-in for a real vision model. It cannot truly "see", so it
 * returns a plausible, structured result that flows into the diagnosis engine.
 * Replace with OpenAI/Gemini vision adapters implementing the same interface.
 */
@Injectable()
export class MockVisionProvider implements VisionProvider {
  readonly name = 'mock';

  async analyze(input: VisionInput, task: VisionTask): Promise<VisionResult> {
    // Vary the canned result a little based on image size so demos aren't identical.
    const bucket = input.buffer.length % 3;

    if (task === 'dashboard_light') {
      const options: VisionResult[] = [
        {
          detectedLabel: 'נורת מנוע (Check Engine) כתומה',
          description: 'זוהתה נורת מנוע כתומה דולקת בלוח השעונים.',
          suggestedComplaint: 'נדלקה נורת מנוע כתומה בלוח השעונים',
          confidence: 0.72,
        },
        {
          detectedLabel: 'נורת לחץ שמן אדומה',
          description: 'זוהתה נורת לחץ שמן אדומה — מצב שעלול להיות דחוף.',
          suggestedComplaint: 'נדלקה נורת שמן אדומה במנוע',
          confidence: 0.68,
        },
        {
          detectedLabel: 'נורת ABS',
          description: 'זוהתה נורת ABS דולקת.',
          suggestedComplaint: 'נדלקה נורת ABS של הבלמים',
          confidence: 0.64,
        },
      ];
      return options[bucket];
    }

    const general: VisionResult[] = [
      {
        detectedLabel: 'נזילת נוזל כהה',
        description: 'זוהתה כתם/נזילה כהה מתחת לרכב — ייתכן שמן מנוע.',
        suggestedComplaint: 'יש נזילת שמן כהה מתחת למנוע',
        confidence: 0.6,
      },
      {
        detectedLabel: 'בלאי צמיג',
        description: 'זוהה צמיג עם סימני בלאי בצד החיצוני.',
        suggestedComplaint: 'הצמיג נראה שחוק בצד אחד',
        confidence: 0.58,
      },
      {
        detectedLabel: 'רפידות בלם שחוקות',
        description: 'זוהו רפידות בלם דקות דרך חישוק הגלגל.',
        suggestedComplaint: 'רפידות הבלם נראות דקות מאוד',
        confidence: 0.55,
      },
    ];
    return general[bucket];
  }
}

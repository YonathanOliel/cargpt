import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLM_PROVIDER, type LlmProvider } from './contracts/llm-provider';
import { VISION_PROVIDER, type VisionProvider } from './contracts/vision-provider';
import { MockLlmProvider } from './providers/mock-llm.provider';
import { MockVisionProvider } from './providers/mock-vision.provider';

/**
 * AI abstraction layer.
 * Providers are resolved at runtime from config (LLM_PROVIDER / VISION_PROVIDER env),
 * so swapping OpenAI/Anthropic/Gemini requires no change to business logic.
 */
@Module({
  providers: [
    MockLlmProvider,
    MockVisionProvider,
    {
      provide: LLM_PROVIDER,
      inject: [ConfigService, MockLlmProvider],
      useFactory: (config: ConfigService, mock: MockLlmProvider): LlmProvider => {
        const provider = config.get<string>('LLM_PROVIDER', 'mock');
        switch (provider) {
          // case 'openai': return new OpenAiProvider(...);
          // case 'anthropic': return new AnthropicProvider(...);
          // case 'gemini': return new GeminiProvider(...);
          case 'mock':
          default:
            return mock;
        }
      },
    },
    {
      provide: VISION_PROVIDER,
      inject: [ConfigService, MockVisionProvider],
      useFactory: (config: ConfigService, mock: MockVisionProvider): VisionProvider => {
        const provider = config.get<string>('VISION_PROVIDER', 'mock');
        switch (provider) {
          // case 'openai': return new OpenAiVisionProvider(...);
          // case 'gemini': return new GeminiVisionProvider(...);
          case 'mock':
          default:
            return mock;
        }
      },
    },
  ],
  exports: [LLM_PROVIDER, VISION_PROVIDER],
})
export class AiModule {}

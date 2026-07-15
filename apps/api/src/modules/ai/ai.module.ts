import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLM_PROVIDER, type LlmProvider } from './contracts/llm-provider';
import { MockLlmProvider } from './providers/mock-llm.provider';

/**
 * AI abstraction layer.
 * The provider is resolved at runtime from config (LLM_PROVIDER env),
 * so swapping OpenAI/Anthropic/Gemini requires no change to business logic.
 */
@Module({
  providers: [
    MockLlmProvider,
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
  ],
  exports: [LLM_PROVIDER],
})
export class AiModule {}

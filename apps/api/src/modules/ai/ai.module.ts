import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLM_PROVIDER, type LlmProvider } from './contracts/llm-provider';
import { VISION_PROVIDER, type VisionProvider } from './contracts/vision-provider';
import { KnowledgeBaseProvider } from './providers/knowledge-base.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { MockVisionProvider } from './providers/mock-vision.provider';

/**
 * AI abstraction layer.
 * Providers are resolved at runtime from config (LLM_PROVIDER / VISION_PROVIDER env),
 * so swapping OpenAI/Anthropic/Gemini requires no change to business logic.
 */
@Module({
  providers: [
    KnowledgeBaseProvider,
    MockVisionProvider,
    {
      provide: LLM_PROVIDER,
      inject: [ConfigService, KnowledgeBaseProvider],
      useFactory: (config: ConfigService, kb: KnowledgeBaseProvider): LlmProvider => {
        const provider = config.get<string>('LLM_PROVIDER', 'kb');
        const apiKey = config.get<string>('OPENAI_API_KEY');
        switch (provider) {
          case 'openai':
            // Falls back to the knowledge base if the key is missing or a call fails.
            return apiKey
              ? new OpenAiProvider(apiKey, config.get<string>('OPENAI_MODEL', 'gpt-4o-mini'), kb)
              : kb;
          // case 'anthropic': return new AnthropicProvider(...);
          // case 'gemini': return new GeminiProvider(...);
          case 'kb':
          case 'mock': // backwards-compatible alias
          default:
            return kb;
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

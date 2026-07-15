import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from './application/diagnosis.service';
import { DIAGNOSIS_REPOSITORY } from './domain/diagnosis.types';
import { InMemoryDiagnosisRepository } from './infrastructure/in-memory-diagnosis.repository';

@Module({
  imports: [AiModule],
  controllers: [DiagnosisController],
  providers: [
    DiagnosisService,
    { provide: DIAGNOSIS_REPOSITORY, useClass: InMemoryDiagnosisRepository },
  ],
})
export class DiagnosisModule {}

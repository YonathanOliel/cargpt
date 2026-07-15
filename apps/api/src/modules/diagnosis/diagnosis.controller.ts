import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type {
  DiagnosisResult,
  StartDiagnosisRequest,
  StartDiagnosisResponse,
} from '@cargpt/shared';
import { DiagnosisService } from './application/diagnosis.service';
import { StartDiagnosisDto } from './dto/start-diagnosis.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

@Controller('diagnoses')
export class DiagnosisController {
  constructor(private readonly service: DiagnosisService) {}

  @Post()
  start(@Body() dto: StartDiagnosisDto): Promise<StartDiagnosisResponse> {
    return this.service.start(dto as StartDiagnosisRequest);
  }

  @Post(':id/answers')
  submitAnswers(
    @Param('id') id: string,
    @Body() dto: SubmitAnswersDto,
  ): Promise<StartDiagnosisResponse> {
    return this.service.submitAnswers(id, dto.answers);
  }

  @Get(':id')
  getResult(@Param('id') id: string): Promise<DiagnosisResult> {
    return this.service.getResult(id);
  }
}

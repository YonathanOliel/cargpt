import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type {
  DiagnosisResult,
  StartDiagnosisRequest,
  StartDiagnosisResponse,
} from '@cargpt/shared';
import { DiagnosisService } from './application/diagnosis.service';
import { StartDiagnosisDto } from './dto/start-diagnosis.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

/** Minimal shape of a Multer upload (avoids depending on the global Express.Multer namespace). */
interface UploadedImage {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@Controller('diagnoses')
export class DiagnosisController {
  constructor(private readonly service: DiagnosisService) {}

  @Post()
  start(@Body() dto: StartDiagnosisDto): Promise<StartDiagnosisResponse> {
    return this.service.start(dto as StartDiagnosisRequest);
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 8 * 1024 * 1024 } }))
  startFromImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\/(jpeg|png|webp|heic)$/ })
        .build({ fileIsRequired: true }),
    )
    file: UploadedImage,
  ): Promise<StartDiagnosisResponse> {
    if (!file?.buffer) throw new BadRequestException('קובץ תמונה חסר');
    return this.service.startFromImage(
      { id: 'anon', make: 'Generic', model: 'Car', year: 2019 },
      { mimeType: file.mimetype, buffer: file.buffer },
    );
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

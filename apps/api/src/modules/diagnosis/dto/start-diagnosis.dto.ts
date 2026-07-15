import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import type { DiagnosisInputType } from '@cargpt/shared';

export class VehicleDto {
  @IsString()
  @MaxLength(40)
  make!: string;

  @IsString()
  @MaxLength(40)
  model!: string;

  @IsInt()
  @Min(1950)
  @Max(2100)
  year!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  engine?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;
}

export class StartDiagnosisDto {
  @ValidateNested()
  @Type(() => VehicleDto)
  vehicle!: VehicleDto;

  @IsIn(['text', 'image'])
  inputType!: DiagnosisInputType;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  text?: string;
}

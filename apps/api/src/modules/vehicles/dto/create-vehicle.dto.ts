import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @MaxLength(40)
  make!: string;

  @IsString()
  @MaxLength(40)
  model!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1950)
  @Max(2100)
  year!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  engine?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  mileage?: number;
}

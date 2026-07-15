import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/** All fields optional — partial update of a vehicle. */
export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  make?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  model?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1950)
  @Max(2100)
  year?: number;

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

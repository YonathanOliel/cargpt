import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsString, MaxLength, ValidateNested } from 'class-validator';

export class FollowUpAnswerDto {
  @IsString()
  @MaxLength(80)
  questionId!: string;

  @IsString()
  @MaxLength(500)
  answer!: string;
}

export class SubmitAnswersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FollowUpAnswerDto)
  answers!: FollowUpAnswerDto[];
}

import { IsString, Matches } from 'class-validator';

/** Israeli mobile number, e.g. 0501234567 or +972501234567. */
const IL_PHONE = /^(?:\+972|0)5\d{8}$/;

export class RequestOtpDto {
  @IsString()
  @Matches(IL_PHONE, { message: 'מספר טלפון לא תקין' })
  phone!: string;
}

export class VerifyOtpDto {
  @IsString()
  @Matches(IL_PHONE, { message: 'מספר טלפון לא תקין' })
  phone!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'קוד בן 6 ספרות' })
  code!: string;
}

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}

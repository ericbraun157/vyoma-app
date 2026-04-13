import { IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class BusinessSetupDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsIn(['salon', 'clinic', 'tuition', 'gym', 'autorepair', 'other'])
  type!: string;

  @IsString()
  @Matches(/^\d{10}$/)
  phone!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  ownerName?: string;
}


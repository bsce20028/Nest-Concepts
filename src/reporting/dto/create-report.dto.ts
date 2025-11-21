import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty()
  incident_id: number;

  @IsEnum(['NMC', 'PSNI', 'TRUST'])
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}

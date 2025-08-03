import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;
}

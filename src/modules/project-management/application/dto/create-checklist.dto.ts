import { IsString } from 'class-validator';


export class CreateChecklistDto {
  @IsString()
  title: string;

  @IsString()
  projectId: string;
}

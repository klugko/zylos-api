import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateTaskColumnDto {
  @ApiProperty({ description: "Nom de la colonne" })
  @IsString()
  name: string;

  @ApiProperty({ description: "ID du projet" })
  @IsString()
  projectId: string;
}

import { PartialType, ApiProperty } from "@nestjs/swagger";
import { CreateTaskColumnDto } from "./create-task-column.dto";
import { IsOptional, IsString, IsInt } from "class-validator";

export class UpdateTaskColumnDto extends PartialType(CreateTaskColumnDto) {
  @ApiProperty({ description: "Nouveau nom de la colonne", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: "Nouvel ordre de la colonne", required: false })
  @IsOptional()
  @IsInt()
  order?: number;
}

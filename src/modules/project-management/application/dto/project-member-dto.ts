import { ApiProperty } from '@nestjs/swagger';

export class ProjectMemberDto {
  @ApiProperty() id: string;
  @ApiProperty() projectId: string;
  @ApiProperty() userId: string;
  @ApiProperty() role: string;
  @ApiProperty() fullname: string;
  @ApiProperty() email: string;
}

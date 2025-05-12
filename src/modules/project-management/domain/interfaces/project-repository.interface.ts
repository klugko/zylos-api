import { Project } from '../entities/project.entity';
import { UpdateProjectDto } from '../../application/dto/update-project.dto';

export interface ProjectRepository {
  create(project: Project): Promise<Project>;
  update(id: string, dto: UpdateProjectDto): Promise<Project>;
  findAll(): Promise<Project[]>;
}

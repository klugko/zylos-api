import { Project } from '../entities/project.entity';
import { UpdateProjectDto } from '../../application/dto/update-project.dto';
import { ProjectWithDetails } from '../entities/project-with-details.entity';

export interface ProjectRepository {
  findById(id: string): Promise<Project | null>;
  create(project: Project): Promise<Project>;
  update(id: string, dto: UpdateProjectDto): Promise<Project>;
  findAll(): Promise<Project[]>;
  findAllByOwner(ownerId: string): Promise<Project[]>;
  findAllWithDetails(): Promise<ProjectWithDetails[]>;
  findFullDataByUserId(userId: string): Promise<any>; 
}

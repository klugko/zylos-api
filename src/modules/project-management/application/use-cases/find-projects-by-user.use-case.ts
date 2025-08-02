import { Inject, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { FindProjectsByUserDto } from '../dto/find-projects-by-user.dto';
import { ProjectRepository } from '@modules/project-management/domain/interfaces/project-repository.interface';

@Injectable()
export class FindProjectsByUserUseCase {
  constructor(
    @Inject('ProjectRepository')
    private readonly projectRepository: ProjectRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: FindProjectsByUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new NotFoundException(`Utilisateur avec l'id ${dto.userId} introuvable.`);
      }

      const projects = await this.projectRepository.findFullDataByUserId(dto.userId);
      return projects;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('Erreur lors de la requête à la base de données.');
      }
      throw error;
    }
  }
}

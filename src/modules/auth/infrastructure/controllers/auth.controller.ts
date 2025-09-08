import {
  Body,
  Controller,
  Post,
  Put,
  Param,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
  Patch,
  Delete,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Inject,
  NotFoundException,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { ActivateUserUseCase } from '../../application/use-cases/activate-user.use-case';
import { DeactivateUserUseCase } from '../../application/use-cases/deactivate-user.use-case';
import { PasswordResetUseCase } from '../../application/use-cases/password-reset.use-case';
import { TwoFAService } from '../../application/services/twofa.service';
import { RegisterDto } from '../../application/dto/register.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { JwtAuthGuard } from '../strategies/jwt-auth.guard';
import { CurrentUser } from '@core/common/current-user.decorator';
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { PasswordResetConfirmDto, PasswordResetRequestDto } from '@modules/auth/application/dto/password-reset.dto';
import { TwoFAVerifyDto } from '@modules/auth/application/dto/twofa.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUsersUseCase } from '@modules/auth/application/use-cases/get-users.use-case';
import { GetUsersDto } from '@modules/auth/application/dto/get-users.dto';
import { UpdateUserUseCase } from '@modules/auth/application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '@modules/auth/application/use-cases/delete-user.use-case';
import { UpdateUserDto } from '@modules/auth/application/dto/update-user.dto';
import { RolesGuard } from '@modules/auth/application/decorators/role.guard';
import { Roles } from '@modules/auth/application/decorators/roles.decorator';
import { UpdateAvatarUseCase } from '@modules/auth/application/use-cases/update-avatar.use-case';
import { UpdateProfileUseCase } from '@modules/auth/application/use-cases/update-profile.use-case';
import { UpdateProfileDto } from '@modules/auth/application/dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarStorageService } from '@modules/auth/infrastructure/services/avatar-storage.service';
import { UploadCvUseCase } from '@modules/auth/application/use-cases/upload-cv.use-case';
import { UploadCvBodyDto } from '@modules/auth/application/dto/upload-cv.dto';
import { Response } from 'express';


@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly registerUC: RegisterUseCase,
    private readonly loginUC: LoginUseCase,
    private readonly activateUC: ActivateUserUseCase,
    private readonly deactivateUC: DeactivateUserUseCase,
    private readonly passwordResetUC: PasswordResetUseCase,
    private readonly twoFAService: TwoFAService,
    private readonly getUsersUC: GetUsersUseCase,
    private readonly updateUserUC: UpdateUserUseCase,
    private readonly deleteUserUC: DeleteUserUseCase,
    private readonly updateAvatarUC: UpdateAvatarUseCase,
    private readonly updateProfileUC: UpdateProfileUseCase,
    private readonly uploadCvUC: UploadCvUseCase,
    @Inject('AuthRepository') private readonly authRepo: any,
    private readonly avatarStorage: AvatarStorageService,
  ) {}


  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lister les utilisateurs avec pagination et recherche dynamique' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs paginée' })
  async getUsers(@Query() dto: GetUsersDto) {
    return this.getUsersUC.execute(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Utilisateur enregistré' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async register(@Body() dto: RegisterDto) {
    return this.registerUC.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Se connecter' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Authentification réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @ApiResponse({ status: 403, description: 'Compte désactivé' })
  async login(@Body() dto: LoginDto) {
    return this.loginUC.execute(dto);
  }

  @Post('password/reset/request')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Demander une réinitialisation de mot de passe' })
  @ApiBody({ type: PasswordResetRequestDto })
  @ApiResponse({ status: 202, description: 'Email de réinitialisation envoyé' })
  async requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return this.passwordResetUC.requestPasswordReset(dto.email);
  }

  @Post('password/reset/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmer la réinitialisation du mot de passe' })
  @ApiBody({ type: PasswordResetConfirmDto })
  @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé' })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  async confirmPasswordReset(@Body() dto: PasswordResetConfirmDto) {
    return this.passwordResetUC.resetPassword(dto.token, dto.newPassword);
  }

  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Générer le QR code pour la 2FA' })
  @ApiResponse({ status: 201, description: 'QR code généré' })
  async generateTwoFA(@CurrentUser() user: User) {
    return this.twoFAService.generateTwoFASecret(user.id, user.email);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Vérifier le code 2FA' })
  @ApiBody({ type: TwoFAVerifyDto })
  @ApiResponse({ status: 200, description: '2FA activée' })
  @ApiResponse({ status: 400, description: 'Code 2FA invalide' })
  async verifyTwoFA(@CurrentUser() user: User, @Body() dto: TwoFAVerifyDto) {
    const isValid = await this.twoFAService.verifyTwoFACode(user.id, dto.code);
    if (!isValid) {
      throw new BadRequestException('Code 2FA invalide');
    }
    return { message: '2FA activée avec succès' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupérer le profil utilisateur' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      isActive: user.isActive,
      role: user.role,
      skills: user.skills,
      availability: user.availability,
      performanceScore: user.performanceScore,
      avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.extractInitials(user.fullname))}&size=128&background=random&color=fff&bold=true`,
      phone: user.phone,
      poste: user.poste,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private extractInitials(fullname: string): string {
    if (!fullname) return 'U';
    
    const words = fullname.trim().split(/\s+/);
    const initials = words
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2);
    
    return initials.join('');
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Se déconnecter (stateless)' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  logout() {
    return { message: 'Logout success (mock)' };
  }

  @Put('activate/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Activer un utilisateur' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur à activer" })
  @ApiResponse({ status: 200, description: 'Utilisateur activé' })
  activate(@Param('id') id: string) {
    return this.activateUC.execute(id);
  }

  @Put('deactivate/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Désactiver un utilisateur' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur à désactiver" })
  @ApiResponse({ status: 200, description: 'Utilisateur désactivé' })
  deactivate(@Param('id') id: string) {
    return this.deactivateUC.execute(id);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Connexion Google OAuth (mock)' })
  googleLogin() {
    return { message: 'Redirection OAuth désactivée temporairement.' };
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback Google OAuth (mock)' })
  async googleCallback(@Req() req: any) {
    return {
      user: null,
      accessToken: null,
      message: 'Callback désactivé en mode développement.',
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour le profil utilisateur' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.updateProfileUC.execute(user.id, dto);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Mettre à jour l\'avatar utilisateur' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Fichier image (JPEG, PNG, WebP)',
        },
      },
      required: ['avatar'],
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Avatar mis à jour avec succès',
    schema: {
      type: 'object',
      properties: {
        avatarUrl: { type: 'string', description: 'URL de l\'avatar' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Fichier invalide ou manquant' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async updateAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.updateAvatarUC.execute(user.id, file);
  }

  @Delete('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer l\'avatar utilisateur' })
  @ApiResponse({ status: 200, description: 'Avatar supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async deleteAvatar(@CurrentUser() user: User) {
    
    const existingUser = await this.authRepo.findById(user.id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Supprimer l'avatar s'il existe
    if (existingUser.avatarUrl) {
      await this.avatarStorage.deleteAvatar(existingUser.avatarUrl);
      existingUser.removeAvatar();
      await this.authRepo.update(existingUser);
    }

    return { message: 'Avatar supprimé avec succès' };
  }

  @Post('upload-cv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Uploader un CV et extraire les compétences' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier CV (PDF ou DOCX)',
        },
        type: {
          type: 'string',
          example: 'CV',
          description: 'Type de document (optionnel)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'CV uploadé avec succès et compétences extraites',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        skills: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
        fileUrl: { type: 'string' },
        newSkills: { type: 'number', description: 'Nombre de nouvelles compétences ajoutées' },
        totalSkills: { type: 'number', description: 'Nombre total de compétences après fusion' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Fichier manquant ou format non supporté',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur lors du traitement du CV',
  })
  async uploadCv(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadCvBodyDto,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('Fichier CV requis');
    }

    
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Format de fichier non supporté. Formats acceptés: PDF, DOCX',
      );
    }

    
    const maxSize = 10 * 1024 * 1024; 
    if (file.size > maxSize) {
      throw new BadRequestException('Fichier trop volumineux. Taille maximale: 10MB');
    }

    try {
      const result = await this.uploadCvUC.execute(file, dto, user.id);
      return res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erreur lors du traitement du CV',
        error: error.message,
      });
    }
  }

  @Get('debug-token')
  debugToken(@Req() req: Request) {
    console.log('Received Headers:', req.headers);
    return {
      headers: req.headers,
      authorization: req.headers['authorization'] || 'Aucun token reçu',
    };
  }

  @Put('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Modifier un utilisateur' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur à modifier" })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Utilisateur modifié avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 403, description: 'Permissions insuffisantes' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.updateUserUC.execute(id, dto);
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Modifier partiellement un utilisateur' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur à modifier" })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Utilisateur modifié avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 403, description: 'Permissions insuffisantes' })
  async patchUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.updateUserUC.execute(id, dto);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer un utilisateur (Admin uniquement)' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur à supprimer" })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 403, description: 'Seuls les administrateurs peuvent supprimer des utilisateurs' })
  async deleteUser(@Param('id') id: string, @CurrentUser() currentUser: User) {
    await this.deleteUserUC.execute(id, currentUser);
    return { message: 'Utilisateur supprimé avec succès' };
  }
}

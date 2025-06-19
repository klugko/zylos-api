import {
  Body,
  Controller,
  Post,
  Put,
  Param,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { ActivateUserUseCase } from '../../application/use-cases/activate-user.use-case';
import { DeactivateUserUseCase } from '../../application/use-cases/deactivate-user.use-case';
import { RegisterDto } from '../../application/dto/register.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../strategies/jwt-auth.guard';


@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly registerUC: RegisterUseCase,
    private readonly loginUC: LoginUseCase,
    private readonly activateUC: ActivateUserUseCase,
    private readonly deactivateUC: DeactivateUserUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Utilisateur enregistré' })
  register(@Body() dto: RegisterDto) {
    return this.registerUC.execute(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Se connecter' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Authentification réussie' })
  login(@Body() dto: LoginDto) {
    return this.loginUC.execute(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Se déconnecter (stateless)' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  logout() {
    return { message: 'Logout success' };
  }

  @Put('activate/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activer un utilisateur' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur à activer" })
  @ApiResponse({ status: 200, description: 'Utilisateur activé' })
  activate(@Param('id') id: string) {
    return this.activateUC.execute(id);
  }

  @Put('deactivate/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Désactiver un utilisateur' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur à désactiver" })
  @ApiResponse({ status: 200, description: 'Utilisateur désactivé' })
  deactivate(@Param('id') id: string) {
    return this.deactivateUC.execute(id);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Connexion Google OAuth' })
  googleLogin() {
    // redirection automatique vers Google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback Google OAuth' })
  async googleCallback(@Req() req: any) {
    return {
      user: req.user.user,
      accessToken: req.user.accessToken,
    };
  }

}

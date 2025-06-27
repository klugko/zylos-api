import {
  Body,
  Controller,
  Post,
  Put,
  Param,
  Get,
  // UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  // ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { ActivateUserUseCase } from '../../application/use-cases/activate-user.use-case';
import { DeactivateUserUseCase } from '../../application/use-cases/deactivate-user.use-case';
import { RegisterDto } from '../../application/dto/register.dto';
import { LoginDto } from '../../application/dto/login.dto';
// import { AuthGuard } from '@nestjs/passport';
// import { JwtAuthGuard } from '../strategies/jwt-auth.guard';
// import { CurrentUser } from '@core/common/current-user.decorator';
// import { User } from '@modules/auth/domain/entities/user.entity';

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

  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('JWT-auth')
  @Get('me')
  @ApiOperation({ summary: 'Profil utilisateur (mock)' })
  @ApiResponse({ status: 200, description: 'Profil fictif retourné pour tests' })
  getProfile() {
    return {
      message: 'Authentification désactivée temporairement',
      user: null,
    };
  }

  @Post('logout')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Se déconnecter (stateless)' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  logout() {
    return { message: 'Logout success (mock)' };
  }

  @Put('activate/:id')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Activer un utilisateur' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur à activer" })
  @ApiResponse({ status: 200, description: 'Utilisateur activé' })
  activate(@Param('id') id: string) {
    return this.activateUC.execute(id);
  }

  @Put('deactivate/:id')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Désactiver un utilisateur' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur à désactiver" })
  @ApiResponse({ status: 200, description: 'Utilisateur désactivé' })
  deactivate(@Param('id') id: string) {
    return this.deactivateUC.execute(id);
  }

  @Get('google')
  // @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Connexion Google OAuth (mock)' })
  googleLogin() {
    return { message: 'Redirection OAuth désactivée temporairement.' };
  }

  @Get('google/redirect')
  // @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback Google OAuth (mock)' })
  async googleCallback(@Req() req: any) {
    return {
      user: null,
      accessToken: null,
      message: 'Callback désactivé en mode développement.',
    };
  }

  @Get('debug-token')
  debugToken(@Req() req: Request) {
    console.log('Received Headers:', req.headers);
    return {
      headers: req.headers,
      authorization: req.headers['authorization'] || 'Aucun token reçu',
    };
  }
}

import { Body, Controller, Post, Put, Param } from '@nestjs/common';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { ActivateUserUseCase } from '../../application/use-cases/activate-user.use-case';
import { DeactivateUserUseCase } from '../../application/use-cases/deactivate-user.use-case';
import { RegisterDto } from '../../application/dto/register.dto';
import { LoginDto } from '../../application/dto/login.dto';


@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly registerUC: RegisterUseCase,
    private readonly loginUC: LoginUseCase,
    private readonly activateUC: ActivateUserUseCase,
    private readonly deactivateUC: DeactivateUserUseCase,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.registerUC.execute(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUC.execute(dto);
  }

  @Post('logout')
  logout() {
    // Stateless JWT logout, token supprimé coté client
    return { message: 'Logout success' };
  }

  @Put('activate/:id')
  activate(@Param('id') id: string) {
    return this.activateUC.execute(id);
  }

  @Put('deactivate/:id')
  deactivate(@Param('id') id: string) {
    return this.deactivateUC.execute(id);
  }
}

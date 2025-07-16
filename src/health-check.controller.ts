import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Root') 
@Controller('/')
export class HealthCheckController {
  @Get() 
  @ApiResponse({ status: 200, description: 'Application is running' })
  getHello(@Res() res: Response) {
    const uptimeSeconds = process.uptime();
    const uptimeMinutes = Math.floor(uptimeSeconds / 60); 
    return res.status(200).json({
      message: 'Bienvenue sur l\'API Nexa ! L\'application est en cours d\'exécution.',
      documentation: '/api',
      status: 'ok',
      version: '1.0.0', 
      timestamp: new Date().toISOString(),
      uptime: `${uptimeMinutes} mn`,
    });
  }

  @Get('health')
  @ApiResponse({ status: 200, description: 'Health check successful' })
  getHealth() {
    const uptimeSeconds = process.uptime();
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);

    return {
      status: 'healthy',
      uptime: `${uptimeMinutes} mn`, 
      timestamp: new Date().toISOString(),
    };
  }
}
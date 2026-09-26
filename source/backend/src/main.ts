import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('MarginGuard-AI');
  const app = await NestFactory.create(AppModule);

  // Enable CORS cho Frontend kết nối
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('MarginGuard AI — API Documentation')
    .setDescription(
      'Hệ thống Multi-Agent bảo vệ P&L và can thiệp tự trị quảng cáo Shopee 2026 (Sea × OpenAI Codex Hackathon 2026)',
    )
    .setVersion('1.0.0')
    .addTag('Orchestrator - Multi-Agent Engine')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log('\n' + '='.repeat(64));
  console.log('='.padEnd(63, ' ') + '=');
  console.log('=   MarginGuard AI -- Multi-Agent P&L Protection System        =');
  console.log('=          Sea x OpenAI Codex Hackathon 2026 (NestJS)          =');
  console.log('='.padEnd(63, ' ') + '=');
  console.log('='.repeat(64));
  logger.log(`🚀 MarginGuard AI API đang chạy tại: http://localhost:${port}`);
  logger.log(`📚 Tài liệu Swagger API tại:         http://localhost:${port}/docs`);
  logger.log(`⚡ Demo Endpoint:                     http://localhost:${port}/api/orchestrator/demo`);
}
bootstrap();

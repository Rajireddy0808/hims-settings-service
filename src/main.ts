import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  app.enableCors();
  app.setGlobalPrefix('api');

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Serve static files from patientexaminationreport directory
  app.useStaticAssets(join(__dirname, '..', 'patientexaminationreport'), {
    prefix: '/patientexaminationreport/',
  });

  const config = new DocumentBuilder()
    .setTitle('HIMS Settings Service')
    .setDescription('Settings microservice for HIMS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`HIMS Settings Service running on port ${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();

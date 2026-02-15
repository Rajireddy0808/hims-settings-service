import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.setGlobalPrefix('api');
  
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

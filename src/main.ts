import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from './config/config.module';
import { ExceptionFilter } from './common/utils';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();
  app.use(cookieParser());

  app.useGlobalFilters(new ExceptionFilter(app.get(HttpAdapterHost)));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('BACKYARD FINANCE API')
    .setDescription('BACKYARD FINANCE SERVER API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  app.getHttpAdapter().getInstance().locals.swaggerDocument = document;

  await app.listen(configService.getOrThrow<number>('port'));
}
bootstrap();

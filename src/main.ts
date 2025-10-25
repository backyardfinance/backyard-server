import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExceptionFilter } from './utils';
import { ConfigService } from './config/config.module';
import * as TR from './test_runner';
// import { testSeedDb } from './test_seed_db';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();

  app.useGlobalFilters(new ExceptionFilter(app.get(HttpAdapterHost)));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

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

  await app.listen(configService.getOrThrow<number>('port'));

  console.log(
    "configService.get('app_test_mode'): ",
    configService.get('app_test_mode'),
  );

  if (configService.get('app_test_mode')) {
    // await testSeedDb(app);
    await TR.testMain(app);
  }
}
bootstrap();

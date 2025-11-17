import './instrument';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from './config/config.module';
import cookieParser from 'cookie-parser';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);

  const corsUrls = process.env.CORS_URLS!.split(',').map((url) => url.trim());
  app.enableCors({
    origin: corsUrls,
    credentials: true,
  });
  app.use(cookieParser());

  // Configure session for OAuth state management
  app.use(
    session({
      secret: configService.get<string>('session_secret'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // configService.get<string>('NODE_ENV') === 'prod',
        sameSite: 'lax', // Allow cookies to be sent with top-level navigation (OAuth redirects)
        maxAge: 10 * 60 * 1000, // 10 minutes
      },
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  if (configService.get<string>('node_env') !== 'production') {
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
  }

  await app.listen(configService.getOrThrow<number>('port'));
}
bootstrap();

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from './config/config.module';
import configuration from './config/configuration';
import { ApiModule } from './api/api.module';
import { ServicesModule } from './services/services.module';
import { DatabaseModule } from './database';

@Module({
  imports: [
    ConfigModule(configuration),
    ApiModule,
    ServicesModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

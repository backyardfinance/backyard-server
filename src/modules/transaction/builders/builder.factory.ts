import { Injectable } from '@nestjs/common';
import { JupiterBuilder } from './jupiter.builder';
import { ProtocolBuilder } from '../interfaces/protocol-builder.interface';
import { VaultPlatform } from '@prisma/client';

@Injectable()
export class BuilderFactory {
  constructor(private readonly jupiterBuilder: JupiterBuilder) {}

  getBuilder(platform: VaultPlatform): ProtocolBuilder {
    switch (platform) {
      case VaultPlatform.Jupiter:
        return this.jupiterBuilder;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}

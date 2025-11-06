import { Controller, Get } from '@nestjs/common';
import { CNftService } from './cnft.service';
import { publicKey } from '@metaplex-foundation/umi';

@Controller('cnft')
export class CNftController {
  constructor(private readonly cnftService: CNftService) {}

  @Get('foo')
  async foo() {
    await this.cnftService.createSoulboundCollection();
    await this.cnftService.createTree();
    return this.cnftService.createCNtf(
      publicKey('Bb93vmxNgeEMJ1SJRtPsuUDaEiFdox3pTau5VjSC3P3e'),
    );
  }
}

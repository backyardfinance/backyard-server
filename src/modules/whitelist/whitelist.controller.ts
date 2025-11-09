import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('whitelist')
@ApiTags('whitelist')
export class WhitelistController {
  constructor() {}
}

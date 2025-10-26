import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getHello(): { ok: boolean } {
    return {
      ok: true,
    };
  }

  @Get('openapi')
  getOpenApi(@Res() res: Response) {
    const document = res.req.app.locals.swaggerDocument;
    return res.json(document);
  }
}

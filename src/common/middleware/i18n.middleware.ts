import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { I18nService } from '../../i18n/i18n.service';

@Injectable()
export class I18nMiddleware implements NestMiddleware {
  constructor(private readonly i18nService: I18nService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Get language from header (e.g. Accept-Language) or query parameter (?lang=en)
    const fromQuery =
      typeof req.query.lang === 'string' ? req.query.lang : undefined;
    const fromHeader =
      typeof req.headers['accept-language'] === 'string'
        ? req.headers['accept-language'].split(',')[0]
        : undefined;
    const lang = (fromQuery || fromHeader || 'en').split('-')[0];
    
    // Set language
    this.i18nService.changeLanguage(lang);
    
    // Set language in request for later use
    req['language'] = lang;
    
    next();
  }
} 
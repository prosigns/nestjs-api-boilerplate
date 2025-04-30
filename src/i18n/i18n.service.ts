import { Injectable, OnModuleInit } from '@nestjs/common';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { join } from 'path';

@Injectable()
export class I18nService implements OnModuleInit {
  async onModuleInit() {
    try {
      await i18next
        .use(Backend)
        .init({
          lng: 'en',
          fallbackLng: 'en',
          preload: ['en', 'es'], // Languages to preload
          ns: ['common', 'errors', 'validation'], // Namespaces
          defaultNS: 'common',
          backend: {
            loadPath: join(__dirname, '..', '..', 'src', 'i18n', 'locales/{{lng}}/{{ns}}.json'),
          },
        });
      console.log('i18n initialized successfully');
    } catch (error) {
      console.error('Failed to initialize i18n:', error);
      // Initialize with empty config as fallback
      await i18next.init({
        lng: 'en',
        resources: {
          en: {
            common: {},
            errors: {},
            validation: {}
          },
          es: {
            common: {},
            errors: {},
            validation: {}
          }
        }
      });
    }
  }

  translate(key: string, options: Record<string, any> = {}, lng = 'en'): string {
    return i18next.t(key, { ...options, lng });
  }

  changeLanguage(lng: string): Promise<any> {
    return i18next.changeLanguage(lng);
  }

  getLanguage(): string {
    return i18next.language as string;
  }

  getLanguages(): string[] {
    return i18next.languages as string[];
  }
} 
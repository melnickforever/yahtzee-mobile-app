import * as Localization from 'expo-localization';
import { Language, translations } from './i18n';

const SUPPORTED_LANGUAGES = Object.keys(translations) as Language[];

export function detectSystemLanguage(): Language {
  const code = Localization.getLocales()[0]?.languageCode;
  return SUPPORTED_LANGUAGES.includes(code as Language) ? (code as Language) : 'uk';
}

export function resolveLanguage(persisted?: Language | null): Language {
  return persisted ?? detectSystemLanguage();
}

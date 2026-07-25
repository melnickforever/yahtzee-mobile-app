import * as Localization from 'expo-localization';
import { detectSystemLanguage, resolveLanguage } from '../locale';

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}));

const mockGetLocales = Localization.getLocales as jest.Mock;

describe('detectSystemLanguage', () => {
  it('returns the system language when supported', () => {
    mockGetLocales.mockReturnValue([{ languageCode: 'en' }]);
    expect(detectSystemLanguage()).toBe('en');
  });

  it('falls back to uk when the system language is not supported', () => {
    mockGetLocales.mockReturnValue([{ languageCode: 'fr' }]);
    expect(detectSystemLanguage()).toBe('uk');
  });

  it('falls back to uk when no locales are available', () => {
    mockGetLocales.mockReturnValue([]);
    expect(detectSystemLanguage()).toBe('uk');
  });
});

describe('resolveLanguage', () => {
  it('follows a persisted client choice even when it differs from the system language', () => {
    mockGetLocales.mockReturnValue([{ languageCode: 'en' }]);
    expect(resolveLanguage('uk')).toBe('uk');
  });

  it('follows a persisted client choice that matches the system language', () => {
    mockGetLocales.mockReturnValue([{ languageCode: 'en' }]);
    expect(resolveLanguage('en')).toBe('en');
  });

  it('falls back to the detected system language when nothing is persisted', () => {
    mockGetLocales.mockReturnValue([{ languageCode: 'en' }]);
    expect(resolveLanguage(undefined)).toBe('en');
  });

  it('falls back to the detected system language when the persisted value is null', () => {
    mockGetLocales.mockReturnValue([{ languageCode: 'en' }]);
    expect(resolveLanguage(null)).toBe('en');
  });

  it('falls back to uk when nothing is persisted and the system language is unsupported', () => {
    mockGetLocales.mockReturnValue([{ languageCode: 'fr' }]);
    expect(resolveLanguage(undefined)).toBe('uk');
  });
});

import { translations } from '../i18n';

function leafPaths(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    leafPaths(v, prefix ? `${prefix}.${k}` : k)
  );
}

describe('i18n translations', () => {
  it('uk and en have identical key structure', () => {
    const ukKeys = leafPaths(translations.uk).sort();
    const enKeys = leafPaths(translations.en).sort();
    expect(ukKeys).toEqual(enKeys);
  });

  it('all leaf values are non-empty strings', () => {
    for (const [lang, dict] of Object.entries(translations)) {
      for (const path of leafPaths(dict)) {
        const value = path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], dict);
        expect(typeof value).toBe('string');
        expect((value as string).length).toBeGreaterThan(0);
      }
    }
  });
});

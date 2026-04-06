import type { Locale } from './config';

// We enumerate all dictionaries here for valid asset packing
const dictionaries = {
  ka: () => import('./dictionaries/ka.json').then((module) => module.default),
  en: () => import('./dictionaries/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]?.() ?? dictionaries.ka();

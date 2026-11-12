// src/config.ts - BUKENIRIDE Multi-country Configuration & Testing Engine

export interface CountryConfig {
  code: string;
  currency: 'NAD' | 'ZMW' | string;
  prefix: string;
  sms_provider: 'africastalking';
  shortcode: string;
  sender_id: string;
  networks: string[];
  sms_cost: number;
  google_maps_region: string;
  languages: string[];
  name?: string;
  flag?: string;
  capital?: string;
  taxAuthority?: string;
  vatRate?: number;
  vatName?: string;
}

export type CountryKey = 'NAMIBIA' | 'ZAMBIA';

export const COUNTRIES: Record<CountryKey, CountryConfig> = {
  NAMIBIA: {
    code: 'NA',
    currency: 'NAD',
    prefix: '+264',
    sms_provider: 'africastalking',
    shortcode: '45645', // shared for testing, later your own e.g. 15555
    sender_id: 'BUKENIRIDE',
    networks: ['MTC', 'TN Mobile'],
    sms_cost: 0.35,
    google_maps_region: 'na',
    languages: ['en', 'af'],
    name: 'Namibia',
    flag: '🇳🇦',
    capital: 'Windhoek',
    taxAuthority: 'NAMRA (Namibia Revenue Agency)',
    vatRate: 0.15,
    vatName: 'NAMRA 15% VAT',
  },
  ZAMBIA: {
    code: 'ZM',
    currency: 'ZMW',
    prefix: '+260',
    sms_provider: 'africastalking', // same provider, different country flag
    shortcode: '23445', // Zambia shared, later dedicated e.g. 4477
    sender_id: 'BUKENIRIDE',
    networks: ['MTN', 'Airtel', 'Zamtel'],
    sms_cost: 0.35,
    google_maps_region: 'zm',
    languages: ['en', 'bem', 'nya'],
    name: 'Zambia',
    flag: '🇿🇲',
    capital: 'Lusaka',
    taxAuthority: 'ZRA (Zambia Revenue Authority)',
    vatRate: 0.16,
    vatName: 'ZRA 16% VAT',
  },
};

export const LANGUAGE_METADATA: Record<string, { label: string; native: string; sampleGreeting: string }> = {
  en: { label: 'English', native: 'English', sampleGreeting: 'Hello, book a ride with us!' },
  af: { label: 'Afrikaans', native: 'Afrikaans', sampleGreeting: 'Hallo, bespreek gerieflik \'n rit!' },
  bem: { label: 'Bemba', native: 'IciBemba', sampleGreeting: 'Shani, fwayeni motoka ukufuma kuno!' },
  nya: { label: 'Nyanja', native: 'ChiNyanja', sampleGreeting: 'Muli bwanji, pezani galimoto yapafupi!' },
};

/**
 * Detect network carrier from phone number based on southern African telecom numbering plans
 */
export function detectMobileNetwork(phone: string, country: CountryKey): string {
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  if (country === 'NAMIBIA') {
    if (clean.includes('81') || clean.includes('82') || clean.startsWith('+26481')) return 'MTC';
    if (clean.includes('85') || clean.startsWith('+26485')) return 'TN Mobile';
    return 'MTC (Default)';
  } else {
    if (clean.includes('97') || clean.includes('77') || clean.startsWith('+26097')) return 'Airtel';
    if (clean.includes('96') || clean.includes('76') || clean.startsWith('+26096')) return 'MTN';
    if (clean.includes('95') || clean.includes('75') || clean.startsWith('+26095')) return 'Zamtel';
    return 'MTN (Default)';
  }
}

/**
 * Format phone number with country prefix
 */
export function formatPhoneNumberForCountry(phone: string, country: CountryKey): string {
  const conf = COUNTRIES[country];
  let trimmed = phone.trim();
  if (trimmed.startsWith('0')) {
    trimmed = trimmed.substring(1);
  }
  if (!trimmed.startsWith('+')) {
    return `${conf.prefix} ${trimmed}`;
  }
  return trimmed;
}

/**
 * Identify country by phone number prefix
 */
export function identifyCountryFromPhone(phone: string): CountryKey {
  if (phone.startsWith('+264') || phone.startsWith('264')) return 'NAMIBIA';
  if (phone.startsWith('+260') || phone.startsWith('260')) return 'ZAMBIA';
  return 'NAMIBIA'; // default or fallback
}

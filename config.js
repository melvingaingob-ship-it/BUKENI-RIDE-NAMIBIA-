// config.js - BUKENIRIDE Multi-country
const COUNTRIES = {
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
    languages: ['en', 'af']
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
    languages: ['en', 'bem', 'nya']
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COUNTRIES };
}

export { COUNTRIES };
export default COUNTRIES;

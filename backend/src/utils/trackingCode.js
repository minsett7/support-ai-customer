const crypto = require('crypto');

const TRACKING_CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const TRACKING_CODE_LENGTH = 6;

function generateTrackingCode() {
  const bytes = crypto.randomBytes(TRACKING_CODE_LENGTH);
  let suffix = '';

  for (let index = 0; index < TRACKING_CODE_LENGTH; index += 1) {
    suffix += TRACKING_CODE_CHARACTERS[bytes[index] % TRACKING_CODE_CHARACTERS.length];
  }

  return `TCK-${suffix}`;
}

function normalizeTrackingCode(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

module.exports = {
  generateTrackingCode,
  normalizeTrackingCode
};

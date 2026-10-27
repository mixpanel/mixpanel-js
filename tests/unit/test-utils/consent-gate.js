import { buildConsentGate } from '../../../src/consent-gate';

export const ALLOW_ALL_CONSENT_GATE = buildConsentGate(() => true, () => false);

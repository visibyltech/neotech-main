import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BusinessSettings } from '../types';
import { INITIAL_SETTINGS } from './seedData';

const SETTINGS_COL = 'businessSettings';
const SETTINGS_DOC_ID = 'default';

export const settingsService = {
  async getSettings(): Promise<BusinessSettings> {
    try {
      const snap = await getDoc(doc(db, SETTINGS_COL, SETTINGS_DOC_ID));
      if (snap.exists()) {
        const stored = snap.data() as BusinessSettings & { bankDetailsConfigured?: boolean };
        // Apply the owner's supplied company account once, while preserving any later admin edits.
        const bankDetails = stored.bankDetailsConfigured
          ? (stored.bankDetails || INITIAL_SETTINGS.bankDetails)
          : INITIAL_SETTINGS.bankDetails;
        if (!stored.bankDetailsConfigured) {
          await setDoc(doc(db, SETTINGS_COL, SETTINGS_DOC_ID), {
            bankDetails,
            bankDetailsConfigured: true,
          }, { merge: true });
        }
        const storedContact = stored.contactInfo || INITIAL_SETTINGS.contactInfo;
        const hasLegacyContact =
          storedContact.phone?.includes('814 902 4432') ||
          storedContact.phone?.includes('8149024432') ||
          storedContact.whatsappNumber?.includes('2348149024432') ||
          storedContact.address?.toLowerCase().includes('computer village') ||
          storedContact.address?.toLowerCase().includes('ikeja');
        const hasLegacyPickup = (stored.pickupLocations || []).some((location) =>
          /computer village|ikeja|victoria island/i.test(location.address)
        );

        if (hasLegacyContact || hasLegacyPickup) {
          const migrated: BusinessSettings = {
            ...INITIAL_SETTINGS,
            ...stored,
            bankDetails,
            contactInfo: {
              ...storedContact,
              phone: INITIAL_SETTINGS.contactInfo.phone,
              address: INITIAL_SETTINGS.contactInfo.address,
              whatsappNumber: INITIAL_SETTINGS.contactInfo.whatsappNumber,
            },
            pickupLocations: hasLegacyPickup
              ? INITIAL_SETTINGS.pickupLocations
              : (stored.pickupLocations || INITIAL_SETTINGS.pickupLocations),
          };
          await setDoc(doc(db, SETTINGS_COL, SETTINGS_DOC_ID), migrated, { merge: true });
          return migrated;
        }

        return { ...INITIAL_SETTINGS, ...stored, bankDetails };
      }
      // If doesn't exist, try initializing with default
      await setDoc(doc(db, SETTINGS_COL, SETTINGS_DOC_ID), { ...INITIAL_SETTINGS, bankDetailsConfigured: true });
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  async updateSettings(settings: Partial<BusinessSettings>): Promise<void> {
    try {
      await setDoc(doc(db, SETTINGS_COL, SETTINGS_DOC_ID), settings, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${SETTINGS_COL}/${SETTINGS_DOC_ID}`);
    }
  },
};

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
        return snap.data() as BusinessSettings;
      }
      // If doesn't exist, try initializing with default
      await setDoc(doc(db, SETTINGS_COL, SETTINGS_DOC_ID), INITIAL_SETTINGS);
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

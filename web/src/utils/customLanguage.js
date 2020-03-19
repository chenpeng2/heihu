import LocalStorage from 'utils/localStorage';
import { defaultLanguage } from 'constants';

export const getCustomLanguage = () => LocalStorage.get('customLanguage') || defaultLanguage;
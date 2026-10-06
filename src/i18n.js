import {createI18n} from "vue-i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";

/** localStorage key that keeps the language chosen in the language switcher. */
export const LOCALE_STORAGE_KEY = 'vigia.locale';

const messages = { es, en };
const defaultLocale = 'es';

/**
 * Restores the language chosen in a previous visit, if it is still supported.
 * @returns {string} Initial locale.
 */
function initialLocale() {
    try {
        const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
        return saved in messages ? saved : defaultLocale;
    } catch {
        return defaultLocale;
    }
}

const i18n = createI18n({
    legacy: false,
    locale: initialLocale(),
    fallbackLocale: 'en',
    messages
});

export default i18n;

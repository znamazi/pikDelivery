import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import XHR from 'i18next-xhr-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from 'public/locales/en.json'
import es from 'public/locales/es.json'
import de from 'public/locales/de.json'
import fr from 'public/locales/fr.json'

i18next
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    react: {
      useSuspense: false
    },
    fallbackLng: 'en',
    preload: ['en'],
    interpolation: { escapeValue: false },
    resources: {
      en: { translation: en },
      es: { translation: es },
      de: { translation: de },
      fr: { translation: fr }
    }
  })
  .then(() => {
    console.log('i18next done')
  })
  .catch((error) => {
    console.error('error happend in i18n:', error)
  })

export default i18next

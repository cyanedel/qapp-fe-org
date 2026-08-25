import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import en from "@/i18n/locales/en.json"
import id from "@/i18n/locales/id.json"
import ko from "@/i18n/locales/ko.json"
import zhCN from "@/i18n/locales/zh-CN.json"

const normalizeDetectedLanguage = (language: string) => {
  const normalizedLanguage = language.toLowerCase()

  if (normalizedLanguage.startsWith("zh")) return "zh-CN"
  if (normalizedLanguage.startsWith("id")) return "id"
  if (normalizedLanguage.startsWith("ko")) return "ko"
  if (normalizedLanguage.startsWith("en")) return "en"

  return language
}

i18n.on("languageChanged", (language) => {
  document.documentElement.lang = language
})

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      id: { translation: id },
      ko: { translation: ko },
      "zh-CN": { translation: zhCN },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "id", "ko", "zh-CN"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "potero-language",
      caches: ["localStorage"],
      convertDetectedLanguage: normalizeDetectedLanguage,
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n

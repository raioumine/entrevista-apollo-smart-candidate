import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import esCommon from "./locales/es/common.json";
import esDashboard from "./locales/es/dashboard.json";
import esLanding from "./locales/es/landing.json";
import esSearch from "./locales/es/search.json";
import esCandidates from "./locales/es/candidates.json";
import esInterviews from "./locales/es/interviews.json";
import esAnalytics from "./locales/es/analytics.json";

import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enLanding from "./locales/en/landing.json";
import enSearch from "./locales/en/search.json";
import enCandidates from "./locales/en/candidates.json";
import enInterviews from "./locales/en/interviews.json";
import enAnalytics from "./locales/en/analytics.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        common: esCommon,
        dashboard: esDashboard,
        landing: esLanding,
        search: esSearch,
        candidates: esCandidates,
        interviews: esInterviews,
        analytics: esAnalytics,
      },
      en: {
        common: enCommon,
        dashboard: enDashboard,
        landing: enLanding,
        search: enSearch,
        candidates: enCandidates,
        interviews: enInterviews,
        analytics: enAnalytics,
      },
    },
    fallbackLng: "es",
    defaultNS: "common",
    ns: ["common", "dashboard", "landing", "search", "candidates", "interviews", "analytics"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import {
  catalogs,
  localeCurrencies,
  locales,
  type Locale
} from "./catalogs";
import { translatePortugueseUi } from "./portuguese-ui";

type TranslationValues = Record<string, string | number>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: TranslationValues) => string;
  formatDate: (date: Date) => string;
  formatDateTime: (date: Date) => string;
  formatNumber: (value: number) => string;
  formatCurrency: (value: number, currency?: string) => string;
};

const storageKey = "mushroom-compadres-locale";

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function translationRootForNode(node: Node): ParentNode {
  if (node.nodeType === Node.ELEMENT_NODE) {
    return node as Element;
  }

  return node.parentElement ?? document;
}

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(storageKey);
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }

  return navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    localStorage.setItem(storageKey, nextLocale);
    document.documentElement.lang = nextLocale;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;

    if (locale !== "pt") {
      return;
    }

    window.setTimeout(() => translatePortugueseUi(), 0);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translatePortugueseUi(translationRootForNode(mutation.target));
        } else {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
              translatePortugueseUi(translationRootForNode(node));
            }
          });
        }
      }
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);

  useEffect(() => {
    if (locale !== "pt") {
      return;
    }

    const timers = [0, 100, 500].map((delay) =>
      window.setTimeout(() => {
        translatePortugueseUi();
      }, delay)
    );

    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  });

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string, values?: TranslationValues) => {
      const template = catalogs[locale][key] ?? catalogs.en[key] ?? key;
      return Object.entries(values ?? {}).reduce(
        (copy, [name, replacement]) =>
          copy.replaceAll(`{{${name}}}`, String(replacement)),
        template
      );
    };

    return {
      locale,
      setLocale,
      t,
      formatDate: (date) =>
        new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeZone: "Europe/Lisbon"
        }).format(date),
      formatDateTime: (date) =>
        new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Europe/Lisbon"
        }).format(date),
      formatNumber: (valueToFormat) =>
        new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(
          valueToFormat
        ),
      formatCurrency: (valueToFormat, currency = localeCurrencies[locale]) =>
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency
        }).format(valueToFormat)
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider key={locale} value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}

import type { LocaleCode } from "@mushroom-compadres/domain";

export const defaultLocale: LocaleCode = "en";
export const supportedLocales: LocaleCode[] = ["en", "pt"];

const messages: Record<LocaleCode, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    login: "Staff sign in",
    logout: "Sign out",
    users: "Users",
    roles: "Roles",
    profile: "Profile",
    locale: "Locale",
    administration: "Administration"
  },
  pt: {
    dashboard: "Painel",
    login: "Entrada da equipa",
    logout: "Sair",
    users: "Utilizadores",
    roles: "Funcoes",
    profile: "Perfil",
    locale: "Idioma",
    administration: "Administracao"
  }
};

export function isSupportedLocale(locale: string): locale is LocaleCode {
  return supportedLocales.includes(locale as LocaleCode);
}

export function translate(locale: LocaleCode, key: string): string {
  return messages[locale][key] ?? messages.en[key] ?? key;
}

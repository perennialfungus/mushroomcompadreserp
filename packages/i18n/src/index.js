export const defaultLocale = "en";
export const supportedLocales = ["en", "pt"];
const messages = {
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
export function isSupportedLocale(locale) {
    return supportedLocales.includes(locale);
}
export function translate(locale, key) {
    return messages[locale][key] ?? messages.en[key] ?? key;
}
//# sourceMappingURL=index.js.map
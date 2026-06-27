import type { LocaleCode } from "@mushroom-compadres/domain";
export declare const defaultLocale: LocaleCode;
export declare const supportedLocales: LocaleCode[];
export declare function isSupportedLocale(locale: string): locale is LocaleCode;
export declare function translate(locale: LocaleCode, key: string): string;
//# sourceMappingURL=index.d.ts.map
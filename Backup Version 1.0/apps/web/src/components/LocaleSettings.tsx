import { Globe2 } from "lucide-react";
import {
  localeLabels,
  locales,
  type Locale
} from "../i18n/catalogs";
import { useAuth } from "../auth";
import { useI18n } from "../i18n/I18nProvider";
import { Badge, Table } from "./ui";

export function LocaleSettings() {
  const auth = useAuth();
  const {
    locale,
    setLocale,
    t,
    formatDate,
    formatNumber,
    formatCurrency
  } = useI18n();

  async function handleLocaleChange(nextLocale: Locale) {
    setLocale(nextLocale);

    if (auth.session) {
      await auth.setProfileLocale(nextLocale);
    }
  }

  return (
    <div className="settings-panel">
      <label className="select-field">
        <span>{t("settings.locale")}</span>
        <select
          value={locale}
          onChange={(event) => void handleLocaleChange(event.target.value as Locale)}
        >
          {locales.map((availableLocale) => (
            <option key={availableLocale} value={availableLocale}>
              {localeLabels[availableLocale]}
            </option>
          ))}
        </select>
      </label>

      <Table
        caption={t("settings.title")}
        rows={[
          [t("settings.datePreview"), formatDate(new Date("2026-06-26T12:00:00Z"))],
          [t("settings.numberPreview"), formatNumber(12840.5)],
          [t("settings.currencyPreview"), formatCurrency(12840.5, "EUR")]
        ]}
      />

      <Badge tone="info">
        <Globe2 aria-hidden="true" size={16} />
        {localeLabels[locale]}
      </Badge>
    </div>
  );
}

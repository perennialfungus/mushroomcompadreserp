import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { activatePendingUpdate } from "../pwa/registerServiceWorker";
import { useI18n } from "../i18n/I18nProvider";
import { Button } from "./ui";

export function UpdatePrompt() {
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const showPrompt = () => setVisible(true);
    window.addEventListener("mushroom:update-ready", showPrompt);
    return () => window.removeEventListener("mushroom:update-ready", showPrompt);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="update-prompt" role="status">
      <div>
        <strong>{t("update.title")}</strong>
        <span>{t("update.description")}</span>
      </div>
      <Button size="sm" onClick={activatePendingUpdate}>
        <RefreshCw aria-hidden="true" size={16} />
        {t("update.reload")}
      </Button>
    </div>
  );
}

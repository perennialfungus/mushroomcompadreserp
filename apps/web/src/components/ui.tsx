import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type PropsWithChildren,
  type ReactNode
} from "react";
import { AlertTriangle, CheckCircle2, Info, LoaderCircle, X } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
};

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant} button-${size} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, id, className = "", ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <label className={`input-field ${className}`.trim()} htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} aria-describedby={hintId} {...props} />
      {hint ? <small id={hintId}>{hint}</small> : null}
    </label>
  );
}

type BadgeProps = PropsWithChildren<{
  tone?: "neutral" | "success" | "warning" | "info";
}>;

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

type DialogProps = PropsWithChildren<{
  title: string;
  open: boolean;
  onClose: () => void;
}>;

export function Dialog({ title, open, onClose, children }: DialogProps) {
  const titleId = useId();

  if (!open) {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        className="dialog-panel"
        role="dialog"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          <h2 id={titleId}>{title}</h2>
          <Button variant="ghost" size="sm" aria-label="Close" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}

type TableProps = {
  caption: string;
  rows: Array<[string, ReactNode]>;
};

export function Table({ caption, rows }: TableProps) {
  return (
    <table className="data-table">
      <caption>{caption}</caption>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type Toast = {
  id: string;
  title: string;
  description?: string;
};

type ToastContextValue = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { t } = useI18n();

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-region" role="region" aria-live="polite">
        {toasts.map((toast) => (
          <article className="toast" key={toast.id}>
            <CheckCircle2 aria-hidden="true" size={18} />
            <div>
              <strong>{toast.title}</strong>
              {toast.description ? <span>{toast.description}</span> : null}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismiss(toast.id)}
              aria-label={t("toast.dismiss")}
            >
              <X aria-hidden="true" size={16} />
            </Button>
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

type TabsProps = {
  tabs: Array<{
    id: string;
    label: string;
    content: ReactNode;
  }>;
};

export function Tabs({ tabs }: TabsProps) {
  const generatedId = useId();
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  if (!activeTab) {
    return null;
  }

  const selectedTab = activeTab;

  return (
    <div className="tabs">
      <div className="tab-list" role="tablist">
        {tabs.map((tab) => (
          <button
            aria-controls={`${generatedId}-panel-${tab.id}`}
            aria-selected={selectedTab.id === tab.id}
            className="tab-button"
            id={`${generatedId}-tab-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            role="tab"
            tabIndex={selectedTab.id === tab.id ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        aria-labelledby={`${generatedId}-tab-${selectedTab.id}`}
        className="tab-panel"
        id={`${generatedId}-panel-${selectedTab.id}`}
        role="tabpanel"
      >
        {selectedTab.content}
      </div>
    </div>
  );
}

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon ?? <Info aria-hidden="true" />}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ title, description }: Pick<EmptyStateProps, "title" | "description">) {
  return (
    <EmptyState
      icon={<LoaderCircle aria-hidden="true" className="spin-icon" />}
      title={title}
      description={description}
    />
  );
}

export function ErrorState({
  title,
  description,
  action
}: Pick<EmptyStateProps, "title" | "description" | "action">) {
  return (
    <EmptyState
      icon={<AlertTriangle aria-hidden="true" />}
      title={title}
      description={description}
      action={action}
    />
  );
}

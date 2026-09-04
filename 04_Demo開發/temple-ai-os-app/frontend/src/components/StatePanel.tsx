import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2, SearchX } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatePanelVariant = "loading" | "error" | "empty" | "success" | "info";

type StatePanelProps = {
  variant?: StatePanelVariant;
  icon?: LucideIcon;
  title: string;
  body?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

const defaultIcons: Record<StatePanelVariant, LucideIcon> = {
  loading: Loader2,
  error: AlertCircle,
  empty: SearchX,
  success: CheckCircle2,
  info: AlertCircle
};

export function StatePanel({
  variant = "info",
  icon,
  title,
  body,
  actions,
  children
}: StatePanelProps) {
  const Icon = icon || defaultIcons[variant];
  const role = variant === "error" ? "alert" : "status";
  const ariaLive = variant === "error" ? "assertive" : "polite";

  return (
    <section
      className={`state-panel ${variant}`}
      role={role}
      aria-live={ariaLive}
      aria-busy={variant === "loading" ? true : undefined}
    >
      <Icon className="state-panel-icon" size={26} />
      <div>
        <h2>{title}</h2>
        {body ? <p>{body}</p> : null}
        {children}
        {actions ? <div className="state-actions">{actions}</div> : null}
      </div>
    </section>
  );
}

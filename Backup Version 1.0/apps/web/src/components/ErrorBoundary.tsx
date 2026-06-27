import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, EmptyState } from "./ui";
import { reportClientError } from "../lib/observability";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void reportClientError(error, {
      action: "react_error_boundary",
      route: window.location.pathname,
      componentStack: info.componentStack ?? null
    });
  }

  render() {
    if (this.state.error) {
      return (
        <main className="auth-screen">
          <EmptyState
            icon={<AlertTriangle aria-hidden="true" />}
            title="Something went wrong"
            description="The screen could not be restored. Refresh the app and try the action again."
            action={
              <Button type="button" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            }
          />
        </main>
      );
    }

    return this.props.children;
  }
}

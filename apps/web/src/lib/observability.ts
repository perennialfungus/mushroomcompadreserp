type ClientErrorContext = {
  route?: string;
  userId?: string | null;
  organizationId?: string | null;
  action?: string;
  componentStack?: string | null;
};

const endpoint = import.meta.env.VITE_OBSERVABILITY_ENDPOINT as string | undefined;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return {
    name: "UnknownError",
    message: String(error)
  };
}

export async function reportClientError(error: unknown, context: ClientErrorContext = {}) {
  const payload = {
    level: "error",
    source: "web",
    error: serializeError(error),
    context: {
      route: window.location.pathname,
      ...context
    },
    occurredAt: new Date().toISOString()
  };

  if (!endpoint) {
    console.error("Client error", payload);
    return;
  }

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    console.error("Client error", payload);
  }
}

import { fetchEventSource } from "@microsoft/fetch-event-source";
import { API_BASE_URL, getStoredToken } from "./api";

class RealtimeAuthenticationError extends Error {}

// Recebe avisos por SSE e chama a função passada pela página para atualizar os dados.
export function subscribeToWalletUpdates(onUpdate: () => void) {
  const token = getStoredToken();

  if (!token) {
    return () => undefined;
  }

  const controller = new AbortController();
  let hasConnected = false;

  void fetchEventSource(`${API_BASE_URL}/api/v1/users/me/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal: controller.signal, // use esse objeto --> cancelar a conexão 
    openWhenHidden: true,
    async onopen(response) {
      if (response.status === 401 || response.status === 403 || getStoredToken() !== token) {
        throw new RealtimeAuthenticationError("Sign in again to receive live updates");
      }

      if (!response.ok || !response.headers.get("content-type")?.includes("text/event-stream")) {
        throw new Error("Live updates are temporarily unavailable");
      }
    },
    onmessage(message) {
      if (controller.signal.aborted || getStoredToken() !== token) {
        controller.abort();
        return;
      }

      if (message.event === "connected") {
        // Após reconectar, busca mudanças que podem ter ocorrido enquanto estava offline.
        if (hasConnected) { // se cair e reconectar -->  conectar de novo
          onUpdate();
        }
        hasConnected = true;
      }

      if (message.event === "wallet-update") {
        onUpdate();
      }
    },
    onclose() {
      throw new Error("The live update connection was closed");
    },
    onerror(error) {
      if (error instanceof RealtimeAuthenticationError || getStoredToken() !== token) {
        throw error;
      }
      return 5000;
    },
  }).catch(() => {
    // HTTP 401/403 encerra as tentativas --> erros de rede são reconectados acima.
  });

  // A limpeza do useEffect fecha a conexão ao sair da página.
  return () => controller.abort();
}

import { Client } from "@stomp/stompjs";
import { API_BASE_URL, getStoredToken } from "./api";

export type WalletUpdate = {
  walletId: number;
  changeType: "CREATED" | "UPDATED" | "DELETED";
};

function getWebSocketUrl() {
  const websocketBaseUrl = API_BASE_URL.replace(/^http/, "ws");
  return `${websocketBaseUrl}/ws`;
}

export function subscribeToWalletUpdates(onUpdate: (update: WalletUpdate) => void) {
  const token = getStoredToken();

  if (!token) {
    return () => undefined;
  }

  const client = new Client({
    brokerURL: getWebSocketUrl(),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
  });

  client.onConnect = () => {
    client.subscribe("/user/queue/wallet-updates", (message) => {
      try {
        onUpdate(JSON.parse(message.body) as WalletUpdate);
      } catch {
        // Ignore an invalid realtime message and keep the connection available.
      }
    });
  };

  client.onStompError = () => {
    void client.deactivate();
  };

  client.onWebSocketClose = (event) => {
    if (event.code === 1008) {
      void client.deactivate();
    }
  };

  client.activate();

  return () => {
    void client.deactivate();
  };
}

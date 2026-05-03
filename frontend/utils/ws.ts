export class WSClient {
  socket: WebSocket | null = null;
  url: string;
  reconnectTimer: NodeJS.Timeout | null = null;
  onMessageHandler: ((data: any) => void) | null = null;
  onOpenHandler: (() => void) | null = null;
  onCloseHandler: (() => void) | null = null;
  onErrorHandler: ((event: Event) => void) | null = null;
  isConnected: boolean = false;
  lastSendTime: number = 0;
  shouldReconnect: boolean = false;

  constructor(url: string) {
    this.url = url;
  }

  connect(
    onMessage: (data: any) => void,
    onOpen?: () => void,
    onClose?: () => void,
    onError?: (event: Event) => void,
  ) {
    this.onMessageHandler = onMessage;
    if (onOpen) this.onOpenHandler = onOpen;
    if (onClose) this.onCloseHandler = onClose;
    if (onError) this.onErrorHandler = onError;
    this.shouldReconnect = true;

    this.createSocket();
  }

  private createSocket() {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket connected 🔌");
      this.isConnected = true;
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      if (this.onOpenHandler) this.onOpenHandler();
    };

    this.socket.onmessage = (event) => {
      try {
        const rawData = typeof event.data === "string" ? event.data : "";
        const data = rawData ? JSON.parse(rawData) : event.data;
        console.log("📩 WS incoming:", data);
        if (this.onMessageHandler) this.onMessageHandler(data);
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    this.socket.onerror = (event) => {
      console.error("WebSocket error ❌", event);
      if (this.onErrorHandler) this.onErrorHandler(event);
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected ❌");
      this.isConnected = false;
      if (this.onCloseHandler) this.onCloseHandler();

      // Auto reconnect only when the session is still active
      if (this.shouldReconnect) {
        this.reconnectTimer = setTimeout(() => {
          console.log("Attempting to reconnect...");
          this.createSocket();
        }, 1500);
      }
    };
  }

  send(data: string) {
    const now = Date.now();
    // Throttle frames to max 10 FPS (100ms)
    if (now - this.lastSendTime < 100) return;

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
      this.lastSendTime = Date.now();
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.onclose = null; // Prevent reconnect loop
      this.socket.onerror = null;
      this.socket.onmessage = null;
      this.socket.onopen = null;
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

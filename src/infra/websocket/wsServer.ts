import { WebSocketServer, WebSocket } from "ws";
import { logger } from "../../core/logger.js";
import { Server } from "http";

const clients = new Set<WebSocket>();

export function initWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket: WebSocket, req: Request) => {
    logger.info(`WS client connected: ${req.socket.remoteAddress}`);
    clients.add(socket);

    socket.on("message", (message:any) => {
      logger.info(`WS message: ${message}`);
      // Echo back or handle custom events
      socket.send(`Server received: ${message}`);
    });

    socket.on("close", () => {
      logger.info(`WS client disconnected`);
      clients.delete(socket);
    });

    socket.on("error", (err: Error) => {
      logger.error({ err }, "WS client error");
      clients.delete(socket);
    });
  });

  logger.info("WebSocket server initialized");

  return wss;
}

export function broadcast(message: string) {
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

export function stopWebSocket(wss: WebSocketServer) {
  logger.info("Closing WebSocket server...");
  wss.close();
}

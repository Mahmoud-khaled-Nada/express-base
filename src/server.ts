import { buildApp } from "./app";
import { Env } from "./config/env";
import { logger } from "./core/logger";
import { initSocketIO, stopSocketIO } from "@infra/socketio/socketServer";
import { initWebSocket, stopWebSocket } from "@infra/websocket/wsServer";

let wss: ReturnType<typeof initWebSocket> | null = null;
let socketServer: ReturnType<typeof initSocketIO> | null = null;

export function startHttp() {
  const app = buildApp();
  const server = app.listen(Env.port, () => logger.info(`HTTP on :${Env.port}`));

  // WebSocket support
  // wss = initWebSocket(server);
  // Socket.IO
  // socketServer = initSocketIO(server);
  return server;
}

export function stopHttp() {
  // if (wss) stopWebSocket(wss);
  // if (socketServer) stopSocketIO();
}

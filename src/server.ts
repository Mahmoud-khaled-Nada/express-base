import { buildApp } from "./app.js";
import { Env } from "./config/env.js";
import { logger } from "./core/logger.js";
import { initSocketIO, stopSocketIO } from "./infra/socketio/socketServer.js";
import { initWebSocket, stopWebSocket } from "./infra/websocket/wsServer.js";

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
  if (wss) stopWebSocket(wss);
  if (socketServer) stopSocketIO();
}

import { Server as IOServer, Socket } from "socket.io";
import { logger } from "../../core/logger";
import { Server as HTTPServer } from "http";

let io: IOServer | null = null;

export function initSocketIO(server: HTTPServer) {
  io = new IOServer(server, {
    cors: {
      origin: "*", // Change to your frontend URL in prod
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Listen to events from client
    socket.on("ping", () => {
      socket.emit("pong", { time: Date.now() });
    });

    socket.on("joinRoom", (room: string) => {
      socket.join(room);
      socket.emit("joinedRoom", room);
    });

    socket.on("sendMessage", ({ room, message }: { room?: string; message: string }) => {
      if (room) {
        socket.to(room).emit("newMessage", { from: socket.id, message });
      } else {
        socket.broadcast.emit("newMessage", { from: socket.id, message });
      }
    });

    socket.on("disconnect", (reason: string) => {
      logger.info(`Socket ${socket.id} disconnected: ${reason}`);
    });
  });

  logger.info("Socket.IO server initialized");

  return io;
}

export function getIO(): IOServer {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export function stopSocketIO() {
  if (io) {
    io.close();
    io = null;
    logger.info("Socket.IO server stopped");
  }
}

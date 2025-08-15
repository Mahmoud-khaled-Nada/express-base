import { Channels, EventEnvelope } from "../../infra/events/event.types";
import { EventBus, subscribeWithRetry } from "../../infra/events/eventBus";
import { getIO } from "../../infra/socketio/socketServer";


export function bridgeSocketIO() {
  // Example: forward chat messages to room
  subscribeWithRetry(EventBus.of(Channels.CHAT_MESSAGE), (e: EventEnvelope<{room:string; text:string; fromUserId:string}>) => {
    const io = getIO();
    io.to(e.payload.room).emit("chat:new", e.payload);
  });


  subscribeWithRetry(EventBus.of(Channels.USER_CREATED), (e) => {
    const io = getIO();
    io.emit("user:created", e.payload);
  });
}

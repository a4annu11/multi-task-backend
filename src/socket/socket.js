import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    // Basic setup: join a personal room based on user ID from handshake
    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
      socket.join(userId);
      console.log(`User ${userId} joined personal room`);
    }

    // Handle basic chat message event example
    socket.on("send_message", (data) => {
      // In a real app, you would save message to DB here or in controller
      // and then emit to the receiver's room
      if (data.receiverId) {
        io.to(data.receiverId).emit("receive_message", data);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

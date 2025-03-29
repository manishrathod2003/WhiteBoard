import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import whiteboardRouter from "./src/routes/whiteboardRoutes.js"
import connectDB from "./src/config/db.js";
import { Server } from "socket.io";
import http from 'http'

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: '50mb' }));

connectDB()

// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"],
//     },
// });

// const SECRET_PASSCODE = "1234"; // Set your passcode
// const activeUsers = new Map(); // Track connected users per boar

// io.on("connection", (socket) => {
//     console.log("A user connected");

//     // Handle passcode verification and connection
//     socket.on("verifyPasscode", ({ boardId, passcode }, callback) => {
//         if (passcode === SECRET_PASSCODE) {
//             // Check if board already has a connected user
//             if (!activeUsers.has(boardId)) {
//                 activeUsers.set(boardId, socket.id);
//                 callback({ success: true });
//                 console.log(`User ${socket.id} connected to board ${boardId}`);
//             } else {
//                 callback({ success: false, message: "Another user is already connected." });
//                 socket.disconnect(); // Reject additional connections
//             }
//         } else {
//             callback({ success: false });
//             socket.disconnect();
//         }
//     });

//     // Handle drawing events between two users
//     socket.on("draw", (data) => {
//         const boardId = data.boardId;
//         if (activeUsers.get(boardId) === socket.id) {
//             io.emit("draw", data);
//         }
//     });

//     // Handle disconnection and cleanup
//     socket.on("disconnect", () => {
//         activeUsers.forEach((socketId, boardId) => {
//             if (socketId === socket.id) {
//                 activeUsers.delete(boardId);
//                 console.log(`User disconnected from board ${boardId}`);
//             }
//         });
//     });
// });

app.use("/api/whiteboard", whiteboardRouter);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} `);
});
